import Link from "next/link";
import { notFound } from "next/navigation";
import PatientForm from "@/components/patients/patient-form";
import { requireDashboardSession } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function EditPatientPage({ params }: Params) {
  await requireDashboardSession(["ADMIN", "RECEPTIONIST", "NURSE"]);

  const resolvedParams = await params;

  const [patient, departments] = await Promise.all([
    prisma.patient.findUnique({ where: { id: resolvedParams.id } }),
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <Link href={`/dashboard/patients/${patient.id}`} className="text-sm text-[var(--brand)] underline">
          Back to patient profile
        </Link>
        <h1 className="text-3xl font-semibold">Edit Patient</h1>
        <PatientForm
          initialValues={{
            name: patient.name,
            dateOfBirth: patient.dateOfBirth.toISOString(),
            gender: patient.gender,
            phone: patient.phone ?? undefined,
            address: patient.address ?? undefined,
            departmentId: patient.departmentId ?? undefined,
          }}
          departments={departments}
          submitLabel="Save changes"
          endpoint={`/api/patients/${patient.id}`}
          method="PUT"
          onSuccessRedirect={`/dashboard/patients/${patient.id}`}
        />
      </div>
    </main>
  );
}
