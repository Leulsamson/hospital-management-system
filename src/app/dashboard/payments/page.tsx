import ManagementConsole from "@/components/management-console";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export default async function PaymentsPage() {
  await requireDashboardSession(["ADMIN", "RECEPTIONIST", "PATIENT"]);
  return <ManagementConsole mode="payments" />;
}
