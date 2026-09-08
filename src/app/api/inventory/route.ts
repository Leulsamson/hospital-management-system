import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";

const updateSchema = z.object({
  stockQuantity: z.number().int().min(0),
  reorderLevel: z.number().int().min(0).optional(),
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
  const data = await prisma.medication.update({ where: { id: medicationId }, data: parsed.data });
  await writeAuditLog({ userId: auth.session.id, action: "UPDATE_STOCK", resource: "Medication", resourceId: medicationId });
  return NextResponse.json({ success: true, data });
}
