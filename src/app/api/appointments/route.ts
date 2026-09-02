import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";
import { validateAppointmentBooking } from "@/lib/appointments";

const appointmentRoles = [
  "ADMIN",
  "RECEPTIONIST",
  "DOCTOR",
  "NURSE",
  "PATIENT",
] as const;

const listQuerySchema = z.object({
  q: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  departmentId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const createAppointmentSchema = z.object({
  patientId: z.string().optional(),
  departmentId: z.string(),
  doctorId: z.string(),
  appointmentDate: z.string().datetime(),
  reason: z.string().max(400).optional(),
  notes: z.string().max(500).optional(),
});

async function getSessionPatientId(userId: string) {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  });

  return patient?.id ?? null;
}

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, [...appointmentRoles]);

  if (!auth.ok) {
    return auth.response;
  }

  const rawQuery = {
    q: request.nextUrl.searchParams.get("q") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    doctorId: request.nextUrl.searchParams.get("doctorId") ?? undefined,
    patientId: request.nextUrl.searchParams.get("patientId") ?? undefined,
    departmentId:
      request.nextUrl.searchParams.get("departmentId") ?? undefined,
    from: request.nextUrl.searchParams.get("from") ?? undefined,
    to: request.nextUrl.searchParams.get("to") ?? undefined,
    page: request.nextUrl.searchParams.get("page") ?? "1",
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? "10",
  };

  const parsed = listQuerySchema.safeParse(rawQuery);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid query parameters",
      },
      { status: 400 },
    );
  }

  const {
    q,
    status,
    doctorId,
    patientId,
    departmentId,
    from,
    to,
    page,
    pageSize,
  } = parsed.data;

  const whereBase: Prisma.AppointmentWhereInput = {
    ...(status ? { status } : {}),
    ...(doctorId ? { doctorId } : {}),
    ...(departmentId ? { departmentId } : {}),

    ...(from || to
      ? {
          appointmentDate: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),

    ...(q
      ? {
          OR: [
            {
              patient: {
                name: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              doctor: {
                name: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              reason: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  let where: Prisma.AppointmentWhereInput = whereBase;

  if (auth.session.role === "PATIENT") {
    const linkedPatientId = await getSessionPatientId(auth.session.id);

    if (!linkedPatientId) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          total: 0,
          page,
          pageSize,
          totalPages: 1,
        },
      });
    }

    where = {
      ...whereBase,
      patientId: linkedPatientId,
    };
  } else if (patientId) {
    where = {
      ...whereBase,
      patientId,
    };
  }

  const skip = (page - 1) * pageSize;

  const [total, data] = await Promise.all([
    prisma.appointment.count({ where }),

    prisma.appointment.findMany({
      where,

      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },

        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },

        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        appointmentDate: "desc",
      },

      skip,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data,

    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, [
    "ADMIN",
    "RECEPTIONIST",
    "PATIENT",
  ]);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();

    const parsed = createAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload",
        },
        { status: 400 },
      );
    }

    const appointmentDate = new Date(parsed.data.appointmentDate);

    let patientId = parsed.data.patientId;

    if (auth.session.role === "PATIENT") {
      const linkedPatientId = await getSessionPatientId(
        auth.session.id,
      );

      if (!linkedPatientId) {
        return NextResponse.json(
          {
            success: false,
            message: "Patient profile not linked to this account",
          },
          { status: 403 },
        );
      }

      patientId = linkedPatientId;
    }

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient is required",
        },
        { status: 400 },
      );
    }

    const validation = await validateAppointmentBooking({
      patientId,
      doctorId: parsed.data.doctorId,
      departmentId: parsed.data.departmentId,
      appointmentDate,
    });

    if (!validation.ok) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: validation.status ?? 400 },
      );
    }

    const created = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: parsed.data.doctorId,
        departmentId: parsed.data.departmentId,
        appointmentDate,

        reason: parsed.data.reason?.trim() || null,

        status: "SCHEDULED",
      },

      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },

        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },

        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create appointment error", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create appointment",
      },
      { status: 500 },
    );
  }
}