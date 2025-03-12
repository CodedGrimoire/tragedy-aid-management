// app/api/ngo/inventory/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const ngoID = searchParams.get('ngoID');
    const resourceType = searchParams.get('resourceType');
    const isAvailable = searchParams.get('isAvailable');
    const expiryDateBefore = searchParams.get('expiryDateBefore');
    const expiryDateAfter = searchParams.get('expiryDateAfter');
    
    let expiryFilter = {};
    if (expiryDateBefore || expiryDateAfter) {
      expiryFilter = {
        ...(expiryDateBefore && { lt: new Date(expiryDateBefore) }),
        ...(expiryDateAfter && { gt: new Date(expiryDateAfter) })
      };
    }
    
    const filter = {
      where: {
        ...(ngoID && { ngoID: parseInt(ngoID) }),
        ...(resourceType && { resourceType: { contains: resourceType, mode: 'insensitive' } }),
        ...(isAvailable !== null && { isAvailable: isAvailable === 'true' }),
        ...(Object.keys(expiryFilter).length > 0 && { expiryDate: expiryFilter })
      },
      include: {
        ngo: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        lastUpdated: 'desc'
      }
    };
    
    // Use the correct model name that matches schema.prisma
    const inventoryItems = await prisma.NGO_ResourceInventory.findMany(filter);
    return NextResponse.json(inventoryItems);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      ngoID, 
      resourceType, 
      resourceName, 
      quantity, 
      unit, 
      expiryDate,
      notes 
    } = body;
    
    // Validate required fields
    if (!ngoID || !resourceType || !resourceName || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate numeric values
    if (isNaN(parseInt(ngoID)) || isNaN(parseInt(quantity))) {
      return NextResponse.json(
        { error: 'Invalid numeric values' },
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
    
    // Create inventory item - using the correct model name
    const inventoryItem = await prisma.NGO_ResourceInventory.create({
      data: {
        ngoID: parseInt(ngoID),
        resourceType,
        resourceName,
        quantity: parseInt(quantity),
        ...(unit && { unit }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(notes && { notes }),
        isAvailable: true
      }
    });
    
    return NextResponse.json(inventoryItem, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item', details: error.message },
      { status: 500 }
    );
  }
}