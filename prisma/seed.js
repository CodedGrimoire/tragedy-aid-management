const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create an event first
  const event = await prisma.event.create({
    data: {
      description: 'Test Event',
      location: 'Test Location',
      date: new Date(),
    },
  })

  // Create a family
  const family = await prisma.familyInfo.create({
    data: {
      headName: 'Test Family',
      contact: '1234567890',
      address: 'Test Address',
    },
  })

  // Create a medical record
  const medical = await prisma.medical.create({
    data: {
      medicalID: 'MED001',
      dateOfBirth: new Date(),
      bloodGroup: 'A+',
    },
  })

  // Create a victim
  const victim = await prisma.victim.create({
    data: {
      birthCertificateNumber: 123456789,
      name: 'Test Victim',
      gender: 'M',
      medicalID: medical.medicalID,
      status: 'Active',
      eventID: event.eventID,
      familyID: family.familyID,
    },
  })

  console.log('Created test data:', { event, family, medical, victim })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })