"use client";

import { FormEvent, useEffect, useState } from "react";

type Mode = "records" | "prescriptions" | "medications" | "users" | "inventory" | "payments" | "audit";
type Row = Record<string, unknown>;

const config: Record<Mode, { title: string; endpoint: string; fields: string[] }> = {
  records: { title: "Medical records", endpoint: "/api/medical-records", fields: ["patientId", "doctorId", "symptoms", "diagnosis", "treatment"] },
  prescriptions: { title: "Prescriptions", endpoint: "/api/prescriptions", fields: ["patientId", "doctorId", "notes", "medications"] },
  medications: { title: "Medication catalogue", endpoint: "/api/medications", fields: ["name", "description", "stockQuantity", "reorderLevel"] },
  users: { title: "User administration", endpoint: "/api/users", fields: ["email", "password", "role"] },
  inventory: { title: "Pharmacy inventory", endpoint: "/api/inventory", fields: ["medicationId", "stockQuantity", "reorderLevel", "reason"] },
  payments: { title: "Payments", endpoint: "/api/payments", fields: ["appointmentId", "amount", "method"] },
  audit: { title: "Audit log", endpoint: "/api/audit-logs", fields: [] },
};

function displayValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function ManagementConsole({ mode }: { mode: Mode }) {
  const current = config[mode];
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch(current.endpoint);
    const payload = (await response.json()) as { data?: Row[]; message?: string };
    setRows(payload.data ?? []);
    setMessage(response.ok ? "" : payload.message ?? "Unable to load data");
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [current.endpoint]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body: Record<string, unknown> = { ...form };
    for (const key of ["stockQuantity", "reorderLevel", "amount"]) {
      if (key in body && body[key]) body[key] = Number(body[key]);
    }
    if (mode === "records") body.followUpDate = undefined;
    if (mode === "prescriptions") {
      try {
        body.medications = JSON.parse(String(form.medications ?? "[]"));
      } catch {
        setMessage("Medications must be valid JSON.");
        return;
      }
    }
    const endpoint = mode === "inventory" ? `${current.endpoint}?medicationId=${encodeURIComponent(String(form.medicationId))}` : current.endpoint;
    const response = await fetch(endpoint, {
      method: mode === "inventory" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(response.ok ? "Saved successfully." : payload.message ?? "Unable to save");
    if (response.ok) {
      setForm({});
      await load();
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="card-soft rounded-3xl p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand)]">HMS OPERATIONS</p>
          <h1 className="mt-2 text-3xl font-semibold">{current.title}</h1>
          <p className="mt-2 text-sm text-soft">Authenticated workflow with server-side validation and role restrictions.</p>
        </header>

        {current.fields.length ? (
          <form onSubmit={submit} className="card-soft grid gap-3 rounded-2xl p-5 md:grid-cols-3">
            {current.fields.map((field) => (
              <label key={field} className="text-sm">
                <span className="text-soft">{field}</span>
                {field === "notes" || field === "medications" || field === "reason" ? (
                  <textarea
                    required={field !== "notes"}
                    value={form[field] ?? ""}
                    placeholder={field === "medications" ? '[{"medicationId":"...","dosage":"5mg","frequency":"daily","duration":"30 days"}]' : undefined}
                    onChange={(event) => setForm((previous) => ({ ...previous, [field]: event.target.value }))}
                    className="mt-1 min-h-24 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                  />
                ) : (
                  <input
                  required={field !== "description" && field !== "notes"}
                    type={field === "password" ? "password" : ["amount", "stockQuantity", "reorderLevel"].includes(field) ? "number" : "text"}
                    value={form[field] ?? ""}
                    onChange={(event) => setForm((previous) => ({ ...previous, [field]: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                  />
                )}
              </label>
            ))}
            <button className="self-end rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white" type="submit">
              Save
            </button>
          </form>
        ) : null}

        {message ? <p className="text-sm text-[var(--ink-soft)]">{message}</p> : null}
        <section className="card-soft overflow-x-auto rounded-2xl p-5">
          {loading ? <p className="text-sm text-soft">Loading...</p> : null}
          {!loading && !rows.length ? <p className="text-sm text-soft">No records found.</p> : null}
          {rows.length ? (
            <table className="min-w-full text-left text-sm">
              <thead><tr>{Object.keys(rows[0]).slice(0, 8).map((key) => <th className="px-3 py-2" key={key}>{key}</th>)}</tr></thead>
              <tbody>{rows.map((row, index) => <tr className="border-t border-[var(--line)]" key={String(row.id ?? index)}>{Object.keys(rows[0]).slice(0, 8).map((key) => <td className="px-3 py-2" key={key}>{displayValue(row[key])}</td>)}</tr>)}</tbody>
            </table>
          ) : null}
        </section>
      </div>
    </main>
  );
}
