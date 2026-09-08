import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
import { hashPassword } from "@/lib/password";

const updateSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  password: z.string().min(8).max(200).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (!parsed.data.role && !parsed.data.password && parsed.data.isActive === undefined)) {
    return NextResponse.json({ success: false, message: "Provide a role, password, or active state to update" }, { status: 400 });
  }
  const data = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
      ...(parsed.data.password ? { password: await hashPassword(parsed.data.password) } : {}),
      ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
    },
    select: { id: true, email: true, role: true, isActive: true, updatedAt: true },
  });
  return NextResponse.json({ success: true, data });
}
