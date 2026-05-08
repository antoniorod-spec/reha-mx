# Prompts: Fases 1–6

> Una sesión nueva de Claude Code por fase. Siempre lee `CLAUDE.md` + `docs/00-MASTER-PLAN.md` automáticamente.
> Estos prompts son el "qué hacer hoy". MoveWell SLP es el tenant pivote en todos los flujos.

---

## 🗓️ Fase 1 — Agenda + CRM (S3–S6, 4 semanas)

```
Vamos con la Fase 1: Agenda + CRM. Lee CLAUDE.md, docs/00-MASTER-PLAN.md, docs/DESIGN.md, docs/modulo-bootstrap.md y docs/prototype-reference/views/agenda.jsx, agenda-helpers.jsx, agenda-sidebar.jsx, agenda-views-timeline.jsx, agenda-views-month-list.jsx, patients-list.jsx. Resumime qué quedó listo de Fase 0 + cómo el prototipo resolvió la agenda + qué vamos a divergir.

## Alcance

### Modelo de datos (Drizzle + RLS multi-tenant)
- `appointment_types` — valoración (60min), sesión rehab (45min), reevaluación (30min), readaptación funcional (60min), alta (30min). Default seedeado, configurable por tenant.
- `practitioners` — extiende `members`, con specialty, licencia profesional, color hex para agenda.
- `rooms` — camillas, áreas funcionales, isoinercia.
- `resources` — equipo (dinamómetro, OptoJump si aplica).
- `patients` — datos demográficos + deporte + nivel + objetivo funcional + fecha estimada de retorno + RFC opcional + emergency_contact.
- `appointments` — state machine: scheduled → confirmed → in_progress → completed | no_show | cancelled. Con `room_id`, `practitioner_id`, `patient_id`, `type_id`, `branch_id`, `organization_id`.
- `appointment_reminders` — log de WhatsApp envíos con status (sent, delivered, read, confirmed, failed).
- `waitlist` — pacientes esperando slot por fisio + tipo + ventana de fechas.

**Todas con `organization_id` + `branch_id` + RLS + audit triggers.**

### Server actions
- `createAppointmentAction` con validación de conflictos (sala + fisio en mismo slot).
- `confirmAppointmentAction` (vía link WhatsApp con token).
- `cancelAppointmentAction` con motivo + dispara waitlist.
- `markNoShowAction` (cron a +30min de start).
- `rescheduleAppointmentAction`.
- `addToWaitlistAction`.
- `notifyWaitlistAction` (cuando un slot se libera).

### UI clínica (`app/(app)/agenda/`)
Portado del prototipo con estos no-negociables:
- Vista semana (default desktop) con grid virtualizado, **DnD-Kit** para drag & drop.
- Vista día (default mobile, patrón iOS Calendar/Cron del prototipo).
- Vista mes (lista compacta).
- Vista 3-días (mobile landscape).
- Filtros: fisio, sucursal, tipo de cita, estado.
- Sidebar con mini-mes + filtros activos (como prototipo).
- Crear cita con **Sheet lateral** (no modal centrado).
- Conflictos resaltados en rojo en tiempo real.
- Estados con colores semánticos: confirmed=cyan, in_progress=cyan-soft, completed=good, no_show=bad, cancelled=muted.
- Skeleton loaders para cada vista.

### CRM pacientes (`app/(app)/pacientes/`)
- Lista con server-side pagination + búsqueda + filtros (deporte, nivel, fisio asignado).
- Crear/editar paciente con validación CURP + RFC opcional.
- Quick view en panel lateral (próxima cita, fisio asignado, último diagnóstico).
- Vista detalle del paciente solo header + datos demográficos (el resto es Fase 2).

### Recordatorios WhatsApp (Evolution API + n8n)
- Endpoint `/api/cron/reminders-24h` (cron Vercel cada 1h, citas mañana ±15min de hora actual + 24h).
- Endpoint `/api/cron/reminders-2h` (cron cada 15min).
- Webhook `/api/webhooks/whatsapp` para confirmaciones.
- Plantillas en español, tono cálido pero profesional, con botones Confirmar/Reagendar/Cancelar.
- Log en `appointment_reminders` con cada cambio de status.
- Retry exponencial 3 veces si falla.
- **Branding por tenant** en mensajes (`{tenant_branding.whatsapp_business_name}`).

### Booking público
- `/booking/[tenant]` (sin login).
- Selección de servicio → fisio → fecha → slot disponible → datos paciente → confirmación.
- Si paciente ya existe (match por email/teléfono), pide login. Si no, crea uno nuevo.
- Genera magic link inmediato para acceder al portal.

### Tests
- E2E: crear cita → confirmar → marcar completada.
- E2E: doble booking del mismo fisio en mismo slot debe fallar.
- E2E: cancelar libera slot y notifica primero de waitlist.
- E2E: booking público crea paciente + cita + envía magic link.
- **E2E aislamiento multi-tenant:** user de `movewell` no ve citas de `demo`, ni siquiera con manipulación de URL.
- Unit: state machine de appointments.
- Unit: cálculo de slots disponibles considerando duraciones variables.
- Unit: detección de conflictos (sala, fisio, paciente con cita activa).

### Documentación
- `docs/modulo-agenda.md` con: modelo, máquina de estados, flujo de recordatorios, decisiones tomadas, divergencias del prototipo.

## Reglas de la fase

1. **Migración DB siempre con `drizzle-kit generate`.** Nunca DB manual.
2. **RLS antes de query.**
3. **Audit log en cada mutación de appointments.**
4. **Google Calendar sync NO va en esta fase.** Backlog explícito en `docs/backlog-fase-1.md`.
5. **DnD-Kit, no react-dnd.**
6. **Mobile-first en agenda mobile.** iOS Calendar es el norte.
7. **Booking público** valida tenant existente + activo en cada request.

Plan de ataque por subfases (4 semanas) + dudas. Yo apruebo, vos arrancás.
```

---

## 🩺 Fase 2 — EMR clínico (S7–S10, 4 semanas)

```
Fase 2: Expediente clínico electrónico. Lee CLAUDE.md, docs/modulo-agenda.md, y docs/prototype-reference/views/patient.jsx, protocols.jsx. Resumime qué quedó de Fase 1 + cómo el prototipo modeló el expediente + qué tocamos hoy.

## Alcance

### Modelo de datos
- `clinical_records` — un registro por paciente, history de lesiones previas y cirugías.
- `assessments` — evaluación (Y-Balance, Hop Test, SEBT, goniometría, dinamometría, EVA, DASH, LEFS).
- `assessment_templates_global` — 8 escalas estándar precargadas (Reha.mx).
- `assessment_templates_tenant` — overrides + plantillas custom del tenant.
- `assessment_results` — resultados con valores numéricos por campo + asimetría calculada.
- `soap_notes` — notas SOAP por sesión, vinculadas a `appointment_id`.
- `note_templates` — plantillas reutilizables por diagnóstico (por tenant).
- `studies` — estudios médicos (RMN, RX, ecografía) + signed URLs Supabase Storage.
- `study_annotations` — anotaciones canvas sobre imagen.
- `consents` — consentimientos firmados con firma electrónica + hash SHA-256 + timestamp + IP.
- `consent_templates` — plantillas (privacidad, tratamiento, imagen, riesgos deportivos), versionadas.
- `diagnoses` — diagnóstico vinculado a paciente, ICD-10 + descripción libre.
- `protocols` y `patient_protocols`.

### UI (`app/(app)/pacientes/[id]/`)
Tabs (basado en patrón del prototipo):
- **Resumen** — datos demográficos, próxima cita, diagnóstico activo, evolución de PAIN/EVA y fuerza (gráficas heredadas de `prototype-reference/charts.jsx`).
- **Expediente** — historia clínica editable, lesiones previas.
- **Sesiones** — timeline con SOAP por sesión.
- **Evaluaciones** — lista con gráficas comparativas entre sesiones.
- **Estudios** — galería con anotaciones.
- **Consentimientos** — firmados con fecha + opción re-firmar.
- **Protocolo** — protocolo activo + adherencia + ejercicios pendientes.

### Componentes clave
- `<AssessmentForm>` — render dinámico según template.
- `<SoapNoteEditor>` — editor con plantillas + dictado (post go-live).
- `<ROMTracker>` — tracker de rango de movimiento con goniometría.
- `<AsymmetryChart>` — gráfica L vs R.
- `<StudyViewer>` — viewer canvas con anotaciones.
- `<ConsentSigner>` — firma electrónica con canvas + SHA-256 del documento + timestamp + IP.

### Compliance
- Audit log obligatorio en cada SELECT y UPDATE de tablas `clinical_*`.
- **Conservación 5 años** forzada en policy: no se puede DELETE de `clinical_records` antes de 5 años desde última cita.
- Aviso de privacidad versionado en `consent_templates`, vinculado a `consents` con versión + hash.
- Export ARCO de los datos del paciente en JSON (`/yo/privacidad`).

### Tests
- E2E: crear evaluación Y-Balance → ver gráfica de evolución.
- E2E: subir estudio RMN → anotar → guardar → re-abrir.
- E2E: firmar consentimiento → verificar hash + timestamp.
- **E2E aislamiento:** fisio de Org A no puede acceder a `/pacientes/[id]` de Org B.
- Unit: cálculo de asimetría, ACWR, score Y-Balance compuesto.
- Unit: redacción automática SOAP desde plantilla.

## Reglas

1. **Vocabulario clínico real.** Pedí lista al cliente en Discovery si no la tenés.
2. **Estudios médicos NUNCA con URL pública.** Signed URLs ≤ 1h.
3. **Audit log de cada read.** Sí, también SELECT, no solo mutaciones.
4. **PAIN/EVA va en cada SOAP automáticamente** (subjetivo + objetivo).
5. **Plantillas globales** (Y-Balance etc.) viven en `assessment_templates_global`. Tenant las clona si quiere customizar.

Plan + dudas.
```

---

## 💳 Fase 3 — Pagos + CFDI (S11–S13, 3 semanas)

```
Fase 3: Pagos en línea + Facturación CFDI 4.0. Lee CLAUDE.md, docs/modulo-emr.md, y docs/prototype-reference/views/payments.jsx, billing.jsx.

## Alcance

### Stripe (con adapter pattern)
- `lib/payments/provider.ts` con interface `PaymentProvider { createCheckout, refund, fetchPayment, createSubscription }`.
- `lib/payments/stripe.ts` (default).
- Stub `mercadopago.ts` y `conekta.ts`.
- App consume el provider, nunca Stripe directo (excepto webhooks).

**Stripe específico:**
- Productos: sesión individual, bono 10 sesiones, membresía mensual.
- Checkout Session para cobro único.
- Subscription para membresía recurrente.
- Customer Portal para que paciente gestione sub.
- Webhook `/api/webhooks/stripe` para `checkout.session.completed`, `invoice.paid`, `subscription.deleted`, `charge.refunded`.

### CFDI 4.0 (Facturama)
- `lib/facturama/client.ts` con timbrado, cancelación, consulta.
- Catálogo de productos/servicios con claves SAT (servicios de salud `85121800`).
- `lib/facturama/cfdi-from-payment.ts` — toma un payment, emite CFDI.
- Webhook Facturama si disponible, o polling cada 5min.
- Complemento de pagos (REP) cuando hay parciales.
- Cancelación con motivos SAT (01, 02, 03, 04).
- **Configuración por tenant:** RFC emisor, lugar de expedición, certificado .cer + .key (encriptados).

### Modelo de datos (todo con `organization_id` + RLS)
- `payments` — id, patient_id, amount, currency, provider, provider_id, status.
- `invoices` — CFDI emitido, link a XML + PDF en storage, status.
- `packages` — bono N sesiones, válido hasta fecha.
- `package_redemptions` — qué cita consumió qué bono.
- `memberships` — sub mensual con renew automático.
- `coupons`, `coupon_redemptions`.
- `tenant_payment_config` — credenciales Stripe por tenant (cifradas), Facturama config.

### UI clínica
**`app/(app)/pagos/`:**
- Lista con filtros (paciente, fecha, status).
- Cobrar al paciente → genera link Stripe + envía por WhatsApp.
- TPV en recepción → Stripe Terminal o link QR.
- Conciliación pago ↔ factura.

**`app/(app)/facturacion/`:**
- Emitir CFDI bajo demanda.
- Cancelar CFDI con motivo.
- Reporte mensual exportable Excel + PDF.

### Portal paciente
- `/yo/facturas` — lista descargable XML + PDF.
- `/yo/pagos` — historial.
- `/yo/membresias` — gestionar sub via Customer Portal Stripe.

### Tests
- E2E: cobrar sesión → emitir CFDI → enviar al correo.
- E2E: comprar bono 10 sesiones → consumir 1 al agendar → ver saldo.
- E2E: subscribirse a membresía → cancelar → no se renueva.
- E2E: cancelar CFDI con motivo 02 → ver substituto.
- **E2E aislamiento:** payments de Org A no visibles desde Org B.
- Unit: cálculo IVA, retenciones servicios médicos.
- Unit: idempotencia webhooks (mismo `event.id` no procesa dos veces).

## Reglas

1. **Webhooks idempotentes.** Verificá `event.id` antes de procesar.
2. **Signature verification obligatoria** en todo webhook.
3. **Nunca crees CFDI sin payment confirmado.** `payment_id` único en `invoices`.
4. **Sandbox Facturama hasta go-live.** Variable `FACTURAMA_ENV`.
5. **RFC paciente opcional.** Si no tiene, CFDI público general (`XAXX010101000`).
6. **Stripe Connect vs cuenta directa:** decidir con MoveWell. Si el SaaS escala, Connect permite que cada clínica reciba en su cuenta. Si MoveWell es el único cliente todavía, cuenta directa de KonectAI con split manual. **Pregúntame antes de implementar.**

Plan + dudas.
```

---

## 📱 Fase 4 — Portal paciente PWA (S14–S16, 3 semanas)

```
Fase 4: Portal del paciente como PWA. Lee CLAUDE.md, docs/modulo-pagos.md, y docs/prototype-reference/views/portal*.jsx (todos los tabs y screens-extra).

## Alcance

### PWA
- `manifest.json` con icons (con branding por tenant), theme color cyan, display standalone.
- Service worker con Workbox: precache shell, runtime cache imágenes, offline fallback.
- Install prompt custom en iOS (PWA en iOS no muestra A2HS automático).
- Push notifications via Web Push + FCM/APNs **detrás de feature flag**, no bloquea entrega.

### Auth paciente
- Magic link al correo o WhatsApp.
- 2FA opcional para paciente.
- Onboarding wizard (consentimientos, datos básicos, deporte, lesión, objetivo).

### Tabs (`app/(portal)/`)
Portado del prototipo con divergencias donde shadcn/ui o un patrón móvil mejor:
- **Inicio** — próxima cita, plan activo, gráfica de progreso, atajos.
- **Plan** — protocolo asignado con ejercicios. Cada ejercicio: video, sets×reps, RPE objetivo, comentarios fisio, marcar como hecho.
- **Citas** — lista próximas + agendar nueva (booking online) + cancelar.
- **Nutrición** — placeholder, depende si MoveWell tiene nutriólogo. Feature flag.
- **Yo** — perfil, paquetes, facturas, chat con fisio, ajustes, privacidad ARCO.

### Registro diario
- PAIN/EVA, sueño (h), ánimo (1-10), RPE de la sesión del día.
- Notificación push o WhatsApp diaria a las 9am.
- Visible para fisio en el expediente del paciente.
- Stored en `daily_logs` con `organization_id`.

### Chat asíncrono paciente↔fisio
- `conversations` y `messages` en DB.
- Realtime con Supabase Realtime.
- Notificación push o WhatsApp si fisio responde fuera de horario.
- Fisio ve cola de mensajes en `app/(app)/mensajes/`.
- Banner permanente "para urgencias llama al 911 o ve a urgencias".
- Sin envío de imágenes en V1 (backlog).

### Videos de ejercicios
- Storage en Mux (recomendado) o Supabase Storage + Mux player para mobile-friendly.
- Subir video desde panel admin (Reha.mx super-admin) → biblioteca global.
- Tenant puede subir videos custom a su biblioteca local.
- Compresión y preview generado automáticamente.

### Branding por tenant en portal
- Logo y accent color del tenant en topbar y splash.
- Subdomain dedicado: `movewell.reha.mx/portal` o custom domain.
- Email "from" usa `tenant_branding.email_from`.

### Tests
- E2E: paciente recibe magic link → onboarding → ve plan.
- E2E: paciente marca ejercicio hecho → fisio lo ve en su panel.
- E2E: chat envía mensaje → fisio recibe en realtime.
- E2E: PWA instala correctamente (Lighthouse PWA audit ≥ 90).
- **E2E aislamiento:** paciente de Org A no puede acceder a portal de Org B.
- E2E: registro diario se persiste y aparece en expediente del fisio.

## Reglas

1. **Mobile-first absoluto.** El portal NO se diseña para desktop, aunque sea responsive.
2. **Inter más grande** que en app clínica (es para pacientes, no data-density).
3. **iOS frame del prototipo es solo demo.** En real, PWA full-screen sin frame.
4. **Performance crítica.** Lighthouse mobile ≥ 90 en performance.
5. **Push notifications detrás de feature flag.** No bloquea entrega.
6. **Datos de salud sensibles** en chat → cifrado en tránsito + en reposo + audit log.

Plan + dudas.
```

---

## ⌚ Fase 5 — Wearables + dashboards (S17–S19, 3 semanas)

```
Fase 5: Integración wearables + dashboards ejecutivos. Lee CLAUDE.md, docs/modulo-portal.md, y docs/prototype-reference/views/dashboard.jsx, branch-dashboard.jsx, reports.jsx, team.jsx.

## Alcance

### Wearables — adapter pattern
- `lib/wearables/provider.ts` con interface `WearableProvider { connect, disconnect, fetchMetrics, refreshTokens }`.
- Implementaciones:
  - `apple-health.ts` (HealthKit web bridge o share desde app móvil).
  - `garmin.ts` (Garmin Connect API OAuth 1.0a — sí, todavía 1.0a).
  - `whoop.ts` (Whoop API OAuth 2.0).
  - `google-fit.ts` (en backlog si tiempo).
- OAuth dance en cada uno.
- Tokens cifrados con `pgsodium` antes de guardar en `wearable_connections`.
- Sync diario via cron + manual on-demand desde portal.

### Datos ingestados
- HRV (variabilidad), resting HR, sueño (h, fases), pasos, distancia, FC actividades, carga de entrenamiento.
- Tabla `wearable_metrics` particionada por mes (Postgres native partitioning).
- Política de retención: 2 años de daily, agregado mensual indefinido.

### Cálculos derivados
- ACWR (Acute:Chronic Workload Ratio) — alertar si >1.5 (sobrecarga) o <0.8 (sub-entrenamiento).
- Trend HRV — caída >15% baseline = alerta.
- Sueño promedio últimos 7 días.
- Visible en expediente del fisio + en portal del paciente.

### Dashboards (`app/(app)/dashboard/` y `app/(app)/reportes/`)

**Dashboard ejecutivo (admin/director):**
- KPIs: ingresos mes, sesiones totales, pacientes activos, NPS, ocupación promedio.
- Heatmap día×hora de ocupación (heredar de `prototype-reference/views/branch-dashboard.jsx`).
- Top 5 fisios por ingresos.
- Embudo: prospecto → valoración → activo → alta → reactivación.
- Cancelaciones y no-shows con causa.

**Dashboard por sucursal:** heatmap, carga por fisio, pacientes en riesgo de churn.

**Dashboard por fisio (su vista):** cartera, adherencia, ingresos, satisfacción, próximas citas.

**Reportes clínicos:**
- Tiempo promedio recuperación por tipo de lesión.
- Tasa de alta vs reincidencia.
- Distribución de lesiones por deporte.

**Reportes financieros:**
- Ingresos por sucursal, fisio, tipo de servicio.
- DSO (días de cobro).
- LTV por paciente.

### Exports
- Cada reporte exportable a Excel y PDF.
- Programar reporte mensual al correo del director (n8n).

### Tests
- E2E: conectar Whoop → ver HRV en expediente.
- E2E: ACWR alto dispara alerta visible al fisio.
- **E2E aislamiento:** wearable_metrics de pacientes de Org A no visible desde Org B.
- Unit: cálculo ACWR, NPS, ocupación, embudo.

## Reglas

1. **Tokens OAuth cifrados.** `pgsodium`. Nunca plaintext.
2. **Refresh tokens** con cron antes de expirar.
3. **Rate limits** de cada API respetados. Cola en n8n.
4. **Datos wearable son sensibles.** RLS estricto: paciente ve solo lo suyo, fisio solo de sus pacientes asignados.
5. **Dashboards usan materialized views** para queries pesadas, refrescadas cada hora.
6. **NPS** se captura post-cita via WhatsApp (n8n flow).

Plan + dudas.
```

---

## 🚀 Fase 6 — Capacitación + go-live MoveWell (S20–S21, 2 semanas)

```
Fase 6: Migración, capacitación, go-live MoveWell, hipercare. Lee CLAUDE.md y todos los docs/modulo-*.md acumulados. Esta fase es 50% técnica y 50% humana.

## Alcance

### Migración de datos MoveWell
- Auditar Excel/sistema actual de MoveWell (debió haberse hecho en Discovery, validar que esté).
- Script `scripts/migrate-movewell.ts` que parsea fuente y carga en producción del tenant `movewell`.
- Mapeo: pacientes, citas históricas, fisios, sucursales, paquetes activos.
- Dry-run en staging primero. Validación 1:1 con cliente.
- Migración real en ventana de mantenimiento (sábado 10pm).
- Rollback testeado.

### Pen-test
- Contratar pen-test externo (KonectAI tiene proveedor).
- Foco específico en aislamiento multi-tenant — auditar que ningún endpoint permita ver datos de otro tenant.
- Resolver findings críticos y altos antes de go-live.
- Findings medios y bajos → backlog post go-live.
- Reporte firmado para el cliente.

### Capacitación MoveWell
3 sesiones presenciales/remotas:
- Dirección (2h): reportes, dashboards, gestión de fisios y precios.
- Fisios (2h): expediente, evaluaciones, portal, chat, wearables.
- Recepción (2h): agenda, pagos, facturación, recordatorios.

Material en video grabado, queda disponible permanentemente.
Manual en `docs/manual-usuario-{rol}.md`.

### Go-live
- Plan rollback documentado (snapshot DB + Vercel rollback).
- Checklist pre-go-live (variables prod, certs, dominios, backups, monitoreo).
- DNS cutover de `movewell.reha.mx` (o custom domain).
- Anuncio a pacientes existentes con guía de onboarding al portal.
- Provisioning automatizado del tenant `movewell` con su branding final.

### Hipercare (2 semanas post go-live)
- Slack canal compartido KonectAI ↔ MoveWell.
- SLA respuesta 1h hábil para cualquier issue.
- Stand-up diario 15min con equipo MoveWell.
- Bug tracker en Linear/GitHub Issues con prioridad.
- Métricas: tickets abiertos, MTTR, errores Sentry, uptime.

### Documentación final
- Runbooks: backup, restore, redeploy, hot-fix.
- Diagrama arquitectura (excalidraw / mermaid).
- Catálogo variables de entorno producción.
- Contactos proveedores (Supabase, Vercel, Stripe, Facturama, Mux).
- Plan de soporte mensual post hipercare.

### Onboarding del próximo tenant (preparación)
Aunque MoveWell sea el primer cliente, preparar:
- Script `scripts/provision-tenant.ts` para crear org + branding + admin user.
- Doc `docs/onboarding-nuevo-tenant.md` con pasos.
- Validar que el aislamiento se mantiene con un tenant de prueba en producción.

### Aceptación final
- Acta de cierre firmada por MoveWell.
- Liberación del 30% final del pago.
- Transición a esquema mensual de soporte ($11.1k MXN/mes).
- Inicio del programa de descuento para 2do tenant (M7-M9 en roadmap comercial).

## Reglas

1. **Cero deploys nuevos durante hipercare** salvo hot-fix de bug crítico.
2. **Toda migración con dry-run.**
3. **Rollback testeado antes del go-live.** No el día de.
4. **Cliente firma cada hito** del go-live.
5. **Pen-test multi-tenant** es no-negociable. Sin esto, no hay segundo tenant.

Plan detallado + dudas. Comunicación con cliente es prioridad.
```

---

## 🔁 Workflow entre fases

1. **Cerrá Fase N** → demo a cliente → firma de aceptación parcial → PR `app-real → main` (o `feat/fase-N → main` después de Fase 0) → tag `v0.N.0`.
2. **Backlog** de Fase N que no cerró → `docs/backlog-fase-N.md` con razón.
3. **Sesión Claude Code nueva** para Fase N+1 con prompt limpio.
4. **Retro técnica interna** entre fases: 1h, qué funcionó, qué refactor pendiente.

## 🚦 Si una fase se atrasa

- **Spillover ≤ 1 semana** → mover a inicio de siguiente fase.
- **Spillover > 1 semana** → conversación con cliente, recortar alcance o re-plannear.
- **Nunca acumular deuda silenciosamente.** Documentá en `docs/scope-changes.md`.

## 🎯 Post Fase 6 — preparación comercial

Ya en producción con MoveWell, el SaaS Reha.mx tiene:

- Multi-tenant funcional probado en pen-test.
- Provisioning automatizado de nuevos tenants.
- Branding por tenant.
- Catálogos clínicos editables por tenant.
- Manuales de usuario por rol.
- Plan de soporte definido.

**Listo para empezar a vender a la 2da clínica.**
