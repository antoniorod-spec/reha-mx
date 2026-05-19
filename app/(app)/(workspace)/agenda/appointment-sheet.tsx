'use client';

import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
  StickyNote,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';

import { availableActions, type AppointmentStatus } from '@/lib/agenda/state-machine';
import { cn } from '@/lib/utils/cn';
import {
  cancelAppointmentAction,
  confirmAppointmentAction,
  markAppointmentCompletedAction,
  markAppointmentInProgressAction,
  markAppointmentNoShowAction,
  rescheduleAppointmentAction,
  type TransitionResult,
} from '@/server/actions/appointments/transition';

import type { AppointmentRow } from '@/lib/agenda/queries';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: 'Agendada',
  confirmed: 'Confirmada',
  in_progress: 'En curso',
  completed: 'Completada',
  no_show: 'No asistió',
  cancelled: 'Cancelada',
};

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  scheduled: 'bg-surface-2 text-muted border-border',
  confirmed: 'bg-accent-soft text-accent border-accent/30',
  in_progress: 'bg-accent-soft text-accent border-accent/40 ring-1 ring-accent/30',
  completed: 'bg-good/15 text-good border-good/30',
  no_show: 'bg-bad/10 text-bad border-bad/30',
  cancelled: 'bg-surface-2 text-subtle border-border-soft',
};

interface AppointmentSheetProps {
  row: AppointmentRow;
  onClose: () => void;
}

type Mode = 'view' | 'reschedule' | 'cancel';

export function AppointmentSheet({ row, onClose }: AppointmentSheetProps) {
  const [mode, setMode] = useState<Mode>('view');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function runAction(fn: () => Promise<TransitionResult>): void {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error ?? 'Acción fallida.');
        return;
      }
      onClose();
    });
  }

  const { appointment, patient, practitioner, type, branch, room } = row;
  const actions = availableActions(appointment.status);
  const start = new Date(appointment.startAt);
  const end = new Date(appointment.endAt);
  const startTime = start.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const endTime = end.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const dateLabel = start.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de cita de ${patient.firstName} ${patient.lastName}`}
      className="fixed inset-0 z-40 flex items-end justify-end bg-black/60 sm:items-stretch"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border-border flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-2xl border sm:max-h-screen sm:w-[440px] sm:rounded-none sm:border-l"
      >
        <header className="border-border-soft bg-surface sticky top-0 z-10 flex items-start justify-between gap-3 border-b px-5 pt-5 pb-3">
          <div className="min-w-0">
            <p className="text-subtle font-mono text-[10.5px] tracking-wider uppercase">
              Cita · {type.name}
            </p>
            <h2 className="text-text mt-1 truncate text-[18px] font-semibold tracking-[-0.011em]">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-muted mt-1 font-mono text-[11.5px]">
              {dateLabel} · {startTime} → {endTime} · {type.durationMinutes} min
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-muted hover:bg-surface-2 -mt-1 -mr-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
          >
            <X className="size-[16px]" aria-hidden />
          </button>
        </header>

        <div className="px-5 pt-4">
          <span
            className={cn(
              'inline-flex h-6 items-center rounded-md border px-2 font-mono text-[10.5px] tracking-wider uppercase',
              STATUS_BADGE[appointment.status],
            )}
          >
            {STATUS_LABEL[appointment.status]}
          </span>
        </div>

        <dl className="border-border bg-surface-2 divide-border-soft mx-5 mt-4 divide-y overflow-hidden rounded-lg border">
          <DetailRow label="Fisio" value={practitioner.displayName} dotColor={practitioner.color} />
          <DetailRow label="Sucursal" value={branch.name} />
          <DetailRow label="Sala" value={room?.name ?? '—'} />
          <DetailRow label="Deporte" value={patient.sport ?? '—'} />
          {appointment.notes && <DetailRow label="Notas" value={appointment.notes} multiline />}
          {appointment.cancellationReason && (
            <DetailRow
              label="Motivo cancelación"
              value={appointment.cancellationReason}
              multiline
            />
          )}
        </dl>

        {error && (
          <div className="bg-bad/10 border-bad/30 text-bad mx-5 mt-4 rounded-md border px-3 py-2 text-[12px]">
            {error}
          </div>
        )}

        {mode === 'view' && (
          <ViewActions
            actions={actions}
            isPending={isPending}
            onConfirm={() => runAction(() => confirmAppointmentAction(appointment.id))}
            onInProgress={() => runAction(() => markAppointmentInProgressAction(appointment.id))}
            onComplete={() => runAction(() => markAppointmentCompletedAction(appointment.id))}
            onNoShow={() => runAction(() => markAppointmentNoShowAction(appointment.id))}
            onReschedule={() => setMode('reschedule')}
            onCancel={() => setMode('cancel')}
          />
        )}

        {mode === 'reschedule' && (
          <RescheduleForm
            appointmentId={appointment.id}
            initialDate={toLocalDateInput(start)}
            initialTime={toLocalTimeInput(start)}
            initialDuration={type.durationMinutes}
            isPending={isPending}
            onSubmit={(input) =>
              runAction(() =>
                rescheduleAppointmentAction({ ...input, appointmentId: appointment.id }),
              )
            }
            onBack={() => {
              setError(null);
              setMode('view');
            }}
          />
        )}

        {mode === 'cancel' && (
          <CancelForm
            isPending={isPending}
            onSubmit={(reason) =>
              runAction(() => cancelAppointmentAction({ appointmentId: appointment.id, reason }))
            }
            onBack={() => {
              setError(null);
              setMode('view');
            }}
          />
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  dotColor,
  multiline,
}: {
  label: string;
  value: string;
  dotColor?: string;
  multiline?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex gap-3 px-3 py-2.5',
        multiline ? 'flex-col items-start' : 'items-center justify-between',
      )}
    >
      <dt className="text-subtle shrink-0 font-mono text-[10.5px] tracking-wider uppercase">
        {label}
      </dt>
      <dd className="text-text flex items-center gap-1.5 text-[12.5px] font-medium tracking-[-0.011em]">
        {dotColor && (
          <span className="size-[6px] rounded-full" style={{ background: dotColor }} aria-hidden />
        )}
        {value}
      </dd>
    </div>
  );
}

function ViewActions({
  actions,
  isPending,
  onConfirm,
  onInProgress,
  onComplete,
  onNoShow,
  onReschedule,
  onCancel,
}: {
  actions: ReturnType<typeof availableActions>;
  isPending: boolean;
  onConfirm: () => void;
  onInProgress: () => void;
  onComplete: () => void;
  onNoShow: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}) {
  const anyAction =
    actions.confirm ||
    actions.markInProgress ||
    actions.markCompleted ||
    actions.markNoShow ||
    actions.reschedule ||
    actions.cancel;

  if (!anyAction) {
    return (
      <div className="px-5 pt-4 pb-6">
        <p className="text-muted text-[12px]">
          Esta cita está en estado terminal. No hay acciones disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 px-5 pt-4 pb-6">
      {actions.confirm && (
        <PrimaryButton onClick={onConfirm} pending={isPending}>
          <CheckCircle2 className="size-[14px]" aria-hidden /> Confirmar
        </PrimaryButton>
      )}
      {actions.markInProgress && (
        <SecondaryButton onClick={onInProgress} pending={isPending}>
          <PlayCircle className="size-[14px]" aria-hidden /> Marcar en curso
        </SecondaryButton>
      )}
      {actions.markCompleted && (
        <PrimaryButton onClick={onComplete} pending={isPending}>
          <CheckCircle2 className="size-[14px]" aria-hidden /> Completar
        </PrimaryButton>
      )}
      {actions.reschedule && (
        <SecondaryButton onClick={onReschedule} pending={isPending}>
          <Clock className="size-[14px]" aria-hidden /> Reagendar
        </SecondaryButton>
      )}
      {actions.markNoShow && (
        <SecondaryButton onClick={onNoShow} pending={isPending} variant="warning">
          <UserX className="size-[14px]" aria-hidden /> No asistió
        </SecondaryButton>
      )}
      {actions.cancel && (
        <SecondaryButton onClick={onCancel} pending={isPending} variant="danger">
          <XCircle className="size-[14px]" aria-hidden /> Cancelar
        </SecondaryButton>
      )}
      <button
        type="button"
        disabled
        className="bg-surface-2 text-subtle border-border-soft col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-[12.5px] font-medium opacity-60"
        title="Próximamente"
      >
        <StickyNote className="size-[14px]" aria-hidden /> Notas SOAP · pronto
      </button>
    </div>
  );
}

function RescheduleForm({
  initialDate,
  initialTime,
  initialDuration,
  isPending,
  onSubmit,
  onBack,
}: {
  appointmentId: string;
  initialDate: string;
  initialTime: string;
  initialDuration: number;
  isPending: boolean;
  onSubmit: (input: { date: string; time: string; durationMinutes: number }) => void;
  onBack: () => void;
}) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [duration, setDuration] = useState(initialDuration);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ date, time, durationMinutes: duration });
      }}
      className="space-y-3 px-5 pt-4 pb-6"
    >
      <div className="flex items-center gap-1.5">
        <Calendar className="text-accent size-[14px]" aria-hidden />
        <p className="text-text text-[13px] font-medium">Reagendar cita</p>
      </div>
      <p className="text-muted text-[11.5px]">
        Cambia la fecha/hora. El fisio y la sala se mantienen — chequearemos conflictos antes de
        guardar.
      </p>

      <label className="block">
        <span className="text-subtle font-mono text-[10.5px] tracking-wider uppercase">Fecha</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="bg-surface text-text border-border focus:border-accent mt-1 block h-9 w-full rounded-md border px-2.5 text-[13px] outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-subtle font-mono text-[10.5px] tracking-wider uppercase">Hora</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="bg-surface text-text border-border focus:border-accent mt-1 block h-9 w-full rounded-md border px-2.5 text-[13px] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-subtle font-mono text-[10.5px] tracking-wider uppercase">
            Duración (min)
          </span>
          <input
            type="number"
            min={5}
            max={480}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            required
            className="bg-surface text-text border-border focus:border-accent mt-1 block h-9 w-full rounded-md border px-2.5 text-[13px] outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="bg-surface-2 text-text border-border inline-flex items-center justify-center rounded-md border px-3 py-2.5 text-[12.5px] font-medium disabled:opacity-60"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-accent-on inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-[12.5px] font-semibold disabled:opacity-60"
        >
          {isPending && <Loader2 className="size-[14px] animate-spin" aria-hidden />}
          Guardar
        </button>
      </div>
    </form>
  );
}

function CancelForm({
  isPending,
  onSubmit,
  onBack,
}: {
  isPending: boolean;
  onSubmit: (reason: string | undefined) => void;
  onBack: () => void;
}) {
  const [reason, setReason] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(reason.trim().length > 0 ? reason : undefined);
      }}
      className="space-y-3 px-5 pt-4 pb-6"
    >
      <div className="flex items-center gap-1.5">
        <XCircle className="text-bad size-[14px]" aria-hidden />
        <p className="text-text text-[13px] font-medium">Cancelar cita</p>
      </div>
      <p className="text-muted text-[11.5px]">
        Esta acción es irreversible. La cita queda registrada pero deja de bloquear el slot del
        fisio y la sala. Se notificará al paciente vía WhatsApp en próximo sprint.
      </p>
      <label className="block">
        <span className="text-subtle font-mono text-[10.5px] tracking-wider uppercase">
          Motivo (opcional)
        </span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ej. paciente avisó por WhatsApp que no podría asistir"
          className="bg-surface text-text border-border focus:border-accent mt-1 block w-full rounded-md border px-2.5 py-2 text-[13px] outline-none"
        />
      </label>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="bg-surface-2 text-text border-border inline-flex items-center justify-center rounded-md border px-3 py-2.5 text-[12.5px] font-medium disabled:opacity-60"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-bad text-accent-on inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-[12.5px] font-semibold disabled:opacity-60"
        >
          {isPending && <Loader2 className="size-[14px] animate-spin" aria-hidden />}
          Confirmar cancelación
        </button>
      </div>
    </form>
  );
}

function PrimaryButton({
  children,
  onClick,
  pending,
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="bg-accent text-accent-on inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-[12.5px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-[14px] animate-spin" aria-hidden /> : children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  pending,
  variant = 'neutral',
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending: boolean;
  variant?: 'neutral' | 'danger' | 'warning';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-[12.5px] font-medium disabled:opacity-60',
        variant === 'neutral' && 'bg-surface-2 text-text border-border',
        variant === 'danger' && 'bg-surface-2 text-bad border-border',
        variant === 'warning' && 'bg-surface-2 text-muted border-border',
      )}
    >
      {pending ? <Loader2 className="size-[14px] animate-spin" aria-hidden /> : children}
    </button>
  );
}

function toLocalDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toLocalTimeInput(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}
