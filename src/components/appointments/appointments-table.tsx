"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Appointment = {
  id: string;
  appointmentDate: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  reason: string | null;
  patient: { id: string; name: string };
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
  department: { id: string; name: string };
};

type AppointmentsResponse = {
  success: boolean;
  data: Appointment[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

type AppointmentsTableProps = {
  initialResult: AppointmentsResponse;
  canManage?: boolean;
};

const statusStyles: Record<Appointment["status"], string> = {
  SCHEDULED: "text-[#0b5f7a]",
  COMPLETED: "text-[var(--ink-soft)]",
  CANCELLED: "text-[#b42318]",
};

function formatDateTime(value: string) {
  const date = new Date(value);
  return {
    date: date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

export default function AppointmentsTable({
  initialResult,
  canManage = true,
}: AppointmentsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(initialResult.meta.page);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AppointmentsResponse>(initialResult);

  const canGoNext = useMemo(() => page < result.meta.totalPages, [page, result.meta.totalPages]);

  async function fetchAppointments(nextPage = page) {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(nextPage),
      pageSize: "10",
      ...(query ? { q: query } : {}),
      ...(status ? { status } : {}),
    });

    const response = await fetch(`/api/appointments?${params.toString()}`);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setLoading(false);
      setError(payload?.message ?? "Unable to fetch appointments");
      return;
    }

    const payload = (await response.json()) as AppointmentsResponse;
    setResult(payload);
    setPage(payload.meta.page);
    setLoading(false);
  }

  async function cancelAppointment(id: string) {
    const confirmed = window.confirm("Cancel this appointment?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/appointments/${id}`, { method: "DELETE" });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Unable to cancel appointment");
      return;
    }

    await fetchAppointments(page);
  }


  return (
    <section className="space-y-4">
      <div className="card-soft rounded-2xl p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm text-[var(--ink-soft)]" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Patient, doctor, reason"
              className="mt-1 w-56 rounded-xl border border-[var(--line)] px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-[var(--ink-soft)]" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1 w-40 rounded-xl border border-[var(--line)] px-3 py-2"
            >
              <option value="">All</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setPage(1);
              fetchAppointments(1);
            }}
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Apply filters
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-[var(--ink-soft)]">Loading appointments...</p> : null}
      {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}

      <div className="card-soft overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h3 className="text-lg font-semibold">All appointments ({result.meta.total})</h3>
          {canManage ? (
            <Link
              href="/dashboard/appointments/new"
              className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
            >
              Book appointment
            </Link>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--surface-muted)] text-left">
              <tr>
                <th className="px-4 py-3">Date & time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                {canManage ? <th className="px-4 py-3">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {result.data.map((appointment) => {
                const formatted = formatDateTime(appointment.appointmentDate);

                return (
                  <tr key={appointment.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3">
                      <p>{formatted.date}</p>
                      <p className="text-[var(--ink-soft)]">{formatted.time}</p>
                    </td>
                    <td className="px-4 py-3">
                      {appointment.patient.name}
                    </td>
                    <td className="px-4 py-3">
                      Dr. {appointment.doctor.name}
                    </td>
                    <td className="px-4 py-3">{appointment.department.name}</td>
                    <td className={`px-4 py-3 font-medium ${statusStyles[appointment.status]}`}>
                      {appointment.status}
                    </td>
                    {canManage ? (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          
                          {appointment.status === "SCHEDULED" ||
                          appointment.status === "CONFIRMED" ? (
                            <button
                              type="button"
                              onClick={() => cancelAppointment(appointment.id)}
                              className="text-[#b42318] underline"
                            >
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-4">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => {
              const next = page - 1;
              setPage(next);
              fetchAppointments(next);
            }}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>

          <p className="text-sm text-[var(--ink-soft)]">
            Page {result.meta.page} of {result.meta.totalPages}
          </p>

          <button
            type="button"
            disabled={!canGoNext || loading}
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchAppointments(next);
            }}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {!result.data.length && !loading ? (
        <p className="text-sm text-[var(--ink-soft)]">
          No appointments found. Try adjusting filters or book a new appointment.
        </p>
      ) : null}
    </section>
  );
}
