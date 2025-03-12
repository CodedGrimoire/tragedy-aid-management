/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `NGO` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registrationNo]` on the table `NGO` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "victimCount" INTEGER;

-- AlterTable
ALTER TABLE "NGO" ADD COLUMN     "address" TEXT,
ADD COLUMN     "availableResources" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "focusArea" TEXT,
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "primaryContact" TEXT,
ADD COLUMN     "registrationNo" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "NGO_Service_Provided" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "serviceType" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "NGO_ServiceArea" (
    "serviceAreaID" SERIAL NOT NULL,
    "ngoID" INTEGER NOT NULL,
    "locationName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusKm" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NGO_ServiceArea_pkey" PRIMARY KEY ("serviceAreaID")
);

-- CreateTable
CREATE TABLE "NGO_ResourceInventory" (
    "inventoryID" SERIAL NOT NULL,
    "ngoID" INTEGER NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT,
    "expiryDate" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "NGO_ResourceInventory_pkey" PRIMARY KEY ("inventoryID")
);

-- CreateTable
CREATE TABLE "NGO_Staff" (
    "staffID" SERIAL NOT NULL,
    "ngoID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "contact" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "specialization" TEXT,
    "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NGO_Staff_pkey" PRIMARY KEY ("staffID")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "requestID" SERIAL NOT NULL,
    "birthCertificateNumber" INTEGER NOT NULL,
    "ngoID" INTEGER NOT NULL,
    "requestType" TEXT NOT NULL,
    "urgencyLevel" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "respondedBy" INTEGER,
    "responseDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("requestID")
);

-- CreateTable
CREATE TABLE "ServiceItem" (
    "serviceItemID" SERIAL NOT NULL,
    "requestID" INTEGER NOT NULL,
    "inventoryID" INTEGER,
    "serviceType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "ServiceItem_pkey" PRIMARY KEY ("serviceItemID")
);

-- CreateTable
CREATE TABLE "ServiceDeliveryLog" (
    "logID" SERIAL NOT NULL,
    "serviceID" INTEGER NOT NULL,
    "staffID" INTEGER NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "feedback" TEXT,
    "effectivenessRating" INTEGER,
    "followupNeeded" BOOLEAN NOT NULL DEFAULT false,
    "followupDate" TIMESTAMP(3),
    "notes" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "ServiceDeliveryLog_pkey" PRIMARY KEY ("logID")
);

-- CreateTable
CREATE TABLE "VictimNeed" (
    "needID" SERIAL NOT NULL,
    "birthCertificateNumber" INTEGER NOT NULL,
    "needType" TEXT NOT NULL,
    "urgencyLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dateIdentified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateAddressed" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "VictimNeed_pkey" PRIMARY KEY ("needID")
);

-- CreateIndex
CREATE UNIQUE INDEX "NGO_Staff_email_key" ON "NGO_Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NGO_email_key" ON "NGO"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NGO_registrationNo_key" ON "NGO"("registrationNo");

-- AddForeignKey
ALTER TABLE "NGO_ServiceArea" ADD CONSTRAINT "NGO_ServiceArea_ngoID_fkey" FOREIGN KEY ("ngoID") REFERENCES "NGO"("ngoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NGO_ResourceInventory" ADD CONSTRAINT "NGO_ResourceInventory_ngoID_fkey" FOREIGN KEY ("ngoID") REFERENCES "NGO"("ngoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NGO_Staff" ADD CONSTRAINT "NGO_Staff_ngoID_fkey" FOREIGN KEY ("ngoID") REFERENCES "NGO"("ngoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_birthCertificateNumber_fkey" FOREIGN KEY ("birthCertificateNumber") REFERENCES "Victim"("birthCertificateNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_ngoID_fkey" FOREIGN KEY ("ngoID") REFERENCES "NGO"("ngoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_respondedBy_fkey" FOREIGN KEY ("respondedBy") REFERENCES "NGO_Staff"("staffID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceItem" ADD CONSTRAINT "ServiceItem_requestID_fkey" FOREIGN KEY ("requestID") REFERENCES "ServiceRequest"("requestID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceItem" ADD CONSTRAINT "ServiceItem_inventoryID_fkey" FOREIGN KEY ("inventoryID") REFERENCES "NGO_ResourceInventory"("inventoryID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDeliveryLog" ADD CONSTRAINT "ServiceDeliveryLog_serviceID_fkey" FOREIGN KEY ("serviceID") REFERENCES "NGO_Service_Provided"("serviceID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDeliveryLog" ADD CONSTRAINT "ServiceDeliveryLog_staffID_fkey" FOREIGN KEY ("staffID") REFERENCES "NGO_Staff"("staffID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VictimNeed" ADD CONSTRAINT "VictimNeed_birthCertificateNumber_fkey" FOREIGN KEY ("birthCertificateNumber") REFERENCES "Victim"("birthCertificateNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
