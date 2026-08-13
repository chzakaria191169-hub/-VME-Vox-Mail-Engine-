-- CreateTable
CREATE TABLE "MetricEventLedger" (
    "eventId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricEventLedger_pkey" PRIMARY KEY ("eventId")
);
