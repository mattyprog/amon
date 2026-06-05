-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "notes" TEXT,
    "date" TEXT NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Appointment_date_status_idx" ON "Appointment"("date", "status");

-- CreateIndex
CREATE INDEX "Block_date_idx" ON "Block"("date");
