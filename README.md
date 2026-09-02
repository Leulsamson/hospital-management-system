# Hospital Management System (HMS)

A lightweight Hospital Management System (HMS) prototype built with Next.js, TypeScript and Prisma. The project provides backend APIs and a starting frontend dashboard for managing patients, doctors, departments, and appointment workflows. It is intended as a foundation for an enterprise-grade HMS and is under active development.

Table of contents

- Project overview
- Current development status
- Main features (implemented)
- User roles and access
- Technology stack
- System architecture
- Project structure
- Database (Prisma schema summary)
- API reference (implemented endpoints)
- Appointment workflow
- Security
- Environment variables
- Installation
- Running the project
- Prisma & database workflow
- Testing
- Build & deployment
- Error handling
- Roadmap
- Known limitations
- Contributing


## Project overview

HMS is a small hospital management application that demonstrates a coherent backend API surface together with a dashboard-style frontend. It focuses on core workflows:

- Authentication and session management
- Patient registration and management
- Doctor and Department CRUD operations
- Appointment booking, searching, and conflict-safe scheduling

Intended users: hospital administrators, receptionists, doctors, nurses and patients (as separate roles).


## Current development status

This repository is under development. The current focus is on backend APIs and data-model alignment (Prisma). The implemented and partially implemented areas are documented below.

Current active development phase: Phase 5 — Appointment Management (backend implemented and being integrated with the rest of the codebase).

Implemented (verified in source):
- Authentication (register / login / session) with JWT session cookie
- Patient management API (list, create)
- Doctor management API (list, create, update, deactivate)
- Department management API (list, create, update, deactivate)
- Appointment APIs (list, create, get/update/delete by id)
- Appointment support endpoints: options (departments/doctors/patients) and availability (time slots)
- Prisma schema with models for User, Patient, Doctor, Department, Appointment, MedicalRecord, Prescription, Medication, etc.

Partially implemented / In progress:
- Full codebase type alignment with the current Prisma schema (there are ongoing edits to align UUID/string ids and unified `name` field across code)
- UI pages and components are present but may still rely on some older shapes or need integration work

Planned (not implemented in code):
- Full MedicalRecords CRUD API and UI
- Prescription & medication management APIs and UI
- Complete role-based dashboard pages and role-specific features


## Main features (implemented)

Important: Only features present in the current source are listed. Features that exist solely in the Prisma schema but have no API or UI implementation are marked accordingly.

Authentication
- POST /api/auth/register — register a new user (admin setup key logic for first user)
- POST /api/auth/login — login endpoint (verifies hashed password, creates session JWT cookie)
- GET /api/auth/session — returns session details for authenticated requests
- POST /api/auth/logout — clears session cookie

Patient management
- GET /api/patients — list patients with search, gender filter, department filter, isActive filter, pagination
- POST /api/patients — create a patient (creates a linked User record)
- GET /api/patients/:id — fetch a patient by id (details)

Doctor management
- GET /api/doctors — list doctors with search, department filter, isActive filter, pagination
- POST /api/doctors — create doctor (creates linked User)
- GET /api/doctors/:id — fetch doctor details
- PUT /api/doctors/:id — update doctor
- DELETE /api/doctors/:id — deactivate doctor (sets isActive=false)

Department management
- GET /api/departments — list departments with search, isActive filter, pagination
- POST /api/departments — create department
- GET /api/departments/:id — get department details (includes doctors)
- PUT /api/departments/:id — update department
- DELETE /api/departments/:id — deactivate department (sets isActive=false)

Appointments
- GET /api/appointments — search and filter appointments (q, status, doctorId, patientId, departmentId, date range, pagination)
  - Patient role is restricted to only see their own appointments
- POST /api/appointments — create an appointment (with validation and conflict prevention)
- GET /api/appointments/:id — get an appointment by id (includes patient, doctor, department)
- PUT /api/appointments/:id — update appointment (reschedule, change doctor/department, status changes with patient restrictions)
- DELETE /api/appointments/:id — cancel an appointment (status => CANCELLED)
- GET /api/appointments/options — returns active departments, doctors, patients for use in booking UIs
- GET /api/appointments/availability — returns available time slots for a doctor on a date (conflict-aware)

Utilities
- GET /api/test-db — simple endpoint to test DB connectivity (returns departments)


## User roles

Defined roles (Prisma enum Role):
- ADMIN
- DOCTOR
- NURSE
- RECEPTIONIST
- PATIENT

Role capabilities (as implemented in middleware checks / APIs):
- ADMIN: Full access to management endpoints (departments, doctors, patients, appointments). Can create users via register endpoint (with admin privileges when appropriate).
- RECEPTIONIST: Can list/create appointments and patients; access appointment management endpoints.
- DOCTOR: Can view appointments and (where implemented) medical records/prescriptions for assigned patients; limited management rights on some read operations in APIs.
- NURSE: Similar read-level access to appointment and patient lists (as permitted by API route checks).
- PATIENT: Can create appointments (booking) and view their own appointments only. Patients cannot change appointment status except cancelling.

Authorization is enforced by requireApiSession helper which checks the session and allowedRoles parameter used by each route.


## Technology stack

Key technologies used (from package.json and source):
- Next.js 16.3.0 (app directory)
- React 19.2.8
- TypeScript ^5.x
- Prisma ORM 7.9.1 (schema in prisma/schema.prisma)
- PostgreSQL (datasource provider in schema.prisma)
- Zod (runtime validation)
- jose (JWT signing and verification)
- bcryptjs (password hashing)
- Tailwind CSS (dev deps present)
- tsx for scripting (seed)


## System architecture

Frontend (Next.js app)
  ↓
API routes (Next.js route handlers under src/app/api/*)
  ↓
Authentication/session (JWT session cookie signed with jose; session stored in cookie)
  ↓
Prisma client (src/generated/prisma) talking to PostgreSQL

Authentication flow: login -> verify password -> sign JWT session token -> set httpOnly cookie -> requireApiSession reads cookie and validates token for API requests.


## Project structure (high level)

- prisma/
  - schema.prisma — Prisma schema (source of truth for DB models)
  - seed.ts — seed script (creates sample departments, users, patients, appointments)
  - migrations/ — migration files (if present)

- src/
  - app/ — Next.js app pages and API route handlers (app/dashboard, app/login, app/api/*)
  - components/ — React components (appointments, tables, forms)
  - generated/prisma/ — generated Prisma client (output path configured in schema.prisma)
  - lib/ — shared utilities (prisma client wrapper, auth, api-auth, appointments helper, password helper)

- package.json — scripts and dependencies
- tsconfig.json — TypeScript configuration


## Database (Prisma schema summary)

Models (selected, as implemented in prisma/schema.prisma):
- User: id (String UUID), email (unique), password, role (enum Role), timestamps. Relations: doctor?, patient?, nurse?
- Department: id (String UUID), name (unique), description?, isActive (default true). Relations: doctors[], patients[], appointments[], nurses[]
- Doctor: id (String UUID), userId (unique), departmentId, name, specialization, licenseNumber (unique), phone?, isActive, timestamps. Relations: user, department, appointments, medicalRecords, prescriptions
- Patient: id (String UUID), userId (unique), departmentId?, name, dateOfBirth, gender, phone?, address?, isActive, timestamps. Relations: user, appointments, medicalRecords, prescriptions
- Appointment: id (String UUID), patientId, doctorId, departmentId, appointmentDate (DateTime), status (AppointmentStatus enum), reason?, timestamps
  - Business rule: @@unique([doctorId, appointmentDate]) — prevents double-booking a doctor at the exact same datetime

Enums
- Role: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PATIENT
- Gender: MALE, FEMALE, OTHER
- AppointmentStatus: SCHEDULED, COMPLETED, CANCELLED

Important constraints and business rules
- Unique department.name
- Unique user.email
- Unique doctor.licenseNumber
- Unique prescription/per-medication combos as defined in model
- Appointment uniqueness constraint ensures a doctor cannot have two appointments with the exact same appointmentDate (conflict prevention at DB level)


## API documentation (implemented routes)

NOTE: Documented endpoints are the routes present under src/app/api. For each endpoint the documented roles reflect the checks implemented by requireApiSession in each route.

Authentication
- POST /api/auth/register
  - Purpose: Register a new user. First created user may require ADMIN_SETUP_KEY to become ADMIN.
  - Auth: If not creating first account, only ADMIN session can create users.
  - Body: { name?: string, email: string, password: string, role?: Role, setupKey?: string }
  - Validation: Zod schema enforces name length, email, password length and role enum
  - Response: { success: true, user: { id, email, role } }
  - Errors: 400 invalid payload, 409 email already in use, 403 invalid setup key or unauthorized

- POST /api/auth/login
  - Purpose: Authenticate user and set session cookie
  - Body: { email: string, password: string }
  - Validation: Zod checks email/password length
  - Behavior: Verifies hashed password (bcryptjs), loads linked profile name if applicable (doctor/patient/nurse), signs JWT session token and sets cookie
  - Response: { success: true, user: { id, email, role, name } }
  - Errors: 401 invalid credentials, 403 deactivated account, 500 on server error

- GET /api/auth/session
  - Purpose: Return session info if authenticated
  - Auth: reads session cookie
  - Response: { authenticated: true, user: { id, role, email, name } } or 401

- POST /api/auth/logout
  - Purpose: Clear session cookie

Patients
- GET /api/patients
  - Purpose: List/search patients
  - Auth: ADMIN, RECEPTIONIST, DOCTOR, NURSE
  - Query: q, gender, departmentId, isActive, page, pageSize
  - Response: { success: true, data: patients[], departments: [...], meta }

- POST /api/patients
  - Purpose: Create a patient (creates linked User with a generated email/password)
  - Auth: ADMIN, RECEPTIONIST
  - Body: { name, dateOfBirth (ISO), gender, phone?, address?, departmentId? }
  - Response: created patient object (includes user.email and department info)

- GET /api/patients/:id
  - Purpose: Fetch patient details
  - Auth: not restricted inside the route file (route returns 404 if not found)

Doctors
- GET /api/doctors
  - Purpose: List doctors with filtering and counts
  - Auth: ADMIN, DOCTOR
  - Query: q, departmentId, isActive, page, pageSize

- POST /api/doctors
  - Purpose: Create a doctor (creates linked User account with generated email/password)
  - Auth: ADMIN
  - Body: { name, specialization, licenseNumber, phone?, departmentId }
  - Response: created doctor (includes department select)

- GET /api/doctors/:id
  - Purpose: Fetch doctor detail including counts

- PUT /api/doctors/:id
  - Purpose: Update doctor fields
  - Auth: ADMIN

- DELETE /api/doctors/:id
  - Purpose: Soft-deactivate doctor (sets isActive=false)
  - Auth: ADMIN

Departments
- GET /api/departments
  - Purpose: List/search departments with pagination
  - Auth: ADMIN, DOCTOR
  - Query: q, isActive, page, pageSize

- POST /api/departments
  - Purpose: Create a department
  - Auth: ADMIN
  - Body: { name, description? }

- GET /api/departments/:id
  - Purpose: Get department detail (includes doctors)

- PUT /api/departments/:id
  - Purpose: Update department
  - Auth: ADMIN

- DELETE /api/departments/:id
  - Purpose: Soft-deactivate department (isActive=false)
  - Auth: ADMIN

Appointments
- GET /api/appointments
  - Purpose: Search/list appointments with filters
  - Auth: ADMIN, RECEPTIONIST, DOCTOR, NURSE, PATIENT (patients limited to their own appointments)
  - Query: q, status, doctorId, patientId, departmentId, from (ISO datetime), to (ISO datetime), page, pageSize
  - Response includes patient, doctor, department selections and meta pagination

- POST /api/appointments
  - Purpose: Create an appointment
  - Auth: ADMIN, RECEPTIONIST, PATIENT
  - Body: { patientId? (optional for patients), departmentId, doctorId, appointmentDate (ISO datetime), reason? }
  - Validation: Zod schema enforces required fields and appointmentDate format
  - Booking checks:
   - appointmentDate must be in the future (validateAppointmentBooking)
   - doctor must exist and be active
   - patient must exist and be active
   - doctor must belong to the given department
   - conflict prevention: checks existing appointments with same doctorId and appointmentDate (ACTIVE statuses)
  - Response: created appointment object including patient/doctor/department selects
  - Errors: 400 invalid payload, 403 patient not linked, 409 scheduling conflict, 404 doctor/patient not available

- GET /api/appointments/:id
  - Purpose: Retrieve appointment by id (includes patient, doctor, department)
  - Auth: ADMIN, RECEPTIONIST, DOCTOR, NURSE, PATIENT (patient limited to their own appointment)

- PUT /api/appointments/:id
  - Purpose: Update/reschedule appointment
  - Auth: ADMIN, RECEPTIONIST, PATIENT (patients limited to cancelling only)
  - Validation: same booking validation when rescheduling; prevents modifying completed/cancelled appts

- DELETE /api/appointments/:id
  - Purpose: Cancel appointment (changes status to CANCELLED)
  - Auth: ADMIN, RECEPTIONIST, PATIENT (patient limited to their own appt)

- GET /api/appointments/options
  - Purpose: Return lists for booking UIs (active departments, doctors, patients)
  - Auth: all roles including PATIENT (patients only receive their own patient entries)

- GET /api/appointments/availability
  - Purpose: Return available slots for a doctor on a given date
  - Auth: all roles (requires doctorId and date query parameters)
  - Slot generation considers work hours and existing active appointments


## Appointment workflow (detailed)

Booking flow (as implemented):
1. Client fetches /api/appointments/options to populate departments, doctors, and patient options.
2. Client fetches /api/appointments/availability?doctorId=...&date=YYYY-MM-DD to list open time slots for a given doctor on a date.
3. Client submits POST /api/appointments with departmentId, doctorId, appointmentDate (ISO datetime), and (optionally) patientId.
4. The server validates:
   - appointmentDate is a future date
   - the doctor exists and is active
   - the patient exists and is active
   - the doctor belongs to the given department
   - conflict: no existing appointment for the same doctor at the same date/time with an active status (SCHEDULED)
5. If validation passes the appointment is created with status SCHEDULED.
6. Patients are restricted to see and manage only their own appointments (requireApiSession enforces role + getSessionPatientId lookup).

Conflict prevention: The code uses both a Prisma query to detect conflicts and a DB-level @@unique constraint on (doctorId, appointmentDate). The application-level check returns a 409 Conflict response if a conflicting active appointment exists.


## Security

Implemented security mechanisms (from source):
- Password hashing: bcryptjs used to hash passwords (hashPassword and verifyPassword utilities)
- Session tokens: Signed JWT session token using jose, stored in an httpOnly cookie (setSessionCookie)
- Authorization: requireApiSession helper inspects session and enforces allowed roles per route
- Input validation: Zod schemas validate request query/body parameters for routes
- Database constraints: Unique constraints and foreign key relations enforced by Prisma schema

Notes and limitations: the code implements many standard protections but this is a work-in-progress prototype and has not undergone a security audit. Do not deploy to production without additional hardening.


## Environment variables

Do not commit secrets. The project expects (at minimum):

- DATABASE_URL — PostgreSQL connection string used by Prisma
- AUTH_SECRET — secret used to sign session JWTs (must be at least 32 chars)
- ADMIN_SETUP_KEY — (optional) used by registration flow for first admin bootstrapping
- NODE_ENV — typical Node environment variable


## Installation

Prerequisites
- Node.js (recommend >= 18)
- PostgreSQL instance

Getting started
1. Clone the repository
   - git clone <repo>
2. Install dependencies
   - npm install
3. Generate Prisma client
   - npx prisma generate
4. Prepare the database
   - Use Prisma migrations if desired (example): npx prisma migrate dev --name init
   - Or push the schema: npx prisma db push
5. Seed the database (optional)
   - npm run db:seed


## Running the project

- Development server
  - npm run dev

- Build & Start
  - npm run build
  - npm run start

- Seed DB
  - npm run db:seed


## Prisma & database workflow

- Prisma schema lives in prisma/schema.prisma and is the authoritative data model for the app.
- Generated client outputs to src/generated/prisma (configured in schema.prisma generator).
- Use npx prisma generate after updating schema.
- Migrations (if used) are under prisma/migrations. Use npx prisma migrate dev when actively developing migrations.


## Testing

- Automated tests: none found in the repository. Manual API testing and seeds are used.


## Build & deployment

- The project is a standard Next.js app. Build with npm run build and run with npm run start. Review environment variable configuration and ensure AUTH_SECRET and DATABASE_URL are set for production.


## Error handling

- API routes use try/catch and return JSON responses with { success: false, message } and appropriate HTTP status codes (400, 401, 403, 404, 409, 500).
- Prisma unique-constraint errors are detected (error.code === 'P2002') in several places and return 409 responses.


## Roadmap (based on repository planning and code)

- ✅ Phase 1–5: Core data models and appointment management (appointments features implemented in API)
- 🟡 Phase 6: Patient Management — API core implemented (listing/creating); further UI work and additional CRUD remain
- 🟡 Phase 7: Doctor & Department Management — APIs implemented for doctors and departments; UI and further validation remaining
- ⬜ Phase 8: Medical Records — planned in schema, not implemented as API routes
- ⬜ Phase 9: Prescriptions & Medications — planned in schema, no API routes yet
- ⬜ Phase 10+: User management, dashboards, analytics and UI polish — many pieces scaffolded but not yet complete


## Known limitations

- Some parts of the codebase were recently refactored to use UUID string ids and a single `name` field; a full sweep to align all references and generated client types is in progress. This may cause TypeScript errors until fully synchronized.
- No automated tests found.
- Some Prisma models exist in schema but corresponding API routes are not yet implemented (MedicalRecord, Prescription, Medication CRUD).


## Future improvements (ideas)

- Implement full MedicalRecord and Prescription APIs and UI
- Add automated tests (unit + integration for API)
- Add role-based UI pages for each user type and per-role dashboards
- Improve error reporting and monitoring (Sentry, logs)
- Harden authentication/session handling (rotating secrets, refresh tokens) for production


## Contributing

Recommended workflow

1. Create a feature branch from main
   - git checkout -b feature/your-feature
2. Make changes and run local checks
   - npm install
   - npx prisma generate (if schema changed)
   - npm run dev
3. Commit and push
   - git add .
   - git commit -m "Add feature: ..."
   - git push --set-upstream origin feature/your-feature
4. Open a Pull Request for review


## License

No license file detected in the repository. Add a LICENSE file to declare the project's license.


--

If you'd like, I can now create a tidy CHANGELOG.md and a per-phase document describing Phase 5 in depth (files, technical decisions, remaining work). Which would you like next?
