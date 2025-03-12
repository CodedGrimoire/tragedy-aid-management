// app/api/ngo/service-area/route.js

import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ngoID = searchParams.get('ngoID');
    const isActive = searchParams.get('isActive');
    const locationName = searchParams.get('locationName');
    
    const filter = {
      where: {
        ...(ngoID && { ngoID: parseInt(ngoID) }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
        ...(locationName && { locationName: { contains: locationName, mode: 'insensitive' } })
      },
      include: {
        ngo: {
          select: {
            name: true,
            supportType: true
          }
        }
      }
    };

    console.log(Object.keys(prisma));
    
    // Using the correct model name from schema.prisma
    const serviceAreas = await prisma.NGO_ServiceArea.findMany(filter);
    return NextResponse.json(serviceAreas);
  } catch (error) {
    console.error('Error fetching service areas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service areas' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { ngoID, locationName, latitude, longitude, radiusKm } = body;
    
    // Validate required fields
    if (!ngoID || !locationName || latitude === undefined || longitude === undefined || radiusKm === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate numeric values
    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude)) || isNaN(parseFloat(radiusKm))) {
      return NextResponse.json(
        { error: 'Invalid numeric values for coordinates or radius' },
        { status: 400 }
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
    
    // Create service area
    const serviceArea = await prisma.NGO_ServiceArea.create({
      data: {
        ngoID: parseInt(ngoID),
        locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusKm: parseFloat(radiusKm),
        isActive: true
      }
    });
    
    return NextResponse.json(serviceArea, { status: 201 });
  } catch (error) {
    console.error('Error creating service area:', error);
    return NextResponse.json(
      { error: 'Failed to create service area' },
      { status: 500 }
    );
  }
}