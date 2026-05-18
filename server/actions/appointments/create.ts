'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { checkAppointmentConflicts } from '@/lib/agenda/queries';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserOrg } from '@/lib/auth/current-user-org';
import { db } from '@/lib/db/client';
import { appointments } from '@/lib/db/schema/appointments';

/**
 * Server Action: crear una cita.
 *
 * Reglas (master plan §Fase 1):
 *   - organizationId viene del context (NUNCA del cliente).
 *   - Validación Zod en server. Cliente NO se confía.
 *   - Detección de conflictos antes de insertar (sala / fisio mismo slot).
 *   - Audit log emitido por trigger Postgres (tg_audit_appointment) Y por
 *     logAudit() para capturar IP/UA del cliente.
 *
 * Devuelve { ok, appointmentId } en éxito, { ok:false, error, fields? } en falla.
 */

const createSchema = z.object({
  patientId: z.string().uuid({ message: 'Paciente inválido.' }),
  practitionerId: z.string().uuid({ message: 'Fisio inválido.' }),
  branchId: z.string().uuid({ message: 'Sucursal inválida.' }),
  typeId: z.string().uuid({ message: 'Tipo de cita inválido.' }),
  roomId: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  /** Fecha local en formato YYYY-MM-DD. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha inválida (YYYY-MM-DD).' }),
  /** Hora local en formato HH:MM (24h). */
  time: z.string().regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, { message: 'Hora inválida (HH:MM).' }),
  /** Duración en minutos (1-480). */
  durationMinutes: z.coerce.number().int().min(5).max(480),
  notes: z
    .string()
    .max(2000)
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
});

export type CreateAppointmentInput = z.infer<typeof createSchema>;

export interface CreateAppointmentResult {
  ok: boolean;
  appointmentId?: string | undefined;
  error?: string | undefined;
  field?: keyof CreateAppointmentInput | undefined;
}

export async function createAppointmentAction(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? 'Datos inválidos.',
      field: issue?.path[0] as keyof CreateAppointmentInput | undefined,
    };
  }
  const data = parsed.data;

  const userOrg = await getCurrentUserOrg();
  if (!userOrg) return { ok: false, error: 'Sesión expirada. Inicia sesión otra vez.' };

  // Construir start/end timestamps en el timezone del servidor.
  // En Fase 1.2.b (timezones por sucursal) ajustaremos para usar tz del branch.
  const startAt = new Date(`${data.date}T${data.time.padStart(5, '0')}:00`);
  if (Number.isNaN(startAt.getTime())) {
    return { ok: false, error: 'Fecha/hora inválida.' };
  }
  const endAt = new Date(startAt.getTime() + data.durationMinutes * 60_000);

  if (endAt <= startAt) {
    return { ok: false, error: 'La duración debe ser mayor a cero.' };
  }

  // Conflict check
  const conflict = await checkAppointmentConflicts({
    organizationId: userOrg.organization.id,
    practitionerId: data.practitionerId,
    roomId: data.roomId ?? null,
    startAt,
    endAt,
  });

  if (conflict.practitionerBusy) {
    return {
      ok: false,
      error: 'El fisio ya tiene una cita en ese horario.',
      field: 'practitionerId',
    };
  }
  if (conflict.roomBusy) {
    return {
      ok: false,
      error: 'La sala ya está ocupada en ese horario.',
      field: 'roomId',
    };
  }

  try {
    const inserted = await db
      .insert(appointments)
      .values({
        organizationId: userOrg.organization.id,
        branchId: data.branchId,
        practitionerId: data.practitionerId,
        patientId: data.patientId,
        typeId: data.typeId,
        roomId: data.roomId ?? null,
        startAt,
        endAt,
        notes: data.notes ?? null,
        source: 'manual',
      })
      .returning({ id: appointments.id });

    const appointmentId = inserted[0]?.id;
    if (!appointmentId) {
      return { ok: false, error: 'No se pudo crear la cita. Reintenta.' };
    }

    await logAudit({
      organizationId: userOrg.organization.id,
      userId: userOrg.userId,
      action: 'appointment.created',
      resourceType: 'appointment',
      resourceId: appointmentId,
      metadata: {
        patientId: data.patientId,
        practitionerId: data.practitionerId,
        branchId: data.branchId,
        startAt: startAt.toISOString(),
        durationMinutes: data.durationMinutes,
      },
    });

    revalidatePath('/agenda');

    return { ok: true, appointmentId };
  } catch (error) {
    console.error('[createAppointmentAction] insert failed:', error);
    return { ok: false, error: 'Error inesperado al guardar la cita.' };
  }
}
