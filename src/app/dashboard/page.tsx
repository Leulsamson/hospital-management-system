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

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const [patients, doctors, appointments, todayAppointments, admittedPatients, revenue, recentAppointments, recentPatients] = await Promise.all([
    prisma.patient.count({ where: { isActive: true } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.count(),
    prisma.appointment.count({
      where: { appointmentDate: { gte: todayStart, lte: todayEnd }, status: "SCHEDULED" },
    }),
    Promise.resolve(0),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
    prisma.appointment.findMany({
      take: 5,
      orderBy: { appointmentDate: "desc" },
      include: { patient: { select: { name: true } }, doctor: { select: { name: true } } },
    }),
    prisma.patient.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { department: { select: { name: true } } },
    }),
  ]);

  return (
    <DashboardShell
      user={session}
      stats={[
        { label: "Total Patients", value: patients, detail: "Active records", icon: "♙", tone: "bg-teal-50 text-teal-700" },
        { label: "Today's Appointments", value: todayAppointments, detail: "Scheduled today", icon: "◷", tone: "bg-sky-50 text-sky-700" },
        { label: "Available Doctors", value: doctors, detail: "Active clinicians", icon: "✚", tone: "bg-violet-50 text-violet-700" },
        { label: "Admitted Patients", value: admittedPatients, detail: "Admissions module pending", icon: "⌑", tone: "bg-amber-50 text-amber-700" },
        { label: "Revenue", value: `$${(revenue._sum.amount ?? 0).toLocaleString()}`, detail: "Completed payments", icon: "▣", tone: "bg-emerald-50 text-emerald-700" },
        { label: "Pending Lab Tests", value: "—", detail: "Laboratory module pending", icon: "⚗", tone: "bg-rose-50 text-rose-700" },
      ]}
      appointments={recentAppointments.map((appointment) => ({
        id: appointment.id,
        patient: appointment.patient.name,
        doctor: appointment.doctor.name,
        date: appointment.appointmentDate.toLocaleDateString(),
        status: appointment.status,
      }))}
      patients={recentPatients.map((patient) => ({
        id: patient.id,
        name: patient.name,
        department: patient.department?.name ?? "Unassigned",
        date: patient.createdAt.toLocaleDateString(),
      }))}
    />
  );
}
