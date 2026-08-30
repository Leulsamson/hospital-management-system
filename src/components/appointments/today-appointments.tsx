type TodayAppointment = {
  id: number;
  appointmentDate: Date;
  status: string;
  patient: { firstName: string; lastName: string };
  doctor: { firstName: string; lastName: string };
};

type TodayAppointmentsProps = {
  appointments: TodayAppointment[];
};

function formatTime(value: Date) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function TodayAppointments({ appointments }: TodayAppointmentsProps) {
  return (
    <article className="card-soft rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand)]">
            TODAY&apos;S APPOINTMENTS
          </p>
          <h3 className="mt-2 text-xl font-semibold">Clinic schedule</h3>
        </div>
        <p className="text-sm text-soft">{appointments.length} scheduled</p>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)]">
        <div className="grid grid-cols-[72px_1fr_1fr] gap-3 border-b border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 text-xs font-semibold tracking-wide text-soft">
          <span>Time</span>
          <span>Patient</span>
          <span>Doctor</span>
        </div>

        {appointments.length ? (
          <ul>
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="grid grid-cols-[72px_1fr_1fr] gap-3 border-t border-[var(--line)] px-4 py-3 text-sm first:border-t-0"
              >
                <span className="font-semibold text-[var(--brand)]">
                  {formatTime(appointment.appointmentDate)}
                </span>
                <span>
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </span>
                <span className="text-[var(--ink-soft)]">
                  Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-sm text-soft">No appointments scheduled for today.</p>
        )}
      </div>
    </article>
  );
}
