import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({ status: z.nativeEnum(PaymentStatus), receiptUrl: z.string().url().optional().nullable() });

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request, ["ADMIN", "RECEPTIONIST"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  const payment = await prisma.payment.update({ where: { id }, data: parsed.data });
  await writeAuditLog({ userId: auth.session.id, action: "UPDATE", resource: "Payment", resourceId: id, metadata: { status: parsed.data.status } });
  return NextResponse.json({ success: true, data: payment });
}
