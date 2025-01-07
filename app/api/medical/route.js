import prisma from '../../../lib/prisma';

export async function GET() {
    try {
      const medicalRecords = await prisma.medical.findMany();
      return new Response(JSON.stringify(medicalRecords), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('GET /api/medical error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch medical records.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { medicalID, dateOfBirth, bloodGroup, medicalCondition } = body;

    if (!medicalID) {
      return new Response(JSON.stringify({ error: 'Medical ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newMedical = await prisma.medical.create({
      data: {
        medicalID,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        bloodGroup,
        medicalCondition,
      },
    });

    return new Response(JSON.stringify(newMedical), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/medical error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create medical record.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}