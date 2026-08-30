"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Department = {
  id: string;
  name: string;
};

type PatientPayload = {
  name: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone?: string;
  address?: string;
  departmentId?: string;
};

type PatientFormProps = {
  initialValues?: Partial<PatientPayload>;
  departments: Department[];
  submitLabel: string;
  endpoint: string;
  method: "POST" | "PUT";
  onSuccessRedirect?: string;
};

export default function PatientForm({
  initialValues,
  departments,
  submitLabel,
  endpoint,
  method,
  onSuccessRedirect,
}: PatientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultDate = initialValues?.dateOfBirth ? initialValues.dateOfBirth.slice(0, 10) : "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload: PatientPayload = {
      name: String(form.get("name") ?? "").trim(),
      dateOfBirth: new Date(String(form.get("dateOfBirth") ?? "")).toISOString(),
      gender: String(form.get("gender") ?? "OTHER") as PatientPayload["gender"],
      phone: String(form.get("phone") ?? "").trim() || undefined,
      address: String(form.get("address") ?? "").trim() || undefined,
    };

    const rawDepartmentId = String(form.get("departmentId") ?? "");
    if (rawDepartmentId) {
      payload.departmentId = rawDepartmentId;
    }

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      setLoading(false);
      setError(result?.message ?? "Unable to save patient");
      return;
    }

    if (onSuccessRedirect) {
      router.push(onSuccessRedirect);
      router.refresh();
      return;
    }

    router.push("/dashboard/patients");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card-soft grid gap-4 rounded-2xl p-6">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-[var(--ink-soft)]">
          Full name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={initialValues?.name ?? ""}
          required
          className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="dateOfBirth" className="text-sm font-medium text-[var(--ink-soft)]">
            Date of birth
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={defaultDate}
            required
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="gender" className="text-sm font-medium text-[var(--ink-soft)]">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            defaultValue={initialValues?.gender ?? "OTHER"}
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-[var(--ink-soft)]">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={initialValues?.phone ?? ""}
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="text-sm font-medium text-[var(--ink-soft)]">
          Address
        </label>
        <input
          id="address"
          name="address"
          defaultValue={initialValues?.address ?? ""}
          className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="departmentId" className="text-sm font-medium text-[var(--ink-soft)]">
          Department
        </label>
        <select
          id="departmentId"
          name="departmentId"
          defaultValue={initialValues?.departmentId ?? ""}
          className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
        >
          <option value="">Not assigned</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
