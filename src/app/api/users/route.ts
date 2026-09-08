import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
import { hashPassword } from "@/lib/password";

const querySchema = z.object({
  q: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.nativeEnum(Role),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;
  const parsed = querySchema.safeParse({
    q: request.nextUrl.searchParams.get("q") ?? undefined,
    role: request.nextUrl.searchParams.get("role") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
  });
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
  const { q, role, page, pageSize } = parsed.data;
  const where = { ...(q ? { email: { contains: q, mode: "insensitive" as const } } : {}), ...(role ? { role } : {}) };
  const [total, data] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        doctor: { select: { id: true, name: true, isActive: true } },
        patient: { select: { id: true, name: true, isActive: true } },
        nurse: { select: { id: true, name: true, isActive: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return NextResponse.json({ success: true, data, meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  try {
    const data = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase().trim(),
        password: await hashPassword(parsed.data.password),
        role: parsed.data.role,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Create user error", error);
    return NextResponse.json({ success: false, message: "Unable to create user; email may already exist" }, { status: 409 });
  }
}
