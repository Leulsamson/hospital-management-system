import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  await requireDashboardSession(["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]);
  const [statusGroups, departments] = await Promise.all([
    prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.department.findMany({
      where: { isActive: true },
      select: { name: true, _count: { select: { appointments: true, patients: true, doctors: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  const maxDepartmentValue = Math.max(1, ...departments.map((item) => item._count.appointments));
  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">ANALYTICS</p>
          <h1 className="mt-2 text-3xl font-semibold">Hospital activity</h1>
        </header>
        <section className="grid gap-5 lg:grid-cols-2">
          <article className="card-soft rounded-2xl p-5">
            <h2 className="text-xl font-semibold">Appointment status</h2>
            <div className="mt-5 space-y-4">
              {statusGroups.map((item) => (
                <div key={item.status}>
                  <div className="flex justify-between text-sm"><span>{item.status}</span><span>{item._count._all}</span></div>
                  <div className="mt-1 h-3 rounded-full bg-[var(--surface-muted)]">
                    <div className="h-3 rounded-full bg-[var(--brand)]" style={{ width: `${Math.max(8, (item._count._all / Math.max(1, ...statusGroups.map((group) => group._count._all))) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <h2 className="text-xl font-semibold">Department activity</h2>
            <div className="mt-5 space-y-4">
              {departments.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm"><span>{item.name}</span><span>{item._count.appointments} appointments</span></div>
                  <div className="mt-1 h-3 rounded-full bg-[var(--surface-muted)]">
                    <div className="h-3 rounded-full bg-[#0b5f7a]" style={{ width: `${Math.max(8, (item._count.appointments / maxDepartmentValue) * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-soft">{item._count.patients} patients · {item._count.doctors} doctors</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
