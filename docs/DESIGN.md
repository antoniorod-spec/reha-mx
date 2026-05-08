# Rehai — Sistema de diseño

> Lee esto **antes** de tocar UI. Todo lo demás (componentes, vistas, copys) sigue de aquí.

---

## 🎨 Filosofía

Rehai es una herramienta clínica seria para profesionales de la salud + un portal humano y cálido para pacientes en recuperación. El diseño debe sentirse:

- **Clínico, no infantil.** Datos densos, tipografía técnica, mucho monoespaciado para números. Inspiración: Linear, Cron, Things, Apple Health.
- **Confiable, no corporativo.** Nada de gradientes saturados, ilustraciones genéricas, ni stock photos. Casi todo es type + datos + line icons.
- **Mexicano sin folklor.** Nombres, sucursales, direcciones, monedas y fechas en es-MX. Sin emojis decorativos, sin clichés visuales.
- **Mobile-first en el portal paciente / desktop-first en la app clínica.**

**Reglas anti-slop:**

- ❌ Nada de gradientes saturados decorativos. Solo gradientes sutiles para el logo y avatares.
- ❌ Nada de emojis decorativos en UI. Iconografía siempre con line icons (`src/icons.jsx`).
- ❌ Nada de borders accent + rounded card como decoración. La info se jerarquiza con tipografía y espaciado.
- ❌ Nada de SVG decorativo inventado para "ilustrar" — usa placeholders limpios.
- ❌ Nada de stats inventados para llenar espacio. Si una sección está vacía, es decisión, no falta de contenido.

---

## 🌗 Temas (dark default + light)

El tema se controla por la clase `body.theme-light` o ausencia. El estado vive en `app.jsx` y se persiste en `localStorage`.

**Toda vista nueva DEBE recibir `theme` por props y derivar tokens con `tokens(theme)` desde `shell.jsx`.** No hardcodees colores excepto los del logo y casos muy puntuales (acentos de paquetes en el portal).

### Token map (definido en `src/shell.jsx`)

```js
// DARK (default)
{
  bg:          "#06101C",   // body background
  surface:     "#0A1825",   // cards
  surface2:    "#0F2030",   // inputs, secondary surfaces
  border:      "#15293C",   // 1px borders
  borderSoft:  "#0F2030",   // dividers internos
  text:        "#F0F7FB",   // titulares + texto principal
  muted:       "#9BB3C4",   // labels, sublines
  subtle:      "#5F7B91",   // hints, placeholders, hours
  accent:      "#3FBCD4",   // CYAN — la marca
  accentSoft:  "rgba(63,188,212,0.14)",
  navy:        "#1B3A5C",
  navySoft:    "rgba(27,58,92,0.45)",
  good:        "#34D399",
  bad:         "#F87171",
  info:        "#3FBCD4",
}

// LIGHT
{
  bg:          "#F4F8FB",
  surface:     "#FFFFFF",
  surface2:    "#EEF4F8",
  border:      "#D9E4EC",
  borderSoft:  "#E6EDF3",
  text:        "#0E2438",
  muted:       "#42627A",
  subtle:      "#6B8499",
  accent:      "#1B92AE",   // accent oscuro para contraste sobre blanco
  accentSoft:  "rgba(63,188,212,0.14)",
  navy:        "#1B3A5C",
  navySoft:    "rgba(27,58,92,0.10)",
  good:        "#0F8A5F",
  bad:         "#DC2626",
  info:        "#1B92AE",
}
```

### Acento de marca

**Cyan `#3FBCD4`** es THE color. Se usa para:

- Logo + gradiente `linear-gradient(135deg, #1B3A5C → #3FBCD4)`.
- Botones primarios (`background: t.accent`, `color: "#06101C"` — texto navy oscuro sobre cyan, NUNCA blanco).
- Estados activos en navegación.
- Series principales en gráficos.
- Acentos de paquete "más popular" en el portal.

**Texto sobre acento → siempre `#06101C`**, no blanco. Es una regla.

### Colores semánticos por sucursal

```js
Centro    → #3FBCD4 (cyan, la primaria)
Lomas     → #5B8AC9 (azul)
Carranza  → #7EE3C5 (verde menta)
```

Estos colores aparecen como dots/series en gráficos multisucursal. No los reuses para otras cosas.

---

## ✏️ Tipografía

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

- **Inter** → toda la UI (headings, body, labels).
- **JetBrains Mono** → todos los **datos numéricos** (KPIs, monedas, % ocupación, IDs, fechas técnicas, hours en agenda). Aplica con la clase `font-mono`.

### Escala (en uso real)

| Uso                     | Tamaño         | Peso                   | Tracking                       |
| ----------------------- | -------------- | ---------------------- | ------------------------------ |
| KPI numérico grande     | 28-32px (mono) | 600                    | `tracking-tighter2` (-0.022em) |
| Heading vista (h1)      | 22-26px        | 600                    | `tracking-tighter2`            |
| Subheading sección (h2) | 16-18px        | 600                    | `tracking-tightish` (-0.011em) |
| Card title              | 13-14px        | 600                    | `tracking-tightish`            |
| Body                    | 12.5-13px      | 400/500                | normal                         |
| Label / muted           | 11-11.5px      | 500                    | normal                         |
| Hint / micro            | 9-10.5px       | 400/500 mono uppercase | wider                          |

**Reglas:**

- Nunca pongas labels en uppercase con letter-spacing extremo si no son metadata.
- Los porcentajes y deltas en KPIs van **siempre en mono**.
- `text-wrap: pretty` en headings largos.

---

## 📐 Layout y espaciado

- **Container:** la app ocupa 100% del viewport. Sidebar fija 240px (desktop), topbar 48px de alto.
- **Mobile (≤768px):** sidebar se vuelve overlay (drawer) + bottom nav fija. Topbar más compacta.
- **Cards:** `border: 1px solid t.border`, `background: t.surface`, `border-radius: 10-12px`. Sin sombras pesadas — un border es suficiente.
- **Padding interno de cards:** 14-16px en mobile, 16-20px en desktop.
- **Gap entre cards (grid):** 12-16px.
- **Inputs/buttons:** alto 30-36px típico, radio 6-8px, padding horizontal 10-14px.
- **No abuses del espacio.** Densidad clínica: muchos datos visibles sin scroll. Si dudas, comprime.

### Grids comunes

- KPIs: `grid grid-cols-2 sm:grid-cols-4 gap-3`
- Dashboard 2/3 + 1/3: `grid grid-cols-1 lg:grid-cols-3 gap-4` con el principal `lg:col-span-2`.
- Listas tabulares: 1 col en mobile → grid en desktop con líneas divisoras de 1px en `t.borderSoft`.

---

## 🎯 Iconografía

- **Set único** en `src/icons.jsx`. Stroke 1.6-1.8, viewBox 24×24, line-cap round, line-join round.
- **Tamaños estándar:** 11, 13, 15 (botones), 18-20 (vista vacía), 22-26 (headers especiales).
- Color del ícono = `currentColor`; siempre se hereda del `color:` del padre.
- Si necesitas un icono nuevo, **agrégalo a `icons.jsx`** y exporta a `window`. No lo dibujes inline en una vista.
- Nunca uses emojis como íconos.

---

## 📊 Gráficos (SVG puro, sin libs)

Todo está en `src/charts.jsx`. Componentes disponibles:

- `<AreaSparkline values color height theme>` — sparkline de KPI.
- `<LineChart data series height theme yMax formatY showLegend>` — líneas multi-serie.
- `<BarChart data height color theme yMax>` — barras.
- `<HeatmapGrid rows days hours theme>` — heatmap día×hora (paleta cyan).

**Reglas:**

- Series principales **siempre en accent cyan** (`#3FBCD4`).
- Series secundarias usan los colores semánticos de sucursal (`#5B8AC9`, `#7EE3C5`).
- Grid lines: `#1F1F1F` dark / `#EAEAEA` light, **bien sutiles**.
- Ejes y labels en mono, color `t.subtle`.
- Sin tooltips animados pesados; el dato vive en la card a un lado.

---

## 🧱 Patrones de componentes recurrentes

### Botón primario

```jsx
<button
  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold"
  style={{ background: t.accent, color: '#06101C' }}
>
  <IconPlus size={13} /> Nueva cita
</button>
```

### Botón secundario

```jsx
<button
  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium"
  style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}
>
  <IconList size={13} /> Tabla
</button>
```

### Card

```jsx
<div className="rounded-xl p-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
  …
</div>
```

### KPI

```jsx
<div className="rounded-xl p-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
  <div className="text-[11px] font-medium" style={{ color: t.muted }}>
    Pacientes activos
  </div>
  <div className="mt-1 flex items-baseline gap-2">
    <div
      className="tracking-tighter2 font-mono text-[28px] font-semibold"
      style={{ color: t.text }}
    >
      487
    </div>
    <div className="font-mono text-[11px]" style={{ color: t.good }}>
      +12%
    </div>
  </div>
  <div className="mt-0.5 text-[10px]" style={{ color: t.subtle }}>
    vs mes anterior
  </div>
</div>
```

### Avatar (iniciales)

```jsx
<div
  className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold"
  style={{ background: 'linear-gradient(135deg, #1B3A5C, #3FBCD4)', color: '#FFFFFF' }}
>
  AR
</div>
```

### Badge sucursal (dot + nombre)

```jsx
<span className="flex items-center gap-1.5 text-[11.5px]" style={{ color: t.muted }}>
  <span className="h-1.5 w-1.5 rounded-full" style={{ background: branch.color }} />
  {branch.name}
</span>
```

---

## 📱 Portal paciente (mobile)

Vive **dentro de un iPhone frame** (`components/ios-frame.jsx`). El frame simula:

- Status bar (44px notch area).
- Home indicator.
- Border radius del device.

**Reglas específicas:**

- Toda pantalla del portal (incluidos overlays) **debe respetar el padding del status bar**. Hay un patrón establecido en `portal-screens-extra.jsx` — copiar de ahí.
- Los tabs del portal viven en `portal.jsx` y usan iconos de `icons.jsx`.
- Tipografía un poco más grande que la app clínica (es para pacientes, no para profesionales mirando datos densos).
- Bottom nav fijo dentro del frame.
- Tokens propios: el portal usa una paleta `PC` ligeramente distinta (definida en `portal-ui.jsx`) — más cálida.

---

## 🇲🇽 Reglas de contenido (es-MX)

- **Moneda:** `$487,300` con `MXN` como suffix cuando el contexto no sea obvio. Coma como separador de miles, punto para decimales.
- **Fechas cortas:** `12 May`, `Mié 6`, `4 May → 10 May`.
- **Fechas largas:** `12 de marzo de 2026`.
- **Hora:** formato 24h (`14:30`), salvo en el portal paciente que puede ir a 12h con am/pm.
- **Nombres:** mexicanos realistas con apellido paterno + materno (`Carlos Vázquez Hernández`, `Mtra. Paulina Granados`).
- **Títulos profesionales:** `Dr.`, `Dra.`, `Mtro.`, `Mtra.`, `Lic.` antes del nombre.
- **Diagnósticos:** vocabulario clínico real (`Tendinopatía rotuliana`, `Esguince tobillo grado II`, `Síndrome subacromial`).
- **CFDI 4.0** en facturación: campos reales (RFC, uso CFDI, régimen fiscal, forma de pago).
- **NOM-024** en settings de seguridad de datos clínicos.

---

## 🔁 Variantes / "tweaks"

Cuando el usuario pide variaciones de un elemento, **no abras un archivo nuevo**: agrega un Tweak (slider/select/toggle) que cicle entre opciones dentro del prototipo. El patrón ya existe; busca usos previos de panel de Tweaks si vas a añadir uno.

---

## 🚫 Lo que NO debes hacer

- ❌ Inventar datos en una vista. Pásalos a `data.jsx` o `portal-data.jsx`.
- ❌ Hardcodear colores hex en una vista nueva. Usa `tokens(theme)`.
- ❌ Agregar dependencias npm. Esto es estático.
- ❌ Usar `type="module"` en scripts.
- ❌ Llamar `const styles = {…}` global. Nombre único por archivo.
- ❌ Cambiar versiones de React/Babel sin actualizar los integrity hashes.
- ❌ Meter emojis decorativos en UI clínica.
- ❌ Ilustraciones genéricas SVG inventadas. Usa placeholders limpios y pídele al usuario assets reales si hacen falta.
- ❌ Botones primarios con texto blanco sobre cyan. Texto va en `#06101C`.
- ❌ Romper el iOS frame del portal con contenido que se sale del status bar.
