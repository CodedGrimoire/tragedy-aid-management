// app/api/service-request/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const ngoID = searchParams.get('ngoID');
    const victimID = searchParams.get('victimID');
    const status = searchParams.get('status');
    const requestType = searchParams.get('requestType');
    const urgencyLevel = searchParams.get('urgencyLevel');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const staffID = searchParams.get('staffID');
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) })
      };
    }
    
    const filter = {
      where: {
        ...(ngoID && { ngoID: parseInt(ngoID) }),
        ...(victimID && { birthCertificateNumber: parseInt(victimID) }),
        ...(status && { status }),
        ...(requestType && { requestType: { contains: requestType, mode: 'insensitive' } }),
        ...(urgencyLevel && { urgencyLevel }),
        ...(Object.keys(dateFilter).length > 0 && { requestDate: dateFilter }),
        ...(staffID && { respondedBy: parseInt(staffID) })
      },
      include: {
        victim: {
          select: {
            name: true,
            status: true
          }
        },
        ngo: {
          select: {
            name: true
          }
        },
        ngoStaff: {
          select: {
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            serviceItems: true
          }
        }
      },
      orderBy: {
        requestDate: 'desc'
      }
    };
    
    // Use the exact model name as defined in the Prisma schema
    // Correct: This should match your schema.prisma model name exactly
    const serviceRequests = await prisma.ServiceRequest.findMany(filter);
    return NextResponse.json(serviceRequests);
  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service requests', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      birthCertificateNumber, 
      ngoID, 
      requestType, 
      urgencyLevel, 
      notes,
      serviceItems 
    } = body;
    
    // Validate required fields
    if (!birthCertificateNumber || !ngoID || !requestType || !urgencyLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate IDs
    if (isNaN(parseInt(birthCertificateNumber)) || isNaN(parseInt(ngoID))) {
      return NextResponse.json(
        { error: 'Invalid victim or NGO ID' },
        { status: 400 }
      );
    }
    
    // Validate urgencyLevel
    if (!['high', 'medium', 'low'].includes(urgencyLevel.toLowerCase())) {
      return NextResponse.json(
        { error: 'Urgency level must be high, medium, or low' },
        { status: 400 }
      );
    }
    
    // Check if victim exists
    const victim = await prisma.Victim.findUnique({
      where: { birthCertificateNumber: parseInt(birthCertificateNumber) }
    });
    
    if (!victim) {
      return NextResponse.json(
        { error: 'Victim not found' },
        { status: 404 }
      );
    }
    
    // Check if NGO exists
    const ngo = await prisma.NGO.findUnique({
      where: { ngoID: parseInt(ngoID) }
    });
    
    if (!ngo) {
      return NextResponse.json(
        { error: 'NGO not found' },
        { status: 404 }
      );
    }
    
    // Create service request with optional service items
    // Using the correct model name that matches schema.prisma
    const serviceRequest = await prisma.ServiceRequest.create({
      data: {
        birthCertificateNumber: parseInt(birthCertificateNumber),
        ngoID: parseInt(ngoID),
        requestType,
        urgencyLevel: urgencyLevel.toLowerCase(),
        status: 'pending',
        ...(notes && { notes }),
        ...(serviceItems && {
          serviceItems: {
            create: serviceItems.map(item => ({
              serviceType: item.serviceType,
              quantity: item.quantity || 1,
              status: 'pending',
              ...(item.notes && { notes: item.notes })
            }))
          }
        })
      },
      include: {
        serviceItems: true
      }
    });
    
    // Also create a corresponding need record if it doesn't exist
    // Using the correct model name that matches schema.prisma
    await prisma.VictimNeed.upsert({
      where: {
        needID: -1  // This will always fail, forcing create
      },
      update: {},   // Not used
      create: {
        birthCertificateNumber: parseInt(birthCertificateNumber),
        needType: requestType,
        urgencyLevel: urgencyLevel.toLowerCase(),
        status: 'pending',
        notes: `Service requested from ${ngo.name}`
      }
    }).catch(error => {
      console.error('Non-fatal error creating need record:', error);
      // Continue anyway, this is not critical
    });
    
    return NextResponse.json(serviceRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { error: 'Failed to create service request', details: error.message },
      { status: 500 }
    );
  }
}