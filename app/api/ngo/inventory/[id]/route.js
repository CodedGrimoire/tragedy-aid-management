// app/api/ngo/inventory/[id]/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const inventoryID = parseInt(params.id);
    
    if (isNaN(inventoryID)) {
      return NextResponse.json(
        { error: 'Invalid inventory ID' },
        { status: 400 }
      );
    }
    
    const inventoryItem = await prisma.nGO_ResourceInventory.findUnique({
      where: { inventoryID },
      include: {
        ngo: {
          select: {
            name: true,
            contact: true
          }
        },
        serviceItems: {
          select: {
            serviceItemID: true,
            quantity: true,
            status: true,
            request: {
              select: {
                requestID: true,
                requestType: true,
                status: true,
                victim: {
                  select: {
                    birthCertificateNumber: true,
                    name: true,
                    status: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(inventoryItem);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const inventoryID = parseInt(params.id);
    
    if (isNaN(inventoryID)) {
      return NextResponse.json(
        { error: 'Invalid inventory ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { 
      resourceType, 
      resourceName, 
      quantity, 
      unit, 
      expiryDate, 
      isAvailable,
      notes 
    } = body;
    
    // Check if inventory item exists
    const existingItem = await prisma.nGO_ResourceInventory.findUnique({
      where: { inventoryID }
    });
    
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    // Update the inventory item
    const updatedItem = await prisma.nGO_ResourceInventory.update({
      where: { inventoryID },
      data: {
        ...(resourceType !== undefined && { resourceType }),
        ...(resourceName !== undefined && { resourceName }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(unit !== undefined && { unit }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
        ...(notes !== undefined && { notes })
      }
    });
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const inventoryID = parseInt(params.id);
    
    if (isNaN(inventoryID)) {
      return NextResponse.json(
        { error: 'Invalid inventory ID' },
        { status: 400 }
      );
    }
    
    // Check if inventory item exists
    const existingItem = await prisma.nGO_ResourceInventory.findUnique({
      where: { inventoryID },
      include: {
        serviceItems: true
      }
    });
    
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    // Check if inventory is referenced by any service items
    if (existingItem.serviceItems.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete inventory item that is associated with service items',
        serviceItems: existingItem.serviceItems
      }, { status: 400 });
    }
    
    // Delete the inventory item
    await prisma.nGO_ResourceInventory.delete({
      where: { inventoryID }
    });
    
    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}