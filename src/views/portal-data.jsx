/* Portal paciente — datos mock + tabs */

const PATIENT_ME = {
  name: "Carlos Vázquez",
  initials: "CV",
  branch: "Reha Centro",
  fisio: "Dr. Antonio R.",
  fisioColor: "#3FBCD4",
  diagnosis: "LCA reconstruido (tendón rotuliano)",
  surgeryDate: "12 Mar 2026",
  weekNum: 8,
  weekTotal: 12,
  phase: "Fase 3 · Fortalecimiento",
  adherence: 71,
  nextAppt: { day: "Martes 5 May", time: "11:00", duration: "60 min", type: "Sesión 12 de 24" },
};

const TODAY_PROTOCOL = [
  { name: "Sentadilla unipodal asistida",     set: "3 × 12",    side: "Pierna der.", thumb: "linear-gradient(135deg,#1e3a5f,#3FBCD4)", done: true,  duration: "8 min" },
  { name: "Step-up con caja 30cm",            set: "3 × 10",    side: "Bilateral",   thumb: "linear-gradient(135deg,#2C2C5C,#7C3AED)", done: true,  duration: "6 min" },
  { name: "Curl nórdico excéntrico",          set: "4 × 6",     side: "Bilateral",   thumb: "linear-gradient(135deg,#5C2C2C,#F87171)", done: false, duration: "9 min" },
  { name: "Plancha lateral con elevación",    set: "3 × 30s",   side: "Ambos lados", thumb: "linear-gradient(135deg,#2C5C3C,#34D399)", done: false, duration: "5 min" },
  { name: "Estiramiento isquiotibiales",      set: "3 × 45s",   side: "Bilateral",   thumb: "linear-gradient(135deg,#5C4A2C,#F59E0B)", done: false, duration: "4 min" },
];

const ADHERENCIA_7D = [
  { d: "L", v: 100 }, { d: "M", v: 80 }, { d: "M", v: 100 }, { d: "J", v: 60 }, { d: "V", v: 40 }, { d: "S", v: 0 }, { d: "D", v: 0 },
];

const PROGRESO_EVA = [
  { w: "S1", v: 7.5 }, { w: "S2", v: 7.0 }, { w: "S3", v: 6.5 }, { w: "S4", v: 5.5 },
  { w: "S5", v: 5.0 }, { w: "S6", v: 4.0 }, { w: "S7", v: 3.0 }, { w: "S8", v: 2.5 },
];

const PROGRESO_FUERZA = [
  { w: "S1", izq: 100, der: 35 }, { w: "S2", izq: 100, der: 42 }, { w: "S3", izq: 100, der: 50 },
  { w: "S4", izq: 100, der: 58 }, { w: "S5", izq: 100, der: 64 }, { w: "S6", izq: 100, der: 71 },
  { w: "S7", izq: 100, der: 78 }, { w: "S8", izq: 100, der: 82 },
];

const PROGRESO_ROM = [
  { w: "S1", v: 90 }, { w: "S2", v: 100 }, { w: "S3", v: 110 }, { w: "S4", v: 118 },
  { w: "S5", v: 125 }, { w: "S6", v: 130 }, { w: "S7", v: 135 }, { w: "S8", v: 138 },
];

const PACIENTE_PAQUETES = [
  { name: "Plan Premium 24 sesiones", remaining: 12, total: 24, expires: "30 Sep 2026", color: "#3FBCD4", desc: "Incluye nutrición, wearable y readaptación" },
  { name: "Bonus Crioterapia 5 sesiones", remaining: 3, total: 5, expires: "15 Jun 2026", color: "#A78BFA", desc: "Recuperación post-entreno" },
];

const PAQUETES_TIENDA = [
  { name: "Sesión individual",    sessions: 1,  price: 850,  per: 850,  popular: false, color: "#9BB3C4", features: ["60 min con tu fisio", "Ejercicios HEP", "Nota SOAP"] },
  { name: "Pack 8 sesiones",      sessions: 8,  price: 6240, per: 780,  popular: false, color: "#3FBCD4", features: ["Ahorras $560", "Vigencia 3 meses", "Reagendamiento gratis"] },
  { name: "Pack 16 sesiones",     sessions: 16, price: 11200, per: 700, popular: true,  color: "#3FBCD4", features: ["Ahorras $2,400", "Vigencia 5 meses", "Plan nutricional", "1 valoración postural"] },
  { name: "Plan Premium 24",      sessions: 24, price: 14400, per: 600, popular: false, color: "#A78BFA", features: ["Ahorras $6,000", "Vigencia 8 meses", "Wearable incluido", "Plan nutricional", "App + chat ilimitado"] },
];

const RECETAS_HOY = [
  { meal: "Desayuno",  time: "08:00", title: "Avena con frutos rojos y proteína",       kcal: 420, protein: 32, carbs: 48, fat: 12, done: true },
  { meal: "Snack",     time: "10:30", title: "Yogur griego natural + 20g almendras",    kcal: 280, protein: 18, carbs: 14, fat: 18, done: true },
  { meal: "Comida",    time: "14:00", title: "Bowl de pollo, arroz integral y aguacate",kcal: 620, protein: 45, carbs: 62, fat: 22, done: false },
  { meal: "Snack",     time: "17:00", title: "Manzana + crema de cacahuate (15g)",      kcal: 220, protein: 6,  carbs: 28, fat: 11, done: false },
  { meal: "Cena",      time: "20:30", title: "Salmón al horno con verduras asadas",     kcal: 480, protein: 42, carbs: 22, fat: 24, done: false },
];

const CHAT_MSGS = [
  { from: "fisio", t: "10:42", text: "Hola Carlos, ¿cómo amaneciste de la rodilla? ¿Algún dolor con el step-up de ayer?" },
  { from: "yo",    t: "10:48", text: "Buen día Dr. Antonio. La rodilla mejor, EVA 3/10. El step-up sí me costó la última serie." },
  { from: "fisio", t: "10:50", text: "Perfecto. Para hoy bajamos a 8 reps en la última serie y agregamos isométrico de cuádriceps al final. ¿OK?" },
  { from: "fisio", t: "10:50", text: "Te dejo video en el protocolo." , attachment: { type: "video", title: "Isométrico cuádriceps · 4×30s" } },
  { from: "yo",    t: "11:02", text: "Va, gracias 🙏" },
];

const NOTIFICACIONES_PORTAL = [
  { icon: "calendar", color: "#3FBCD4", title: "Cita confirmada",            sub: "Martes 5 May · 11:00 con Dr. Antonio R.",      time: "Hace 2h" },
  { icon: "check",    color: "#34D399", title: "Pago aplicado",              sub: "$6,240 · Pack 8 sesiones · Tarjeta •••4321",   time: "Ayer"     },
  { icon: "message",  color: "#A78BFA", title: "Nuevo mensaje del fisio",    sub: "\"Ajustamos la carga del step-up\"",            time: "Ayer"     },
  { icon: "trophy",   color: "#F59E0B", title: "¡Lograste tu meta semanal!", sub: "5 días de adherencia esta semana",              time: "2 may"    },
  { icon: "heart",    color: "#FB7185", title: "Recordatorio: reporta dolor",sub: "EVA del día post-protocolo",                    time: "1 may"    },
];

Object.assign(window, {
  PATIENT_ME, TODAY_PROTOCOL, ADHERENCIA_7D, PROGRESO_EVA, PROGRESO_FUERZA, PROGRESO_ROM,
  PACIENTE_PAQUETES, PAQUETES_TIENDA, RECETAS_HOY, CHAT_MSGS, NOTIFICACIONES_PORTAL,
});
