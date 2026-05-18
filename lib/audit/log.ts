import 'server-only';

import { headers } from 'next/headers';

import { db } from '@/lib/db/client';
import { auditLogs, type NewAuditLog } from '@/lib/db/schema/audit-logs';

/**
 * Helper de audit log. Escribe un evento append-only en la tabla `audit_logs`
 * desde server actions / route handlers / Server Components.
 *
 * Cumplimiento NOM-004-SSA3 + LFPDPPP: cada acceso o modificación a datos
 * clínicos debe quedar registrado con quién, qué, cuándo y desde dónde.
 *
 * - IP y User-Agent se extraen automáticamente de los headers del request.
 * - userId puede venir null si la acción la ejecuta un cron / system.
 * - action sigue formato `recurso.accion`: 'patient.viewed', 'appointment.created'.
 *
 * Esta función NO debe fallar el flujo: si por algún motivo la escritura
 * del log falla, capturamos el error y lo logueamos por consola (en Paso 12
 * se reemplaza por Sentry). Nunca tirar excepción al caller.
 *
 * Importante: este modulo es 'server-only' — ESLint + el runtime impedirán
 * que se importe desde Client Components.
 */
export interface AuditLogInput {
  organizationId: string;
  userId: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const requestHeaders = await safeReadHeaders();

    const row: NewAuditLog = {
      organizationId: input.organizationId,
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType ?? null,
      resourceId: input.resourceId ?? null,
      metadata: input.metadata ?? null,
      ipAddress: requestHeaders.ip,
      userAgent: requestHeaders.userAgent,
    };

    await db.insert(auditLogs).values(row);
  } catch (error) {
    console.error('[audit] write failed:', {
      action: input.action,
      organizationId: input.organizationId,
      resourceId: input.resourceId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

interface RequestHeaders {
  ip: string | null;
  userAgent: string | null;
}

async function safeReadHeaders(): Promise<RequestHeaders> {
  try {
    const h = await headers();
    const forwarded = h.get('x-forwarded-for');
    const realIp = h.get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() ?? realIp ?? null;
    const userAgent = h.get('user-agent');
    return { ip, userAgent };
  } catch {
    return { ip: null, userAgent: null };
  }
}
