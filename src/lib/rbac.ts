import type { Role } from "@prisma/client";

export const ROLE_ACCESS: Record<string, Role[]> = {
  "/dashboard/admin": ["ADMIN"],
  "/dashboard/doctor": ["DOCTOR", "ADMIN"],
  "/dashboard/nurse": ["NURSE", "ADMIN"],
  "/dashboard/reception": ["RECEPTIONIST", "ADMIN"],
  "/dashboard/patient": ["PATIENT", "ADMIN"],
  "/dashboard/patients": ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"],
  "/dashboard/appointments": ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE", "PATIENT"],
  "/dashboard/appointments/new": ["ADMIN", "RECEPTIONIST", "PATIENT"],
  "/dashboard/medical-records": ["ADMIN", "DOCTOR", "NURSE", "PATIENT"],
  "/dashboard/prescriptions": ["ADMIN", "DOCTOR", "NURSE", "PATIENT"],
  "/dashboard/medications": ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"],
  "/dashboard/payments": ["ADMIN", "RECEPTIONIST", "PATIENT"],
  "/dashboard/inventory": ["ADMIN", "NURSE"],
  "/dashboard/users": ["ADMIN"],
  "/dashboard/audit-logs": ["ADMIN"],
  "/dashboard/analytics": ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"],
};

export function canAccessPath(pathname: string, role: Role): boolean {
  for (const [pathPrefix, allowedRoles] of Object.entries(ROLE_ACCESS)) {
    if (pathname.startsWith(pathPrefix)) {
      return allowedRoles.includes(role);
    }
  }

  return true;
}
