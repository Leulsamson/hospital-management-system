import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { Role } from "@/generated/prisma/enums";

const registerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role).optional(),
  setupKey: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid registration payload" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already in use" },
        { status: 409 },
      );
    }

    const userCount = await prisma.user.count();
    let assignedRole = parsed.data.role ?? Role.PATIENT;

    if (userCount === 0) {
      const setupKey = process.env.ADMIN_SETUP_KEY;

      if (!setupKey) {
        return NextResponse.json(
          { success: false, message: "ADMIN_SETUP_KEY is not configured" },
          { status: 500 },
        );
      }

      if (parsed.data.setupKey !== setupKey) {
        return NextResponse.json(
          { success: false, message: "Invalid setup key" },
          { status: 403 },
        );
      }

      assignedRole = Role.ADMIN;
    } else {
      const session = await getSessionFromRequest(request);

      if (!session || session.role !== Role.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Only admins can create users" },
          { status: 403 },
        );
      }
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        email: parsed.data.email.trim().toLowerCase(),
        passwordHash,
        role: assignedRole,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json(
      { success: false, message: "Unable to register user" },
      { status: 500 },
    );
  }
}
