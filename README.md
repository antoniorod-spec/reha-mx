# Rehai

> Sistema operativo para clínicas de readaptación deportiva en México.
> SaaS B2B vertical, multi-tenant, con app clínica y portal paciente.

**Estado:** Fase 0 — bootstrap técnico. No hay deployment público todavía.

---

## Stack

- **Next.js 16** App Router + TypeScript estricto
- **Supabase self-hosted** (Postgres 15 + GoTrue + PostgREST + Storage) en `dedi35661`
- **Drizzle ORM** con migrations versionadas
- **Tailwind CSS v4** con tokens propios (ver [`docs/DESIGN.md`](./docs/DESIGN.md))
- **Vercel** (preview por PR, prod desde `main`)

Documentación completa: [`docs/00-MASTER-PLAN.md`](./docs/00-MASTER-PLAN.md) · contrato técnico en [`CLAUDE.md`](./CLAUDE.md).

---

## Desarrollo local

Requiere Node 22+ (LTS) y pnpm 10+.

```bash
pnpm install
cp .env.local.example .env.local   # rellenar credenciales Supabase
pnpm dev                            # http://localhost:3000
```

### Comandos esenciales

```bash
pnpm dev              # next dev con Turbopack
pnpm build            # build production
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit
pnpm format           # prettier --write
pnpm db:generate      # drizzle-kit generate (genera SQL desde schemas)
pnpm db:migrate       # aplica migrations
pnpm db:studio        # Drizzle Studio en el navegador
```

### Multi-tenant en dev

Sin DNS local, usa el path prefix `/t/[slug]`:

- `http://localhost:3000/` → marketing público
- `http://localhost:3000/t/movewell/dashboard` → app del tenant `movewell`
- `http://localhost:3000/showcase` → QA visual de primitives (solo dev)

En producción cada tenant vive en su subdomain: `movewell.rehai.app`.

---

## Estructura

```
app/                      Next.js App Router
  (marketing) (app) (portal) (admin) + api/
components/{ui,shared,tenant,...}
lib/{supabase,tenant,db,facturama,stripe,whatsapp,...}
server/actions
docs/
  00-MASTER-PLAN.md       plan completo
  DESIGN.md               sistema de diseño
  prototype-reference/    snapshot del prototipo HTML (consulta visual)
middleware.ts             tenant resolution + auth refresh
```

---

## Cliente fundador

**MoveWell SLP** (San Luis Potosí) es el primer tenant del SaaS. El modelo Cliente Fundador está documentado en [`docs/04-modelo-cliente-fundador.md`](./docs/04-modelo-cliente-fundador.md).

---

## Licencia y operación

Producto operado por **Antonio Rodríguez de Tembleque** (persona física, San Luis Potosí, México) bajo el dominio **rehai.app**, mientras se constituye **Rehai S.A.P.I. de C.V.** Todos los derechos reservados.
