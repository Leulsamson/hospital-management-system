import ManagementConsole from "@/components/management-console";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export default async function MedicationsPage() {
  await requireDashboardSession(["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]);
  return <ManagementConsole mode="medications" />;
}
