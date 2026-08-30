import AppointmentsTable from "@/components/appointments/appointments-table";
import TodayAppointments from "@/components/appointments/today-appointments";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export default async function AppointmentsPage() {
  const session = await requireDashboardSession([
    "ADMIN",
    "RECEPTIONIST",
    "DOCTOR",
    "NURSE",
    "PATIENT",
  ]);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const patientScope =
    session.role === "PATIENT"
      ? {
          patient: {
            userId: session.id,
          },
        }
      : {};

  const [total, data, todayAppointments] = await Promise.all([
    prisma.appointment.count({ where: patientScope }),
    prisma.appointment.findMany({
      where: patientScope,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
        department: { select: { id: true, name: true } },
      },
      orderBy: { appointmentDate: "desc" },
      take: 10,
    }),
    prisma.appointment.findMany({
      where: {
        ...patientScope,
        appointmentDate: { gte: todayStart, lte: todayEnd },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true } },
      },
      orderBy: { appointmentDate: "asc" },
    }),
  ]);

  const canManage = ["ADMIN", "RECEPTIONIST", "PATIENT"].includes(session.role);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">PHASE 5</p>
          <h1 className="mt-2 text-3xl font-semibold">Appointment System</h1>
          <p className="mt-2 text-sm text-soft">
            Book, view, confirm, and cancel appointments with double-booking protection and
            real-time availability.
          </p>
        </header>

        <TodayAppointments appointments={todayAppointments} />

        <AppointmentsTable
          canManage={canManage}
          initialResult={{
            success: true,
            data: data.map((appointment) => ({
              ...appointment,
              appointmentDate: appointment.appointmentDate.toISOString(),
            })),
            meta: {
              total,
              page: 1,
              pageSize: 10,
              totalPages: Math.max(1, Math.ceil(total / 10)),
            },
          }}
        />
      </div>
    </main>
  );
}
