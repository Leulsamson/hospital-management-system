# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added
- Backend APIs for departments (list, create, update, deactivate) under src/app/api/departments.
- Backend APIs for doctors (list, create, update, deactivate) under src/app/api/doctors.
- Appointment APIs and helpers under src/app/api/appointments and src/lib/appointments covering:
  - Searching and filtering appointments
  - Creating appointments with validation
  - Availability and options endpoints for booking UIs
  - Conflict prevention (doctorId + appointmentDate uniqueness check in code and DB)
- Authentication endpoints: register/login/logout/session under src/app/api/auth.
- Patient management endpoints (list, create) under src/app/api/patients.
- Prisma schema and generated client (prisma/schema.prisma and src/generated/prisma)

### Changed
- Swept code towards using UUID string ids and a single `name` field for users/patients/doctors (to match prisma/schema.prisma).
- Regenerated Prisma client and aligned various created/updated scripts and seed file to the current schema.

### In progress
- TypeScript/type alignment across the entire codebase: some references (firstName/lastName, numeric ids) were updated but a full sweep is ongoing.
- UI integration and per-role dashboards are partially present but require additional work.

### Fixed
- Seed script updated to match current model shapes (name fields, password property name and generated user accounts).

### Security
- Password hashing implemented using bcryptjs.
- Session tokens signed with jose and stored in httpOnly cookies.


## Milestone summary

### Phase 1 — Planning & Requirements
Status: ✅ Completed (project scaffolding and initial requirements recorded)

### Phase 2 — Architecture & System Design
Status: ✅ Completed (Next.js + Prisma + PostgreSQL architecture established)

### Phase 3 — Database & Prisma
Status: ✅ Completed (Prisma schema created; models for users, patients, doctors, departments, appointments, medical records, prescriptions and medications defined)

### Phase 4 — Authentication & Authorization
Status: ✅ Completed (register/login/session/logout endpoints implemented, session JWT cookie flow present)

### Phase 5 — Appointment Management
Status: 🟡 In progress
- Appointment APIs implemented (search, create, get/update/delete)
- Availability and options APIs present
- Conflict protection implemented (application-level and DB unique constraint)
- Remaining: full frontend integration, type alignment, additional UI features

### Phase 6 — Patient Management
Status: 🟡 Partial
- Patient list/create APIs implemented; further CRUD and UI remain

### Phase 7 — Doctor & Department Management
Status: 🟡 Partial
- Doctor and Department backend APIs implemented; UI work and additional validations remain

### Phase 8 — Medical Records
Status: ⬜ Planned (schema present; APIs not implemented)

### Phase 9 — Prescriptions & Medication Management
Status: ⬜ Planned (schema present; APIs not implemented)


*This changelog was generated from the project repository state. It documents implemented APIs and notable code changes visible in the current tree.*
