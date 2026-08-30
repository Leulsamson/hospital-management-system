import type { Role } from "@/generated/prisma/enums";

export const ROLE_ACCESS: Record<string, Role[]> = {
  "/dashboard/admin": ["ADMIN"],
  "/dashboard/doctor": ["DOCTOR", "ADMIN"],
  "/dashboard/nurse": ["NURSE", "ADMIN"],
  "/dashboard/reception": ["RECEPTIONIST", "ADMIN"],
  "/dashboard/patient": ["PATIENT", "ADMIN"],
  "/dashboard/patients": ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"],
  "/dashboard/appointments": ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE", "PATIENT"],
  "/dashboard/appointments/new": ["ADMIN", "RECEPTIONIST", "PATIENT"],
};

export function canAccessPath(pathname: string, role: Role): boolean {
  for (const [pathPrefix, allowedRoles] of Object.entries(ROLE_ACCESS)) {
    if (pathname.startsWith(pathPrefix)) {
      return allowedRoles.includes(role);
    }
  }

  return true;
}
