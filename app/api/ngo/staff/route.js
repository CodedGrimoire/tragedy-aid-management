// app/api/ngo/staff/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const ngoID = searchParams.get('ngoID');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const specialization = searchParams.get('specialization');
    const name = searchParams.get('name');
    
    const filter = {
      where: {
        ...(ngoID && { ngoID: parseInt(ngoID) }),
        ...(role && { role: { contains: role, mode: 'insensitive' } }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
        ...(specialization && { specialization: { contains: specialization, mode: 'insensitive' } }),
        ...(name && { name: { contains: name, mode: 'insensitive' } })
      },
      include: {
        ngo: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            serviceRequests: true,
            serviceDeliveryLogs: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    };
    
    // Use the correct model name that matches schema.prisma
    const staffMembers = await prisma.NGO_Staff.findMany(filter);
    return NextResponse.json(staffMembers);
  } catch (error) {
    console.error('Error fetching staff members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff members', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      ngoID, 
      name, 
      role, 
      contact, 
      email, 
      specialization 
    } = body;
    
    // Validate required fields
    if (!ngoID || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate ngoID
    if (isNaN(parseInt(ngoID))) {
      return NextResponse.json(
        { error: 'Invalid NGO ID' },
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
    
    // Check if email is unique if provided
    if (email) {
      const existingStaff = await prisma.NGO_Staff.findUnique({
        where: { email }
      });
      
      if (existingStaff) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }
    
    // Create staff member - using the correct model name
    const staffMember = await prisma.NGO_Staff.create({
      data: {
        ngoID: parseInt(ngoID),
        name,
        role,
        ...(contact && { contact }),
        ...(email && { email }),
        ...(specialization && { specialization }),
        isActive: true
      }
    });
    
    return NextResponse.json(staffMember, { status: 201 });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member', details: error.message },
      { status: 500 }
    );
  }
}