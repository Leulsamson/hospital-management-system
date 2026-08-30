import TodayAppointments from "@/components/appointments/today-appointments";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export default async function NurseDashboardPage() {
  await requireDashboardSession(["NURSE", "ADMIN"]);

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const [todayAppointmentsCount, activePatients, openRecords, todayAppointments] =
    await Promise.all([
      prisma.appointment.count({ where: { appointmentDate: { gte: start, lte: end } } }),
      prisma.patient.count({ where: { isActive: true } }),
      prisma.medicalRecord.count({ where: { status: "OPEN" } }),
      prisma.appointment.findMany({
        where: {
          appointmentDate: { gte: start, lte: end },
          status: { in: ["SCHEDULED", "CONFIRMED"] },
        },
        include: {
          patient: { select: { firstName: true, lastName: true } },
          doctor: { select: { firstName: true, lastName: true } },
        },
        orderBy: { appointmentDate: "asc" },
      }),
    ]);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">NURSE STATION</p>
          <h1 className="mt-2 text-3xl font-semibold">Care Coordination</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Today appointments</p>
            <p className="mt-2 text-4xl font-semibold text-[#0f766e]">{todayAppointmentsCount}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Active patients</p>
            <p className="mt-2 text-4xl font-semibold text-[#0b5f7a]">{activePatients}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Open records</p>
            <p className="mt-2 text-4xl font-semibold text-[#b45309]">{openRecords}</p>
          </article>
        </section>

        <TodayAppointments appointments={todayAppointments} />
      </div>
    </main>
  );
}
