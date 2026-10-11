import Link from "next/link";

const departments = [
  {
    name: "Cardiology",
    description: "Heart and cardiovascular care",
    icon: "CA",
    tone: "from-rose-100 to-orange-50 text-rose-700",
  },
  {
    name: "Neurology",
    description: "Brain and nervous system care",
    icon: "NE",
    tone: "from-violet-100 to-indigo-50 text-violet-700",
  },
  {
    name: "Pediatrics",
    description: "Child and adolescent care",
    icon: "PE",
    tone: "from-sky-100 to-cyan-50 text-sky-700",
  },
  {
    name: "Orthopedics",
    description: "Bone and joint care",
    icon: "OR",
    tone: "from-amber-100 to-yellow-50 text-amber-700",
  },
];

const doctors = [
  {
    name: "Marta Hayle",
    specialty: "Cardiologist",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Natan Kebede",
    specialty: "Neurologist",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=85",
  },
];

const highlights = [
  {
    number: "01",
    title: "Coordinated care",
    description: "Doctors, nurses, receptionists, and patients stay connected around one care journey.",
  },
  {
    number: "02",
    title: "Trusted records",
    description: "Appointments, medical records, prescriptions, and patient history stay organized.",
  },
  {
    number: "03",
    title: "Human-first service",
    description: "A calmer, clearer experience for every person who enters our hospital.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7faf8] text-[var(--ink)]">
      <header className="sticky top-0 z-50 border-b border-white/70 bg-[#f7faf8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="CareFlow home">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand)] text-xl font-bold text-white shadow-lg shadow-teal-900/15">
              +
            </span>
            <span>
              <span className="block text-lg font-extrabold tracking-tight">CareFlow</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                Hospital management
              </span>
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[var(--brand)]"
          >
            Login
          </Link>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20">
          <div className="relative z-10 fade-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-ring" />
              Caring for every chapter
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Better care starts with{" "}
              <span className="text-[var(--brand)]">better connection.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
              Welcome to CareFlow, a connected hospital experience that brings people,
              appointments, and clinical information together with clarity.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="rounded-full bg-[var(--brand)] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                Access your portal <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#departments"
                className="rounded-full border border-[var(--line)] bg-white px-6 py-3.5 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                Explore services
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-[var(--ink-soft)]">
              <span><strong className="text-[var(--brand)]">04</strong> care departments</span>
              <span><strong className="text-[var(--brand)]">01</strong> connected workspace</span>
            </div>
          </div>

          <div className="relative min-h-[430px] fade-slide-up fade-slide-delay-1">
            <div className="absolute -right-16 -top-12 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
            <div className="relative h-[430px] overflow-hidden rounded-[2.5rem] bg-slate-200 shadow-2xl shadow-slate-900/15">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(15, 23, 42, 0.18)), url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=90')",
                }}
                role="img"
                aria-label="Modern hospital exterior and care facility"
              />
              <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/30 bg-slate-950/55 p-5 text-white backdrop-blur-md">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
                      Our hospital
                    </p>
                    <p className="mt-1 text-xl font-bold">Care that moves with you</p>
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Connected care</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-5 rounded-2xl border border-white bg-white p-4 shadow-xl sm:-left-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Patient promise</p>
              <p className="mt-1 text-sm font-bold text-[var(--ink)]">Every visit matters.</p>
            </div>
          </div>
        </section>

        <section id="departments" className="bg-white px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">Our services</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Care for what matters most</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--ink-soft)]">
                Our connected departments work together to support patients through every stage of care.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {departments.map((department) => (
                <article key={department.name} className="group rounded-3xl border border-[var(--line)] bg-[#fbfdfb] p-5 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-black ${department.tone}`}>
                    {department.icon}
                  </div>
                  <h3 className="mt-6 font-bold">{department.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{department.description}</p>
                  <span className="mt-5 inline-block text-sm font-bold text-[var(--brand)] transition group-hover:translate-x-1">Learn more →</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">Meet the team</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">People behind the care</h2>
            <p className="mt-5 max-w-md leading-7 text-[var(--ink-soft)]">
              Our clinical teams combine expertise with a personal approach, supported by a shared view of every patient journey.
            </p>
            <Link href="/login" className="mt-7 inline-block text-sm font-bold text-[var(--brand)] hover:underline">
              Sign in to view your care team →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {doctors.map((doctor) => (
              <article key={doctor.name} className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-sm">
                <div className="h-64 bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url('${doctor.image}')` }} role="img" aria-label={`${doctor.name}, ${doctor.specialty}`} />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand)]">{doctor.specialty}</p>
                  <h3 className="mt-2 text-xl font-extrabold">{doctor.name}</h3>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">Here to listen, guide, and care.</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[var(--ink)] px-5 py-20 text-white sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-300">What we are building</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">A more thoughtful hospital experience.</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {highlights.map((highlight) => (
                <article key={highlight.number} className="border-t border-white/20 pt-5">
                  <span className="text-sm font-bold text-teal-300">{highlight.number}</span>
                  <h3 className="mt-5 text-xl font-bold">{highlight.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{highlight.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto w-full bg-[#102327] px-5 py-12 text-slate-300 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <div className="flex items-center gap-3 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)] text-lg font-bold">+</span>
              <span className="text-lg font-extrabold">CareFlow</span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-6">Connected hospital management for better everyday care.</p>
          </div>
          <div className="mt-10 flex flex-col gap-5 border-y border-white/10 py-6 text-sm md:flex-row md:items-center md:justify-between">
            <a href="mailto:hospital@example.com" className="flex items-center gap-3 transition hover:text-teal-300">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">Email</span>
              <span>hospital@example.com</span>
            </a>
            <span className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">Visit</span>
              <span>Addis Ababa, Ethiopia</span>
            </span>
            <a href="tel:+251000000000" className="flex items-center gap-3 transition hover:text-teal-300">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">Call</span>
              <span>+251 XXX XXX XXX</span>
            </a>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-slate-500">
          © 2026 Hospital Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
