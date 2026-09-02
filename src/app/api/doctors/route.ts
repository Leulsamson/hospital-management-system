import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
import { hashPassword } from "@/lib/password";

const listQuerySchema = z.object({
  q: z.string().optional(),
  departmentId: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const createSchema = z.object({
  name: z.string().min(1).max(150),
  specialization: z.string().min(1).max(150),
  licenseNumber: z.string().min(1).max(80),
  phone: z.string().min(7).max(25).optional(),
  departmentId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR"]);
  if (!auth.ok) return auth.response;

  const rawQuery = {
    q: request.nextUrl.searchParams.get("q") ?? undefined,
    departmentId: request.nextUrl.searchParams.get("departmentId") ?? undefined,
    isActive: request.nextUrl.searchParams.get("isActive") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
  };

  const parsed = listQuerySchema.safeParse(rawQuery);
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });

  const { q, departmentId, isActive, page, pageSize } = parsed.data;
  const where: any = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(departmentId ? { departmentId } : {}),
    ...(typeof isActive !== "undefined" ? { isActive: isActive === "true" } : {}),
  };

  const skip = (page - 1) * pageSize;

  const [total, doctors] = await Promise.all([
    prisma.doctor.count({ where }),
    prisma.doctor.findMany({
      where,
      include: { department: { select: { id: true, name: true } }, _count: { select: { appointments: true, medicalRecords: true, prescriptions: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ success: true, data: doctors, meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });

    const slug = parsed.data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
    const user = await prisma.user.create({
      data: {
        email: `${slug || "doctor"}.${crypto.randomUUID().slice(0, 8)}@careflow.local`,
        password: await hashPassword(crypto.randomUUID()),
        role: "DOCTOR",
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        name: parsed.data.name.trim(),
        specialization: parsed.data.specialization.trim(),
        licenseNumber: parsed.data.licenseNumber.trim(),
        phone: parsed.data.phone?.trim() || null,
        departmentId: parsed.data.departmentId,
      },
      include: { department: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, data: doctor }, { status: 201 });
  } catch (error: any) {
    console.error("Create doctor error", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, message: "Doctor with this license number already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Unable to create doctor" }, { status: 500 });
  }
}
