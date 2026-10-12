import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard-shell";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export default async function DashboardWorkspaceLayout({ children }: { children: ReactNode }) {
  const session = await requireDashboardSession();

  return (
    <DashboardShell
      user={session}
      stats={[]}
      appointments={[]}
      patients={[]}
    >
      {children}
    </DashboardShell>
  );
}
