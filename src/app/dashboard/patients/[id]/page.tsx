import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function PatientProfilePage({ params }: Params) {
  await requireDashboardSession(["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"]);

  const resolvedParams = await params;

  const patient = await prisma.patient.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: { select: { email: true } },
      department: { select: { id: true, name: true } },
      appointments: {
        orderBy: { appointmentDate: "desc" },
        take: 8,
        include: {
          doctor: { select: { name: true, specialization: true } },
        },
      },
      medicalRecords: {
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          doctor: { select: { name: true } },
        },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/patients" className="text-sm text-[var(--brand)] underline">
            Back to patients
          </Link>
          <Link href={`/dashboard/patients/${patient.id}/edit`} className="text-sm text-[var(--ink)] underline">
            Edit profile
          </Link>
        </div>

        <section className="card-soft rounded-3xl p-6">
          <h1 className="text-3xl font-semibold">{patient.name}</h1>
          <p className="mt-2 text-sm text-soft">
            {patient.gender} | {patient.user.email} | {patient.phone ?? "No phone"}
          </p>
          <p className="mt-2 text-sm text-soft">Department: {patient.department?.name ?? "Not assigned"}</p>
          <p className="mt-2 text-sm text-soft">Address: {patient.address ?? "Not set"}</p>
          <p className="mt-2 text-sm text-soft">Status: {patient.isActive ? "Active" : "Inactive"}</p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="card-soft rounded-2xl p-5">
            <h2 className="text-xl font-semibold">Recent Appointments</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {patient.appointments.map((appointment) => (
                <li key={appointment.id} className="rounded-xl border border-[var(--line)] px-3 py-2">
                  <p>
                    {new Date(appointment.appointmentDate).toLocaleString()} - {appointment.status}
                  </p>
                  <p className="text-soft">
                    Dr. {appointment.doctor.name} ({appointment.doctor.specialization})
                  </p>
                </li>
              ))}
              {patient.appointments.length === 0 ? <li className="text-soft">No appointments yet.</li> : null}
            </ul>
          </article>

          <article className="card-soft rounded-2xl p-5">
            <h2 className="text-xl font-semibold">Recent Medical Records</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {patient.medicalRecords.map((record) => (
                <li key={record.id} className="rounded-xl border border-[var(--line)] px-3 py-2">
                  <p>{record.diagnosis}</p>
                  <p className="text-soft">
                    Doctor: {record.doctor.name}
                  </p>
                </li>
              ))}
              {patient.medicalRecords.length === 0 ? <li className="text-soft">No records yet.</li> : null}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
