import ManagementConsole from "@/components/management-console";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export default async function InventoryPage() {
  await requireDashboardSession(["ADMIN", "NURSE"]);
  return <ManagementConsole mode="inventory" />;
}
