import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Add console.log for debugging
    const totalVictims = await prisma.victim.count()
    console.log('Total victims count:', totalVictims)

    const [activeEvents, supportedFamilies] = await Promise.all([
      prisma.event.count(),
      prisma.familyInfo.count()
    ])

    const stats = {
      totalVictims,
      activeEvents,
      supportedFamilies
    }

    console.log('Dashboard stats:', stats)

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch dashboard statistics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}