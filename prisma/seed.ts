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

  const [adminUser, doctorUserA, doctorUserB, nurseUser, receptionUser, patientUser] = await Promise.all([
    prisma.user.create({
      data: {
        firstName: "Leul",
        lastName: "Admin",
        email: "admin@hms.local",
        passwordHash,
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Marta",
        lastName: "Hayle",
        email: "doctor.cardiology@hms.local",
        passwordHash,
        role: "DOCTOR",
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Natan",
        lastName: "Kebede",
        email: "doctor.neuro@hms.local",
        passwordHash,
        role: "DOCTOR",
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Selam",
        lastName: "Tesfaye",
        email: "nurse@hms.local",
        passwordHash,
        role: "NURSE",
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Abel",
        lastName: "Frontdesk",
        email: "reception@hms.local",
        passwordHash,
        role: "RECEPTIONIST",
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Mimi",
        lastName: "Bekele",
        email: "patient@hms.local",
        passwordHash,
        role: "PATIENT",
      },
    }),
  ]);

  const doctorA = await prisma.doctor.create({
    data: {
      firstName: doctorUserA.firstName,
      lastName: doctorUserA.lastName,
      email: doctorUserA.email,
      specialization: "Cardiologist",
      licenseNumber: "DOC-1001",
      departmentId: departments[0].id,
      userId: doctorUserA.id,
    },
  });

  const doctorB = await prisma.doctor.create({
    data: {
      firstName: doctorUserB.firstName,
      lastName: doctorUserB.lastName,
      email: doctorUserB.email,
      specialization: "Neurologist",
      licenseNumber: "DOC-1002",
      departmentId: departments[1].id,
      userId: doctorUserB.id,
    },
  });

  const patientA = await prisma.patient.create({
    data: {
      firstName: patientUser.firstName,
      lastName: patientUser.lastName,
      dateOfBirth: new Date("1998-05-14T00:00:00.000Z"),
      gender: "FEMALE",
      phone: "+251-911-000001",
      email: patientUser.email,
      address: "Bole, Addis Ababa",
      emergencyContact: "Alemu Bekele - +251-911-999111",
      departmentId: departments[0].id,
      userId: patientUser.id,
    },
  });

  const patientB = await prisma.patient.create({
    data: {
      firstName: "Samuel",
      lastName: "Assefa",
      dateOfBirth: new Date("1987-03-22T00:00:00.000Z"),
      gender: "MALE",
      phone: "+251-911-000002",
      email: "samuel.assefa@hms.local",
      address: "CMC, Addis Ababa",
      emergencyContact: "Liya Assefa - +251-911-999222",
      departmentId: departments[1].id,
    },
  });

  const patientC = await prisma.patient.create({
    data: {
      firstName: "Hana",
      lastName: "Tadesse",
      dateOfBirth: new Date("2013-10-02T00:00:00.000Z"),
      gender: "FEMALE",
      phone: "+251-911-000003",
      email: "hana.tadesse@hms.local",
      address: "Piassa, Addis Ababa",
      emergencyContact: "Rahel Tadesse - +251-911-999333",
      departmentId: departments[2].id,
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
        status: "CONFIRMED",
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
      genericName: "Amlodipine",
      form: "Tablet",
      strength: "5mg",
      manufacturer: "HMS Pharma",
    },
  });

  const medB = await prisma.medication.create({
    data: {
      name: "Sumatriptan",
      genericName: "Sumatriptan",
      form: "Tablet",
      strength: "50mg",
      manufacturer: "HMS Pharma",
    },
  });

  const prescriptionA = await prisma.prescription.create({
    data: {
      instructions: "Take one tablet every morning",
      status: "ACTIVE",
      doctorId: doctorA.id,
      patientId: patientA.id,
      medicalRecordId: recordA.id,
    },
  });

  const prescriptionB = await prisma.prescription.create({
    data: {
      instructions: "Take at onset of severe headache",
      status: "ACTIVE",
      doctorId: doctorB.id,
      patientId: patientB.id,
      medicalRecordId: recordB.id,
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
