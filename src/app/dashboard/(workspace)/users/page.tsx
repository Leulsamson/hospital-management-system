import ManagementConsole from "@/components/management-console";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export default async function UsersPage() {
  await requireDashboardSession(["ADMIN"]);
  return <ManagementConsole mode="users" />;
}
