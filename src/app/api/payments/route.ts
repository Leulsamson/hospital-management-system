import { NextRequest, NextResponse } from "next/server";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";

const querySchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});
const createSchema = z.object({
  appointmentId: z.string().min(1),
  amount: z.number().nonnegative(),
  method: z.nativeEnum(PaymentMethod),
  receiptUrl: z.string().url().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "RECEPTIONIST", "PATIENT"]);
  if (!auth.ok) return auth.response;
  const parsed = querySchema.safeParse({
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
  });
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid query parameters" }, { status: 400 });
  const { status, page, pageSize } = parsed.data;
  const where = {
    ...(status ? { status } : {}),
    ...(auth.session.role === "PATIENT" ? { appointment: { patient: { userId: auth.session.id } } } : {}),
  };
  const [total, data] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: { appointment: { select: { id: true, appointmentDate: true, patient: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return NextResponse.json({ success: true, data, meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, ["ADMIN", "RECEPTIONIST", "PATIENT"]);
  if (!auth.ok) return auth.response;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  const appointment = await prisma.appointment.findUnique({
    where: { id: parsed.data.appointmentId },
    select: { id: true, patient: { select: { userId: true } } },
  });
  if (!appointment) return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
  if (auth.session.role === "PATIENT" && appointment.patient.userId !== auth.session.id) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }
  try {
    const payment = await prisma.payment.create({ data: parsed.data });
    await writeAuditLog({ userId: auth.session.id, action: "CREATE", resource: "Payment", resourceId: payment.id });
    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error("Create payment error", error);
    return NextResponse.json({ success: false, message: "Payment already exists or could not be created" }, { status: 409 });
  }
}
