import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@/generated/prisma/enums";
import { getSessionFromRequest } from "@/lib/auth";

export async function requireApiSession(
  request: NextRequest,
  allowedRoles?: Role[],
): Promise<{ ok: true; session: { id: number; role: Role } } | { ok: false; response: NextResponse }> {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, session: { id: session.id, role: session.role } };
}
