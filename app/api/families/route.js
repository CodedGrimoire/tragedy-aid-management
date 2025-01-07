// app/api/families/route.js

import prisma from '../../../lib/prisma';

export async function GET(request) {  // Make sure to include the request parameter
  try {
    const families = await prisma.familyInfo.findMany();
    
    if (!families) {
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
    
    const { headName, contact, address } = body;

    const newFamily = await prisma.familyInfo.create({
      data: {
        headName,
        contact,
        address,
      },
    });

    return new Response(JSON.stringify(newFamily), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/families error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create family.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}