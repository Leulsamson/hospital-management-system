import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
import { hashPassword } from "@/lib/password";

const listQuerySchema = z.object({
  q: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  departmentId: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const createPatientSchema = z.object({
  name: z.string().min(1).max(150),
  dateOfBirth: z.string().datetime(),
  gender: z.nativeEnum(Gender),
  phone: z.string().min(7).max(25).optional(),
  address: z.string().max(300).optional(),
  departmentId: z.string().optional().nullable(),
});

const managementRoles = ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"] as const;

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, [...managementRoles]);

  if (!auth.ok) {
    return auth.response;
  }

  const rawQuery = {
    q: request.nextUrl.searchParams.get("q") ?? undefined,
    gender: request.nextUrl.searchParams.get("gender") ?? undefined,
    departmentId: request.nextUrl.searchParams.get("departmentId") ?? undefined,
    isActive: request.nextUrl.searchParams.get("isActive") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
  };

  const parsed = listQuerySchema.safeParse(rawQuery);

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
  }

  const { q, gender, departmentId, isActive, page, pageSize } = parsed.data;
  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
            { address: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(gender ? { gender } : {}),
    ...(departmentId ? { departmentId } : {}),
    ...(isActive ? { isActive: isActive === "true" } : {}),
  };

  const skip = (page - 1) * pageSize;

  const [total, patients, departments] = await Promise.all([
    prisma.patient.count({ where }),
    prisma.patient.findMany({
      where,
      include: {
        user: { select: { email: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({
    success: true,
    data: patients,
    departments,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "RECEPTIONIST"]);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const parsed = createPatientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const slug = parsed.data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
    const user = await prisma.user.create({
      data: {
        email: `${slug || "patient"}.${crypto.randomUUID().slice(0, 8)}@careflow.local`,
        password: await hashPassword(crypto.randomUUID()),
        role: "PATIENT",
      },
    });

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        name: parsed.data.name.trim(),
        dateOfBirth: new Date(parsed.data.dateOfBirth),
        gender: parsed.data.gender,
        phone: parsed.data.phone?.trim() || null,
        address: parsed.data.address?.trim() || null,
        departmentId: parsed.data.departmentId || null,
      },
      include: {
        user: { select: { email: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error) {
    console.error("Create patient error", error);
    return NextResponse.json({ success: false, message: "Unable to create patient" }, { status: 500 });
  }
}
