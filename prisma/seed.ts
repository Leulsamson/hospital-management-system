import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for seeding");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

function addDays(base: Date, offsetDays: number, hour = 9, minute = 0) {
  const date = new Date(base);
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  const passwordHash = await hashPassword("Password123!");

  await prisma.$transaction([
    prisma.prescriptionMedication.deleteMany(),
    prisma.prescription.deleteMany(),
    prisma.medicalRecord.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.doctor.deleteMany(),
    prisma.user.deleteMany(),
    prisma.medication.deleteMany(),
    prisma.department.deleteMany(),
  ]);

  const departments = await Promise.all([
    prisma.department.create({ data: { name: "Cardiology", description: "Heart and cardiovascular care" } }),
    prisma.department.create({ data: { name: "Neurology", description: "Brain and nervous system care" } }),
    prisma.department.create({ data: { name: "Pediatrics", description: "Child and adolescent care" } }),
    prisma.department.create({ data: { name: "Orthopedics", description: "Bone and joint care" } }),
  ]);

  const [adminUser, doctorUserA, doctorUserB, nurseUser, receptionUser, patientUser, patientUserB, patientUserC] = await Promise.all([
    prisma.user.create({ data: { email: "admin@hms.local", password: passwordHash, role: "ADMIN" } }),
    prisma.user.create({ data: { email: "doctor.cardiology@hms.local", password: passwordHash, role: "DOCTOR" } }),
    prisma.user.create({ data: { email: "doctor.neuro@hms.local", password: passwordHash, role: "DOCTOR" } }),
    prisma.user.create({ data: { email: "nurse@hms.local", password: passwordHash, role: "NURSE" } }),
    prisma.user.create({ data: { email: "reception@hms.local", password: passwordHash, role: "RECEPTIONIST" } }),
    prisma.user.create({ data: { email: "patient@hms.local", password: passwordHash, role: "PATIENT" } }),
    prisma.user.create({ data: { email: "samuel.assefa@hms.local", password: passwordHash, role: "PATIENT" } }),
    prisma.user.create({ data: { email: "hana.tadesse@hms.local", password: passwordHash, role: "PATIENT" } }),
  ]);

  const doctorA = await prisma.doctor.create({
    data: {
      name: "Marta Hayle",
      specialization: "Cardiologist",
      licenseNumber: "DOC-1001",
      departmentId: departments[0].id,
      userId: doctorUserA.id,
    },
  });

  const doctorB = await prisma.doctor.create({
    data: {
      name: "Natan Kebede",
      specialization: "Neurologist",
      licenseNumber: "DOC-1002",
      departmentId: departments[1].id,
      userId: doctorUserB.id,
    },
  });

  const patientA = await prisma.patient.create({
    data: {
      name: "Mimi Bekele",
      dateOfBirth: new Date("1998-05-14T00:00:00.000Z"),
      gender: "FEMALE",
      phone: "+251-911-000001",
      address: "Bole, Addis Ababa",
      departmentId: departments[0].id,
      userId: patientUser.id,
    },
  });

  const patientB = await prisma.patient.create({
    data: {
      name: "Samuel Assefa",
      dateOfBirth: new Date("1987-03-22T00:00:00.000Z"),
      gender: "MALE",
      phone: "+251-911-000002",
      address: "CMC, Addis Ababa",
      departmentId: departments[1].id,
      userId: patientUserB.id,
    },
  });

  const patientC = await prisma.patient.create({
    data: {
      name: "Hana Tadesse",
      dateOfBirth: new Date("2013-10-02T00:00:00.000Z"),
      gender: "FEMALE",
      phone: "+251-911-000003",
      address: "Piassa, Addis Ababa",
      departmentId: departments[2].id,
      userId: patientUserC.id,
    },
  });

  const now = new Date();

  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        appointmentDate: addDays(now, -4, 10, 0),
        status: "COMPLETED",
        reason: "Chest pain follow-up",
        patientId: patientA.id,
        doctorId: doctorA.id,
        departmentId: departments[0].id,
      },
    }),
    prisma.appointment.create({
      data: {
        appointmentDate: addDays(now, -2, 11, 0),
        status: "COMPLETED",
        reason: "Migraine review",
        patientId: patientB.id,
        doctorId: doctorB.id,
        departmentId: departments[1].id,
      },
    }),
    prisma.appointment.create({
      data: {
        appointmentDate: addDays(now, 1, 9, 30),
        status: "SCHEDULED",
        reason: "Routine checkup",
        patientId: patientC.id,
        doctorId: doctorA.id,
        departmentId: departments[0].id,
      },
    }),
    prisma.appointment.create({
      data: {
        appointmentDate: addDays(now, 3, 13, 0),
        status: "SCHEDULED",
        reason: "Neurology consultation",
        patientId: patientA.id,
        doctorId: doctorB.id,
        departmentId: departments[1].id,
      },
    }),
  ]);

  const recordA = await prisma.medicalRecord.create({
    data: {
      symptoms: "Intermittent chest discomfort",
      diagnosis: "Mild hypertension",
      treatment: "Lifestyle changes and monitoring",
      notes: "Return if pain worsens",
      status: "OPEN",
      patientId: patientA.id,
      doctorId: doctorA.id,
      appointmentId: appointments[0].id,
    },
  });

  const recordB = await prisma.medicalRecord.create({
    data: {
      symptoms: "Recurring migraines",
      diagnosis: "Chronic migraine",
      treatment: "Preventive medication",
      notes: "Track headache frequency",
      status: "OPEN",
      patientId: patientB.id,
      doctorId: doctorB.id,
      appointmentId: appointments[1].id,
    },
  });

  const medA = await prisma.medication.create({
    data: {
      name: "Amlodipine",
      description: "Antihypertensive medication",
    },
  });

  const medB = await prisma.medication.create({
    data: {
      name: "Sumatriptan",
      description: "Acute migraine treatment",
    },
  });

  const prescriptionA = await prisma.prescription.create({
    data: {
      notes: "Take one tablet every morning",
      status: "ACTIVE",
      doctorId: doctorA.id,
      patientId: patientA.id,
    },
  });

  const prescriptionB = await prisma.prescription.create({
    data: {
      notes: "Take at onset of severe headache",
      status: "ACTIVE",
      doctorId: doctorB.id,
      patientId: patientB.id,
    },
  });

  await prisma.prescriptionMedication.createMany({
    data: [
      {
        prescriptionId: prescriptionA.id,
        medicationId: medA.id,
        dosage: "5mg",
        frequency: "Once daily",
        duration: "30 days",
      },
      {
        prescriptionId: prescriptionB.id,
        medicationId: medB.id,
        dosage: "50mg",
        frequency: "As needed",
        duration: "15 days",
      },
    ],
  });

  const [userCount, doctorCount, patientCount, appointmentCount] = await Promise.all([
    prisma.user.count(),
    prisma.doctor.count(),
    prisma.patient.count(),
    prisma.appointment.count(),
  ]);

  console.log("Seed completed successfully");
  console.log({
    adminEmail: adminUser.email,
    demoPassword: "Password123!",
    receptionEmail: receptionUser.email,
    nurseEmail: nurseUser.email,
    patientPortalEmail: patientUser.email,
    userCount,
    doctorCount,
    patientCount,
    appointmentCount,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
