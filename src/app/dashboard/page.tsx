import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard-shell";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  const [patients, doctors, appointments, departments] = await Promise.all([
    prisma.patient.count({ where: { isActive: true } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.count(),
    prisma.department.count({ where: { isActive: true } }),
  ]);

  return (
    <DashboardShell
      user={session}
      stats={[
        { label: "Active Patients", value: patients, accent: "#0f766e" },
        { label: "Active Doctors", value: doctors, accent: "#0b5f7a" },
        { label: "Appointments", value: appointments, accent: "#b45309" },
        { label: "Departments", value: departments, accent: "#14532d" },
      ]}
    />
  );
}
