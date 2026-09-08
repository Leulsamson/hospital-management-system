import { NextRequest, NextResponse } from "next/server";
import { MedicalRecordStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

const querySchema = z.object({
  q: z.string().optional(),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.nativeEnum(MedicalRecordStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const createSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  appointmentId: z.string().min(1).optional(),
  symptoms: z.string().min(1).max(5000),
  diagnosis: z.string().min(1).max(5000),
  treatment: z.string().min(1).max(5000),
  notes: z.string().max(5000).optional().nullable(),
  followUpDate: z.string().datetime().optional().nullable(),
});

const clinicalRoles = ["ADMIN", "DOCTOR", "NURSE"] as const;

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, [...clinicalRoles, "PATIENT"]);
  if (!auth.ok) return auth.response;

  const parsed = querySchema.safeParse({
    q: request.nextUrl.searchParams.get("q") ?? undefined,
    patientId: request.nextUrl.searchParams.get("patientId") ?? undefined,
    doctorId: request.nextUrl.searchParams.get("doctorId") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
  }

  const { q, patientId, doctorId, status, page, pageSize } = parsed.data;
  const where = {
    ...(patientId ? { patientId } : {}),
    ...(doctorId ? { doctorId } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { symptoms: { contains: q, mode: "insensitive" as const } },
            { diagnosis: { contains: q, mode: "insensitive" as const } },
            { treatment: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(auth.session.role === "PATIENT"
      ? { patient: { userId: auth.session.id } }
      : {}),
  };
  const skip = (page - 1) * pageSize;
  const [total, data] = await Promise.all([
    prisma.medicalRecord.count({ where }),
    prisma.medicalRecord.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true } },
        doctor: { select: { id: true, name: true, specialization: true } },
        appointment: { select: { id: true, appointmentDate: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data,
    meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, [...clinicalRoles]);
  if (!auth.ok) return auth.response;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  }

  try {
    const record = await prisma.medicalRecord.create({
      data: {
        patientId: parsed.data.patientId,
        doctorId: parsed.data.doctorId,
        appointmentId: parsed.data.appointmentId,
        symptoms: parsed.data.symptoms.trim(),
        diagnosis: parsed.data.diagnosis.trim(),
        treatment: parsed.data.treatment.trim(),
        notes: parsed.data.notes?.trim() || null,
        followUpDate: parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : null,
      },
      include: {
        patient: { select: { id: true, name: true } },
        doctor: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error("Create medical record error", error);
    return NextResponse.json({ success: false, message: "Unable to create medical record" }, { status: 500 });
  }
}
