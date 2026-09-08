import { NextRequest, NextResponse } from "next/server";
import { PrescriptionStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

const querySchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.nativeEnum(PrescriptionStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const medicationItemSchema = z.object({
  medicationId: z.string().min(1),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  duration: z.string().min(1).max(100),
  notes: z.string().max(500).optional().nullable(),
});

const createSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  notes: z.string().max(2000).optional().nullable(),
  medications: z.array(medicationItemSchema).min(1),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR", "NURSE", "PATIENT"]);
  if (!auth.ok) return auth.response;
  const parsed = querySchema.safeParse({
    patientId: request.nextUrl.searchParams.get("patientId") ?? undefined,
    doctorId: request.nextUrl.searchParams.get("doctorId") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
  });
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
  const { patientId, doctorId, status, page, pageSize } = parsed.data;
  const where = {
    ...(patientId ? { patientId } : {}),
    ...(doctorId ? { doctorId } : {}),
    ...(status ? { status } : {}),
    ...(auth.session.role === "PATIENT" ? { patient: { userId: auth.session.id } } : {}),
  };
  const [total, data] = await Promise.all([
    prisma.prescription.count({ where }),
    prisma.prescription.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true } },
        doctor: { select: { id: true, name: true } },
        prescriptionMedications: { include: { medication: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return NextResponse.json({ success: true, data, meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR"]);
  if (!auth.ok) return auth.response;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  const data = await prisma.prescription.create({
    data: {
      patientId: parsed.data.patientId,
      doctorId: parsed.data.doctorId,
      notes: parsed.data.notes?.trim() || null,
      prescriptionMedications: { create: parsed.data.medications },
    },
    include: { prescriptionMedications: { include: { medication: true } } },
  });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
