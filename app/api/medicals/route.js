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
    const { medicalID, dateOfBirth, dateOfDeath, bloodGroup, medicalCondition, operation } = body;

    if (!medicalID) {
      return new Response(JSON.stringify({ error: 'Medical ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if the medical record already exists
    const existingMedical = await prisma.medical.findUnique({
      where: {
        medicalID: medicalID
      }
    });

    // If operation is upsert and record exists, update it
    if (operation === 'upsert' && existingMedical) {
      const updatedMedical = await prisma.medical.update({
        where: {
          medicalID: medicalID
        },
        data: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existingMedical.dateOfBirth,
          dateOfDeath: dateOfDeath ? new Date(dateOfDeath) : existingMedical.dateOfDeath,
          bloodGroup: bloodGroup || existingMedical.bloodGroup,
          medicalCondition: medicalCondition || existingMedical.medicalCondition
        }
      });
      
      return new Response(JSON.stringify(updatedMedical), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If no existing record is found, create a new one
    const newMedical = await prisma.medical.create({
      data: {
        medicalID,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        dateOfDeath: dateOfDeath ? new Date(dateOfDeath) : null,
        bloodGroup,
        medicalCondition
      },
    });

    return new Response(JSON.stringify(newMedical), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/medical error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create medical record.',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}