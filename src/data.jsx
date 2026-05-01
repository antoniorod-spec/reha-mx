/* Mock dataset — Mexican names, realistic sports-rehab content */

const BRANCHES = [
  { id: "centro",   name: "MoveWell Centro",   short: "Centro",   addr: "Av. Carranza 1240, Col. Tequisquiapan",     phone: "+52 444 812 3340", color: "#3FBCD4", dot: "#3FBCD4", patients: 184, sessions: 122, occupancy: 86, salas: 4, fisios: 6, revenue: 198400, status: "Activa" },
  { id: "lomas",    name: "MoveWell Lomas",    short: "Lomas",    addr: "Av. Salvador Nava 3055, Lomas 4ª Sección",  phone: "+52 444 825 1170", color: "#5B8AC9", dot: "#5B8AC9", patients: 156, sessions: 104, occupancy: 78, salas: 3, fisios: 5, revenue: 162900, status: "Activa" },
  { id: "carranza", name: "MoveWell Carranza", short: "Carranza", addr: "Blvd. Río Españita 415, Lomas del Tecnológico", phone: "+52 444 199 4422", color: "#7EE3C5", dot: "#7EE3C5", patients: 147, sessions: 86,  occupancy: 71, salas: 3, fisios: 5, revenue: 126000, status: "Activa" },
];

const CONSOLIDATED = { id: "all", name: "Vista consolidada", short: "Las 3 sucursales", color: "#9BB3C4", dot: "#9BB3C4" };

const KPIS_CONSOLIDATED = [
  { label: "Pacientes activos",      value: "487",        delta: "+12%", up: true,  hint: "vs mes anterior" },
  { label: "Sesiones esta semana",   value: "312",        delta: "+8%",  up: true,  hint: "vs semana pasada" },
  { label: "Ingresos del mes",       value: "$487,300",   suffix: "MXN", delta: "+15%", up: true, hint: "vs mes anterior" },
  { label: "NPS promedio",           value: "72",         delta: "+4 pts", up: true, hint: "Q2 2026" },
];

const KPIS_BRANCH = [
  { label: "Pacientes activos",      value: "184",        delta: "+9%", up: true },
  { label: "Sesiones esta semana",   value: "122",        delta: "+6%", up: true },
  { label: "Ingresos del mes",       value: "$198,400",   suffix: "MXN", delta: "+11%", up: true },
  { label: "Ocupación",              value: "86%",        delta: "+3 pts", up: true },
];

const REVENUE_6M = [
  // 6 months, three branches; values in thousand MXN
  { m: "Nov",  centro: 142, lomas: 121, carranza: 96 },
  { m: "Dic",  centro: 158, lomas: 128, carranza: 102 },
  { m: "Ene",  centro: 134, lomas: 119, carranza:  98 },
  { m: "Feb",  centro: 167, lomas: 138, carranza: 110 },
  { m: "Mar",  centro: 182, lomas: 149, carranza: 118 },
  { m: "Abr",  centro: 198, lomas: 163, carranza: 126 },
];

const BRANCH_PERF = [
  { id: "centro",   name: "MoveWell Centro",   patients: 184, sessions: 122, occupancy: 86, revenue: 198400, nps: 76 },
  { id: "lomas",    name: "MoveWell Lomas",    patients: 156, sessions: 104, occupancy: 78, revenue: 162900, nps: 71 },
  { id: "carranza", name: "MoveWell Carranza", patients: 147, sessions:  86, occupancy: 71, revenue: 126000, nps: 69 },
];

const NEXT_DISCHARGES = [
  { name: "Carlos Vázquez Hernández", dx: "Rotura parcial LCA derecho",    fisio: "Dr. Antonio R.",  date: "12 May",  branch: "Centro",   progress: 86 },
  { name: "Daniela Espinosa Lugo",    dx: "Tendinopatía rotuliana",        fisio: "Mtra. Paulina G.",date: "16 May",  branch: "Lomas",    progress: 78 },
  { name: "Iván Moreno Sandoval",     dx: "Esguince tobillo grado II",     fisio: "Dr. Rafael C.",   date: "21 May",  branch: "Centro",   progress: 72 },
  { name: "Mariana Hinojosa Téllez",  dx: "Síndrome subacromial",          fisio: "Mtra. Sofía V.",  date: "24 May",  branch: "Carranza", progress: 64 },
  { name: "Bruno Castañeda Ruíz",     dx: "Lumbalgia mecánica crónica",    fisio: "Dr. Miguel A.",   date: "28 May",  branch: "Lomas",    progress: 58 },
];

// Heatmap: 7 days x 11 hours (07:00-18:00)
const HEATMAP_DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const HEATMAP_HOURS = ["07","08","09","10","11","12","13","14","15","16","17","18"];
// 0–4 intensity; 7 rows (days) x 12 cols (hours)
const HEATMAP = [
  [2,3,4,4,3,2,1,2,3,4,3,1], // L
  [2,3,4,4,4,3,2,3,4,4,3,2], // M
  [1,3,3,4,4,3,2,3,4,3,3,1], // M
  [2,3,4,4,4,3,2,3,4,4,3,2], // J
  [3,4,4,4,3,2,2,3,4,4,2,1], // V
  [3,4,4,3,3,2,1,1,2,2,1,0], // S
  [0,1,2,2,1,0,0,0,0,0,0,0], // D
];

const FISIOS_CARGA = [
  { name: "Dr. Antonio Rodríguez",   role: "Director · Readaptación",      load: 92, patients: 28, init: "AR" },
  { name: "Dr. Rafael Castañeda",    role: "Fisio · Miembro inferior",     load: 84, patients: 24, init: "RC" },
  { name: "Mtra. Sofía Villarreal",  role: "Fisio · Hombro y columna",     load: 71, patients: 19, init: "SV" },
  { name: "Dr. Miguel Arteaga",      role: "Readaptador · Performance",    load: 65, patients: 17, init: "MA" },
  { name: "Mtra. Paulina Granados",  role: "Fisio · Pediátrica deportiva", load: 48, patients: 12, init: "PG" },
  { name: "Lic. Emiliano Solís",     role: "Asistente clínico",            load: 31, patients:  9, init: "ES" },
];

// Agenda — week of L 4 May → D 10 May
const AGENDA_DAYS = [
  { label: "Lun", date: "4"  },
  { label: "Mar", date: "5"  },
  { label: "Mié", date: "6"  },
  { label: "Jue", date: "7"  },
  { label: "Vie", date: "8"  },
  { label: "Sáb", date: "9"  },
  { label: "Dom", date: "10" },
];
const AGENDA_HOURS = ["08","09","10","11","12","13","14","15","16","17","18"]; // 11 rows

// type: valoracion(blue), sesion(orange), reev(violet), readap(green)
// each appt: dayIdx, startHour (0-10), durationHours, type, patient, fisio, confirmed
// s = start hour as fraction (0 = 08:00, 1 = 09:00, 0.5 = 08:30, etc.) ; dur in hours
// b = branch short name, mins = duration in minutes
const APPTS = [
  // Lun 4 May
  { d:0, s:0,   dur:1,    mins:60, t:"valoracion", p:"Adriana Salinas Treviño",     f:"Dr. Antonio Rodríguez",   b:"Centro",   c:true  },
  { d:0, s:1,   dur:1,    mins:60, t:"sesion",     p:"Carlos Vázquez Hernández",    f:"Dr. Antonio Rodríguez",   b:"Centro",   c:true  },
  { d:0, s:2.5, dur:1,    mins:60, t:"sesion",     p:"Iván Moreno Sandoval",        f:"Dr. Rafael Castañeda",    b:"Centro",   c:true  },
  { d:0, s:4,   dur:1.5,  mins:90, t:"readap",     p:"Bruno Castañeda Ruíz",        f:"Dr. Miguel Arteaga",      b:"Lomas",    c:false },
  { d:0, s:5.75,dur:0.75, mins:45, t:"sesion",     p:"María Fernández López",       f:"Dra. Mariana López",      b:"Lomas",    c:true  },
  { d:0, s:7,   dur:1,    mins:60, t:"sesion",     p:"Mariana Hinojosa Téllez",     f:"Mtra. Sofía Villarreal",  b:"Carranza", c:true  },
  { d:0, s:8.5, dur:0.5,  mins:30, t:"alta",       p:"Tomás Aldana Quintana",       f:"Mtra. Sofía Villarreal",  b:"Carranza", c:true  },
  { d:0, s:9.5, dur:1,    mins:60, t:"sesion",     p:"Diego Hernández Gallardo",    f:"Lic. Diego Hernández",    b:"Centro",   c:false },
  // Mar 5 May
  { d:1, s:0,   dur:1.5,  mins:90, t:"reev",       p:"Daniela Espinosa Lugo",       f:"Mtra. Paulina Granados",  b:"Lomas",    c:true  },
  { d:1, s:2,   dur:1,    mins:60, t:"sesion",     p:"Carlos Vázquez Hernández",    f:"Dr. Antonio Rodríguez",   b:"Centro",   c:true  },
  { d:1, s:3.5, dur:1,    mins:60, t:"sesion",     p:"Lucía Treviño Galván",        f:"Dr. Rafael Castañeda",    b:"Centro",   c:true  },
  { d:1, s:5.5, dur:1,    mins:60, t:"valoracion", p:"Andrés Lozano Pérez",         f:"Dr. Antonio Rodríguez",   b:"Centro",   c:false },
  { d:1, s:7.5, dur:1.5,  mins:90, t:"readap",     p:"Pablo Esquivel Arce",         f:"Dr. Miguel Arteaga",      b:"Lomas",    c:true  },
  { d:1, s:9.5, dur:1,    mins:60, t:"sesion",     p:"Lorena Sánchez Cárdenas",     f:"Dra. Mariana López",      b:"Lomas",    c:true  },
  { d:1, s:11,  dur:0.75, mins:45, t:"reev",       p:"Renata Cordero Méndez",       f:"Mtra. Sofía Villarreal",  b:"Carranza", c:false },
  // Mié 6 May
  { d:2, s:0.5, dur:1,    mins:60, t:"sesion",     p:"Mariana Hinojosa Téllez",     f:"Mtra. Sofía Villarreal",  b:"Carranza", c:true  },
  { d:2, s:2,   dur:1.5,  mins:90, t:"valoracion", p:"Renata Jaramillo Cepeda",     f:"Dr. Antonio Rodríguez",   b:"Centro",   c:true  },
  { d:2, s:4.5, dur:1,    mins:60, t:"sesion",     p:"Iván Moreno Sandoval",        f:"Dr. Rafael Castañeda",    b:"Centro",   c:true  },
  { d:2, s:6,   dur:1,    mins:60, t:"reev",       p:"Bruno Castañeda Ruíz",        f:"Dr. Miguel Arteaga",      b:"Lomas",    c:false },
  { d:2, s:7.5, dur:0.75, mins:45, t:"sesion",     p:"Juan Pablo Méndez Ortega",    f:"Lic. Diego Hernández",    b:"Centro",   c:true  },
  { d:2, s:8.5, dur:1,    mins:60, t:"sesion",     p:"Carlos Vázquez Hernández",    f:"Dr. Antonio Rodríguez",   b:"Centro",   c:true  },
  { d:2, s:10,  dur:0.5,  mins:30, t:"alta",       p:"Ivanna Rodríguez Salas",      f:"Dra. Mariana López",      b:"Lomas",    c:true  },
  // Jue 7 May
  { d:3, s:0,   dur:1,    mins:60, t:"sesion",     p:"Daniela Espinosa Lugo",       f:"Mtra. Paulina Granados",  b:"Lomas",    c:true  },
  { d:3, s:1.5, dur:1,    mins:60, t:"sesion",     p:"Pablo Esquivel Arce",         f:"Dr. Miguel Arteaga",      b:"Lomas",    c:true  },
  { d:3, s:3,   dur:1.5,  mins:90, t:"readap",     p:"Carlos Vázquez Hernández",    f:"Dr. Antonio Rodríguez",   b:"Centro",   c:true  },
  { d:3, s:5,   dur:1,    mins:60, t:"valoracion", p:"Bruno Reyes Castillo",        f:"Dr. Rafael Castañeda",    b:"Centro",   c:false },
  { d:3, s:6.5, dur:1,    mins:60, t:"valoracion", p:"Tomás Aldana Quintana",       f:"Mtra. Sofía Villarreal",  b:"Carranza", c:false },
  { d:3, s:8,   dur:1,    mins:60, t:"sesion",     p:"Lucía Treviño Galván",        f:"Dr. Rafael Castañeda",    b:"Centro",   c:true  },
  { d:3, s:9.5, dur:1,    mins:60, t:"sesion",     p:"Mateo Vázquez Domínguez",     f:"Dra. Mariana López",      b:"Lomas",    c:true  },
  // Vie 8 May
  { d:4, s:0.5, dur:1,    mins:60, t:"sesion",     p:"Adriana Salinas Treviño",     f:"Dr. Antonio Rodríguez",   b:"Centro",   c:true  },
  { d:4, s:2,   dur:1,    mins:60, t:"reev",       p:"Iván Moreno Sandoval",        f:"Dr. Rafael Castañeda",    b:"Centro",   c:true  },
  { d:4, s:3.5, dur:1.5,  mins:90, t:"readap",     p:"Bruno Castañeda Ruíz",        f:"Dr. Miguel Arteaga",      b:"Lomas",    c:true  },
  { d:4, s:5.25,dur:0.75, mins:45, t:"sesion",     p:"Andrés Pérez Quezada",        f:"Lic. Diego Hernández",    b:"Centro",   c:true  },
  { d:4, s:6.5, dur:1,    mins:60, t:"sesion",     p:"Renata Jaramillo Cepeda",     f:"Dr. Antonio Rodríguez",   b:"Centro",   c:true  },
  { d:4, s:8,   dur:1,    mins:60, t:"sesion",     p:"Mariana Hinojosa Téllez",     f:"Mtra. Sofía Villarreal",  b:"Carranza", c:true  },
  { d:4, s:10,  dur:0.5,  mins:30, t:"alta",       p:"José Garibay Solís",          f:"Dr. Rafael Castañeda",    b:"Carranza", c:true  },
  // Sáb 9 May
  { d:5, s:0.5, dur:1,    mins:60, t:"sesion",     p:"Carlos Vázquez Hernández",    f:"Dr. Antonio Rodríguez",   b:"Centro",   c:true  },
  { d:5, s:2,   dur:1.5,  mins:90, t:"valoracion", p:"José Garibay Solís",          f:"Dr. Rafael Castañeda",    b:"Carranza", c:false },
  { d:5, s:4,   dur:0.75, mins:45, t:"sesion",     p:"Daniela Mtz. Romero",         f:"Dra. Mariana López",      b:"Lomas",    c:true  },
];

const APPT_TYPES = {
  valoracion: { label: "Valoración",   bg: "rgba(59,130,246,0.18)",  border: "rgba(59,130,246,0.55)",  fg: "#93C5FD", bar: "#3B82F6" },
  sesion:     { label: "Sesión",       bg: "rgba(63,188,212,0.18)",  border: "rgba(63,188,212,0.55)",  fg: "#7DD3DF", bar: "#3FBCD4" },
  reev:       { label: "Reevaluación", bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.55)", fg: "#C4B5FD", bar: "#A78BFA" },
  readap:     { label: "Readaptación", bg: "rgba(34,197,94,0.18)",   border: "rgba(34,197,94,0.55)",   fg: "#86EFAC", bar: "#22C55E" },
  alta:       { label: "Alta",         bg: "rgba(126,227,197,0.18)", border: "rgba(126,227,197,0.55)", fg: "#7EE3C5", bar: "#7EE3C5" },
};

// Patient — Carlos Vázquez Hernández
const PATIENT = {
  name: "Carlos Vázquez Hernández",
  age: 28,
  sport: "Fútbol amateur",
  branch: "MoveWell Centro",
  fisio: "Dr. Antonio Rodríguez",
  diagnosis: "Rotura parcial LCA derecho · Post-cirugía (6 sem.)",
  goal: "Retorno a entrenamiento de campo en 12 semanas",
  startDate: "10 Mar 2026",
  expectedDischarge: "12 May 2026",
  sessionsDone: 14,
  sessionsTotal: 24,
  init: "CV",
};

const PAIN_EVA = [
  { w: "S1", v: 7.5 }, { w: "S2", v: 7 }, { w: "S3", v: 6 }, { w: "S4", v: 5.5 },
  { w: "S5", v: 4.5 }, { w: "S6", v: 3.5 }, { w: "S7", v: 2.8 }, { w: "S8", v: 2 },
];

const QUAD_FORCE = [
  { w: "S1", afecto: 28, sano: 62 },
  { w: "S2", afecto: 34, sano: 64 },
  { w: "S3", afecto: 41, sano: 65 },
  { w: "S4", afecto: 47, sano: 64 },
  { w: "S5", afecto: 52, sano: 66 },
  { w: "S6", afecto: 56, sano: 65 },
  { w: "S7", afecto: 60, sano: 66 },
  { w: "S8", afecto: 63, sano: 67 },
];

// Last-week wearable summary
const WEARABLE = {
  device: "Garmin Forerunner 265",
  lastSync: "Hace 2h",
  hrv: { v: 68, delta: "+4ms" },
  sleep: { v: "7h 24m", delta: "+18min" },
  load: { v: 412, delta: "Óptimo" },
  rhr: { v: 54, delta: "-2 bpm" },
};

// Patient portal — exercises today
const EXERCISES_TODAY = [
  { name: "Sentadilla búlgara con TRX",   set: "3 × 10", side: "Lado afecto", thumb: "linear-gradient(135deg, #1F2937, #0F172A)" },
  { name: "Step-up lateral con carga",    set: "3 × 12", side: "Bilateral",   thumb: "linear-gradient(135deg, #2A1A0E, #1A0F08)" },
  { name: "Hip thrust unilateral",        set: "4 × 8",  side: "Lado afecto", thumb: "linear-gradient(135deg, #1A2330, #0E141C)" },
  { name: "Cadena propioceptiva BOSU",    set: "3 × 45s",side: "Bilateral",   thumb: "linear-gradient(135deg, #21171C, #15101A)" },
];

const ADHERENCIA_SEMANA = [
  { d: "L", v: 100 }, { d: "M", v: 100 }, { d: "M", v: 67 },
  { d: "J", v: 100 }, { d: "V", v: 33  }, { d: "S", v: 100 }, { d: "D", v: 0 },
];

// Branch admin — staff
const STAFF = [
  { name: "Dr. Antonio Rodríguez",   spec: "Readaptación deportiva",  branches: ["Centro", "Lomas"],            patients: 28, status: "Disponible", init: "AR" },
  { name: "Dr. Rafael Castañeda",    spec: "Miembro inferior · Rodilla", branches: ["Centro"],                 patients: 24, status: "En sesión",  init: "RC" },
  { name: "Mtra. Sofía Villarreal",  spec: "Hombro · Columna",         branches: ["Centro", "Carranza"],       patients: 19, status: "Disponible", init: "SV" },
  { name: "Dr. Miguel Arteaga",      spec: "Performance · Fuerza",     branches: ["Lomas"],                    patients: 17, status: "En sesión",  init: "MA" },
  { name: "Mtra. Paulina Granados",  spec: "Pediátrica deportiva",     branches: ["Lomas"],                    patients: 12, status: "Disponible", init: "PG" },
  { name: "Lic. Emiliano Solís",     spec: "Asistente clínico",        branches: ["Centro"],                   patients:  9, status: "Off",        init: "ES" },
  { name: "Mtra. Renata Pacheco",    spec: "Cervicobraquial",          branches: ["Carranza"],                 patients: 14, status: "Disponible", init: "RP" },
  { name: "Dr. José Hinojosa",       spec: "Tendón · Rodilla",         branches: ["Carranza", "Centro"],       patients: 16, status: "Disponible", init: "JH" },
];

/* ─── Pacientes (directorio) ────────────────────────────────────────── */
const PATIENTS_LIST = [
  { id: "EXP-001247", name: "Carlos Vázquez Hernández", age: 28, dx: "Rotura parcial LCA derecho",  fisio: "Dr. Antonio R.",   branch: "Centro",   phase: "Fuerza",        progress: 86, status: "Activo",   nps: 9,  init: "CV", lastVisit: "Hoy 09:00",   adh: 92, balance: 0,       sport: "Fútbol amateur" },
  { id: "EXP-001248", name: "Daniela Espinosa Lugo",     age: 24, dx: "Tendinopatía rotuliana",      fisio: "Mtra. Paulina G.", branch: "Lomas",    phase: "Reentreno",     progress: 78, status: "Activo",   nps: 10, init: "DE", lastVisit: "Ayer 11:30",  adh: 88, balance: 0,       sport: "Atletismo" },
  { id: "EXP-001253", name: "Iván Moreno Sandoval",      age: 31, dx: "Esguince tobillo grado II",   fisio: "Dr. Rafael C.",    branch: "Centro",   phase: "Movilidad",     progress: 72, status: "Activo",   nps: 8,  init: "IM", lastVisit: "04 May",       adh: 81, balance: 1280,    sport: "Trail running" },
  { id: "EXP-001260", name: "Mariana Hinojosa Téllez",   age: 35, dx: "Síndrome subacromial",        fisio: "Mtra. Sofía V.",   branch: "Carranza", phase: "Estabilidad",   progress: 64, status: "Activo",   nps: 9,  init: "MH", lastVisit: "03 May",       adh: 76, balance: 0,       sport: "CrossFit" },
  { id: "EXP-001271", name: "Bruno Castañeda Ruíz",      age: 42, dx: "Lumbalgia mecánica crónica",  fisio: "Dr. Miguel A.",    branch: "Lomas",    phase: "Control motor", progress: 58, status: "Activo",   nps: 7,  init: "BC", lastVisit: "02 May",       adh: 64, balance: 0,       sport: "Golf" },
  { id: "EXP-001284", name: "Adriana Salinas Treviño",   age: 26, dx: "Condromalacia rotuliana",     fisio: "Dr. Antonio R.",   branch: "Centro",   phase: "Fortalecimiento", progress: 49, status: "Activo", nps: 9,  init: "AS", lastVisit: "01 May",     adh: 90, balance: 0,       sport: "Spinning" },
  { id: "EXP-001290", name: "Pablo Esquivel Arce",       age: 38, dx: "Hernia discal L4-L5",         fisio: "Dr. Miguel A.",    branch: "Lomas",    phase: "Fase 2",        progress: 41, status: "Activo",   nps: 8,  init: "PE", lastVisit: "30 Abr",       adh: 71, balance: 2400,    sport: "Tenis" },
  { id: "EXP-001302", name: "Lucía Treviño Galván",      age: 22, dx: "Tendinitis aquilea bilat.",   fisio: "Dr. Rafael C.",    branch: "Centro",   phase: "Inicial",       progress: 28, status: "Activo",   nps: null, init: "LT", lastVisit: "29 Abr",     adh: 85, balance: 0,       sport: "Volleyball" },
  { id: "EXP-001315", name: "Renata Jaramillo Cepeda",   age: 29, dx: "Inestabilidad de hombro",     fisio: "Dr. Antonio R.",   branch: "Centro",   phase: "Valoración",    progress: 8,  status: "Activo",   nps: null, init: "RJ", lastVisit: "28 Abr",     adh: null, balance: 0,    sport: "Natación" },
  { id: "EXP-001112", name: "Tomás Aldana Quintana",     age: 45, dx: "Capsulitis adhesiva",         fisio: "Mtra. Sofía V.",   branch: "Carranza", phase: "Mantenimiento", progress: 100, status: "Alta",     nps: 10, init: "TA", lastVisit: "15 Abr",       adh: 94, balance: 0,       sport: "Senderismo" },
  { id: "EXP-001098", name: "Andrés Lozano Pérez",       age: 19, dx: "Periostitis tibial",          fisio: "Dr. Rafael C.",    branch: "Centro",   phase: "—",             progress: 0,   status: "Pausa",   nps: null, init: "AL", lastVisit: "08 Abr",     adh: null, balance: 540,  sport: "Atletismo" },
  { id: "EXP-001076", name: "José Garibay Solís",        age: 33, dx: "Fascitis plantar bilateral",  fisio: "Dr. Rafael C.",    branch: "Carranza", phase: "Inicial",       progress: 14, status: "Activo",   nps: null, init: "JG", lastVisit: "Hoy 10:30",  adh: 70, balance: 0,       sport: "Maratón" },
];

/* ─── Protocolos (biblioteca) ───────────────────────────────────────── */
const PROTOCOLS = [
  { id: "PRT-LCA-12",  name: "LCA post-quirúrgico · 12 semanas",   region: "Rodilla",    type: "Reconstrucción",  weeks: 12, phases: 5, exercises: 47, used: 38, last: "Abr 2026", author: "Dr. Antonio R.", evidence: "Beischer et al. 2020" },
  { id: "PRT-MEN-08",  name: "Meniscopatía conservadora",          region: "Rodilla",    type: "Conservador",     weeks: 8,  phases: 4, exercises: 32, used: 22, last: "Mar 2026", author: "Dr. Antonio R.", evidence: "JOSPT 2021" },
  { id: "PRT-TR-10",   name: "Tendinopatía rotuliana · isométrico", region: "Rodilla",   type: "Tendón",          weeks: 10, phases: 4, exercises: 28, used: 19, last: "Feb 2026", author: "Mtra. Paulina G.", evidence: "Rio et al. 2017" },
  { id: "PRT-AT-06",   name: "Esguince tobillo G-II",              region: "Tobillo",    type: "Ligamentoso",     weeks: 6,  phases: 3, exercises: 24, used: 41, last: "Abr 2026", author: "Dr. Rafael C.",   evidence: "BMJ 2018" },
  { id: "PRT-AQ-10",   name: "Tendinopatía aquilea · Alfredson",   region: "Tobillo",    type: "Tendón",          weeks: 10, phases: 4, exercises: 18, used: 14, last: "Mar 2026", author: "Dr. Rafael C.",   evidence: "Alfredson 1998" },
  { id: "PRT-HS-12",   name: "Subacromial · ejercicio progresivo", region: "Hombro",     type: "Manguito",        weeks: 12, phases: 5, exercises: 36, used: 26, last: "Abr 2026", author: "Mtra. Sofía V.",  evidence: "Lewis 2018" },
  { id: "PRT-HC-08",   name: "Capsulitis adhesiva · movilidad",    region: "Hombro",     type: "Articular",       weeks: 8,  phases: 4, exercises: 22, used: 11, last: "Feb 2026", author: "Mtra. Sofía V.",  evidence: "Page et al. 2014" },
  { id: "PRT-LB-10",   name: "Lumbalgia mecánica · McKenzie",      region: "Columna",    type: "Mecánico",        weeks: 10, phases: 4, exercises: 19, used: 33, last: "Abr 2026", author: "Dr. Miguel A.",   evidence: "McKenzie 2003" },
  { id: "PRT-CV-08",   name: "Cervicobraquial · control motor",    region: "Columna",    type: "Neurodinámico",   weeks: 8,  phases: 3, exercises: 21, used: 9,  last: "Mar 2026", author: "Mtra. Renata P.", evidence: "Jull 2008" },
  { id: "PRT-RT-04",   name: "Retorno al deporte · campo",         region: "Performance",type: "Retorno",         weeks: 4,  phases: 3, exercises: 16, used: 28, last: "Abr 2026", author: "Dr. Miguel A.",   evidence: "Ardern 2016" },
];

const PROTOCOL_REGIONS = [
  { name: "Rodilla",     count: 9,  color: "#3FBCD4" },
  { name: "Tobillo",     count: 6,  color: "#7EE3C5" },
  { name: "Hombro",      count: 5,  color: "#5B8AC9" },
  { name: "Columna",     count: 4,  color: "#A78BFA" },
  { name: "Cadera",      count: 2,  color: "#F59E0B" },
  { name: "Performance", count: 1,  color: "#F87171" },
];

/* ─── Pagos / cobros ────────────────────────────────────────────────── */
const PAYMENTS = [
  { id: "COB-3408", patient: "Iván Moreno Sandoval",     concept: "Sesión #18 · LCA",         amount: 850,   method: "Tarjeta · ****4421", status: "Pagado",     date: "Hoy 09:42",  branch: "Centro",  init: "IM" },
  { id: "COB-3407", patient: "Daniela Espinosa Lugo",    concept: "Paquete 10 sesiones",      amount: 7800,  method: "SPEI",                status: "Pagado",     date: "Hoy 09:15",  branch: "Lomas",   init: "DE" },
  { id: "COB-3406", patient: "Carlos Vázquez Hernández", concept: "Sesión #14 · Readap.",     amount: 950,   method: "Tarjeta · ****0192", status: "Pagado",     date: "Hoy 08:55",  branch: "Centro",  init: "CV" },
  { id: "COB-3405", patient: "Pablo Esquivel Arce",      concept: "Valoración inicial",        amount: 1500,  method: "Por cobrar",          status: "Pendiente",  date: "Hoy 08:30",  branch: "Lomas",   init: "PE" },
  { id: "COB-3404", patient: "Mariana Hinojosa Téllez",  concept: "Sesión #08",                amount: 850,   method: "Tarjeta · ****7732", status: "Pagado",     date: "Ayer 17:20", branch: "Carranza",init: "MH" },
  { id: "COB-3403", patient: "Bruno Castañeda Ruíz",     concept: "Reevaluación",              amount: 1100,  method: "Efectivo",            status: "Pagado",     date: "Ayer 15:45", branch: "Lomas",   init: "BC" },
  { id: "COB-3402", patient: "Lucía Treviño Galván",     concept: "Sesión #03",                amount: 850,   method: "Tarjeta · ****1184", status: "Reembolso",  date: "Ayer 12:10", branch: "Centro",  init: "LT" },
  { id: "COB-3401", patient: "José Garibay Solís",       concept: "Paquete 5 sesiones",        amount: 4200,  method: "SPEI",                status: "Pagado",     date: "Ayer 10:05", branch: "Carranza",init: "JG" },
  { id: "COB-3400", patient: "Andrés Lozano Pérez",      concept: "Sesión #02 (mora)",         amount: 540,   method: "Por cobrar",          status: "Vencido",    date: "08 Abr",     branch: "Centro",  init: "AL" },
];

const REVENUE_BY_METHOD_30D = [
  { label: "Tarjeta",     value: 312400, pct: 64, color: "#3FBCD4" },
  { label: "SPEI",        value: 98600,  pct: 20, color: "#5B8AC9" },
  { label: "Efectivo",    value: 48700,  pct: 10, color: "#7EE3C5" },
  { label: "Seguro",      value: 27600,  pct:  6, color: "#A78BFA" },
];

const PAYMENT_KPIS = [
  { label: "Cobrado hoy",          value: "$24,180",  suffix: "MXN", delta: "+18%", up: true,  hint: "vs ayer" },
  { label: "Por cobrar",           value: "$18,420",  suffix: "MXN", delta: "−6%",  up: true,  hint: "12 cuentas" },
  { label: "Vencido > 30 días",    value: "$3,240",   suffix: "MXN", delta: "−2%",  up: true,  hint: "4 cuentas" },
  { label: "Ticket promedio",      value: "$1,128",   suffix: "MXN", delta: "+4%",  up: true,  hint: "Mayo 2026" },
];

/* ─── Facturación CFDI ──────────────────────────────────────────────── */
const CFDI_LIST = [
  { folio: "MW-A-01284", uuid: "9F3A…42E1", rfc: "VAHC9802157Q1", razon: "Carlos Vázquez Hernández",       total: 950,    uso: "D01", forma: "04", metodo: "PUE", date: "Hoy 09:00",   status: "Timbrado",  init: "CV" },
  { folio: "MW-A-01283", uuid: "B12C…8847", rfc: "EILD0103022FA", razon: "Daniela Espinosa Lugo",          total: 7800,   uso: "G03", forma: "03", metodo: "PUE", date: "Hoy 08:55",   status: "Timbrado",  init: "DE" },
  { folio: "MW-A-01282", uuid: "—",         rfc: "MOSI940210XYZ", razon: "Iván Moreno Sandoval",           total: 850,    uso: "D01", forma: "04", metodo: "PUE", date: "Hoy 08:30",   status: "En cola",   init: "IM" },
  { folio: "MW-A-01281", uuid: "C44D…0019", rfc: "GASA000312JK4", razon: "GNP Seguros · Pablo Esquivel",   total: 12400,  uso: "G03", forma: "99", metodo: "PPD", date: "Ayer 18:10",  status: "Timbrado",  init: "GN" },
  { folio: "MW-A-01280", uuid: "D88E…7723", rfc: "HITM910625RR2", razon: "Mariana Hinojosa Téléz",         total: 850,    uso: "D01", forma: "04", metodo: "PUE", date: "Ayer 17:20",  status: "Timbrado",  init: "MH" },
  { folio: "MW-A-01279", uuid: "E22F…1190", rfc: "CARB820407UQ8", razon: "Bruno Castañeda Ruíz",           total: 1100,   uso: "D01", forma: "01", metodo: "PUE", date: "Ayer 15:45",  status: "Cancelado", init: "BC" },
  { folio: "MW-A-01278", uuid: "F77G…3401", rfc: "TEGL031108PA1", razon: "Lucía Treviño Galván",           total: 850,    uso: "D01", forma: "04", metodo: "PUE", date: "Ayer 12:10",  status: "Cancelado", init: "LT" },
  { folio: "MW-A-01277", uuid: "G33H…5588", rfc: "GASJ881109MNB", razon: "José Garibay Solís",             total: 4200,   uso: "D01", forma: "03", metodo: "PUE", date: "Ayer 10:05",  status: "Timbrado",  init: "JG" },
];

const CFDI_KPIS = [
  { label: "Timbradas hoy",     value: "47",       delta: "+9",   up: true,  hint: "vs promedio" },
  { label: "Pendientes",        value: "3",        delta: "−2",   up: true,  hint: "se reintenta auto" },
  { label: "Canceladas (mes)",  value: "8",        delta: "0.6%", up: false, hint: "del total" },
  { label: "Monto facturado",   value: "$498,200", suffix: "MXN", delta: "+15%", up: true, hint: "Mayo 2026" },
];

/* ─── Reportes ──────────────────────────────────────────────────────── */
const REPORTS_NPS = [
  { m: "Nov", v: 64 }, { m: "Dic", v: 67 }, { m: "Ene", v: 68 }, { m: "Feb", v: 70 }, { m: "Mar", v: 71 }, { m: "Abr", v: 72 },
];
const REPORTS_OUTCOMES = [
  { label: "Alta exitosa",      pct: 71, count: 184, color: "#34D399" },
  { label: "Alta con limit.",   pct: 18, count:  47, color: "#3FBCD4" },
  { label: "Abandono",          pct:  8, count:  21, color: "#F59E0B" },
  { label: "Re-lesión 90 días", pct:  3, count:   8, color: "#F87171" },
];
const REPORTS_TOP_DX = [
  { dx: "LCA / meniscos",        n: 92, trend: "up" },
  { dx: "Tendinopatías rodilla", n: 64, trend: "up" },
  { dx: "Lumbalgia mecánica",    n: 58, trend: "flat" },
  { dx: "Subacromial / hombro",  n: 47, trend: "up" },
  { dx: "Tobillo · esguinces",   n: 41, trend: "down" },
  { dx: "Tendinopatía aquilea",  n: 28, trend: "up" },
];
const REPORTS_KPIS = [
  { label: "Pacientes atendidos", value: "1,248", delta: "+18%", up: true,  hint: "YTD" },
  { label: "Sesiones impartidas", value: "9,412", delta: "+22%", up: true,  hint: "YTD" },
  { label: "Tasa de adherencia",  value: "87.4%", delta: "+2.1pts", up: true, hint: "Promedio" },
  { label: "Tiempo a alta",       value: "9.4 sem", delta: "−0.8 sem", up: true, hint: "Mediana" },
];

/* ─── Equipo ────────────────────────────────────────────────────────── */
const TEAM_KPIS = [
  { label: "Miembros activos",      value: "16",      delta: "+2",    up: true,  hint: "Mayo 2026" },
  { label: "Carga prom. sem.",      value: "78%",     delta: "+4 pts", up: true, hint: "saludable" },
  { label: "Sesiones / fisio",      value: "23",      delta: "+1.4",  up: true,  hint: "promedio sem." },
  { label: "Comisiones del mes",    value: "$184,200", suffix: "MXN", delta: "+11%", up: true, hint: "16 fisios" },
];

const FISIO_DETAIL = [
  { name: "Dr. Antonio Rodríguez",   role: "Director clínico",            init: "AR", branches: ["Centro","Lomas"],         load: 92, weekly: 38, monthly: 152, rating: 4.9, since: "Ene 2022", commission: 32400, color: "#3FBCD4" },
  { name: "Dr. Rafael Castañeda",    role: "Miembro inferior",            init: "RC", branches: ["Centro"],                 load: 84, weekly: 32, monthly: 128, rating: 4.8, since: "Mar 2022", commission: 27800, color: "#5B8AC9" },
  { name: "Mtra. Sofía Villarreal",  role: "Hombro y columna",            init: "SV", branches: ["Centro","Carranza"],      load: 71, weekly: 28, monthly: 112, rating: 4.9, since: "Jul 2022", commission: 24100, color: "#7EE3C5" },
  { name: "Dr. Miguel Arteaga",      role: "Performance",                  init: "MA", branches: ["Lomas"],                  load: 65, weekly: 24, monthly:  98, rating: 4.7, since: "Sep 2023", commission: 21300, color: "#A78BFA" },
  { name: "Mtra. Paulina Granados",  role: "Pediátrica deportiva",         init: "PG", branches: ["Lomas"],                  load: 48, weekly: 18, monthly:  72, rating: 4.9, since: "Feb 2024", commission: 16200, color: "#F59E0B" },
  { name: "Mtra. Renata Pacheco",    role: "Cervicobraquial",              init: "RP", branches: ["Carranza"],               load: 62, weekly: 22, monthly:  88, rating: 4.8, since: "Ago 2024", commission: 18900, color: "#34D399" },
];

/* ─── Configuración ─────────────────────────────────────────────────── */
const ORG_INFO = {
  name: "MoveWell SLP S.A. de C.V.",
  rfc: "MWE220314QY8",
  regimen: "601 · General de Personas Morales",
  domicilio: "Av. Carranza 1240, Tequisquiapan, San Luis Potosí, S.L.P. C.P. 78250",
  cer: "30001000000400002434",
  expCer: "13 Mar 2027",
};

const INTEGRATIONS = [
  { name: "WhatsApp Business",   desc: "Confirmaciones, recordatorios, notas SOAP", status: "Conectado",  by: "MoveWell · Centro",  color: "#34D399" },
  { name: "PAC · Finkok (CFDI)", desc: "Timbrado SAT 4.0",                          status: "Conectado",  by: "Cuenta MWE220314",   color: "#34D399" },
  { name: "Stripe",              desc: "Cobros con tarjeta, links de pago",         status: "Conectado",  by: "Cuenta MWE…",        color: "#34D399" },
  { name: "Garmin Connect",      desc: "Datos wearable de pacientes",               status: "Conectado",  by: "OAuth global",       color: "#34D399" },
  { name: "Google Calendar",     desc: "Sincronización agenda fisios",              status: "Parcial",    by: "12 de 16 fisios",    color: "#F59E0B" },
  { name: "QuickBooks",          desc: "Conciliación contable",                     status: "Desconect.", by: "—",                   color: "#5F7B91" },
];

const ROLES = [
  { name: "Administrador",       members: 2,  scope: "Acceso total · todas las sucursales" },
  { name: "Director sucursal",   members: 3,  scope: "Una sucursal · sin facturación global" },
  { name: "Fisio · sénior",      members: 6,  scope: "Pacientes propios · protocolos · agenda" },
  { name: "Fisio · jr",          members: 4,  scope: "Solo sesiones asignadas" },
  { name: "Recepción",           members: 4,  scope: "Agenda · cobros · sin expedientes" },
  { name: "Contabilidad",        members: 1,  scope: "Solo facturación y reportes financieros" },
];

const COMPLIANCE = [
  { l: "NOM-024-SSA3-2010 · Expediente clínico electrónico", v: "Cumplido",   color: "#34D399", note: "Auditoría 03 Abr 2026 · firma electrónica activa" },
  { l: "Aviso de privacidad LFPDPPP",                         v: "Vigente",    color: "#34D399", note: "Última actualización: 12 Ene 2026" },
  { l: "CFDI 4.0 · SAT",                                      v: "Activo",    color: "#34D399", note: "Certificado expira 13 Mar 2027" },
  { l: "Bitácora de accesos · 90 días",                       v: "12,478",    color: "#3FBCD4", note: "Eventos registrados" },
  { l: "Backup cifrado AES-256",                              v: "Diario · 03:00 AM", color: "#3FBCD4", note: "Última copia: hoy 03:14" },
];

Object.assign(window, {
  BRANCHES, CONSOLIDATED, KPIS_CONSOLIDATED, KPIS_BRANCH, REVENUE_6M, BRANCH_PERF, NEXT_DISCHARGES,
  HEATMAP, HEATMAP_DAYS, HEATMAP_HOURS, FISIOS_CARGA,
  AGENDA_DAYS, AGENDA_HOURS, APPTS, APPT_TYPES,
  PATIENT, PAIN_EVA, QUAD_FORCE, WEARABLE, EXERCISES_TODAY, ADHERENCIA_SEMANA, STAFF,
  PATIENTS_LIST, PROTOCOLS, PROTOCOL_REGIONS,
  PAYMENTS, REVENUE_BY_METHOD_30D, PAYMENT_KPIS,
  CFDI_LIST, CFDI_KPIS,
  REPORTS_NPS, REPORTS_OUTCOMES, REPORTS_TOP_DX, REPORTS_KPIS,
  TEAM_KPIS, FISIO_DETAIL,
  ORG_INFO, INTEGRATIONS, ROLES, COMPLIANCE,
});
