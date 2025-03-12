// app/api/victim/route.js
import { NextResponse } from "next/server";
import prisma from '../../../lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { birthCertificateNumber, name, gender, status, medicalID, eventID, familyID } = body;
    
    // Validate required fields
    if (!birthCertificateNumber || !name || !medicalID || !eventID || !familyID) {
      return NextResponse.json({ 
        error: "Missing required fields!", 
        details: "Birth certificate number, name, medical ID, event ID, and family ID are required" 
      }, { status: 400 });
    }
    
    // Parse numeric values to ensure correct types
    const numericBirthCertificateNumber = parseInt(birthCertificateNumber, 10);
    const numericEventID = parseInt(eventID, 10);
    const numericFamilyID = parseInt(familyID, 10);
    
    if (isNaN(numericBirthCertificateNumber) || isNaN(numericEventID) || isNaN(numericFamilyID)) {
      return NextResponse.json({ 
        error: "Invalid numeric values", 
        details: "Birth certificate number, event ID, and family ID must be valid numbers" 
      }, { status: 400 });
    }
    
    // Create the victim record
    const victim = await prisma.victim.create({
      data: { 
        birthCertificateNumber: numericBirthCertificateNumber, 
        name, 
        gender: gender || null, 
        status: status || null, 
        medicalID, 
        eventID: numericEventID, 
        familyID: numericFamilyID 
      },
      include: {
        medical: true,
        event: true,
        family: true
      }
    });
    
    return NextResponse.json({ 
      message: "Victim added successfully", 
      victim 
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding victim:", error);
    
    // More detailed error handling for common issues
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: "Duplicate record", 
        details: "A victim with this birth certificate number already exists" 
      }, { status: 409 });
    } else if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: "Foreign key constraint failed", 
        details: "One of the referenced records does not exist (medicalID, eventID, or familyID)" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const searchQuery = searchParams.get('search') || '';
    const birthCertificateNumber = searchParams.get('birthCertificateNumber');
    
    // If birthCertificateNumber is provided, fetch a specific victim
    if (birthCertificateNumber) {
      const numericId = parseInt(birthCertificateNumber, 10);
      
      if (isNaN(numericId)) {
        return NextResponse.json({ 
          error: "Invalid birth certificate number format" 
        }, { status: 400 });
      }
      
      const victim = await prisma.victim.findUnique({
        where: { birthCertificateNumber: numericId },
        include: {
          medical: true,
          event: true,
          family: true
        }
      });
      
      if (!victim) {
        return NextResponse.json({ 
          error: "Victim not found" 
        }, { status: 404 });
      }
      
      return NextResponse.json(victim, { status: 200 });
    }
    
    // Otherwise, search for victims matching criteria
    const victims = await prisma.victim.findMany({
      take: limit,
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { medicalID: { contains: searchQuery, mode: 'insensitive' } },
          { 
            medical: { 
              medicalCondition: { contains: searchQuery, mode: 'insensitive' } 
            } 
          },
          { 
            event: { 
              description: { contains: searchQuery, mode: 'insensitive' },
            } 
          },
          {
            event: {
              location: { contains: searchQuery, mode: 'insensitive' }
            }
          }
        ],
      },
      include: {
        event: true,
        medical: true,
        family: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Return the victims array directly for consistency with your updated UI
    return NextResponse.json(victims, { status: 200 });
  } catch (error) {
    console.error('GET /api/victim error:', error);
    return NextResponse.json({
      error: 'Failed to fetch victims',
      details: error.message,
    }, { status: 500 });
  }
}