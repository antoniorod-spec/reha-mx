/**
 * Barrel de schemas Drizzle.
 *
 * Excepción justificada a la regla "no barrel files" del CLAUDE.md:
 *   1. Drizzle-kit consume todo el schema (drizzle-orm necesita el grafo completo).
 *   2. Solo se importa desde server (lib/db/client.ts, server actions, scripts).
 *   3. No afecta el bundle del cliente.
 *
 * Cualquier tabla nueva se exporta aquí.
 */
export * from './organizations';
export * from './tenant-domains';
export * from './tenant-branding';
export * from './members';
export * from './audit-logs';
export * from './patients';
export * from './branches';
export * from './rooms';
export * from './practitioners';
export * from './appointment-types';
export * from './appointments';
