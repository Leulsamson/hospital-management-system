"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Role } from "@prisma/client";
import LogoutButton from "@/components/logout-button";

type SessionUser = {
  name: string;
  email: string;
  role: Role;
};

type StatItem = {
  label: string;
  value: number | string;
  detail: string;
  icon: string;
  tone: string;
};

type AppointmentItem = {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  status: string;
};

type PatientItem = {
  id: string;
  name: string;
  department: string;
  date: string;
};

type DashboardShellProps = {
  user: SessionUser;
  stats: StatItem[];
  appointments: AppointmentItem[];
  patients: PatientItem[];
};

type NavItem = {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "⌂", roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "PATIENT"] },
  { label: "Patients", href: "/dashboard/patients", icon: "♙", roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"] },
  { label: "Doctors", href: "/dashboard/doctors", icon: "✚", roles: ["ADMIN", "DOCTOR"] },
  { label: "Appointments", href: "/dashboard/appointments", icon: "◷", roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "PATIENT"] },
  { label: "Departments", href: "/dashboard/departments", icon: "▦", roles: ["ADMIN"] },
  { label: "Patient intake", href: "/dashboard/patients", icon: "IN", roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"] },
  { label: "Laboratory", href: "/dashboard/medical-records", icon: "LB", roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { label: "Pharmacy", href: "/dashboard/medications", icon: "RX", roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"] },
  { label: "Prescriptions", href: "/dashboard/prescriptions", icon: "PR", roles: ["ADMIN", "DOCTOR", "NURSE", "PATIENT"] },
  { label: "Billing", href: "/dashboard/payments", icon: "BL", roles: ["ADMIN", "RECEPTIONIST", "PATIENT"] },
  { label: "Staff directory", href: "/dashboard/users", icon: "ST", roles: ["ADMIN"] },
  { label: "Reports", href: "/dashboard/analytics", icon: "◒", roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"] },
  { label: "Administration", href: "/dashboard/admin", icon: "AD", roles: ["ADMIN"] },
];

const roleDescriptions: Record<Role, string> = {
  ADMIN: "Full hospital operations and system administration.",
  DOCTOR: "Clinical access to patients, records, and prescriptions.",
  NURSE: "Patient support, records visibility, and coordination.",
  RECEPTIONIST: "Patient onboarding and appointment operations.",
  PATIENT: "Your appointments, records, and care timeline.",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardShell({
  user,
  stats,
  appointments,
  patients,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-[#f4f8f7] text-[var(--ink)]">
      <div className="flex min-h-screen">
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col bg-[#102d31] px-5 py-6 text-slate-300 shadow-2xl transition-transform lg:static lg:translate-x-0 lg:shadow-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Link href="/dashboard" className="flex items-center gap-3 px-2 text-white" onClick={() => setMobileOpen(false)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-xl font-bold">+</span>
            <span>
              <span className="block text-lg font-black tracking-tight">CareFlow</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-teal-300">HMS workspace</span>
            </span>
          </Link>
          <div className="mt-8 flex-1 overflow-y-auto">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Care operations</p>
            <nav className="mt-3 grid gap-1.5">
              {visibleItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-teal-500 text-white shadow-lg shadow-teal-950/20" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-[9px] font-black tracking-tight" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-300">Signed in as</p>
            <p className="mt-2 truncate font-bold text-white">{user.name}</p>
            <p className="mt-1 text-xs text-slate-400">{roleDescriptions[user.role]}</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-[var(--line)] bg-white/90 px-5 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-4">
              <button type="button" className="rounded-xl border border-[var(--line)] p-2 text-xl lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">☰</button>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand)]">Hospital operations</p>
                <h1 className="text-lg font-extrabold md:text-xl">Good day, {user.name.split(" ")[0]}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="relative rounded-xl border border-[var(--line)] bg-white p-2.5 text-lg" aria-label="Notifications">
                <span aria-hidden="true">●</span><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              </button>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">{user.name}</p>
                <p className="text-xs capitalize text-[var(--ink-soft)]">{user.role.toLowerCase()}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-black text-[var(--brand)]">{initials(user.name)}</div>
              <LogoutButton />
            </div>
          </header>

          <main className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-[var(--ink-soft)]">Today&apos;s hospital activity</p>
                <h2 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">Care team overview</h2>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard/patients/new" className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-800">Register patient</Link>
                <Link href="/dashboard/appointments/new" className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold transition hover:border-[var(--brand)] hover:text-[var(--brand)]">Book appointment</Link>
              </div>
            </div>

            <section className="relative overflow-hidden rounded-[1.75rem] bg-[#164e4b] p-6 text-white shadow-xl shadow-teal-950/10 md:p-8">
              <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-cover bg-center opacity-70 md:block" style={{ backgroundImage: "linear-gradient(90deg, #164e4b 0%, rgba(22, 78, 75, 0.58) 38%, rgba(22, 78, 75, 0.12) 100%), url('https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=900&q=85')" }} role="img" aria-label="Hospital team preparing a patient care area" />
              <div className="relative max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">A clear start to every shift</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">Keep the next patient, appointment, and task in view.</h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-teal-50/85">Use the care operations menu to move from registration to follow-up without losing the patient story.</p>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
              {stats.map((stat) => (
                <article key={stat.label} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-bold text-[var(--ink-soft)]">{stat.label}</p>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${stat.tone}`} aria-hidden="true">{stat.icon}</span>
                  </div>
                  <p className="mt-5 text-3xl font-black">{stat.value}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{stat.detail}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm md:p-6">
                <div className="flex items-center justify-between">
                  <div><h3 className="text-lg font-extrabold">Appointment overview</h3><p className="mt-1 text-xs text-[var(--ink-soft)]">Weekly scheduled appointments</p></div>
                  <Link href="/dashboard/appointments" className="text-xs font-bold text-[var(--brand)]">View all →</Link>
                </div>
                <div className="mt-8 flex h-48 items-end gap-3 border-b border-l border-[var(--line)] px-3 pb-0">
                  {[42, 66, 52, 82, 58, 74, 46].map((height, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t-lg bg-teal-100 transition hover:bg-teal-500" style={{ height: `${height}%` }} title={`${height} appointments`} />
                      <span className="text-[10px] text-[var(--ink-soft)]">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span>
                    </div>
                  ))}
                </div>
              </article>
              <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm md:p-6">
                <h3 className="text-lg font-extrabold">Patient statistics</h3>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">Active patient mix</p>
                <div className="mx-auto mt-7 flex h-36 w-36 items-center justify-center rounded-full" style={{ background: "conic-gradient(#0f766e 0 58%, #f59e0b 58% 81%, #bae6fd 81% 100%)" }}>
                  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white"><strong className="text-2xl">100%</strong><span className="text-[10px] text-[var(--ink-soft)]">active records</span></div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-[var(--ink-soft)]"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-teal-600" />Adults</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />Seniors</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-200" />Children</span></div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm">
                <div className="flex items-center justify-between p-5 md:p-6"><div><h3 className="text-lg font-extrabold">Recent appointments</h3><p className="mt-1 text-xs text-[var(--ink-soft)]">Latest activity in your care workspace</p></div><Link href="/dashboard/appointments" className="text-xs font-bold text-[var(--brand)]">View all →</Link></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-y border-[var(--line)] bg-[#f8fbfa] text-xs uppercase tracking-wider text-[var(--ink-soft)]"><tr><th className="px-6 py-3 font-bold">Patient</th><th className="px-6 py-3 font-bold">Doctor</th><th className="px-6 py-3 font-bold">Date</th><th className="px-6 py-3 font-bold">Status</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{appointments.length ? appointments.map((appointment) => <tr key={appointment.id} className="hover:bg-[#fbfdfc]"><td className="px-6 py-4 font-bold">{appointment.patient}</td><td className="px-6 py-4 text-[var(--ink-soft)]">{appointment.doctor}</td><td className="px-6 py-4 text-[var(--ink-soft)]">{appointment.date}</td><td className="px-6 py-4"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">{appointment.status}</span></td></tr>) : <tr><td colSpan={4} className="px-6 py-10 text-center text-[var(--ink-soft)]">No recent appointments.</td></tr>}</tbody></table></div>
              </article>
              <div className="space-y-6">
                <article className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-lg font-extrabold">Recent patients</h3><Link href="/dashboard/patients" className="text-xs font-bold text-[var(--brand)]">View all →</Link></div><div className="mt-4 space-y-3">{patients.length ? patients.map((patient) => <div key={patient.id} className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-sky-700">{initials(patient.name)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{patient.name}</p><p className="text-xs text-[var(--ink-soft)]">{patient.department} · {patient.date}</p></div></div>) : <p className="py-5 text-sm text-[var(--ink-soft)]">No recent patients.</p>}</div></article>
                <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"><div className="flex items-center gap-2"><span className="text-lg">♧</span><h3 className="font-extrabold">Notifications</h3></div><p className="mt-3 text-sm leading-6 text-amber-900">Review today&apos;s appointments and pending operational tasks before the end of your shift.</p></article>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
