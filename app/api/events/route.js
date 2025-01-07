import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany();
    return new Response(JSON.stringify(events), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch events.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { date, description, location } = body;

    const newEvent = await prisma.event.create({
      data: {
        date: date ? new Date(date) : null,
        description,
        location,
      },
    });

    return new Response(JSON.stringify(newEvent), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/events error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create event.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}