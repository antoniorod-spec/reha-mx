'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { checkAppointmentConflicts } from '@/lib/agenda/queries';
import { canReschedule, canTransition, type AppointmentStatus } from '@/lib/agenda/state-machine';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserOrg } from '@/lib/auth/current-user-org';
import { db } from '@/lib/db/client';
import { appointments } from '@/lib/db/schema/appointments';

/**
 * Server Actions de transición del state machine de citas.
 *
 *   confirmAppointmentAction        → confirmed
 *   markAppointmentInProgressAction → in_progress
 *   markAppointmentCompletedAction  → completed
 *   markAppointmentNoShowAction     → no_show
 *   cancelAppointmentAction         → cancelled (requiere motivo opcional)
 *   rescheduleAppointmentAction     → mueve start_at/end_at sin cambiar status
 *
 * Patrón:
 *   1. getCurrentUserOrg() — autoriza + da organizationId.
 *   2. SELECT actual de la cita filtrando por org (defensa en profundidad + RLS).
 *   3. Validar transición permitida (canTransition / canReschedule).
 *   4. UPDATE.
 *   5. logAudit() con metadata útil para forensia.
 *   6. revalidatePath('/agenda') + /dashboard (KPIs pueden cambiar).
 */

export interface TransitionResult {
  ok: boolean;
  error?: string | undefined;
}

async function loadAppointment(
  organizationId: string,
  appointmentId: string,
): Promise<{ id: string; status: AppointmentStatus; startAt: Date; endAt: Date } | null> {
  const rows = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
    })
    .from(appointments)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.organizationId, organizationId)))
    .limit(1);
  return rows[0] ?? null;
}

function revalidate(): void {
  revalidatePath('/agenda');
  revalidatePath('/dashboard');
}

const idSchema = z.string().uuid({ message: 'Cita inválida.' });

async function applyTransition(
  appointmentId: string,
  to: AppointmentStatus,
  metadata: Record<string, unknown> = {},
): Promise<TransitionResult> {
  const idCheck = idSchema.safeParse(appointmentId);
  if (!idCheck.success) return { ok: false, error: idCheck.error.issues[0]?.message };

  const userOrg = await getCurrentUserOrg();
  if (!userOrg) return { ok: false, error: 'Sesión expirada. Inicia sesión otra vez.' };

  const current = await loadAppointment(userOrg.organization.id, appointmentId);
  if (!current) return { ok: false, error: 'Cita no encontrada.' };

  if (!canTransition(current.status, to)) {
    return {
      ok: false,
      error: `No se puede pasar de "${current.status}" a "${to}".`,
    };
  }

  try {
    await db
      .update(appointments)
      .set({ status: to, updatedAt: new Date() })
      .where(eq(appointments.id, appointmentId));

    await logAudit({
      organizationId: userOrg.organization.id,
      userId: userOrg.userId,
      action: `appointment.${to}`,
      resourceType: 'appointment',
      resourceId: appointmentId,
      metadata: { from: current.status, to, ...metadata },
    });

    revalidate();
    return { ok: true };
  } catch (error) {
    console.error('[applyTransition] failed:', error);
    return { ok: false, error: 'Error inesperado al actualizar la cita.' };
  }
}

export async function confirmAppointmentAction(appointmentId: string): Promise<TransitionResult> {
  return applyTransition(appointmentId, 'confirmed');
}

export async function markAppointmentInProgressAction(
  appointmentId: string,
): Promise<TransitionResult> {
  return applyTransition(appointmentId, 'in_progress');
}

export async function markAppointmentCompletedAction(
  appointmentId: string,
): Promise<TransitionResult> {
  return applyTransition(appointmentId, 'completed');
}

export async function markAppointmentNoShowAction(
  appointmentId: string,
): Promise<TransitionResult> {
  return applyTransition(appointmentId, 'no_show');
}

const cancelSchema = z.object({
  appointmentId: z.string().uuid(),
  reason: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
});

export async function cancelAppointmentAction(
  input: z.input<typeof cancelSchema>,
): Promise<TransitionResult> {
  const parsed = cancelSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' };
  }

  const userOrg = await getCurrentUserOrg();
  if (!userOrg) return { ok: false, error: 'Sesión expirada. Inicia sesión otra vez.' };

  const current = await loadAppointment(userOrg.organization.id, parsed.data.appointmentId);
  if (!current) return { ok: false, error: 'Cita no encontrada.' };

  if (!canTransition(current.status, 'cancelled')) {
    return { ok: false, error: 'Esta cita ya no se puede cancelar.' };
  }

  try {
    await db
      .update(appointments)
      .set({
        status: 'cancelled',
        cancellationReason: parsed.data.reason,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, parsed.data.appointmentId));

    await logAudit({
      organizationId: userOrg.organization.id,
      userId: userOrg.userId,
      action: 'appointment.cancelled',
      resourceType: 'appointment',
      resourceId: parsed.data.appointmentId,
      metadata: { from: current.status, reason: parsed.data.reason },
    });

    revalidate();
    return { ok: true };
  } catch (error) {
    console.error('[cancelAppointmentAction] failed:', error);
    return { ok: false, error: 'Error inesperado al cancelar.' };
  }
}

const rescheduleSchema = z.object({
  appointmentId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha inválida.' }),
  time: z.string().regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, { message: 'Hora inválida.' }),
  durationMinutes: z.coerce.number().int().min(5).max(480),
});

export type RescheduleInput = z.infer<typeof rescheduleSchema>;

export async function rescheduleAppointmentAction(
  input: RescheduleInput,
): Promise<TransitionResult> {
  const parsed = rescheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' };
  }
  const data = parsed.data;

  const userOrg = await getCurrentUserOrg();
  if (!userOrg) return { ok: false, error: 'Sesión expirada. Inicia sesión otra vez.' };

  const current = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      practitionerId: appointments.practitionerId,
      roomId: appointments.roomId,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.id, data.appointmentId),
        eq(appointments.organizationId, userOrg.organization.id),
      ),
    )
    .limit(1);

  const appt = current[0];
  if (!appt) return { ok: false, error: 'Cita no encontrada.' };

  if (!canReschedule(appt.status)) {
    return { ok: false, error: 'Esta cita ya no se puede reagendar.' };
  }

  const startAt = new Date(`${data.date}T${data.time.padStart(5, '0')}:00`);
  if (Number.isNaN(startAt.getTime())) {
    return { ok: false, error: 'Fecha/hora inválida.' };
  }
  const endAt = new Date(startAt.getTime() + data.durationMinutes * 60_000);

  const conflict = await checkAppointmentConflicts({
    organizationId: userOrg.organization.id,
    practitionerId: appt.practitionerId,
    roomId: appt.roomId,
    startAt,
    endAt,
    excludeAppointmentId: appt.id,
  });

  if (conflict.practitionerBusy) {
    return { ok: false, error: 'El fisio ya tiene una cita en ese horario.' };
  }
  if (conflict.roomBusy) {
    return { ok: false, error: 'La sala ya está ocupada en ese horario.' };
  }

  try {
    await db
      .update(appointments)
      .set({ startAt, endAt, updatedAt: new Date() })
      .where(eq(appointments.id, data.appointmentId));

    await logAudit({
      organizationId: userOrg.organization.id,
      userId: userOrg.userId,
      action: 'appointment.rescheduled',
      resourceType: 'appointment',
      resourceId: data.appointmentId,
      metadata: {
        previousStartAt: appt.startAt.toISOString(),
        previousEndAt: appt.endAt.toISOString(),
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      },
    });

    revalidate();
    return { ok: true };
  } catch (error) {
    console.error('[rescheduleAppointmentAction] failed:', error);
    return { ok: false, error: 'Error inesperado al reagendar.' };
  }
}
