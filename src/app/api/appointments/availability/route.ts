import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiSession } from "@/lib/api-auth";
import { getAvailableSlots } from "@/lib/appointments";

const querySchema = z.object({
  doctorId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, [
    "ADMIN",
    "RECEPTIONIST",
    "DOCTOR",
    "NURSE",
    "PATIENT",
  ]);

  if (!auth.ok) {
    return auth.response;
  }

  const rawQuery = {
    doctorId: request.nextUrl.searchParams.get("doctorId") ?? undefined,
    date: request.nextUrl.searchParams.get("date") ?? undefined,
  };

  const parsed = querySchema.safeParse(rawQuery);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid query parameters" },
      { status: 400 },
    );
  }

  const result = await getAvailableSlots(parsed.data.doctorId, parsed.data.date);

  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: result.message },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    data: result.slots,
  });
}
