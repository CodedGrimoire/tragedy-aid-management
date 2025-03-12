import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const subsidies = await prisma.recipient.findMany({
      include: {
        family: {
          include: {
            recipient: true,
          },
        },
      },
    });

    const subsidyDetails = await Promise.all(
      subsidies.map(async (recipient) => {
        const familySupport = await prisma.familySupport.findUnique({
          where: { supportID: recipient.supportID },
        });

        return {
          supportID: recipient.supportID,
          dateReceived: recipient.dateReceived,
          familyID: recipient.family.familyID,
          headName: recipient.family.headName,
          contact: recipient.family.contact,
          address: recipient.family.address,
          supportType: familySupport?.supportType || 'Unknown',
          amount: familySupport?.amount || 0,
        };
      })
    );

    return new Response(JSON.stringify(subsidyDetails), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/subsidy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch subsidy data.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
