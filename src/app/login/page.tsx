"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LoginState = {
  loading: boolean;
  error: string | null;
};

export default function LoginPage() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>({ loading: false, error: null });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, error: null });

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { message?: string } | null;
        setState({ loading: false, error: result?.message ?? "Unable to sign in. Check your email and password." });
        return;
      }

      router.push("/dashboard");
    } catch {
      setState({ loading: false, error: "The sign-in service is unavailable. Please try again." });
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 font-sans">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 group">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)] text-white font-bold text-xl leading-none shadow transition group-hover:-translate-x-1">
          &larr;
        </div>
        <span className="text-sm font-semibold text-[var(--ink)]">Back to Home</span>
      </Link>

      <section className="card-soft fade-slide-up grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex min-h-[520px] flex-col justify-between overflow-hidden bg-[#103d3d] p-8 text-white md:p-12">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(9, 55, 54, 0.85), rgba(16, 61, 61, 0.48)), url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85')",
            }}
            role="img"
            aria-label="Clinician speaking with a patient in a bright consultation room"
          />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
          
          <div className="relative z-10">
            <div className="mb-12 flex flex-col gap-1">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-black leading-none text-[var(--brand)] shadow-lg">
                +
              </span>
              <h2 className="text-3xl font-black tracking-tight">CareFlow</h2>
              <p className="font-medium text-teal-100">Hospital management workspace</p>
            </div>
            
            <div className="max-w-sm space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Welcome back</p>
              <h3 className="text-3xl font-black leading-tight md:text-4xl">Make every patient visit feel considered.</h3>
              <p className="text-sm leading-6 text-teal-50/90">Coordinate appointments, patient records, prescriptions, and follow-up care from one clear workspace.</p>
            </div>
            <div className="mt-9 grid gap-3 text-sm text-teal-50">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-teal-100">✓</span>
                <p>Role-based access for hospital teams and patients.</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-teal-100">✓</span>
                <p>One dependable place for the day&apos;s care work.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 md:p-12 flex flex-col justify-center relative">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Secure sign in</p>
            <h1 className="mt-2 text-2xl font-black text-[var(--ink)]">Access your care workspace</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Use your hospital email and password to continue.</p>
          </div>

          <form onSubmit={onSubmit} className="grid gap-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5">
                Hospital email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@hospital.org"
                required
                autoComplete="email"
                aria-invalid={Boolean(state.error)}
                aria-describedby={state.error ? "login-error" : undefined}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none ring-[var(--brand)] transition-all focus:border-[var(--brand)] focus:ring-1"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-soft)]">
                  Password
                </label>
                <span className="text-xs font-medium text-[var(--ink-soft)]">Keep your password private</span>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={8}
                required
                autoComplete="current-password"
                aria-invalid={Boolean(state.error)}
                aria-describedby={state.error ? "login-error" : undefined}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none ring-[var(--brand)] transition-all focus:border-[var(--brand)] focus:ring-1"
              />
            </div>

            {state.error ? (
              <div id="login-error" role="alert" aria-live="polite" className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-200 font-bold">!</span>
                {state.error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={state.loading}
              className="mt-4 w-full rounded-xl bg-[var(--brand)] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-md"
            >
              {state.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : "Sign in securely →"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
