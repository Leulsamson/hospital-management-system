import Link from "next/link";
import PatientForm from "@/components/patients/patient-form";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export default async function NewPatientPage() {
  await requireDashboardSession(["ADMIN", "RECEPTIONIST"]);

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <Link href="/dashboard/patients" className="text-sm text-[var(--brand)] underline">
          Back to patients
        </Link>
        <h1 className="text-3xl font-semibold">Register Patient</h1>
        <p className="text-sm text-soft">A linked patient account will be created automatically.</p>
        <PatientForm
          departments={departments}
          submitLabel="Create patient"
          endpoint="/api/patients"
          method="POST"
          onSuccessRedirect="/dashboard/patients"
        />
      </div>
    </main>
  );
}
