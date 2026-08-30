import Link from "next/link";
import AppointmentForm from "@/components/appointments/appointment-form";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export default async function NewAppointmentPage() {
  const session = await requireDashboardSession(["ADMIN", "RECEPTIONIST", "PATIENT"]);

  const showPatientSelect = session.role !== "PATIENT";

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">PHASE 5</p>
          <h1 className="mt-2 text-3xl font-semibold">Book appointment</h1>
          <p className="mt-2 text-sm text-soft">
            Choose a department, doctor, date, and available time slot to schedule a visit.
          </p>
        </header>

        <AppointmentForm showPatientSelect={showPatientSelect} />

        <Link
          href="/dashboard/appointments"
          className="inline-flex text-sm font-medium text-[var(--brand)] underline"
        >
          Back to appointments
        </Link>
      </div>
    </main>
  );
}
