import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE", "PATIENT"]);

  if (!auth.ok) {
    return auth.response;
  }

  const [departments, doctors, patients] = await Promise.all([
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.doctor.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, specialization: true, departmentId: true },
    }),
    auth.session.role === "PATIENT"
      ? prisma.patient.findMany({ where: { userId: auth.session.id, isActive: true }, select: { id: true, name: true, departmentId: true } })
      : prisma.patient.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, departmentId: true },
        }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      departments,
      doctors,
      patients,
    },
  });
}
