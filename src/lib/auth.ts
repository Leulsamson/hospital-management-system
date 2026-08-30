import { jwtVerify, SignJWT } from "jose";
import type { NextRequest, NextResponse } from "next/server";
import type { Role } from "@/generated/prisma/enums";

export const SESSION_COOKIE_NAME = "hms_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionClaims = {
  sub: string;
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
};

export type SessionUser = {
  id: number;
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
};

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters long");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const claims = payload as Partial<SessionClaims>;
    const userId = Number(claims.sub);

    if (!userId || !claims.role || !claims.email || !claims.firstName || !claims.lastName) {
      return null;
    }

    return {
      id: userId,
      role: claims.role,
      email: claims.email,
      firstName: claims.firstName,
      lastName: claims.lastName,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
