import { NextRequest, NextResponse } from "next/server";
import { MedicalRecordStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

const updateSchema = z.object({
  symptoms: z.string().min(1).max(5000).optional(),
  diagnosis: z.string().min(1).max(5000).optional(),
  treatment: z.string().min(1).max(5000).optional(),
  notes: z.string().max(5000).optional().nullable(),
  followUpDate: z.string().datetime().optional().nullable(),
  status: z.nativeEnum(MedicalRecordStatus).optional(),
});

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR", "NURSE", "PATIENT"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const record = await prisma.medicalRecord.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true } },
      doctor: { select: { id: true, name: true, specialization: true } },
      appointment: true,
    },
  });
  if (!record) return NextResponse.json({ success: false, message: "Medical record not found" }, { status: 404 });
  if (auth.session.role === "PATIENT") {
    const ownsRecord = await prisma.patient.findFirst({ where: { id: record.patientId, userId: auth.session.id } });
    if (!ownsRecord) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ success: true, data: record });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });

  try {
    const record = await prisma.medicalRecord.update({
      where: { id },
      data: {
        ...(parsed.data.symptoms !== undefined ? { symptoms: parsed.data.symptoms.trim() } : {}),
        ...(parsed.data.diagnosis !== undefined ? { diagnosis: parsed.data.diagnosis.trim() } : {}),
        ...(parsed.data.treatment !== undefined ? { treatment: parsed.data.treatment.trim() } : {}),
        ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes?.trim() || null } : {}),
        ...(parsed.data.followUpDate !== undefined
          ? { followUpDate: parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : null }
          : {}),
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
      },
    });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Update medical record error", error);
    return NextResponse.json({ success: false, message: "Unable to update medical record" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const record = await prisma.medicalRecord.update({
    where: { id },
    data: { status: "CLOSED" },
  });
  return NextResponse.json({ success: true, data: record });
}
