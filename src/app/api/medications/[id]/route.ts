import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

const updateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
});

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const data = await prisma.medication.findUnique({ where: { id } });
  if (!data) return NextResponse.json({ success: false, message: "Medication not found" }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  const data = await prisma.medication.update({
    where: { id },
    data: { name: parsed.data.name.trim(), description: parsed.data.description?.trim() || null },
  });
  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  try {
    await prisma.medication.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Medication deleted" });
  } catch (error) {
    console.error("Delete medication error", error);
    return NextResponse.json({ success: false, message: "Medication cannot be deleted while prescribed" }, { status: 409 });
  }
}
