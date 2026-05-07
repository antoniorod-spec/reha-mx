/* Agenda — Google Calendar style con 4 vistas: Día, Semana, Mes, Lista
   + mini-calendario + filtros + indicador de "ahora" + drag-to-create
   + mobile experience separado (iOS Calendar pattern)                  */

/* ───── Helpers ───── */
const fmtTime = (s) => {
  const startBase = 8;
  const totalMin = Math.round((startBase + s) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};
const endTime = (s, dur) => fmtTime(s + dur);

const FULL_DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const SHORT_DAY_NAMES = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

/* "Hoy" se ancla en Lun 4 May (= dayIdx 0 de la semana visible). Hora actual fake = 11:42 */
const NOW_DAY_IDX = 0;
const NOW_HOUR = 11.7; // 11:42

const branchPill = (name) => {
  const b = BRANCHES.find(x => x.short === name);
  return b ? { color: b.color, name: b.short } : { color: "#9BB3C4", name: name || "—" };
};

/* Color por fisio — extraído de FISIO_DETAIL para consistencia */
const fisioColor = (fisioName) => {
  const f = FISIO_DETAIL.find(x => x.name === fisioName);
  return f ? f.color : "#9BB3C4";
};

const periodOf = (s) => {
  const startBase = 8;
  const h = startBase + s;
  if (h < 12) return "Mañana";
  if (h < 18) return "Tarde";
  return "Noche";
};

/* Filtros aplicados — devuelve true si la cita pasa */
const matchFilters = (a, filters) => {
  if (filters.branch !== "all" && a.b !== filters.branch) return false;
  if (filters.fisio !== "all"  && a.f !== filters.fisio)  return false;
  if (filters.type  !== "all"  && a.t !== filters.type)   return false;
  if (filters.colorBy === "fisio") {
    /* no-op — solo afecta render */
  }
  return true;
};

const getApptColor = (a, colorBy) => {
  if (colorBy === "fisio")  return { bar: fisioColor(a.f), bg: fisioColor(a.f) + "26", border: fisioColor(a.f) + "70", fg: fisioColor(a.f) };
  if (colorBy === "branch") {
    const c = branchPill(a.b).color;
    return { bar: c, bg: c + "26", border: c + "70", fg: c };
  }
  return APPT_TYPES[a.t]; // by type (default)
};

Object.assign(window, {
  fmtTime, endTime, FULL_DAY_NAMES, SHORT_DAY_NAMES, MONTHS,
  NOW_DAY_IDX, NOW_HOUR,
  branchPill, fisioColor, periodOf, matchFilters, getApptColor,
});
