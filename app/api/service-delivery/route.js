// app/api/service-delivery/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const serviceID = searchParams.get('serviceID');
    const staffID = searchParams.get('staffID');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const followupNeeded = searchParams.get('followupNeeded');
    const effectivenessRating = searchParams.get('effectivenessRating');
    const location = searchParams.get('location');
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) })
      };
    }
    
    const filter = {
      where: {
        ...(serviceID && { serviceID: parseInt(serviceID) }),
        ...(staffID && { staffID: parseInt(staffID) }),
        ...(Object.keys(dateFilter).length > 0 && { deliveryDate: dateFilter }),
        ...(followupNeeded !== null && { followupNeeded: followupNeeded === 'true' }),
        ...(effectivenessRating && { effectivenessRating: parseInt(effectivenessRating) }),
        ...(location && { location: { contains: location, mode: 'insensitive' } })
      },
      include: {
        service: {
          select: {
            serviceType: true,
            victim: {
              select: {
                name: true,
                birthCertificateNumber: true
              }
            },
            ngo: {
              select: {
                name: true
              }
            }
          }
        },
        staff: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        deliveryDate: 'desc'
      }
    };
    
    const deliveryLogs = await prisma.serviceDeliveryLog.findMany(filter);
    return NextResponse.json(deliveryLogs);
  } catch (error) {
    console.error('Error fetching delivery logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery logs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      serviceID, 
      staffID, 
      deliveryDate, 
      location, 
      feedback,
      effectivenessRating,
      followupNeeded,
      followupDate,
      notes,
      latitude,
      longitude
    } = body;
    
    // Validate required fields
    if (!serviceID || !staffID) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate IDs
    if (isNaN(parseInt(serviceID)) || isNaN(parseInt(staffID))) {
      return NextResponse.json(
        { error: 'Invalid service or staff ID' },
        { status: 400 }
      );
    }
    
    // Validate rating if provided
    if (effectivenessRating !== undefined && (isNaN(parseInt(effectivenessRating)) || 
        parseInt(effectivenessRating) < 1 || parseInt(effectivenessRating) > 5)) {
      return NextResponse.json(
        { error: 'Effectiveness rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Check if service exists
    const service = await prisma.nGO_Service_Provided.findUnique({
      where: { serviceID: parseInt(serviceID) }
    });
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Check if staff exists
    const staff = await prisma.nGO_Staff.findUnique({
      where: { staffID: parseInt(staffID) }
    });
    
    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    // Ensure staff belongs to the same NGO as the service
    if (staff.ngoID !== service.ngoID) {
      return NextResponse.json(
        { error: 'Staff member must belong to the same NGO as the service provider' },
        { status: 400 }
      );
    }
    
    // Create delivery log
    const deliveryLog = await prisma.serviceDeliveryLog.create({
      data: {
        serviceID: parseInt(serviceID),
        staffID: parseInt(staffID),
        ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
        ...(location && { location }),
        ...(feedback && { feedback }),
        ...(effectivenessRating !== undefined && { effectivenessRating: parseInt(effectivenessRating) }),
        ...(followupNeeded !== undefined && { followupNeeded: Boolean(followupNeeded) }),
        ...(followupDate && { followupDate: new Date(followupDate) }),
        ...(notes && { notes }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) })
      },
      include: {
        service: {
          select: {
            serviceType: true,
            victim: {
              select: {
                name: true
              }
            }
          }
        },
        staff: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Update the service status to "active" if it wasn't already
    if (service.status !== 'active') {
      await prisma.nGO_Service_Provided.update({
        where: { serviceID: parseInt(serviceID) },
        data: { status: 'active' }
      });
    }
    
    return NextResponse.json(deliveryLog, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery log:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery log' },
      { status: 500 }
    );
  }
}