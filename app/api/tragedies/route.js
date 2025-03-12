import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tragedies = await prisma.tragedy.findMany({
      include: {
        tragedyVictims: {
          include: {
            victim: {
              select: { birthCertificateNumber: true, eventID: true },
            },
          },
        },
      },
    });

    const formattedTragedies = await Promise.all(
      tragedies.map(async (tragedy) => {
        const eventVictimCount = {};
        const eventDescriptions = {};

        for (const { victim } of tragedy.tragedyVictims) {
          if (victim.eventID) {
            eventVictimCount[victim.eventID] = (eventVictimCount[victim.eventID] || 0) + 1;

            const event = await prisma.event.findUnique({
              where: { eventID: victim.eventID },
              select: { description: true },
            });

            eventDescriptions[victim.eventID] = event?.description || 'No description available';
          }
        }

        return {
          tragedyID: tragedy.tragedyID,
          tragedyName: tragedy.tragedyName,
          totalVictims: tragedy.tragedyVictims.length,
          eventVictimData: Object.entries(eventVictimCount).map(([eventID, count]) => ({
            eventID: parseInt(eventID),
            victims: count,
            description: eventDescriptions[eventID],
          })),
        };
      })
    );

    return new Response(JSON.stringify(formattedTragedies), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/tragedies error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tragedies.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const { tragedyName } = await request.json();

    const newTragedy = await prisma.tragedy.create({
      data: { tragedyName },
    });

    return new Response(JSON.stringify(newTragedy), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/tragedies error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create tragedy.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tragedyID = parseInt(searchParams.get('tragedyID'));

    if (!tragedyID) {
      return new Response(JSON.stringify({ error: 'Tragedy ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await prisma.tragedyVictim.deleteMany({
      where: { tragedyID },
    });

    await prisma.tragedy.delete({
      where: { tragedyID },
    });

    return new Response(JSON.stringify({ message: 'Tragedy deleted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DELETE /api/tragedies error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete tragedy.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
