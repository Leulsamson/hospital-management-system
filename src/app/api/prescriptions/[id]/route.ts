import { NextRequest, NextResponse } from "next/server";
import { PrescriptionStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

const updateSchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(PrescriptionStatus).optional(),
  medications: z.array(z.object({
    medicationId: z.string().min(1),
    dosage: z.string().min(1).max(100),
    frequency: z.string().min(1).max(100),
    duration: z.string().min(1).max(100),
    notes: z.string().max(500).optional().nullable(),
  })).optional(),
});

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR", "NURSE", "PATIENT"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const data = await prisma.prescription.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true } },
      doctor: { select: { id: true, name: true } },
      prescriptionMedications: { include: { medication: true } },
    },
  });
  if (!data) return NextResponse.json({ success: false, message: "Prescription not found" }, { status: 404 });
  if (auth.session.role === "PATIENT") {
    const ownsPrescription = await prisma.patient.findFirst({ where: { id: data.patientId, userId: auth.session.id } });
    if (!ownsPrescription) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  const data = await prisma.$transaction(async (tx) => {
    if (parsed.data.medications) {
      await tx.prescriptionMedication.deleteMany({ where: { prescriptionId: id } });
    }
    return tx.prescription.update({
      where: { id },
      data: {
        ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes?.trim() || null } : {}),
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.medications ? { prescriptionMedications: { create: parsed.data.medications } } : {}),
      },
      include: { prescriptionMedications: { include: { medication: true } } },
    });
  });
  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = z.object({ status: z.enum(["COMPLETED", "CANCELLED"]) }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ success: false, message: "Status must be COMPLETED or CANCELLED" }, { status: 400 });
  const data = await prisma.prescription.update({ where: { id }, data: { status: body.data.status } });
  return NextResponse.json({ success: true, data });
}
