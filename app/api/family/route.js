// app/api/families/route.js
import prisma from '../../../lib/prisma';

export async function GET(request) {
  try {
    const families = await prisma.familyInfo.findMany();
    if (!families || families.length === 0) {
      return new Response(JSON.stringify({ error: 'No families found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(families), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/families error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch families.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body) {
      return new Response(JSON.stringify({ error: 'Request body is missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const { headName, contact, address } = body;
    
    // Validate required fields
    if (!headName) {
      return new Response(JSON.stringify({ error: 'Head name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if a family with similar details already exists
    const existingFamily = await prisma.familyInfo.findFirst({
      where: {
        AND: [
          { headName },
          contact ? { contact } : {},
          address ? { address } : {}
        ]
      }
    });

    if (existingFamily) {
      // Return the existing family with a 200 status code instead of creating a duplicate
      return new Response(JSON.stringify({
        message: 'A family with this information already exists. Using existing record.',
        family: existingFamily,
        isExisting: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Create the family record with auto-incremented ID if no duplicate exists
    const newFamily = await prisma.familyInfo.create({
      data: {
        headName,
        contact,
        address,
      },
    });
    
    return new Response(JSON.stringify({
      message: 'Family record created successfully',
      family: newFamily,
      isExisting: false
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/families error:', error);
    
    // Check if it's a Prisma unique constraint error
    if (error.code === 'P2002') {
      // This handles edge cases where a race condition might happen
      return new Response(JSON.stringify({
        error: 'A family with this information already exists.',
        details: 'Please try again with different information or use the search function to find the existing record.'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      error: 'Failed to create family.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}