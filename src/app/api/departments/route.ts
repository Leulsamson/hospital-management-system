import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

const listQuerySchema = z.object({
  q: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const createDepartmentSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR"]);
  if (!auth.ok) return auth.response;

  const rawQuery = {
    q: request.nextUrl.searchParams.get("q") ?? undefined,
    isActive: request.nextUrl.searchParams.get("isActive") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
  };

  const parsed = listQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
  }

  const { q, isActive, page, pageSize } = parsed.data;
  const where: any = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(typeof isActive !== "undefined" ? { isActive: isActive === "true" } : {}),
  };

  const skip = (page - 1) * pageSize;

  const [total, departments] = await Promise.all([
    prisma.department.count({ where }),
    prisma.department.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
      include: { doctors: { select: { id: true } } },
    }),
  ]);

  const mapped = departments.map((d) => ({ ...d, doctorCount: d.doctors.length }));

  return NextResponse.json({
    success: true,
    data: mapped,
    meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = createDepartmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const created = await prisma.department.create({
      data: { name: parsed.data.name.trim(), description: parsed.data.description?.trim() || null },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Create department error", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, message: "Department name already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Unable to create department" }, { status: 500 });
  }
}
