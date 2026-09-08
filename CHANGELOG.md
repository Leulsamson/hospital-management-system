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
- Medical-record APIs under src/app/api/medical-records.
- Medication APIs under src/app/api/medications.
- Prescription APIs with nested prescription medication management under src/app/api/prescriptions.
- Admin user-management APIs under src/app/api/users.
- Role-protected dashboard summary metrics under src/app/api/dashboard/stats.
- Payment and pharmacy inventory APIs under src/app/api/payments and src/app/api/inventory.
- Inventory movement history with stock deltas and reasons.
- Audit-log persistence/viewing, login rate limiting, and an initial automated security test suite.
- Dedicated clinical, administration, payments, inventory, audit, and analytics dashboard pages.
- Prisma schema and generated client (prisma/schema.prisma and src/generated/prisma)

### Changed
- Swept code towards using UUID string ids and a single `name` field for users/patients/doctors (to match prisma/schema.prisma).
- Regenerated Prisma client and aligned various created/updated scripts and seed file to the current schema.

### In progress
- Clinical and user-management UI screens remain to be built.
- Automated tests, analytics visualizations, and production security hardening remain.
- Prisma migration history requires reconciliation before applying the new schema migration to the current drifted local database.

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
Status: ✅ Backend complete; UI polish remains
- Appointment APIs implemented (search, create, get/update/delete)
- Availability and options APIs present
- Conflict protection implemented (application-level and DB unique constraint)
- Remaining: automated tests, payment workflow, and richer calendar UI

### Phase 6 — Patient Management
Status: 🟡 Core CRUD and history in progress
- List/create/update/detail/soft-deactivate APIs and core patient pages are present

### Phase 7 — Doctor & Department Management
Status: 🟡 Backend complete; UI polish remains
- Doctor and Department CRUD, filters, pagination, and dashboard pages are present

### Phase 8 — Medical Records
Status: ✅ Core API complete; UI planned
- Search/filter/pagination, create/update/read, ownership, and close workflows are present

### Phase 9 — Prescriptions & Medication Management
Status: ✅ Core API complete; UI planned
- Medication CRUD, prescription CRUD, nested medication items, and status transitions are present

### Phase 10 — User Management
Status: ✅ Core API and administrative UI
- Admin user listing, creation, role assignment, and password updates are present
- Account activation/deactivation and login enforcement are implemented

### Phase 11 — Dashboard & Analytics
Status: ✅ Core metrics and analytics available
- Role dashboards, /api/dashboard/stats, and analytics charts are present

### Phase 12 — Frontend UI/UX
Status: 🟡 Core screens available; polish remains
- Core shell plus clinical, user, payment, inventory, audit, and analytics screens are present
- Accessibility and richer form workflows remain

### Phase 13 — Security & Validation
Status: 🟡 Core protections present; production hardening remains
- Sessions, password hashing, validation, RBAC, ownership checks, constraints, login rate limiting, audit logs, and unit security tests are present
- Broader endpoint tests, distributed rate limiting, CSRF review, and monitoring remain


*This changelog was generated from the project repository state. It documents implemented APIs and notable code changes visible in the current tree.*
