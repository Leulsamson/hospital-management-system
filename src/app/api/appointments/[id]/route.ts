import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AppointmentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
import {
  parseAppointmentId,
  validateAppointmentBooking,
} from "@/lib/appointments";

const updateAppointmentSchema = z.object({
  appointmentDate: z.string().datetime().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  reason: z.string().max(400).optional(),
  notes: z.string().max(500).optional(),
  departmentId: z.number().int().positive().optional(),
  doctorId: z.number().int().positive().optional(),
});

const appointmentInclude = {
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  doctor: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      specialization: true,
    },
  },
  department: {
    select: {
      id: true,
      name: true,
    },
  },
};

async function getSessionPatientId(userId: number) {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  });

  return patient?.id ?? null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(_request, [
    "ADMIN",
    "RECEPTIONIST",
    "DOCTOR",
    "NURSE",
    "PATIENT",
  ]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const appointmentId = parseAppointmentId(id);

  if (!appointmentId) {
    return NextResponse.json(
      { success: false, message: "Invalid appointment id" },
      { status: 400 },
    );
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: appointmentInclude,
  });

  if (!appointment) {
    return NextResponse.json(
      { success: false, message: "Appointment not found" },
      { status: 404 },
    );
  }

  if (auth.session.role === "PATIENT") {
    const linkedPatientId = await getSessionPatientId(auth.session.id);

    if (!linkedPatientId || appointment.patientId !== linkedPatientId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }
  }

  return NextResponse.json({ success: true, data: appointment });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(request, [
    "ADMIN",
    "RECEPTIONIST",
    "PATIENT",
  ]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const appointmentId = parseAppointmentId(id);

  if (!appointmentId) {
    return NextResponse.json(
      { success: false, message: "Invalid appointment id" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 },
      );
    }

    if (auth.session.role === "PATIENT") {
      const linkedPatientId = await getSessionPatientId(auth.session.id);

      if (!linkedPatientId || existing.patientId !== linkedPatientId) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 },
        );
      }
    }

    if (
      existing.status === "COMPLETED" ||
      existing.status === "CANCELLED"
    ) {
      return NextResponse.json(
        { success: false, message: "Cannot modify a completed or cancelled appointment" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = updateAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 },
      );
    }

    const nextDate = parsed.data.appointmentDate
      ? new Date(parsed.data.appointmentDate)
      : existing.appointmentDate;

    const nextDoctorId = parsed.data.doctorId ?? existing.doctorId;
    const nextDepartmentId = parsed.data.departmentId ?? existing.departmentId;

    const isReschedule =
      nextDate.getTime() !== existing.appointmentDate.getTime() ||
      nextDoctorId !== existing.doctorId ||
      nextDepartmentId !== existing.departmentId;

    if (isReschedule) {
      const validation = await validateAppointmentBooking({
        patientId: existing.patientId,
        doctorId: nextDoctorId,
        departmentId: nextDepartmentId,
        appointmentDate: nextDate,
        excludeAppointmentId: appointmentId,
      });

      if (!validation.ok) {
        return NextResponse.json(
          { success: false, message: validation.message },
          { status: validation.status ?? 400 },
        );
      }
    }

    if (
      parsed.data.status &&
      auth.session.role === "PATIENT" &&
      !["CANCELLED", "SCHEDULED"].includes(parsed.data.status)
    ) {
      return NextResponse.json(
        { success: false, message: "Patients can only cancel appointments" },
        { status: 403 },
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(parsed.data.appointmentDate
          ? { appointmentDate: nextDate }
          : {}),
        ...(parsed.data.doctorId ? { doctorId: nextDoctorId } : {}),
        ...(parsed.data.departmentId
          ? { departmentId: nextDepartmentId }
          : {}),
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.reason !== undefined
          ? { reason: parsed.data.reason.trim() || null }
          : {}),
        ...(parsed.data.notes !== undefined
          ? { notes: parsed.data.notes.trim() || null }
          : {}),
      },
      include: appointmentInclude,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update appointment error", error);

    return NextResponse.json(
      { success: false, message: "Unable to update appointment" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(request, [
    "ADMIN",
    "RECEPTIONIST",
    "PATIENT",
  ]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const appointmentId = parseAppointmentId(id);

  if (!appointmentId) {
    return NextResponse.json(
      { success: false, message: "Invalid appointment id" },
      { status: 400 },
    );
  }

  const existing = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Appointment not found" },
      { status: 404 },
    );
  }

  if (auth.session.role === "PATIENT") {
    const linkedPatientId = await getSessionPatientId(auth.session.id);

    if (!linkedPatientId || existing.patientId !== linkedPatientId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }
  }

  if (
    existing.status === "COMPLETED" ||
    existing.status === "CANCELLED"
  ) {
    return NextResponse.json(
      { success: false, message: "Appointment is already closed" },
      { status: 400 },
    );
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({
    success: true,
    message: "Appointment cancelled",
  });
}
