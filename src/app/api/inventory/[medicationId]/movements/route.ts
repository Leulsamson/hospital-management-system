import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

export async function GET(request: NextRequest, context: { params: Promise<{ medicationId: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]);
  if (!auth.ok) return auth.response;
  const { medicationId } = await context.params;
  const data = await prisma.inventoryMovement.findMany({
    where: { medicationId },
    include: { user: { select: { email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ success: true, data });
}
