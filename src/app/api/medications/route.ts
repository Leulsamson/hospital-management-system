import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

const querySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const medicationSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  stockQuantity: z.number().int().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]);
  if (!auth.ok) return auth.response;
  const parsed = querySchema.safeParse({
    q: request.nextUrl.searchParams.get("q") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
  });
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
  const { q, page, pageSize } = parsed.data;
  const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};
  const [total, data] = await Promise.all([
    prisma.medication.count({ where }),
    prisma.medication.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return NextResponse.json({ success: true, data, meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "DOCTOR"]);
  if (!auth.ok) return auth.response;
  const parsed = medicationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  const medication = await prisma.medication.create({
    data: { name: parsed.data.name.trim(), description: parsed.data.description?.trim() || null, stockQuantity: parsed.data.stockQuantity, reorderLevel: parsed.data.reorderLevel },
  });
  return NextResponse.json({ success: true, data: medication }, { status: 201 });
}
