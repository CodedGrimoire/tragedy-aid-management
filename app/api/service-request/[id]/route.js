// app/api/service-request/[id]/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const requestID = parseInt(params.id);
    
    if (isNaN(requestID)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }
    
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { requestID },
      include: {
        victim: {
          select: {
            birthCertificateNumber: true,
            name: true,
            status: true,
            gender: true,
            medical: {
              select: {
                bloodGroup: true,
                medicalCondition: true
              }
            },
            family: {
              select: {
                headName: true,
                contact: true
              }
            }
          }
        },
        ngo: {
          select: {
            ngoID: true,
            name: true,
            contact: true,
            supportType: true
          }
        },
        ngoStaff: {
          select: {
            staffID: true,
            name: true,
            role: true,
            contact: true
          }
        },
        serviceItems: {
          include: {
            inventory: true
          }
        }
      }
    });
    
    if (!serviceRequest) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(serviceRequest);
  } catch (error) {
    console.error('Error fetching service request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service request' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const requestID = parseInt(params.id);
    
    if (isNaN(requestID)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { 
      status, 
      urgencyLevel, 
      notes, 
      respondedBy,
      responseDate,
      completionDate,
      serviceItems
    } = body;
    
    // Check if service request exists
    const existingRequest = await prisma.serviceRequest.findUnique({
      where: { requestID },
      include: {
        serviceItems: true
      }
    });
    
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      );
    }
    
    // Validate staff ID if provided
    if (respondedBy && isNaN(parseInt(respondedBy))) {
      return NextResponse.json(
        { error: 'Invalid staff ID' },
        { status: 400 }
      );
    }
    
    // Validate status if provided
    if (status && !['pending', 'approved', 'in_progress', 'completed', 'denied'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Check if staff exists if ID provided
    if (respondedBy) {
      const staff = await prisma.nGO_Staff.findUnique({
        where: { staffID: parseInt(respondedBy) }
      });
      
      if (!staff) {
        return NextResponse.json(
          { error: 'Staff member not found' },
          { status: 404 }
        );
      }
      
      // Ensure staff belongs to the same NGO
      if (staff.ngoID !== existingRequest.ngoID) {
        return NextResponse.json(
          { error: 'Staff member must belong to the same NGO as the service request' },
          { status: 400 }
        );
      }
    }
    
    // Build update object
    const updateData = {
      ...(status && { status }),
      ...(urgencyLevel && { urgencyLevel }),
      ...(notes !== undefined && { notes }),
      ...(respondedBy && { respondedBy: parseInt(respondedBy) }),
      ...(responseDate && { responseDate: new Date(responseDate) }),
      ...(completionDate && { completionDate: new Date(completionDate) })
    };
    
    // If status is being updated to completed, set completionDate automatically if not provided
    if (status === 'completed' && !completionDate) {
      updateData.completionDate = new Date();
    }
    
    // If status is being updated to approved or in_progress and no respondedBy, set responseDate
    if ((status === 'approved' || status === 'in_progress') && !existingRequest.responseDate) {
      updateData.responseDate = new Date();
    }
    
    // Handle service items updates if provided
    let serviceItemUpdates = [];
    if (serviceItems && Array.isArray(serviceItems)) {
      for (const item of serviceItems) {
        // For existing items
        if (item.serviceItemID) {
          const existingItem = existingRequest.serviceItems.find(
            si => si.serviceItemID === item.serviceItemID
          );
          
          if (!existingItem) {
            return NextResponse.json(
              { error: `Service item with ID ${item.serviceItemID} not found` },
              { status: 404 }
            );
          }
          
          serviceItemUpdates.push(
            prisma.serviceItem.update({
              where: { serviceItemID: item.serviceItemID },
              data: {
                ...(item.serviceType && { serviceType: item.serviceType }),
                ...(item.quantity && { quantity: parseInt(item.quantity) }),
                ...(item.status && { status: item.status }),
                ...(item.deliveryDate && { deliveryDate: new Date(item.deliveryDate) }),
                ...(item.notes !== undefined && { notes: item.notes })
              }
            })
          );
        } else {
          // For new items
          serviceItemUpdates.push(
            prisma.serviceItem.create({
              data: {
                requestID,
                serviceType: item.serviceType,
                quantity: item.quantity || 1,
                status: item.status || 'pending',
                ...(item.inventoryID && { inventoryID: parseInt(item.inventoryID) }),
                ...(item.deliveryDate && { deliveryDate: new Date(item.deliveryDate) }),
                ...(item.notes && { notes: item.notes })
              }
            })
          );
        }
      }
    }
    
    // Execute updates in transaction
    const [updatedRequest, ...updatedItems] = await prisma.$transaction([
      prisma.serviceRequest.update({
        where: { requestID },
        data: updateData,
        include: {
          serviceItems: true,
          victim: {
            select: {
              name: true
            }
          },
          ngo: {
            select: {
              name: true
            }
          }
        }
      }),
      ...serviceItemUpdates
    ]);
    
    // Update victim need status if request status is updated to completed
    if (status === 'completed') {
      await prisma.victimNeed.updateMany({
        where: {
          birthCertificateNumber: existingRequest.birthCertificateNumber,
          needType: existingRequest.requestType,
          status: { not: 'addressed' }
        },
        data: {
          status: 'addressed',
          dateAddressed: new Date()
        }
      }).catch(error => {
        console.error('Non-fatal error updating victim need status:', error);
      });
    }
    
    return NextResponse.json({
      ...updatedRequest,
      updatedItems: serviceItemUpdates.length > 0 ? updatedItems : undefined
    });
  } catch (error) {
    console.error('Error updating service request:', error);
    return NextResponse.json(
      { error: 'Failed to update service request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const requestID = parseInt(params.id);
    
    if (isNaN(requestID)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }
    
    // Check if service request exists
    const existingRequest = await prisma.serviceRequest.findUnique({
      where: { requestID },
      include: {
        serviceItems: true
      }
    });
    
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      );
    }
    
    // Don't allow deletion of completed requests
    if (existingRequest.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot delete a completed service request' },
        { status: 400 }
      );
    }
    
    // Delete related service items first
    if (existingRequest.serviceItems.length > 0) {
      await prisma.serviceItem.deleteMany({
        where: { requestID }
      });
    }
    
    // Delete the service request
    await prisma.serviceRequest.delete({
      where: { requestID }
    });
    
    return NextResponse.json(
      { message: 'Service request deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting service request:', error);
    return NextResponse.json(
      { error: 'Failed to delete service request' },
      { status: 500 }
    );
  }
}