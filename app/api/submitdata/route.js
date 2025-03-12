import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { birthCertificateNumber, name, gender, status, medicalID, eventID, familyID } = req.body;

    if (!birthCertificateNumber || !name || !medicalID || !eventID || !familyID) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    const victim = await prisma.victim.create({
      data: {
        birthCertificateNumber,
        name,
        gender,
        status,
        medicalID,
        eventID,
        familyID,
      },
    });

    res.status(201).json({ message: "Victim added successfully", victim });
  } catch (error) {
    console.error("Error adding victim:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
