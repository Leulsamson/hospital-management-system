import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";

const updateSchema = z.object({
  stockQuantity: z.number().int().min(0),
  reorderLevel: z.number().int().min(0).optional(),
  reason: z.string().min(1).max(200),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]);
  if (!auth.ok) return auth.response;
  const data = await prisma.medication.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, stockQuantity: true, reorderLevel: true },
  });
  return NextResponse.json({ success: true, data, lowStock: data.filter((item) => item.stockQuantity <= item.reorderLevel) });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "NURSE"]);
  if (!auth.ok) return auth.response;
  const medicationId = request.nextUrl.searchParams.get("medicationId");
  if (!medicationId) return NextResponse.json({ success: false, message: "medicationId is required" }, { status: 400 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  const current = await prisma.medication.findUnique({ where: { id: medicationId }, select: { stockQuantity: true } });
  if (!current) return NextResponse.json({ success: false, message: "Medication not found" }, { status: 404 });
  const data = await prisma.$transaction(async (tx) => {
    const medication = await tx.medication.update({
      where: { id: medicationId },
      data: { stockQuantity: parsed.data.stockQuantity, ...(parsed.data.reorderLevel !== undefined ? { reorderLevel: parsed.data.reorderLevel } : {}) },
    });
    if (parsed.data.stockQuantity !== current.stockQuantity) {
      await tx.inventoryMovement.create({
        data: {
          medicationId,
          userId: auth.session.id,
          quantityDelta: parsed.data.stockQuantity - current.stockQuantity,
          reason: parsed.data.reason,
        },
      });
    }
    return medication;
  });
  await writeAuditLog({ userId: auth.session.id, action: "UPDATE_STOCK", resource: "Medication", resourceId: medicationId });
  return NextResponse.json({ success: true, data });
}
