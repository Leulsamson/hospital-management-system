import ManagementConsole from "@/components/management-console";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export default async function AuditLogsPage() {
  await requireDashboardSession(["ADMIN"]);
  return <ManagementConsole mode="audit" />;
}
