import { AppointmentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 17;
export const SLOT_MINUTES = 30;

export const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
];

export function parseAppointmentId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function buildTimeSlots(date: Date): Date[] {
  const slots: Date[] = [];
  const base = new Date(date);
  base.setHours(WORK_START_HOUR, 0, 0, 0);

  const end = new Date(date);
  end.setHours(WORK_END_HOUR, 0, 0, 0);

  while (base < end) {
    slots.push(new Date(base));
    base.setMinutes(base.getMinutes() + SLOT_MINUTES);
  }

  return slots;
}

export function formatTimeSlot(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export async function validateAppointmentBooking(input: {
  patientId: number;
  doctorId: number;
  departmentId: number;
  appointmentDate: Date;
  excludeAppointmentId?: number;
}) {
  if (input.appointmentDate.getTime() <= Date.now()) {
    return { ok: false as const, message: "Appointment must be scheduled in the future" };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: input.doctorId },
  });

  if (!doctor || !doctor.isActive) {
    return { ok: false as const, message: "Doctor not available", status: 404 };
  }

  if (doctor.departmentId !== input.departmentId) {
    return {
      ok: false as const,
      message: "Doctor does not belong to selected department",
      status: 400,
    };
  }

  const patient = await prisma.patient.findUnique({
    where: { id: input.patientId },
  });

  if (!patient || !patient.isActive) {
    return { ok: false as const, message: "Patient not available", status: 404 };
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: input.doctorId,
      appointmentDate: input.appointmentDate,
      status: { in: ACTIVE_APPOINTMENT_STATUSES },
      ...(input.excludeAppointmentId
        ? { id: { not: input.excludeAppointmentId } }
        : {}),
    },
    select: { id: true },
  });

  if (conflict) {
    return {
      ok: false as const,
      message: "This doctor already has an appointment at the selected date and time",
      status: 409,
    };
  }

  return { ok: true as const };
}

export async function getAvailableSlots(doctorId: number, date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const dayDate = new Date(year, month - 1, day);

  if (Number.isNaN(dayDate.getTime())) {
    return { ok: false as const, message: "Invalid date" };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { id: true, isActive: true },
  });

  if (!doctor || !doctor.isActive) {
    return { ok: false as const, message: "Doctor not available" };
  }

  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayDate);
  dayEnd.setHours(23, 59, 59, 999);

  const booked = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentDate: { gte: dayStart, lte: dayEnd },
      status: { in: ACTIVE_APPOINTMENT_STATUSES },
    },
    select: { appointmentDate: true },
  });

  const bookedTimes = new Set(booked.map((item) => item.appointmentDate.getTime()));
  const now = Date.now();

  const slots = buildTimeSlots(dayDate)
    .filter((slot) => slot.getTime() > now && !bookedTimes.has(slot.getTime()))
    .map((slot) => ({
      value: slot.toISOString(),
      label: formatTimeSlot(slot),
    }));

  return { ok: true as const, slots };
}
