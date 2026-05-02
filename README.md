# Reha.mx

Prototipo del sistema operativo para clínicas de fisioterapia deportiva en México.

**Stack:** HTML + React 18 (vía Babel standalone) + Tailwind CDN. Sin build step.

## Estructura

```
index.html              ← entry point (Vercel home)
Reha.mx.bundled.html    ← versión single-file standalone
src/
  app.jsx               ← router + estado global
  shell.jsx             ← sidebar + topbar + mobile shell
  data.jsx              ← mock data (sucursales, citas, pacientes…)
  charts.jsx            ← gráficos SVG
  icons.jsx             ← icon set
  ui.jsx                ← primitivas (Card, KPI, etc.)
  views/                ← una vista por archivo
    dashboard.jsx
    branch-dashboard.jsx
    agenda.jsx
    patient.jsx
    branches.jsx
    portal.jsx
    patients-list.jsx
    protocols.jsx
    payments.jsx
    billing.jsx
    reports.jsx
    team.jsx
    settings.jsx
```

## Vistas incluidas

- **Dashboard consolidado** (multi-sucursal)
- **Dashboard por sucursal** (heatmap + carga fisios)
- **Agenda** (mobile iOS Calendar pattern + desktop week grid)
- **Expediente paciente** (PAIN/EVA, fuerza, wearable, ejercicios)
- **Pacientes** (directorio + filtros)
- **Protocolos** (biblioteca clínica)
- **Pagos** + **Facturación CFDI 4.0**
- **Reportes** (NPS, clínico, financiero)
- **Equipo** (fisios, capacidad, comisiones)
- **Sucursales** (admin)
- **Portal paciente** (mobile)
- **Configuración** (NOM-024, integraciones)

## Deploy

Es estático. En Vercel:
- Framework: **Other**
- Build command: *(vacío)*
- Output directory: `./`
