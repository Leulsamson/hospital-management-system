"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Patient = {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone: string | null;
  address: string | null;
  isActive: boolean;
  department: { id: string; name: string } | null;
  user: { email: string };
  createdAt: string;
};

type Department = {
  id: string;
  name: string;
};

type PatientsResponse = {
  success: boolean;
  data: Patient[];
  departments: Department[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

type PatientsTableProps = {
  initialResult: PatientsResponse;
};

export default function PatientsTable({ initialResult }: PatientsTableProps) {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("true");
  const [page, setPage] = useState(initialResult.meta.page);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PatientsResponse>(initialResult);

  const canGoNext = useMemo(() => page < result.meta.totalPages, [page, result.meta.totalPages]);

  async function fetchPatients(nextPage = page) {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(nextPage),
      pageSize: "10",
      ...(query ? { q: query } : {}),
      ...(gender ? { gender } : {}),
      ...(departmentId ? { departmentId } : {}),
      ...(status ? { isActive: status } : {}),
    });

    const response = await fetch(`/api/patients?${params.toString()}`);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setLoading(false);
      setError(payload?.message ?? "Unable to fetch patients");
      return;
    }

    const payload = (await response.json()) as PatientsResponse;
    setResult(payload);
    setPage(payload.meta.page);
    setLoading(false);
  }

  async function deactivatePatient(id: string) {
    const confirmed = window.confirm("Deactivate this patient?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/patients/${id}`, { method: "DELETE" });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Unable to deactivate patient");
      return;
    }

    await fetchPatients(page);
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
              placeholder="Name, phone, address"
              className="mt-1 w-56 rounded-xl border border-[var(--line)] px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-[var(--ink-soft)]" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              className="mt-1 w-36 rounded-xl border border-[var(--line)] px-3 py-2"
            >
              <option value="">All</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-[var(--ink-soft)]" htmlFor="department">
              Department
            </label>
            <select
              id="department"
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="mt-1 w-48 rounded-xl border border-[var(--line)] px-3 py-2"
            >
              <option value="">All</option>
              {result.departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-[var(--ink-soft)]" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1 w-36 rounded-xl border border-[var(--line)] px-3 py-2"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setPage(1);
              fetchPatients(1);
            }}
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Apply filters
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-[var(--ink-soft)]">Loading patients...</p> : null}

      {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}

      <div className="card-soft overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h3 className="text-lg font-semibold">Patients ({result.meta.total})</h3>
          <Link
            href="/dashboard/patients/new"
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
          >
            Register patient
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--surface-muted)] text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((patient) => (
                <tr key={patient.id} className="border-t border-[var(--line)]">
                  <td className="px-4 py-3">
                    {patient.name}
                  </td>
                  <td className="px-4 py-3">{patient.gender}</td>
                  <td className="px-4 py-3">{patient.department?.name ?? "-"}</td>
                  <td className="px-4 py-3">{patient.phone ?? patient.address ?? patient.user.email}</td>
                  <td className="px-4 py-3">{patient.isActive ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/dashboard/patients/${patient.id}`} className="text-[var(--brand)] underline">
                        View
                      </Link>
                      <Link href={`/dashboard/patients/${patient.id}/edit`} className="text-[var(--ink)] underline">
                        Edit
                      </Link>
                      {patient.isActive ? (
                        <button
                          type="button"
                          onClick={() => deactivatePatient(patient.id)}
                          className="text-[#b42318] underline"
                        >
                          Deactivate
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
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
              fetchPatients(next);
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
              fetchPatients(next);
            }}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {!result.data.length && !loading ? (
        <p className="text-sm text-[var(--ink-soft)]">No patients found. Try adjusting filters or register a patient.</p>
      ) : null}
    </section>
  );
}
