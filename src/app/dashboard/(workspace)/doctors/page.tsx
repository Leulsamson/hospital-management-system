import Link from "next/link";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export default async function DoctorsPage() {
  await requireDashboardSession(["ADMIN", "DOCTOR"]);

  const [total, activeDoctors, doctors] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.doctor.findMany({
      include: {
        department: { select: { id: true, name: true } },
        _count: {
          select: {
            appointments: true,
            medicalRecords: true,
            prescriptions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">PHASE 7</p>
          <h1 className="mt-2 text-3xl font-semibold">Doctor Management</h1>
          <p className="mt-2 text-sm text-soft">
            Overview of doctors, specialties, departments, and clinical workload.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm">
              Back to dashboard
            </Link>
            <span className="rounded-full bg-[var(--surface-muted)] px-4 py-2 text-sm text-[var(--ink-soft)]">
              Active: {activeDoctors} / Total: {total}
            </span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Total doctors</p>
            <p className="mt-2 text-4xl font-semibold text-[#0f766e]">{total}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Active doctors</p>
            <p className="mt-2 text-4xl font-semibold text-[#0b5f7a]">{activeDoctors}</p>
          </article>
          <article className="card-soft rounded-2xl p-5">
            <p className="text-sm text-soft">Tracked specialities</p>
            <p className="mt-2 text-4xl font-semibold text-[#b45309]">{new Set(doctors.map((doctor) => doctor.specialization)).size}</p>
          </article>
        </section>

        <section className="card-soft overflow-hidden rounded-3xl">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-lg font-semibold">Doctors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--surface-muted)] text-left">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Speciality</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Appointments</th>
                  <th className="px-4 py-3">Records</th>
                  <th className="px-4 py-3">Prescriptions</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3">{doctor.name}</td>
                    <td className="px-4 py-3">{doctor.specialization}</td>
                    <td className="px-4 py-3">{doctor.department.name}</td>
                    <td className="px-4 py-3">{doctor._count.appointments}</td>
                    <td className="px-4 py-3">{doctor._count.medicalRecords}</td>
                    <td className="px-4 py-3">{doctor._count.prescriptions}</td>
                    <td className="px-4 py-3">{doctor.isActive ? "Active" : "Inactive"}</td>
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
