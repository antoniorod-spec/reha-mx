import type { Appointment } from '@/lib/db/schema/appointments';

export type AppointmentStatus = Appointment['status'];

/**
 * State machine de una cita (master plan §Fase 1).
 *
 * Transiciones permitidas:
 *   scheduled    → confirmed | cancelled | no_show
 *   confirmed    → in_progress | cancelled | no_show
 *   in_progress  → completed
 *   completed    (terminal)
 *   no_show      (terminal)
 *   cancelled    (terminal)
 *
 * `reschedule` no cambia status (mantiene scheduled/confirmed) pero sí mueve
 * start_at/end_at. Se permite mientras la cita no esté en estado terminal.
 */
const ALLOWED: Record<AppointmentStatus, ReadonlyArray<AppointmentStatus>> = {
  scheduled: ['confirmed', 'cancelled', 'no_show'],
  confirmed: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed'],
  completed: [],
  no_show: [],
  cancelled: [],
};

const TERMINAL: ReadonlySet<AppointmentStatus> = new Set(['completed', 'no_show', 'cancelled']);

export function canTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return ALLOWED[from].includes(to);
}

export function isTerminal(status: AppointmentStatus): boolean {
  return TERMINAL.has(status);
}

export function canReschedule(status: AppointmentStatus): boolean {
  return !TERMINAL.has(status) && status !== 'in_progress';
}

/** Acciones disponibles desde una cita en estado dado. UI usa esto para botones. */
export interface AvailableActions {
  confirm: boolean;
  markInProgress: boolean;
  markCompleted: boolean;
  markNoShow: boolean;
  cancel: boolean;
  reschedule: boolean;
}

export function availableActions(status: AppointmentStatus): AvailableActions {
  return {
    confirm: canTransition(status, 'confirmed'),
    markInProgress: canTransition(status, 'in_progress'),
    markCompleted: canTransition(status, 'completed'),
    markNoShow: canTransition(status, 'no_show'),
    cancel: canTransition(status, 'cancelled'),
    reschedule: canReschedule(status),
  };
}
