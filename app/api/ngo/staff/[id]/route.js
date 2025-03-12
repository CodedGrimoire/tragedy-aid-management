// app/api/ngo/staff/[id]/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const staffID = parseInt(params.id);
    
    if (isNaN(staffID)) {
      return NextResponse.json(
        { error: 'Invalid staff ID' },
        { status: 400 }
      );
    }
    
    const staffMember = await prisma.nGO_Staff.findUnique({
      where: { staffID },
      include: {
        ngo: {
          select: {
            name: true,
            contact: true,
            supportType: true
          }
        },
        serviceRequests: {
          select: {
            requestID: true,
            requestType: true,
            status: true,
            requestDate: true,
            victim: {
              select: {
                birthCertificateNumber: true,
                name: true,
                status: true
              }
            }
          },
          take: 10,
          orderBy: {
            requestDate: 'desc'
          }
        },
        serviceDeliveryLogs: {
          select: {
            logID: true,
            deliveryDate: true,
            effectivenessRating: true,
            service: {
              select: {
                serviceType: true,
                victim: {
                  select: {
                    name: true,
                    birthCertificateNumber: true
                  }
                }
              }
            }
          },
          take: 10,
          orderBy: {
            deliveryDate: 'desc'
          }
        },
        _count: {
          select: {
            serviceRequests: true,
            serviceDeliveryLogs: true
          }
        }
      }
    });
    
    if (!staffMember) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(staffMember);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff member' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const staffID = parseInt(params.id);
    
    if (isNaN(staffID)) {
      return NextResponse.json(
        { error: 'Invalid staff ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { 
      name, 
      role, 
      contact, 
      email, 
      specialization, 
      isActive 
    } = body;
    
    // Check if staff member exists
    const existingStaff = await prisma.nGO_Staff.findUnique({
      where: { staffID }
    });
    
    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    // Check email uniqueness if changed
    if (email && email !== existingStaff.email) {
      const emailExists = await prisma.nGO_Staff.findUnique({
        where: { email }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }
    
    // Update the staff member
    const updatedStaff = await prisma.nGO_Staff.update({
      where: { staffID },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(contact !== undefined && { contact }),
        ...(email !== undefined && { email }),
        ...(specialization !== undefined && { specialization }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });
    
    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const staffID = parseInt(params.id);
    
    if (isNaN(staffID)) {
      return NextResponse.json(
        { error: 'Invalid staff ID' },
        { status: 400 }
      );
    }
    
    // Check if staff member exists
    const existingStaff = await prisma.nGO_Staff.findUnique({
      where: { staffID },
      include: {
        serviceRequests: true,
        serviceDeliveryLogs: true
      }
    });
    
    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    // Check if staff member has related records
    if (existingStaff.serviceRequests.length > 0 || existingStaff.serviceDeliveryLogs.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete staff member with related service records. Consider marking as inactive instead.',
        serviceRequests: existingStaff.serviceRequests.length,
        serviceDeliveryLogs: existingStaff.serviceDeliveryLogs.length
      }, { status: 400 });
    }
    
    // Delete the staff member
    await prisma.nGO_Staff.delete({
      where: { staffID }
    });
    
    return NextResponse.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}