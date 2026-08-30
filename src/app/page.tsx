import React from "react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
      {/* Navigation */}
      <nav className="w-full border-b border-[var(--line)] bg-[var(--surface)] sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)] text-white font-bold text-xl leading-none shadow-md">
              C
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--ink)]">
              CareFlow{" "}
              <span className="font-medium text-[var(--ink-soft)]">HMS</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow"
            >
              Staff Portal Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 lg:py-20 w-full flex flex-col gap-16">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto fade-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-800 mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            System Online & Connected
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[var(--ink)] !leading-tight">
            Enterprise Grade <br />
            <span className="text-[var(--brand)]">Medical Operations</span>
          </h1>
          <p className="mt-6 text-lg text-[var(--ink-soft)] leading-relaxed max-w-2xl mx-auto">
            Experience seamless hospital management with CareFlow. Real-time patient
            tracking, schedule optimization, and comprehensive medical records—all
            in one secure platform.
          </p>
        </section>

        {/* Feature Previews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 fade-slide-up fade-slide-delay-1">
          {/* Card 1: Hospital Statistics Preview */}
          <div className="card-soft rounded-2xl p-6 flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--ink-soft)]">
                Facility Stats
              </h3>
              <div className="h-8 w-8 rounded-full bg-[var(--surface-muted)] flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <svg
                  className="w-4 h-4 text-[var(--brand)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-end border-b border-[var(--line)] pb-3">
                <span className="text-[var(--ink-soft)] text-sm">
                  Active Patients
                </span>
                <span className="text-2xl font-bold text-[var(--ink)]">
                  1,492
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-[var(--line)] pb-3">
                <span className="text-[var(--ink-soft)] text-sm">
                  Available Beds
                </span>
                <span className="text-2xl font-bold text-[var(--ink)]">42</span>
              </div>
              <div className="flex justify-between items-end pb-2">
                <span className="text-[var(--ink-soft)] text-sm">
                  On-duty Staff
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[var(--ink)]">118</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Appointment Preview */}
          <div className="card-soft rounded-2xl p-6 flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-[var(--brand)] shadow-[0_0_20px_rgba(15,118,110,0.1)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--ink-soft)]">
                Live Schedule
              </h3>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {[
                {
                  time: "09:00 AM",
                  name: "Sarah Jenkins",
                  dept: "Cardiology",
                  status: "In Progress",
                },
                {
                  time: "09:30 AM",
                  name: "Michael Chang",
                  dept: "Neurology",
                  status: "Waiting",
                },
                {
                  time: "10:00 AM",
                  name: "Emma Robert",
                  dept: "Orthopedics",
                  status: "Scheduled",
                },
              ].map((appt, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border ${
                    i === 0
                      ? "bg-teal-50 border-teal-100"
                      : "bg-[var(--surface)] border-[var(--line)]"
                  } transition-colors`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-[var(--ink)]">
                      {appt.time}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        i === 0
                          ? "bg-teal-100 text-teal-800"
                          : i === 1
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-[var(--ink)]">
                      {appt.name}
                    </span>
                    <span className="text-xs text-[var(--ink-soft)]">
                      {appt.dept}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Dashboard Preview */}
          <div className="card-soft rounded-2xl p-6 flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--ink-soft)]">
                Secure Access
              </h3>
              <div className="h-8 w-8 rounded-full bg-[var(--surface-muted)] flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <svg
                  className="w-4 h-4 text-[var(--brand)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center relative z-10">
              <div className="bg-gradient-to-br from-teal-50 to-white border border-[var(--line)] rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-[var(--brand)] pb-1">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-[var(--ink)] mb-1">
                  Role-Based Dashboard
                </h4>
                <p className="text-xs text-[var(--ink-soft)] mb-3">
                  Admin • Doctor • Nurse • Receptionist
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full rounded-lg bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                >
                  Enter System
                </Link>
              </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--brand)] opacity-[0.03] rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500"></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--line)] py-8 mt-auto bg-white/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-80">
            <div className="h-5 w-5 rounded bg-[var(--brand)] text-white text-[10px] font-bold flex items-center justify-center">
              C
            </div>
            <span className="text-xs font-semibold text-[var(--ink)]">
              CareFlow Technology © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6 text-xs font-medium text-[var(--ink-soft)]">
            <span className="hover:text-[var(--brand)] cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-[var(--brand)] cursor-pointer transition-colors">
              Terms of Service
            </span>
            <span className="hover:text-[var(--brand)] cursor-pointer transition-colors">
              Support
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
