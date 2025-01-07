-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Victim" (
    "birthCertificateNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "gender" CHAR(1),
    "medicalID" TEXT,
    "status" TEXT,
    "eventID" INTEGER,
    "familyID" INTEGER,

    CONSTRAINT "Victim_pkey" PRIMARY KEY ("birthCertificateNumber")
);

-- CreateTable
CREATE TABLE "Medical" (
    "medicalID" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "dateOfDeath" TIMESTAMP(3),
    "medicalCondition" TEXT,
    "bloodGroup" TEXT,

    CONSTRAINT "Medical_pkey" PRIMARY KEY ("medicalID")
);

-- CreateTable
CREATE TABLE "FamilyInfo" (
    "familyID" SERIAL NOT NULL,
    "headName" TEXT,
    "contact" VARCHAR(15),
    "address" TEXT,

    CONSTRAINT "FamilyInfo_pkey" PRIMARY KEY ("familyID")
);

-- CreateTable
CREATE TABLE "Recipient" (
    "supportID" SERIAL NOT NULL,
    "familyID" INTEGER NOT NULL,
    "dateReceived" TIMESTAMP(3),

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("supportID")
);

-- CreateTable
CREATE TABLE "FamilySupport" (
    "supportID" SERIAL NOT NULL,
    "supportType" TEXT,
    "amount" DOUBLE PRECISION,

    CONSTRAINT "FamilySupport_pkey" PRIMARY KEY ("supportID")
);

-- CreateTable
CREATE TABLE "Event" (
    "eventID" SERIAL NOT NULL,
    "date" TIMESTAMP(3),
    "description" TEXT,
    "location" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("eventID")
);

-- CreateTable
CREATE TABLE "NGO" (
    "ngoID" SERIAL NOT NULL,
    "name" TEXT,
    "contact" TEXT,
    "supportType" TEXT,

    CONSTRAINT "NGO_pkey" PRIMARY KEY ("ngoID")
);

-- CreateTable
CREATE TABLE "NGO_Service_Provided" (
    "serviceID" SERIAL NOT NULL,
    "birthCertificateNumber" INTEGER NOT NULL,
    "ngoID" INTEGER NOT NULL,

    CONSTRAINT "NGO_Service_Provided_pkey" PRIMARY KEY ("serviceID")
);

-- CreateTable
CREATE TABLE "HealthcareProvider" (
    "providerID" SERIAL NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "contact" TEXT,

    CONSTRAINT "HealthcareProvider_pkey" PRIMARY KEY ("providerID")
);

-- CreateTable
CREATE TABLE "VictimHealthcare" (
    "recordID" SERIAL NOT NULL,
    "medicalID" TEXT NOT NULL,
    "providerID" INTEGER NOT NULL,
    "serviceDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "VictimHealthcare_pkey" PRIMARY KEY ("recordID")
);

-- CreateTable
CREATE TABLE "GovernmentSubsidy" (
    "subsidyID" SERIAL NOT NULL,
    "birthCertificateNumber" INTEGER NOT NULL,
    "dateReceived" TIMESTAMP(3),

    CONSTRAINT "GovernmentSubsidy_pkey" PRIMARY KEY ("subsidyID")
);

-- CreateTable
CREATE TABLE "Subsidy" (
    "subsidyID" SERIAL NOT NULL,
    "medicalCondition" TEXT,
    "amount" DOUBLE PRECISION,
    "eligibility" TEXT,

    CONSTRAINT "Subsidy_pkey" PRIMARY KEY ("subsidyID")
);

-- CreateTable
CREATE TABLE "Tragedy" (
    "tragedyID" SERIAL NOT NULL,
    "tragedyName" TEXT,

    CONSTRAINT "Tragedy_pkey" PRIMARY KEY ("tragedyID")
);

-- CreateTable
CREATE TABLE "TragedyVictim" (
    "tragedyVictimID" SERIAL NOT NULL,
    "tragedyID" INTEGER NOT NULL,
    "birthCertificateNumber" INTEGER NOT NULL,

    CONSTRAINT "TragedyVictim_pkey" PRIMARY KEY ("tragedyVictimID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Victim_medicalID_key" ON "Victim"("medicalID");

-- CreateIndex
CREATE UNIQUE INDEX "Recipient_familyID_key" ON "Recipient"("familyID");

-- AddForeignKey
ALTER TABLE "Victim" ADD CONSTRAINT "Victim_medicalID_fkey" FOREIGN KEY ("medicalID") REFERENCES "Medical"("medicalID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Victim" ADD CONSTRAINT "Victim_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Event"("eventID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Victim" ADD CONSTRAINT "Victim_familyID_fkey" FOREIGN KEY ("familyID") REFERENCES "FamilyInfo"("familyID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipient" ADD CONSTRAINT "Recipient_familyID_fkey" FOREIGN KEY ("familyID") REFERENCES "FamilyInfo"("familyID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NGO_Service_Provided" ADD CONSTRAINT "NGO_Service_Provided_birthCertificateNumber_fkey" FOREIGN KEY ("birthCertificateNumber") REFERENCES "Victim"("birthCertificateNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NGO_Service_Provided" ADD CONSTRAINT "NGO_Service_Provided_ngoID_fkey" FOREIGN KEY ("ngoID") REFERENCES "NGO"("ngoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VictimHealthcare" ADD CONSTRAINT "VictimHealthcare_medicalID_fkey" FOREIGN KEY ("medicalID") REFERENCES "Medical"("medicalID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VictimHealthcare" ADD CONSTRAINT "VictimHealthcare_providerID_fkey" FOREIGN KEY ("providerID") REFERENCES "HealthcareProvider"("providerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentSubsidy" ADD CONSTRAINT "GovernmentSubsidy_birthCertificateNumber_fkey" FOREIGN KEY ("birthCertificateNumber") REFERENCES "Victim"("birthCertificateNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TragedyVictim" ADD CONSTRAINT "TragedyVictim_tragedyID_fkey" FOREIGN KEY ("tragedyID") REFERENCES "Tragedy"("tragedyID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TragedyVictim" ADD CONSTRAINT "TragedyVictim_birthCertificateNumber_fkey" FOREIGN KEY ("birthCertificateNumber") REFERENCES "Victim"("birthCertificateNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
