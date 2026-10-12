import Link from "next/link";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export default async function DepartmentsPage() {
  await requireDashboardSession(["ADMIN"]);

  const [total, activeDepartments, departments] = await Promise.all([
    prisma.department.count(),
    prisma.department.count({ where: { isActive: true } }),
    prisma.department.findMany({
      include: {
        _count: {
          select: {
            doctors: true,
            patients: true,
            appointments: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">PHASE 7</p>
          <h1 className="mt-2 text-3xl font-semibold">Department Management</h1>
          <p className="mt-2 text-sm text-soft">
            Hospital departments, capacity planning, and workload overview.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm">
              Back to dashboard
            </Link>
            <span className="rounded-full bg-[var(--surface-muted)] px-4 py-2 text-sm text-[var(--ink-soft)]">
              Active: {activeDepartments} / Total: {total}
            </span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Total departments</p>
            <p className="mt-2 text-4xl font-semibold text-[#0f766e]">{total}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Active departments</p>
            <p className="mt-2 text-4xl font-semibold text-[#0b5f7a]">{activeDepartments}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Total assigned staff</p>
            <p className="mt-2 text-4xl font-semibold text-[#b45309]">
              {departments.reduce((sum, department) => sum + department._count.doctors, 0)}
            </p>
          </article>
        </section>

        <section className="card-soft overflow-hidden rounded-3xl">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-lg font-semibold">Departments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--surface-muted)] text-left">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Doctors</th>
                  <th className="px-4 py-3">Patients</th>
                  <th className="px-4 py-3">Appointments</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3">{department.name}</td>
                    <td className="px-4 py-3">{department._count.doctors}</td>
                    <td className="px-4 py-3">{department._count.patients}</td>
                    <td className="px-4 py-3">{department._count.appointments}</td>
                    <td className="px-4 py-3">{department.isActive ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
