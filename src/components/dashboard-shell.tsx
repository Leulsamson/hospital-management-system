import Link from "next/link";
import type { Role } from "@prisma/client";
import LogoutButton from "@/components/logout-button";

type SessionUser = {
  name: string;
  email: string;
  role: Role;
};

type StatItem = {
  label: string;
  value: number;
  accent: string;
};

type DashboardShellProps = {
  user: SessionUser;
  stats: StatItem[];
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "PATIENT"] },
  { label: "Patient Registry", href: "/dashboard/patients", roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"] },
  { label: "Doctors", href: "/dashboard/doctors", roles: ["ADMIN", "DOCTOR"] },
  { label: "Departments", href: "/dashboard/departments", roles: ["ADMIN"] },
  { label: "Appointments", href: "/dashboard/appointments", roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "PATIENT"] },
  { label: "Admin", href: "/dashboard/admin", roles: ["ADMIN"] },
  { label: "Doctor", href: "/dashboard/doctor", roles: ["ADMIN", "DOCTOR"] },
  { label: "Nurse", href: "/dashboard/nurse", roles: ["ADMIN", "NURSE"] },
  { label: "Reception", href: "/dashboard/reception", roles: ["ADMIN", "RECEPTIONIST"] },
  { label: "Patient Portal", href: "/dashboard/patient", roles: ["ADMIN", "PATIENT"] },
];

const roleDescriptions: Record<Role, string> = {
  ADMIN: "Global access to users, departments, and system-wide settings.",
  DOCTOR: "Clinical access to patient profiles, records, and prescriptions.",
  NURSE: "Patient support workflow with records visibility and coordination.",
  RECEPTIONIST: "Patient onboarding and appointment operations management.",
  PATIENT: "Personal profile, appointment timeline, and medical record view.",
};

export default function DashboardShell({ user, stats }: DashboardShellProps) {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="card-soft fade-slide-up rounded-3xl p-5 md:p-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-[var(--brand)]">HMS PLATFORM</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">CareOps Console</h1>

          <nav className="mt-8 grid gap-2">
            {navItems
              .filter((item) => item.roles.includes(user.role))
              .map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
              >
                {item.label}
              </Link>
              ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-4">
            <p className="text-xs font-semibold tracking-wide text-[var(--brand)]">Current role</p>
            <p className="mt-1 text-lg font-semibold">{user.role}</p>
            <p className="mt-2 text-sm text-soft">{roleDescriptions[user.role]}</p>
          </div>
        </aside>

        <section className="space-y-5">
          <header className="card-soft fade-slide-up fade-slide-delay-1 rounded-3xl p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">WELCOME BACK</p>
                <h2 className="mt-2 text-3xl font-semibold">
                  {user.name}
                </h2>
                <p className="mt-1 text-sm text-soft">{user.email}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="pulse-ring h-3 w-3 rounded-full bg-[var(--brand)]" />
                <p className="text-sm font-medium text-[var(--ink-soft)]">System healthy</p>
                <LogoutButton />
              </div>
            </div>
          </header>

          <div className="fade-slide-up fade-slide-delay-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="card-soft rounded-2xl p-5">
                <p className="text-xs font-semibold tracking-wide text-soft">{stat.label}</p>
                <p className="mt-3 text-4xl font-semibold" style={{ color: stat.accent }}>
                  {stat.value}
                </p>
              </article>
            ))}
          </div>

          <article className="card-soft fade-slide-up fade-slide-delay-2 rounded-3xl p-5 md:p-6">
            <h3 className="text-xl font-semibold">Today at a glance</h3>
            <p className="mt-2 text-soft">
              CareFlow now includes patient management cleanup and the Phase 7 doctor and department overview pages.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
