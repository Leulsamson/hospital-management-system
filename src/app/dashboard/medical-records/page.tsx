import ManagementConsole from "@/components/management-console";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export default async function MedicalRecordsPage() {
  await requireDashboardSession(["ADMIN", "DOCTOR", "NURSE", "PATIENT"]);
  return <ManagementConsole mode="records" />;
}
