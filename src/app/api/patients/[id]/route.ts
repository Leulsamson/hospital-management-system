import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

const updatePatientSchema = z.object({
  name: z.string().min(1).max(150),
  dateOfBirth: z.string().datetime(),
  gender: z.nativeEnum(Gender),
  phone: z.string().min(7).max(25).optional(),
  address: z.string().max(300).optional(),
  departmentId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      department: { select: { id: true, name: true } },
      appointments: {
        take: 10,
        orderBy: { appointmentDate: "desc" },
        include: {
          doctor: { select: { id: true, name: true, specialization: true } },
        },
      },
      medicalRecords: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          doctor: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!patient) {
    return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: patient });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "RECEPTIONIST", "NURSE"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updatePatientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        dateOfBirth: new Date(parsed.data.dateOfBirth),
        gender: parsed.data.gender,
        phone: parsed.data.phone?.trim() || null,
        address: parsed.data.address?.trim() || null,
        departmentId: parsed.data.departmentId ?? null,
        ...(typeof parsed.data.isActive === "boolean" ? { isActive: parsed.data.isActive } : {}),
      },
      include: {
        user: { select: { email: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update patient error", error);
    return NextResponse.json({ success: false, message: "Unable to update patient" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "RECEPTIONIST"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  await prisma.patient.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, message: "Patient deactivated" });
}
