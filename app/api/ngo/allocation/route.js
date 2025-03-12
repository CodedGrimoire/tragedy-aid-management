// app/api/ngo/allocation/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { findNGOsInRadius } from '@/utils/geoUtils';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const eventID = searchParams.get('eventID');
    const needType = searchParams.get('needType');
    const maxDistance = searchParams.get('maxDistance');
    
    // Validate required parameters
    if ((!latitude || !longitude) && !eventID) {
      return NextResponse.json({ 
        error: 'Either coordinates (latitude/longitude) or eventID is required' 
      }, { status: 400 });
    }
    
    let eventLocation;
    
    // If eventID is provided, get location from event
    if (eventID) {
      const event = await prisma.event.findUnique({
        where: { eventID: parseInt(eventID) },
        select: { lat: true, lng: true }
      });
      
      if (!event || !event.lat || !event.lng) {
        return NextResponse.json({ 
          error: 'Event not found or has no location data' 
        }, { status: 404 });
      }
      
      eventLocation = { latitude: event.lat, longitude: event.lng };
    } else {
      eventLocation = { 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      };
    }
    
    // Get all NGO service areas
    const serviceAreas = await prisma.nGO_ServiceArea.findMany({
      where: {
        isActive: true,
        ...(maxDistance ? { radiusKm: { lte: parseFloat(maxDistance) } } : {})
      },
      include: {
        ngo: {
          select: {
            ngoID: true,
            name: true,
            supportType: true,
            focusArea: true,
            contact: true,
            email: true,
            isActive: true,
            isVerified: true
          }
        }
      }
    });
    
    // Find NGOs that can serve this location
    const ngosInRadius = findNGOsInRadius(
      eventLocation.latitude,
      eventLocation.longitude,
      serviceAreas
    );
    
    // If needType is specified, filter NGOs by their focus area or support type
    let matchingNGOs = ngosInRadius;
    if (needType) {
      matchingNGOs = ngosInRadius.filter(ngoMatch => {
        const ngo = serviceAreas.find(area => area.ngoID === ngoMatch.ngoID)?.ngo;
        if (!ngo) return false;
        
        return (
          ngo.focusArea?.toLowerCase().includes(needType.toLowerCase()) ||
          ngo.supportType?.toLowerCase().includes(needType.toLowerCase())
        );
      });
    }
    
    // Get resource availability for these NGOs if they match the need type
    if (needType) {
      const resourceInventory = await prisma.nGO_ResourceInventory.findMany({
        where: {
          ngoID: { in: matchingNGOs.map(ngo => ngo.ngoID) },
          resourceType: { contains: needType, mode: 'insensitive' },
          isAvailable: true,
          quantity: { gt: 0 }
        }
      });
      
      // Add resource availability to results
      matchingNGOs = matchingNGOs.map(ngo => {
        const ngoResources = resourceInventory.filter(resource => resource.ngoID === ngo.ngoID);
        return {
          ...ngo,
          ngoInfo: serviceAreas.find(area => area.ngoID === ngo.ngoID)?.ngo,
          availableResources: ngoResources
        };
      });
    } else {
      // Just add NGO info
      matchingNGOs = matchingNGOs.map(ngo => ({
        ...ngo,
        ngoInfo: serviceAreas.find(area => area.ngoID === ngo.ngoID)?.ngo
      }));
    }
    
    // Return the results
    return NextResponse.json({ 
      ngos: matchingNGOs,
      total: matchingNGOs.length
    });
  } catch (error) {
    console.error('Error in NGO allocation API:', error);
    return NextResponse.json({ 
      error: 'An error occurred while finding NGOs' 
    }, { status: 500 });
  }
}