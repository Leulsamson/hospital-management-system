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

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Verify password (password field stores the hashed password in the current schema)
    const isValidPassword = await verifyPassword(parsed.data.password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Try to load a linked profile name (doctor / patient / nurse)
    let profileName: string | null = null;
    let profileIsActive: boolean | null = null;

    if (user.role === "DOCTOR") {
      const doc = await prisma.doctor.findUnique({ where: { userId: user.id }, select: { name: true, isActive: true } });
      profileName = doc?.name ?? null;
      profileIsActive = doc?.isActive ?? null;
    } else if (user.role === "PATIENT") {
      const pat = await prisma.patient.findUnique({ where: { userId: user.id }, select: { name: true, isActive: true } });
      profileName = pat?.name ?? null;
      profileIsActive = pat?.isActive ?? null;
    } else if (user.role === "NURSE") {
      const nurse = await prisma.nurse.findUnique({ where: { userId: user.id }, select: { name: true, isActive: true } });
      profileName = nurse?.name ?? null;
      profileIsActive = nurse?.isActive ?? null;
    }

    if (profileIsActive === false) {
      return NextResponse.json(
        { success: false, message: "Account is deactivated" },
        { status: 403 },
      );
    }

    const token = await signSessionToken({
      id: user.id,
      role: user.role,
      email: user.email,
      name: profileName ?? user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: profileName ?? user.email,
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
