import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    // Fetch NGOs with the count of services provided
    const ngos = await prisma.nGO.findMany({
      include: {
        servicesProvided: {
          include: {
            victim: {
              select: { name: true } // Fetch victim's name
            }
          }
        }
      }
    });

    // Transform data to include service count and victim names
    const formattedNGOs = ngos.map(ngo => ({
      ngoID: ngo.ngoID,
      name: ngo.name,
      contact: ngo.contact,
      supportType: ngo.supportType,
      servicesProvided: ngo.servicesProvided.length,
      victims: ngo.servicesProvided.map(service => service.victim.name) // List of victims' names
    }));

    return new Response(JSON.stringify(formattedNGOs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/ngo error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch NGOs.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { name, contact, supportType } = body;

    const newNGO = await prisma.nGO.create({
      data: {
        name,
        contact,
        supportType,
      },
    });

    return new Response(JSON.stringify(newNGO), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/ngo error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create NGO.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
