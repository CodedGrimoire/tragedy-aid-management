import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    // Fetch all victims, whether or not they have healthcare
    const victims = await prisma.victim.findMany({
      include: {
        medical: {
          include: {
            victimHealthcare: {
              include: {
                healthcareProvider: true,
              },
            },
          },
        },
      },
    });

    // Fetch all healthcare providers
    const healthcareProviders = await prisma.healthcareProvider.findMany();

    const formattedData = victims.map((victim) => {
      const victimHealthcare = victim.medical?.victimHealthcare?.[0];
      return {
        victimID: victim.birthCertificateNumber,
        victimName: victim.name,
        providerID: victimHealthcare?.healthcareProvider?.providerID || null,
        providerName: victimHealthcare?.healthcareProvider?.name || 'None',
        description: victimHealthcare?.description || 'No Description',
        serviceDate: victimHealthcare?.serviceDate ? new Date(victimHealthcare.serviceDate).toLocaleDateString() : 'N/A',
      };
    });

    return new Response(JSON.stringify({ victims: formattedData, healthcareProviders }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/medical error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch victims with healthcare details.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const { name, address, contact } = await request.json();
    const newProvider = await prisma.healthcareProvider.create({
      data: { name, address, contact },
    });
    return new Response(JSON.stringify(newProvider), { status: 201 });
  } catch (error) {
    console.error('POST /api/medical error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create healthcare provider.' }), { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { victimID, providerID } = await request.json();
    const medical = await prisma.medical.findFirst({ where: { victim: { birthCertificateNumber: victimID } } });
    if (!medical) {
      return new Response(JSON.stringify({ error: 'Medical record not found for victim.' }), { status: 404 });
    }
    await prisma.victimHealthcare.upsert({
      where: { medicalID: medical.medicalID },
      update: { providerID },
      create: { medicalID: medical.medicalID, providerID },
    });
    return new Response(JSON.stringify({ message: 'Healthcare provider updated successfully' }), { status: 200 });
  } catch (error) {
    console.error('PUT /api/medical error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update healthcare provider.' }), { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { victimID } = await request.json();
    const medical = await prisma.medical.findFirst({ where: { victim: { birthCertificateNumber: victimID } } });
    if (!medical) {
      return new Response(JSON.stringify({ error: 'Medical record not found for victim.' }), { status: 404 });
    }
    await prisma.victimHealthcare.deleteMany({ where: { medicalID: medical.medicalID } });
    return new Response(JSON.stringify({ message: 'Healthcare provider removed successfully' }), { status: 200 });
  } catch (error) {
    console.error('DELETE /api/medical error:', error);
    return new Response(JSON.stringify({ error: 'Failed to remove healthcare provider.' }), { status: 500 });
  }
}