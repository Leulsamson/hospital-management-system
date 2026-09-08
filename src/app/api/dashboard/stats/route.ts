import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]);
  if (!auth.ok) return auth.response;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const [patients, doctors, departments, today, upcoming, completed, cancelled] = await Promise.all([
    prisma.patient.count({ where: { isActive: true } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.department.count({ where: { isActive: true } }),
    prisma.appointment.count({ where: { appointmentDate: { gte: start, lte: end } } }),
    prisma.appointment.count({ where: { appointmentDate: { gt: end }, status: "SCHEDULED" } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
  ]);
  return NextResponse.json({
    success: true,
    data: { totalPatients: patients, totalDoctors: doctors, totalDepartments: departments, todayAppointments: today, upcomingAppointments: upcoming, completedAppointments: completed, cancelledAppointments: cancelled },
  });
}
