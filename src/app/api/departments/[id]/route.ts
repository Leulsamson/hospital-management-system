import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

const updateSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const department = await prisma.department.findUnique({
    where: { id },
    include: { doctors: { select: { id: true, name: true, isActive: true } } },
  });

  if (!department) {
    return NextResponse.json({ success: false, message: "Department not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: department });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() ?? null,
        ...(typeof parsed.data.isActive === "boolean" ? { isActive: parsed.data.isActive } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update department error", error);
    return NextResponse.json({ success: false, message: "Unable to update department" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(_request, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  await prisma.department.update({ where: { id }, data: { isActive: false } });

  return NextResponse.json({ success: true, message: "Department deactivated" });
}
