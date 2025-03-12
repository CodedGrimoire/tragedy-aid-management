import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const searchQuery = searchParams.get('search') || '';

    const victims = await prisma.victim.findMany({
      take: limit,
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { medicalID: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        event: true,
        medical: true,
        family: true,
      },
      orderBy: {
        birthCertificateNumber: 'desc',
      },
    });

    return new Response(JSON.stringify({ victims }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/victims error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch victims',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
