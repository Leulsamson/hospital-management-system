import Link from "next/link";
import TodayAppointments from "@/components/appointments/today-appointments";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export default async function ReceptionDashboardPage() {
  await requireDashboardSession(["RECEPTIONIST", "ADMIN"]);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const nextTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const [newPatients, upcomingAppointments, confirmedAppointments, todayAppointments] =
    await Promise.all([
      prisma.patient.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.appointment.count({
        where: { appointmentDate: { gte: now, lte: nextTwoDays } },
      }),
      prisma.appointment.count({ where: { status: "CONFIRMED" } }),
      prisma.appointment.findMany({
        where: {
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

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">RECEPTION DESK</p>
          <h1 className="mt-2 text-3xl font-semibold">Admissions & Scheduling</h1>
          <div className="mt-4">
            <Link
              href="/dashboard/appointments/new"
              className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
            >
              Book appointment
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">New patients today</p>
            <p className="mt-2 text-4xl font-semibold text-[#0f766e]">{newPatients}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Upcoming (48h)</p>
            <p className="mt-2 text-4xl font-semibold text-[#0b5f7a]">{upcomingAppointments}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Confirmed appointments</p>
            <p className="mt-2 text-4xl font-semibold text-[#b45309]">{confirmedAppointments}</p>
          </article>
        </section>

        <TodayAppointments appointments={todayAppointments} />
      </div>
    </main>
  );
}
