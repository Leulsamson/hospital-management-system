import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, signSessionToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid login payload" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = await signSessionToken({
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { success: false, message: "Unable to login" },
      { status: 500 },
    );
  }
}
