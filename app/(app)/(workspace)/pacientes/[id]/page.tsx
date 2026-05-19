import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { AvatarInitials } from '@/components/shared/avatar-initials';
import { Card } from '@/components/shared/card';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserOrg } from '@/lib/auth/current-user-org';
import { calculateAge, getPatientById } from '@/lib/patients/queries';
import { cn } from '@/lib/utils/cn';

import type { Patient } from '@/lib/db/schema/patients';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ficha del paciente',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ficha básica del paciente — Fase 1.1.
 *
 * Server Component:
 *   1. Resuelve org + user actual.
 *   2. Valida ID (UUID) y busca paciente en la org (filtro explícito + RLS).
 *   3. Emite audit log `patient.viewed` (LFPDPPP / NOM-004-SSA3).
 *   4. Render con resumen demográfico + objetivo + meta deportiva.
 *
 * Lo que NO va acá todavía (vienen en sub-pasos siguientes / Fase 2):
 *   - Sesiones / SOAP notes
 *   - Evaluaciones (Y-Balance, etc.)
 *   - Estudios
 *   - Consentimientos
 *   - Botón editar (Fase 1.1.b)
 */
export default async function PatientDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const userOrg = await getCurrentUserOrg();
  if (userOrg === null) {
    redirect(`/login?next=${encodeURIComponent(`/pacientes/${id}`)}`);
  }

  const patient = await getPatientById(userOrg.organization.id, id);
  if (patient === null) {
    notFound();
  }

  await logAudit({
    organizationId: userOrg.organization.id,
    userId: userOrg.userId,
    action: 'patient.viewed',
    resourceType: 'patient',
    resourceId: patient.id,
  });

  const age = calculateAge(patient.birthDate);
  const fullName = `${patient.firstName} ${patient.lastName}`.trim();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <nav className="mb-4 text-[12px]" aria-label="Navegación">
        <Link
          href="/pacientes"
          className="text-muted hover:text-text underline-offset-2 hover:underline"
        >
          ← Pacientes
        </Link>
      </nav>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <AvatarInitials name={fullName} size="lg" />
          <div>
            <p className="text-subtle font-mono text-[11px] tracking-wider uppercase">
              {userOrg.organization.name}
            </p>
            <h1 className="text-text mt-1 text-2xl font-semibold tracking-[-0.022em]">
              {fullName}
            </h1>
            <p className="text-muted mt-1 text-[12px]">
              <MetaLine age={age} sex={patient.sex} sport={patient.sport} />
            </p>
          </div>
        </div>
        <StatusBadge status={patient.status} />
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <h2 className="text-text mb-3 text-[13px] font-semibold tracking-[-0.011em]">
            Objetivo funcional
          </h2>
          {patient.functionalGoal ? (
            <p className="text-text text-[14px] leading-relaxed">{patient.functionalGoal}</p>
          ) : (
            <p className="text-subtle text-[13px]">Sin objetivo registrado todavía.</p>
          )}

          {patient.estimatedReturnDate && (
            <div className="border-border-soft mt-4 flex items-center justify-between border-t pt-3 text-[12px]">
              <span className="text-muted">Retorno deportivo estimado</span>
              <span className="text-text font-mono">{formatDate(patient.estimatedReturnDate)}</span>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-text mb-3 text-[13px] font-semibold tracking-[-0.011em]">Contacto</h2>
          <dl className="space-y-2 text-[13px]">
            <Field label="Email" value={patient.email ?? '—'} mono />
            <Field label="Teléfono" value={patient.phone ?? '—'} mono />
            <Field label="Edad" value={age !== null ? `${age} años` : '—'} />
            <Field label="Sexo" value={sexLabel(patient.sex)} />
          </dl>
        </Card>

        <Card>
          <h2 className="text-text mb-3 text-[13px] font-semibold tracking-[-0.011em]">
            Identificación
          </h2>
          <dl className="space-y-2 text-[13px]">
            <Field label="CURP" value={patient.curp ?? '—'} mono />
            <Field label="RFC" value={patient.rfc ?? '—'} mono />
            {patient.externalId && (
              <Field label="ID externo" value={patient.externalId} mono subtle />
            )}
          </dl>
        </Card>

        <Card className="md:col-span-2">
          <h2 className="text-text mb-3 text-[13px] font-semibold tracking-[-0.011em]">
            Información deportiva
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-[13px]">
            <Field label="Deporte" value={patient.sport ?? '—'} />
            <Field label="Nivel" value={sportLevelLabel(patient.sportLevel)} />
            <Field label="Fecha de nacimiento" value={formatDate(patient.birthDate)} mono />
            <Field label="Última actualización" value={formatDate(patient.updatedAt)} mono subtle />
          </dl>
        </Card>

        {patient.notes && (
          <Card className="md:col-span-3">
            <h2 className="text-text mb-3 text-[13px] font-semibold tracking-[-0.011em]">
              Notas internas
            </h2>
            <p className="text-muted text-[13px] leading-relaxed whitespace-pre-line">
              {patient.notes}
            </p>
          </Card>
        )}
      </div>

      <p className="text-subtle mt-6 text-[11px]">
        Sesiones, evaluaciones, estudios y consentimientos aparecen en Fase 2 (EMR clínico).
      </p>
    </main>
  );
}

function MetaLine({
  age,
  sex,
  sport,
}: {
  age: number | null;
  sex: Patient['sex'];
  sport: string | null;
}) {
  const parts: string[] = [];
  if (age !== null) parts.push(`${age} años`);
  if (sex && sex !== 'unspecified') parts.push(sexLabel(sex));
  if (sport) parts.push(sport);
  return <>{parts.join(' · ') || '—'}</>;
}

function Field({
  label,
  value,
  mono,
  subtle,
}: {
  label: string;
  value: string;
  mono?: boolean;
  subtle?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted text-[11px] tracking-wider uppercase">{label}</dt>
      <dd
        className={cn(
          'text-text text-right',
          mono && 'font-mono',
          subtle && 'text-subtle text-[12px]',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: Patient['status'] }) {
  const styles: Record<Patient['status'], string> = {
    active: 'bg-good/15 text-good',
    discharged: 'bg-accent-soft text-accent',
    inactive: 'bg-surface-2 text-muted',
    archived: 'bg-bad/10 text-bad',
  };
  const labels: Record<Patient['status'], string> = {
    active: 'Expediente activo',
    discharged: 'Alta clínica',
    inactive: 'Inactivo',
    archived: 'Archivado',
  };
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-md px-3 font-mono text-[10px] tracking-wider uppercase',
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

function sexLabel(sex: Patient['sex']): string {
  if (!sex) return '—';
  const map: Record<NonNullable<Patient['sex']>, string> = {
    female: 'Femenino',
    male: 'Masculino',
    intersex: 'Intersexo',
    unspecified: 'No especificado',
  };
  return map[sex];
}

function sportLevelLabel(level: Patient['sportLevel']): string {
  if (!level) return '—';
  const map: Record<NonNullable<Patient['sportLevel']>, string> = {
    recreational: 'Recreativo',
    amateur: 'Amateur',
    semipro: 'Semiprofesional',
    professional: 'Profesional',
    elite: 'Élite',
  };
  return map[level];
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
}
