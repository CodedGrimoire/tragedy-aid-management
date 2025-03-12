import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET: Retrieve families & FamilySupport options
export async function GET(request) {
  try {
    const familyInfos = await prisma.familyInfo.findMany({
      include: {
        recipient: true, // Checks recipient existence
        victims: true,
      },
    });

    const familySupportOptions = await prisma.familySupport.findMany(); // Fetch available supports

    const totalFamilies = familyInfos.length;
    const recipientsCount = familyInfos.filter((f) => f.recipient).length;
    const nonRecipientsCount = totalFamilies - recipientsCount;

    const result = familyInfos.map((family) => ({
      familyID: family.familyID,
      headName: family.headName,
      contact: family.contact,
      address: family.address,
      receivedSupport: !!family.recipient,
      supportID: family.recipient ? family.recipient.supportID : null,
      victims: family.victims,
    }));

    return NextResponse.json({
      families: result,
      familySupportOptions,
      stats: { totalFamilies, recipientsCount, nonRecipientsCount }, // For Pie Chart
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching families:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PATCH: Assign FamilySupport to a family
export async function PATCH(request) {
  try {
    const { familyID, supportID } = await request.json();

    const family = await prisma.familyInfo.findUnique({
      where: { familyID },
      include: { recipient: true },
    });

    if (!family) {
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }
    if (family.recipient) {
      return NextResponse.json({ error: "Family already has support" }, { status: 400 });
    }

    const newRecipient = await prisma.recipient.create({
      data: {
        familyID,
        supportID,
        dateReceived: new Date(),
      },
    });

    return NextResponse.json({
      message: "Family support assigned successfully",
      recipient: newRecipient,
    }, { status: 201 });

  } catch (error) {
    console.error("Error assigning FamilySupport:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST: Insert new FamilySupport option
export async function POST(request) {
  try {
    const { supportType, amount } = await request.json();

    if (!supportType || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newSupport = await prisma.familySupport.create({
      data: {
        supportType,
        amount,
      },
    });

    return NextResponse.json({ message: "Support created", support: newSupport }, { status: 201 });

  } catch (error) {
    console.error("Error adding FamilySupport:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
