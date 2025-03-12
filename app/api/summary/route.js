// app/api/summary/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const victims = await prisma.victim.findMany({
      include: {
        ngoServices: { include: { ngo: true } },
        event: true,
        medical: true,
      },
    });

    const summary = {
      ageBracket: getAgeBracketSummary(victims),
      status: getStatusSummary(victims),
      gender: getGenderSummary(victims),
      ngoSupport: getNgoSupportSummary(victims),
      eventsLocation: getEventsLocationSummary(victims),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper functions
const getAgeBracketSummary = (victims) => {
  const brackets = { '<18': 0, '18-40': 0, '41-60': 0, '60+': 0 };
  victims.forEach(({ medical }) => {
    if (medical?.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(medical.dateOfBirth).getFullYear();
      if (age < 18) brackets['<18']++;
      else if (age <= 40) brackets['18-40']++;
      else if (age <= 60) brackets['41-60']++;
      else brackets['60+']++;
    }
  });
  return Object.entries(brackets).map(([ageGroup, count]) => ({ ageGroup, count }));
};

const getStatusSummary = (victims) => {
  const statusCount = {};
  victims.forEach(({ status }) => {
    if (status) statusCount[status] = (statusCount[status] || 0) + 1;
  });
  return Object.entries(statusCount).map(([statusType, count]) => ({ statusType, count }));
};

const getGenderSummary = (victims) => {
  const genderCount = {};
  victims.forEach(({ gender }) => {
    const genderType = gender || 'Unknown';
    genderCount[genderType] = (genderCount[genderType] || 0) + 1;
  });
  return Object.entries(genderCount).map(([genderType, count]) => ({ genderType, count }));
};

const getNgoSupportSummary = (victims) => {
  const ngoSupport = {};
  victims.forEach(({ ngoServices }) => {
    ngoServices.forEach(({ ngo }) => {
      const ngoName = ngo.name || 'Unknown NGO';
      ngoSupport[ngoName] = (ngoSupport[ngoName] || 0) + 1;
    });
  });
  return Object.entries(ngoSupport).map(([ngoName, count]) => ({ ngoName, count }));
};

const getEventsLocationSummary = (victims) => {
  const eventLocations = {};
  victims.forEach(({ event }) => {
    if (event?.location) {
      eventLocations[event.location] = (eventLocations[event.location] || 0) + 1;
    }
  });
  return Object.entries(eventLocations).map(([location, eventCount]) => ({ location, eventCount }));
};
