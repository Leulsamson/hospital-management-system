CREATE TABLE IF NOT EXISTS "InventoryMovement" (
  "id" TEXT NOT NULL,
  "medicationId" TEXT NOT NULL,
  "userId" TEXT,
  "quantityDelta" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InventoryMovement_medicationId_createdAt_idx"
  ON "InventoryMovement"("medicationId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'InventoryMovement_medicationId_fkey'
  ) THEN
    ALTER TABLE "InventoryMovement"
      ADD CONSTRAINT "InventoryMovement_medicationId_fkey"
      FOREIGN KEY ("medicationId") REFERENCES "Medication"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'InventoryMovement_userId_fkey'
  ) THEN
    ALTER TABLE "InventoryMovement"
      ADD CONSTRAINT "InventoryMovement_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
