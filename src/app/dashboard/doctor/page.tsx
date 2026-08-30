import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export default async function DoctorDashboardPage() {
  await requireDashboardSession(["DOCTOR", "ADMIN"]);

  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [upcomingAppointments, openRecords, activePrescriptions] = await Promise.all([
    prisma.appointment.count({ where: { appointmentDate: { gte: now, lte: inSevenDays } } }),
    prisma.medicalRecord.count({ where: { status: "OPEN" } }),
    prisma.prescription.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">DOCTOR WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-semibold">Clinical Workload</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Upcoming (7 days)</p>
            <p className="mt-2 text-4xl font-semibold text-[#0f766e]">{upcomingAppointments}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Open medical records</p>
            <p className="mt-2 text-4xl font-semibold text-[#0b5f7a]">{openRecords}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Active prescriptions</p>
            <p className="mt-2 text-4xl font-semibold text-[#b45309]">{activePrescriptions}</p>
          </article>
        </section>
      </div>
    </main>
  );
}
