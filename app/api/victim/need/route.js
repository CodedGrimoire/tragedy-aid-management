// app/api/victim/need/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const victimID = searchParams.get('victimID');
    const needType = searchParams.get('needType');
    const urgencyLevel = searchParams.get('urgencyLevel');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) })
      };
    }
    
    const filter = {
      where: {
        ...(victimID && { birthCertificateNumber: parseInt(victimID) }),
        ...(needType && { needType: { contains: needType, mode: 'insensitive' } }),
        ...(urgencyLevel && { urgencyLevel }),
        ...(status && { status }),
        ...(Object.keys(dateFilter).length > 0 && { dateIdentified: dateFilter })
      },
      include: {
        victim: {
          select: {
            name: true,
            status: true,
            gender: true,
            event: {
              select: {
                description: true,
                location: true
              }
            }
          }
        }
      },
      orderBy: [
        {
          urgencyLevel: 'desc'  // high, medium, low
        },
        {
          dateIdentified: 'desc'
        }
      ]
    };
    
    // Use the correct model name that matches schema.prisma
    const victimNeeds = await prisma.VictimNeed.findMany(filter);
    return NextResponse.json(victimNeeds);
  } catch (error) {
    console.error('Error fetching victim needs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch victim needs', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      birthCertificateNumber, 
      needType, 
      urgencyLevel, 
      notes 
    } = body;
    
    // Validate required fields
    if (!birthCertificateNumber || !needType || !urgencyLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate birthCertificateNumber
    if (isNaN(parseInt(birthCertificateNumber))) {
      return NextResponse.json(
        { error: 'Invalid victim ID' },
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
    
    // Create victim need - using the correct model name
    const victimNeed = await prisma.VictimNeed.create({
      data: {
        birthCertificateNumber: parseInt(birthCertificateNumber),
        needType,
        urgencyLevel: urgencyLevel.toLowerCase(),
        status: 'pending',
        ...(notes && { notes })
      },
      include: {
        victim: {
          select: {
            name: true,
            status: true
          }
        }
      }
    });
    
    return NextResponse.json(victimNeed, { status: 201 });
  } catch (error) {
    console.error('Error creating victim need:', error);
    return NextResponse.json(
      { error: 'Failed to create victim need', details: error.message },
      { status: 500 }
    );
  }
}