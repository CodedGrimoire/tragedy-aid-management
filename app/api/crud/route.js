import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// ✅ GET: Fetch all victims (including related data)
export async function GET() {
  try {
    const victims = await prisma.victim.findMany({
      include: {
        medical: true,
        family: true,
        event: true,
        tragedyVictims: {
          include: { tragedy: true },
        },
      },
    });

    console.log("✅ Victims fetched successfully:", victims);
    return NextResponse.json(victims);
  } catch (error) {
    console.error("❌ Database Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch victims." }, { status: 500 });
  }
}

// ✅ PUT: Update victim details (handles existing/new events & tragedies)
export async function PUT(req) {
  try {
    const {
      birthCertificateNumber,
      name,
      status,
      medicalID,
      eventID,
      eventDescription,
      eventLocation,
      familyID,
      familyHead,
      tragedyID,
      tragedyName,
    } = await req.json();

    console.log("🔹 Incoming update request:", {
      birthCertificateNumber,
      name,
      status,
      medicalID,
      eventID,
      eventDescription,
      eventLocation,
      familyID,
      familyHead,
      tragedyID,
      tragedyName,
    });

    // Convert IDs to integers if provided as strings.
    let updatedEventID = eventID ? parseInt(eventID) : null;
    let updatedTragedyID = tragedyID ? parseInt(tragedyID) : null;

    // If no existing event is selected and eventDescription is provided, create a new event.
    if (!updatedEventID && eventDescription.trim() !== "") {
      console.log("🆕 Creating new event...");
      const newEvent = await prisma.event.create({
        data: { description: eventDescription, location: eventLocation, date: new Date() },
      });
      updatedEventID = newEvent.eventID;
      console.log("✅ New event created:", newEvent);
    }

    // If no existing tragedy is selected and tragedyName is provided, create a new tragedy.
    if (!updatedTragedyID && tragedyName.trim() !== "") {
      console.log("🆕 Creating new tragedy...");
      const newTragedy = await prisma.tragedy.create({
        data: { tragedyName },
      });
      updatedTragedyID = newTragedy.tragedyID;
      console.log("✅ New tragedy created:", newTragedy);
    }

    // Update family head if changed
    if (familyHead && familyID) {
      console.log("🛠 Updating family head...");
      await prisma.familyInfo.update({
        where: { familyID: parseInt(familyID) },
        data: { headName: familyHead },
      });
      console.log("✅ Family head updated:", familyHead);
    }

    // Ensure the victim exists
    const victimExists = await prisma.victim.findUnique({
      where: { birthCertificateNumber: parseInt(birthCertificateNumber) },
    });
    if (!victimExists) {
      console.error(`❌ Victim with ID ${birthCertificateNumber} not found!`);
      return NextResponse.json({ error: "Victim not found." }, { status: 404 });
    }

    // Update victim details
    console.log("🛠 Updating victim...");
    const updatedVictim = await prisma.victim.update({
      where: { birthCertificateNumber: parseInt(birthCertificateNumber) },
      data: {
        name,
        status,
        medicalID,
        eventID: updatedEventID || null,
        familyID: parseInt(familyID),
      },
    });
    console.log("✅ Victim updated successfully:", updatedVictim);

    // Link victim to tragedy if updated
    if (updatedTragedyID) {
      const existingTragedyVictim = await prisma.tragedyVictim.findFirst({
        where: {
          birthCertificateNumber: parseInt(birthCertificateNumber),
          tragedyID: updatedTragedyID,
        },
      });

      if (!existingTragedyVictim) {
        console.log("🆕 Linking victim to tragedy...");
        await prisma.tragedyVictim.create({
          data: {
            tragedyID: updatedTragedyID,
            birthCertificateNumber: parseInt(birthCertificateNumber),
          },
        });
        console.log(`✅ Victim ${birthCertificateNumber} linked to tragedy ${updatedTragedyID}`);
      } else {
        console.log(`⚠️ Victim ${birthCertificateNumber} is already linked to tragedy ${updatedTragedyID}`);
      }
    }

    return NextResponse.json(updatedVictim);
  } catch (error) {
    console.error("❌ Error updating victim:", error);
    return NextResponse.json({ error: "Error updating victim.", details: error.message }, { status: 500 });
  }
}

// ✅ DELETE: Remove victim and clean up related records
export async function DELETE(req) {
  try {
    const { birthCertificateNumber } = await req.json();
    console.log(`🗑 Attempting to delete victim with ID: ${birthCertificateNumber}`);

    if (!birthCertificateNumber) {
      return NextResponse.json({ error: "Birth Certificate Number is required." }, { status: 400 });
    }

    const victimID = parseInt(birthCertificateNumber);

    // ❌ Check if victim exists before deleting
    const victim = await prisma.victim.findUnique({
      where: { birthCertificateNumber: victimID },
      include: {
        tragedyVictims: true,
        govtSubsidies: true,
        ngoServices: {
          include: { deliveryLogs: true },
        },
        serviceRequests: {
          include: { serviceItems: true }, // ✅ Include ServiceItems
        },
        needs: true,
      },
    });

    if (!victim) {
      console.log(`❌ Victim with ID ${victimID} not found.`);
      return NextResponse.json({ error: "Victim not found." }, { status: 404 });
    }

    console.log("🔄 Removing related records...");

    // ✅ Remove service items first before deleting service requests
    await prisma.serviceItem.deleteMany({
      where: {
        requestID: {
          in: victim.serviceRequests.map((request) => request.requestID),
        },
      },
    });

    // ✅ Remove service delivery logs first before deleting NGO services
    await prisma.serviceDeliveryLog.deleteMany({
      where: {
        serviceID: {
          in: victim.ngoServices.map((service) => service.serviceID),
        },
      },
    });

    // ✅ Remove dependent records to satisfy foreign key constraints
    await prisma.tragedyVictim.deleteMany({
      where: { birthCertificateNumber: victimID },
    });

    await prisma.governmentSubsidy.deleteMany({
      where: { birthCertificateNumber: victimID },
    });

    await prisma.nGO_Service_Provided.deleteMany({
      where: { birthCertificateNumber: victimID },
    });

    await prisma.serviceRequest.deleteMany({
      where: { birthCertificateNumber: victimID },
    });

    await prisma.victimNeed.deleteMany({
      where: { birthCertificateNumber: victimID },
    });

    console.log("✅ All related records deleted successfully.");

    // ✅ Now, delete the victim record
    await prisma.victim.delete({
      where: { birthCertificateNumber: victimID },
    });

    console.log(`✅ Victim with ID ${victimID} deleted successfully.`);
    return NextResponse.json({ message: "Victim deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting victim:", error);
    return NextResponse.json({ error: "Error deleting victim.", details: error.message }, { status: 500 });
  }
}
