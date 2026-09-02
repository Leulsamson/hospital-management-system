import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

const updateSchema = z.object({
  name: z.string().min(1).max(150),
  specialization: z.string().min(1).max(150),
  licenseNumber: z.string().min(1).max(80),
  phone: z.string().min(7).max(25).optional(),
  departmentId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true } },
      _count: { select: { appointments: true, medicalRecords: true, prescriptions: true } },
    },
  });

  if (!doctor) {
    return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: doctor });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });

    const updated = await prisma.doctor.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        specialization: parsed.data.specialization.trim(),
        licenseNumber: parsed.data.licenseNumber.trim(),
        phone: parsed.data.phone?.trim() ?? null,
        departmentId: parsed.data.departmentId ?? undefined,
        ...(typeof parsed.data.isActive === "boolean" ? { isActive: parsed.data.isActive } : {}),
      },
      include: { department: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update doctor error", error);
    return NextResponse.json({ success: false, message: "Unable to update doctor" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(_request, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  await prisma.doctor.update({ where: { id }, data: { isActive: false } });

  return NextResponse.json({ success: true, message: "Doctor deactivated" });
}
