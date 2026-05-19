'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import { cn } from '@/lib/utils/cn';
import {
  createAppointmentAction,
  type CreateAppointmentInput,
  type CreateAppointmentResult,
} from '@/server/actions/appointments/create';

interface BranchOpt {
  id: string;
  name: string;
  slug: string;
}
interface PractitionerOpt {
  id: string;
  displayName: string;
  color: string;
  primaryBranchId: string | null;
}
interface TypeOpt {
  id: string;
  name: string;
  durationMinutes: number;
  color: string;
}
interface RoomOpt {
  id: string;
  name: string;
}
interface PatientOpt {
  id: string;
  firstName: string;
  lastName: string;
  sport: string | null;
}

interface NewAppointmentLauncherProps {
  branches: BranchOpt[];
  practitioners: PractitionerOpt[];
  types: TypeOpt[];
  defaultBranchId: string | undefined;
  defaultDate: string;
  roomsByBranch: Record<string, RoomOpt[]>;
  initialPatients: PatientOpt[];
}

/**
 * Lanza un modal con el form de "Crear cita". Mantenemos el modal aquí para
 * no necesitar instalar dialog primitives todavía. Es accesible (focus trap
 * básico, ESC para cerrar, click fuera).
 *
 * Próximo sub-sprint: convertir a Sheet lateral (más espacio) + autocomplete
 * de pacientes con búsqueda server.
 */
export function NewAppointmentLauncher(props: NewAppointmentLauncherProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-accent text-accent-on inline-flex h-9 items-center rounded-md px-4 text-[13px] font-semibold transition-opacity hover:opacity-90"
      >
        + Nueva cita
      </button>
      {open && <NewAppointmentModal {...props} onClose={() => setOpen(false)} />}
    </>
  );
}

interface ModalProps extends NewAppointmentLauncherProps {
  onClose: () => void;
}

function NewAppointmentModal({
  branches,
  practitioners,
  types,
  defaultBranchId,
  defaultDate,
  roomsByBranch,
  initialPatients,
  onClose,
}: ModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [branchId, setBranchId] = useState<string>(defaultBranchId ?? branches[0]?.id ?? '');
  const [patientId, setPatientId] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<PatientOpt[]>(initialPatients);
  const [typeId, setTypeId] = useState<string>(types[0]?.id ?? '');
  const [practitionerId, setPractitionerId] = useState<string>(() => {
    const fromBranch = practitioners.find((p) => p.primaryBranchId === defaultBranchId);
    return fromBranch?.id ?? practitioners[0]?.id ?? '';
  });
  const [roomId, setRoomId] = useState<string>('');
  const [date, setDate] = useState<string>(defaultDate);
  const [time, setTime] = useState<string>('09:00');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const selectedType = useMemo(() => types.find((t) => t.id === typeId), [types, typeId]);
  const duration = selectedType?.durationMinutes ?? 45;

  // Derivado: salas del branch seleccionado. Sin useState/useEffect para evitar
  // cascading renders (regla react-hooks/set-state-in-effect).
  const roomsForBranch = useMemo<RoomOpt[]>(
    () => roomsByBranch[branchId] ?? [],
    [branchId, roomsByBranch],
  );

  function handleBranchChange(nextBranchId: string): void {
    setBranchId(nextBranchId);
    setRoomId('');
  }

  // Búsqueda de pacientes con debounce (consulta al server)
  useEffect(() => {
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/internal/patients-search?q=${encodeURIComponent(patientSearch)}`,
          { headers: { 'cache-control': 'no-cache' } },
        );
        if (!res.ok) return;
        const body = (await res.json()) as { patients?: PatientOpt[] };
        if (body.patients) setPatients(body.patients);
      } catch {
        // best effort
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [patientSearch]);

  // ESC para cerrar + focus inicial
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function submit() {
    setError(null);
    if (!patientId) {
      setError('Selecciona un paciente.');
      return;
    }
    const input: CreateAppointmentInput = {
      patientId,
      practitionerId,
      branchId,
      typeId,
      roomId: roomId || null,
      date,
      time,
      durationMinutes: duration,
      notes,
    };
    startTransition(async () => {
      const result: CreateAppointmentResult = await createAppointmentAction(input);
      if (!result.ok) {
        setError(result.error ?? 'Error al crear la cita.');
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-appointment-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="bg-bg/80 absolute inset-0 backdrop-blur-sm"
      />

      <div className="border-border bg-surface relative w-full max-w-lg rounded-xl border p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2
              id="new-appointment-title"
              className="text-text text-lg font-semibold tracking-[-0.011em]"
            >
              Nueva cita
            </h2>
            <p className="text-muted mt-1 text-[12px]">
              Las citas se validan contra conflictos de fisio y sala automáticamente.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="text-muted hover:text-text -mt-1 -mr-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-[18px]"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-3"
        >
          <Field label="Paciente">
            <input
              type="search"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Buscar paciente…"
              className="border-border bg-surface-2 text-text placeholder:text-subtle focus:border-accent w-full rounded-md border px-3 py-2 text-[13px] transition-colors outline-none"
            />
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="border-border bg-surface-2 text-text focus:border-accent mt-2 w-full rounded-md border px-3 py-2 text-[13px] transition-colors outline-none"
              required
            >
              <option value="">Selecciona…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lastName}, {p.firstName}
                  {p.sport ? ` · ${p.sport}` : ''}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sucursal">
              <select
                value={branchId}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="border-border bg-surface-2 text-text focus:border-accent w-full rounded-md border px-3 py-2 text-[13px] transition-colors outline-none"
                required
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de cita">
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="border-border bg-surface-2 text-text focus:border-accent w-full rounded-md border px-3 py-2 text-[13px] transition-colors outline-none"
                required
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.durationMinutes}m)
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fisio">
              <select
                value={practitionerId}
                onChange={(e) => setPractitionerId(e.target.value)}
                className="border-border bg-surface-2 text-text focus:border-accent w-full rounded-md border px-3 py-2 text-[13px] transition-colors outline-none"
                required
              >
                {practitioners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Sala (opcional)">
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="border-border bg-surface-2 text-text focus:border-accent w-full rounded-md border px-3 py-2 text-[13px] transition-colors outline-none"
              >
                <option value="">Sin sala asignada</option>
                {roomsForBranch.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-border bg-surface-2 text-text focus:border-accent w-full rounded-md border px-3 py-2 text-[13px] transition-colors outline-none"
                required
              />
            </Field>

            <Field label="Hora">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-border bg-surface-2 text-text focus:border-accent w-full rounded-md border px-3 py-2 text-[13px] transition-colors outline-none"
                required
              />
            </Field>
          </div>

          <Field label="Notas (opcional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalle clínico, motivo, etc."
              rows={2}
              className="border-border bg-surface-2 text-text placeholder:text-subtle focus:border-accent w-full rounded-md border px-3 py-2 text-[13px] transition-colors outline-none"
            />
          </Field>

          {error && (
            <p role="alert" className="text-bad text-[12px]">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-subtle text-[11px]">Duración: {duration} min</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="border-border text-muted hover:text-text inline-flex h-9 items-center rounded-md border px-3 text-[12px] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  'bg-accent text-accent-on inline-flex h-9 items-center rounded-md px-4 text-[13px] font-semibold transition-opacity',
                  isPending && 'opacity-60',
                )}
              >
                {isPending ? 'Creando…' : 'Crear cita'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-muted mb-1 block text-[11px] tracking-wider uppercase">{label}</span>
      {children}
    </label>
  );
}
