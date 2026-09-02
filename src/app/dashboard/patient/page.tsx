import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export default async function PatientDashboardPage() {
  const session = await requireDashboardSession(["PATIENT", "ADMIN"]);

  const patient = await prisma.patient.findUnique({
    where: { userId: session.id },
    include: {
      appointments: {
        where: { appointmentDate: { gte: new Date() } },
        orderBy: { appointmentDate: "asc" },
        take: 1,
        include: {
          doctor: { select: { name: true, specialization: true } },
        },
      },
      medicalRecords: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">PATIENT PORTAL</p>
          <h1 className="mt-2 text-3xl font-semibold">My Health Overview</h1>
        </header>

        {!patient ? (
          <article className="card-soft rounded-2xl p-5 text-sm text-soft">
            Your account is active but not yet linked to a patient profile.
          </article>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            <article className="card-soft rounded-2xl p-5">
              <p className="text-sm text-soft">Next appointment</p>
              <p className="mt-2 text-lg font-semibold">
                {patient.appointments[0]
                  ? new Date(patient.appointments[0].appointmentDate).toLocaleString()
                  : "No upcoming appointments"}
              </p>
              {patient.appointments[0] ? (
                <p className="mt-1 text-sm text-soft">
                  Dr. {patient.appointments[0].doctor.name} ({patient.appointments[0].doctor.specialization})
                </p>
              ) : null}
            </article>

            <article className="card-soft rounded-2xl p-5">
              <p className="text-sm text-soft">Latest diagnosis</p>
              <p className="mt-2 text-lg font-semibold">
                {patient.medicalRecords[0]?.diagnosis ?? "No records yet"}
              </p>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}
