"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Department = {
  id: number;
  name: string;
};

type Doctor = {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  departmentId: number;
};

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  departmentId: number | null;
};

type TimeSlot = {
  value: string;
  label: string;
};

type AppointmentFormProps = {
  showPatientSelect?: boolean;
  defaultPatientId?: number;
  onSuccessRedirect?: string;
};

export default function AppointmentForm({
  showPatientSelect = true,
  defaultPatientId,
  onSuccessRedirect = "/dashboard/appointments",
}: AppointmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState(defaultPatientId ? String(defaultPatientId) : "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const filteredDoctors = useMemo(
    () => doctors.filter((doctor) => !departmentId || doctor.departmentId === Number(departmentId)),
    [doctors, departmentId],
  );

  useEffect(() => {
    async function loadOptions() {
      const response = await fetch("/api/appointments/options");

      if (!response.ok) {
        setError("Unable to load booking options");
        return;
      }

      const payload = (await response.json()) as {
        data: {
          departments: Department[];
          doctors: Doctor[];
          patients: Patient[];
        };
      };

      setDepartments(payload.data.departments);
      setDoctors(payload.data.doctors);
      setPatients(payload.data.patients);

      if (!showPatientSelect && payload.data.patients.length === 1) {
        setPatientId(String(payload.data.patients[0].id));
      }
    }

    loadOptions();
  }, [showPatientSelect]);

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      setTime("");
      return;
    }

    async function loadSlots() {
      setLoadingSlots(true);
      setTime("");

      const params = new URLSearchParams({
        doctorId,
        date,
      });

      const response = await fetch(`/api/appointments/availability?${params.toString()}`);

      if (!response.ok) {
        setSlots([]);
        setLoadingSlots(false);
        return;
      }

      const payload = (await response.json()) as { data: TimeSlot[] };
      setSlots(payload.data);
      setLoadingSlots(false);
    }

    loadSlots();
  }, [doctorId, date]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!departmentId || !doctorId || !date || !time) {
      setLoading(false);
      setError("Please complete all required fields");
      return;
    }

    if (showPatientSelect && !patientId) {
      setLoading(false);
      setError("Please select a patient");
      return;
    }

    const payload = {
      ...(showPatientSelect ? { patientId: Number(patientId) } : {}),
      departmentId: Number(departmentId),
      doctorId: Number(doctorId),
      appointmentDate: time,
      reason: reason.trim() || undefined,
    };

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      setLoading(false);
      setError(result?.message ?? "Unable to book appointment");
      return;
    }

    router.push(onSuccessRedirect);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card-soft grid gap-5 rounded-2xl p-6">
      <div className="grid gap-1">
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand)]">BOOKING FLOW</p>
        <p className="text-sm text-soft">Patient → Department → Doctor → Date → Time → Book</p>
      </div>

      {showPatientSelect ? (
        <div>
          <label htmlFor="patientId" className="text-sm font-medium text-[var(--ink-soft)]">
            Patient
          </label>
          <select
            id="patientId"
            value={patientId}
            onChange={(event) => setPatientId(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="departmentId" className="text-sm font-medium text-[var(--ink-soft)]">
            Department
          </label>
          <select
            id="departmentId"
            value={departmentId}
            onChange={(event) => {
              setDepartmentId(event.target.value);
              setDoctorId("");
              setDate("");
              setTime("");
            }}
            required
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
          >
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="doctorId" className="text-sm font-medium text-[var(--ink-soft)]">
            Doctor
          </label>
          <select
            id="doctorId"
            value={doctorId}
            onChange={(event) => {
              setDoctorId(event.target.value);
              setDate("");
              setTime("");
            }}
            required
            disabled={!departmentId}
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 disabled:opacity-50"
          >
            <option value="">Select doctor</option>
            {filteredDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.firstName} {doctor.lastName} — {doctor.specialization}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="date" className="text-sm font-medium text-[var(--ink-soft)]">
            Date
          </label>
          <input
            id="date"
            type="date"
            min={minDate}
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setTime("");
            }}
            required
            disabled={!doctorId}
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="time" className="text-sm font-medium text-[var(--ink-soft)]">
            Available time
          </label>
          <select
            id="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
            disabled={!date || loadingSlots || slots.length === 0}
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 disabled:opacity-50"
          >
            <option value="">
              {loadingSlots
                ? "Loading slots..."
                : slots.length
                  ? "Select time"
                  : "No available slots"}
            </option>
            {slots.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="text-sm font-medium text-[var(--ink-soft)]">
          Reason for visit
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
          placeholder="Optional — describe symptoms or purpose of visit"
        />
      </div>

      {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}

      <button
        type="submit"
        disabled={loading || !time}
        className="w-fit rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Booking..." : "Book appointment"}
      </button>
    </form>
  );
}
