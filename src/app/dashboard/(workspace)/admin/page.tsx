import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  await requireDashboardSession(["ADMIN"]);

  const [users, departments, doctors, patients] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    prisma.department.count({ where: { isActive: true } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.patient.count({ where: { isActive: true } }),
  ]);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">ADMIN CONSOLE</p>
          <h1 className="mt-2 text-3xl font-semibold">System Governance</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Active Departments</p>
            <p className="mt-2 text-4xl font-semibold text-[#0f766e]">{departments}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Active Doctors</p>
            <p className="mt-2 text-4xl font-semibold text-[#0b5f7a]">{doctors}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Active Patients</p>
            <p className="mt-2 text-4xl font-semibold text-[#14532d]">{patients}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">User Roles Tracked</p>
            <p className="mt-2 text-4xl font-semibold text-[#b45309]">{users.length}</p>
          </article>
        </section>

        <section className="card-soft rounded-2xl p-5">
          <h2 className="text-xl font-semibold">Users by role</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {users.map((row) => (
              <li key={row.role} className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm">
                <p className="font-semibold">{row.role}</p>
                <p className="text-soft">{row._count.role} accounts</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
