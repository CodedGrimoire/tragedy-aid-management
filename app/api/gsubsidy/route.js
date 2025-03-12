import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET: Retrieve victims & GovernmentSubsidy options
export async function GET(request) {
  try {
    const victims = await prisma.victim.findMany({
      include: {
        govtSubsidies: true, // Fetch subsidy if it exists
      },
    });

    const subsidyOptions = await prisma.subsidy.findMany(); // Fetch all available subsidies

    const totalVictims = victims.length;
    const recipientsCount = victims.filter((v) => v.govtSubsidies.length > 0).length;
    const nonRecipientsCount = totalVictims - recipientsCount;

    const result = victims.map((victim) => ({
      birthCertificateNumber: victim.birthCertificateNumber,
      name: victim.name,
      receivedSubsidy: victim.govtSubsidies.length > 0,
      subsidyID: victim.govtSubsidies.length > 0 ? victim.govtSubsidies[0].subsidyID : null,
    }));

    return NextResponse.json({
      victims: result,
      subsidyOptions,
      stats: { totalVictims, recipientsCount, nonRecipientsCount },
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching victims:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PATCH: Assign GovernmentSubsidy to a victim
export async function PATCH(request) {
  try {
    const { birthCertificateNumber, subsidyID } = await request.json();

    const victim = await prisma.victim.findUnique({
      where: { birthCertificateNumber },
      include: { govtSubsidies: true },
    });

    if (!victim) {
      return NextResponse.json({ error: "Victim not found" }, { status: 404 });
    }
    if (victim.govtSubsidies.length > 0) {
      return NextResponse.json({ error: "Victim already has a subsidy" }, { status: 400 });
    }

    const newSubsidy = await prisma.governmentSubsidy.create({
      data: {
        birthCertificateNumber,
        subsidyID,
        dateReceived: new Date(),
      },
    });

    return NextResponse.json({
      message: "Subsidy assigned successfully",
      subsidy: newSubsidy,
    }, { status: 201 });

  } catch (error) {
    console.error("Error assigning subsidy:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST: Insert new Subsidy option
export async function POST(request) {
  try {
    const { medicalCondition, amount, eligibility } = await request.json();

    if (!medicalCondition || !amount || !eligibility) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newSubsidy = await prisma.subsidy.create({
      data: {
        medicalCondition,
        amount,
        eligibility,
      },
    });

    return NextResponse.json({ message: "Subsidy created", subsidy: newSubsidy }, { status: 201 });

  } catch (error) {
    console.error("Error adding subsidy:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
