// app/api/ngo/service-area/[id]/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const serviceAreaID = parseInt(params.id);
    
    if (isNaN(serviceAreaID)) {
      return NextResponse.json(
        { error: 'Invalid service area ID' },
        { status: 400 }
      );
    }
    
    const serviceArea = await prisma.NGO_ServiceArea.findUnique({
      where: { serviceAreaID },
      include: {
        ngo: {
          select: {
            name: true,
            supportType: true,
            contact: true
          }
        }
      }
    });
    
    if (!serviceArea) {
      return NextResponse.json(
        { error: 'Service area not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(serviceArea);
  } catch (error) {
    console.error('Error fetching service area:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service area' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const serviceAreaID = parseInt(params.id);
    
    if (isNaN(serviceAreaID)) {
      return NextResponse.json(
        { error: 'Invalid service area ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { locationName, latitude, longitude, radiusKm, isActive } = body;
    
    // Validate numeric values if provided
    if ((latitude !== undefined && isNaN(parseFloat(latitude))) || 
        (longitude !== undefined && isNaN(parseFloat(longitude))) || 
        (radiusKm !== undefined && isNaN(parseFloat(radiusKm)))) {
      return NextResponse.json(
        { error: 'Invalid numeric values for coordinates or radius' },
        { status: 400 }
      );
    }
    
    // Check if service area exists
    const existingArea = await prisma.NGO_ServiceArea.findUnique({
      where: { serviceAreaID }
    });
    
    if (!existingArea) {
      return NextResponse.json(
        { error: 'Service area not found' },
        { status: 404 }
      );
    }
    
    // Update the service area
    const updatedServiceArea = await prisma.NGO_ServiceArea.update({
      where: { serviceAreaID },
      data: {
        ...(locationName !== undefined && { locationName }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(radiusKm !== undefined && { radiusKm: parseFloat(radiusKm) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });
    
    return NextResponse.json(updatedServiceArea);
  } catch (error) {
    console.error('Error updating service area:', error);
    return NextResponse.json(
      { error: 'Failed to update service area' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const serviceAreaID = parseInt(params.id);
    
    if (isNaN(serviceAreaID)) {
      return NextResponse.json(
        { error: 'Invalid service area ID' },
        { status: 400 }
      );
    }
    
    // Check if service area exists
    const existingArea = await prisma.NGO_ServiceArea.findUnique({
      where: { serviceAreaID }
    });
    
    if (!existingArea) {
      return NextResponse.json(
        { error: 'Service area not found' },
        { status: 404 }
      );
    }
    
    // Delete the service area
    await prisma.NGO_ServiceArea.delete({
      where: { serviceAreaID }
    });
    
    return NextResponse.json(
      { message: 'Service area deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting service area:', error);
    return NextResponse.json(
      { error: 'Failed to delete service area' },
      { status: 500 }
    );
  }
}