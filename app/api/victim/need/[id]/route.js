// app/api/victim/need/[id]/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const needID = parseInt(params.id);
    
    if (isNaN(needID)) {
      return NextResponse.json(
        { error: 'Invalid need ID' },
        { status: 400 }
      );
    }
    
    const victimNeed = await prisma.victimNeed.findUnique({
      where: { needID },
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
            },
            event: {
              select: {
                eventID: true,
                description: true,
                location: true,
                date: true
              }
            }
          }
        }
      }
    });
    
    if (!victimNeed) {
      return NextResponse.json(
        { error: 'Victim need not found' },
        { status: 404 }
      );
    }
    
    // Get related service requests
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: {
        birthCertificateNumber: victimNeed.birthCertificateNumber,
        requestType: {
          contains: victimNeed.needType,
          mode: 'insensitive'
        }
      },
      select: {
        requestID: true,
        ngoID: true,
        requestDate: true,
        status: true,
        ngo: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        requestDate: 'desc'
      }
    });
    
    // Find matching NGOs that could help with this need
    const matchingNGOs = await prisma.nGO.findMany({
      where: {
        OR: [
          {
            supportType: {
              contains: victimNeed.needType,
              mode: 'insensitive'
            }
          },
          {
            focusArea: {
              contains: victimNeed.needType,
              mode: 'insensitive'
            }
          }
        ],
        isActive: true
      },
      select: {
        ngoID: true,
        name: true,
        supportType: true,
        focusArea: true,
        contact: true
      },
      take: 5
    });
    
    return NextResponse.json({
      ...victimNeed,
      serviceRequests,
      matchingNGOs
    });
  } catch (error) {
    console.error('Error fetching victim need:', error);
    return NextResponse.json(
      { error: 'Failed to fetch victim need' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const needID = parseInt(params.id);
    
    if (isNaN(needID)) {
      return NextResponse.json(
        { error: 'Invalid need ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { 
      needType, 
      urgencyLevel, 
      status, 
      notes,
      dateAddressed
    } = body;
    
    // Check if the need exists
    const existingNeed = await prisma.victimNeed.findUnique({
      where: { needID }
    });
    
    if (!existingNeed) {
      return NextResponse.json(
        { error: 'Victim need not found' },
        { status: 404 }
      );
    }
    
    // Validate urgencyLevel if provided
    if (urgencyLevel && !['high', 'medium', 'low'].includes(urgencyLevel.toLowerCase())) {
      return NextResponse.json(
        { error: 'Urgency level must be high, medium, or low' },
        { status: 400 }
      );
    }
    
    // Validate status if provided
    if (status && !['pending', 'addressed', 'ongoing'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be pending, addressed, or ongoing' },
        { status: 400 }
      );
    }
    
    // Build update object
    const updateData = {
      ...(needType && { needType }),
      ...(urgencyLevel && { urgencyLevel: urgencyLevel.toLowerCase() }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(dateAddressed && { dateAddressed: new Date(dateAddressed) })
    };
    
    // If status is being changed to 'addressed' and dateAddressed is not provided, set it
    if (status === 'addressed' && !existingNeed.dateAddressed && !dateAddressed) {
      updateData.dateAddressed = new Date();
    }
    
    // Update the need
    const updatedNeed = await prisma.victimNeed.update({
      where: { needID },
      data: updateData,
      include: {
        victim: {
          select: {
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedNeed);
  } catch (error) {
    console.error('Error updating victim need:', error);
    return NextResponse.json(
      { error: 'Failed to update victim need' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const needID = parseInt(params.id);
    
    if (isNaN(needID)) {
      return NextResponse.json(
        { error: 'Invalid need ID' },
        { status: 400 }
      );
    }
    
    // Check if the need exists
    const existingNeed = await prisma.victimNeed.findUnique({
      where: { needID }
    });
    
    if (!existingNeed) {
      return NextResponse.json(
        { error: 'Victim need not found' },
        { status: 404 }
      );
    }
    
    // Check if there are related service requests
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: {
        birthCertificateNumber: existingNeed.birthCertificateNumber,
        requestType: {
          contains: existingNeed.needType,
          mode: 'insensitive'
        }
      }
    });
    
    if (serviceRequests.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete need with related service requests',
        relatedRequests: serviceRequests.length
      }, { status: 400 });
    }
    
    // Delete the need
    await prisma.victimNeed.delete({
      where: { needID }
    });
    
    return NextResponse.json({ message: 'Victim need deleted successfully' });
  } catch (error) {
    console.error('Error deleting victim need:', error);
    return NextResponse.json(
      { error: 'Failed to delete victim need' },
      { status: 500 }
    );
  }
}