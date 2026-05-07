/* Portal paciente — Tab Nutrición (plan diario + macros + recetas) */

const RECETAS_LIB = [
  { name: "Bowl proteico de quinoa", time: "20 min", kcal: 480, protein: 38, color: "linear-gradient(135deg,#1B3A5C,#3FBCD4)" },
  { name: "Tacos de pescado al sartén", time: "15 min", kcal: 420, protein: 32, color: "linear-gradient(135deg,#5C2C2C,#FB7185)" },
  { name: "Smoothie recovery post-entreno", time: "5 min", kcal: 320, protein: 28, color: "linear-gradient(135deg,#5C4A2C,#F59E0B)" },
  { name: "Ensalada de pollo y aguacate", time: "12 min", kcal: 410, protein: 36, color: "linear-gradient(135deg,#2C5C3C,#34D399)" },
];

const MEAL_BG = {
  "Desayuno": "linear-gradient(135deg,#5C4A2C,#F59E0B)",
  "Snack":    "linear-gradient(135deg,#2C5C3C,#34D399)",
  "Comida":   "linear-gradient(135deg,#1B3A5C,#3FBCD4)",
  "Cena":     "linear-gradient(135deg,#2C2C5C,#7C3AED)",
};

const PortalNutriTab = () => {
  const totalKcal = RECETAS_HOY.reduce((s, r) => s + r.kcal, 0);
  const goalKcal = 2200;
  const totalP   = RECETAS_HOY.reduce((s, r) => s + r.protein, 0);
  const goalP    = 165;
  const totalC   = RECETAS_HOY.reduce((s, r) => s + r.carbs, 0);
  const goalC    = 220;
  const totalF   = RECETAS_HOY.reduce((s, r) => s + r.fat, 0);
  const goalF    = 75;
  const consumed = RECETAS_HOY.filter(r => r.done).reduce((s, r) => s + r.kcal, 0);

  const Macro = ({ l, v, g, color }) => {
    const pct = Math.round(v/g*100);
    return (
      <div className="flex-1">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: PC.subtle }}>{l}</span>
          <span className="text-[10px] font-mono" style={{ color: PC.muted }}>{v}/{g}g</span>
        </div>
        <PProgress value={pct} color={color} height={5}/>
      </div>
    );
  };

  return (
    <div className="pb-2">
      <PortalHeader title="Nutrición" subtitle="Plan personalizado · Lic. María L."
                    right={<button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}><IconCamera size={14} style={{ color: PC.muted }}/></button>}/>

      {/* Calorie ring */}
      <div className="px-5 pb-3">
        <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke={PC.surface2} strokeWidth="3"/>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke={PC.warn} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${(consumed/goalKcal)*97} 97`}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[18px] font-semibold tracking-tighter2 font-mono" style={{ color: PC.text }}>{consumed}</div>
              <div className="text-[9px] font-mono" style={{ color: PC.subtle }}>de {goalKcal} kcal</div>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            <Macro l="Proteína" v={totalP} g={goalP} color={PC.bad}/>
            <Macro l="Carbs"    v={totalC} g={goalC} color={PC.warn}/>
            <Macro l="Grasas"   v={totalF} g={goalF} color="#A78BFA"/>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { l: "Restantes",  v: `${goalKcal - consumed}`, u: "kcal", c: PC.good },
            { l: "Consumido",  v: `${consumed}`, u: "kcal",  c: PC.warn },
            { l: "H. agua",    v: "1.4", u: "/2.5L",          c: PC.accent },
          ].map((m, i) => (
            <div key={i} className="rounded-xl px-2.5 py-2 text-center" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
              <div className="text-[9px] font-mono uppercase" style={{ color: PC.subtle }}>{m.l}</div>
              <div className="text-[15px] font-semibold tracking-tighter2 font-mono mt-0.5" style={{ color: m.c }}>{m.v}<span className="text-[9px] font-normal ml-0.5" style={{ color: PC.muted }}>{m.u}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Meals */}
      <PSection title="Tu plan de hoy" sub="5 comidas · 2,020 kcal"/>
      <div className="px-5 pb-3 space-y-2">
        {RECETAS_HOY.map((r, i) => (
          <div key={i} className="rounded-xl flex items-stretch overflow-hidden"
               style={{ background: PC.surface, border: `1px solid ${r.done ? "rgba(52,211,153,0.30)" : PC.border}`, opacity: r.done ? 0.85 : 1 }}>
            <div className="w-16 flex flex-col items-center justify-center" style={{ background: MEAL_BG[r.meal] }}>
              <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.85)" }}>{r.meal}</span>
              <span className="text-[12px] font-semibold font-mono mt-0.5" style={{ color: "#FFFFFF" }}>{r.time}</span>
            </div>
            <div className="flex-1 px-3.5 py-2.5 flex items-center gap-3 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium tracking-tightish leading-snug" style={{ color: PC.text, textDecoration: r.done ? "line-through" : "none" }}>{r.title}</div>
                <div className="text-[10.5px] font-mono mt-0.5 flex flex-wrap gap-x-2.5 gap-y-0.5" style={{ color: PC.muted }}>
                  <span><span style={{ color: PC.warn }}>{r.kcal}</span> kcal</span>
                  <span><span style={{ color: PC.bad }}>{r.protein}p</span> · <span style={{ color: PC.warn }}>{r.carbs}c</span> · <span style={{ color: "#A78BFA" }}>{r.fat}f</span></span>
                </div>
              </div>
              {r.done ? (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(52,211,153,0.18)" }}>
                  <IconCheck size={13} style={{ color: PC.good }}/>
                </div>
              ) : (
                <button className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: PC.accent + "26", border: `1px solid ${PC.accent}55` }}>
                  <IconPlus size={12} style={{ color: PC.accent }}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recipe library */}
      <PSection title="Recetas para ti" sub="Adaptadas a tu fase de readaptación" action="Ver todas →"/>
      <div className="px-5 pb-3 flex gap-2.5 overflow-x-auto -mx-5 px-5 pb-1" style={{ scrollbarWidth: "none" }}>
        {RECETAS_LIB.map((r, i) => (
          <div key={i} className="rounded-xl overflow-hidden shrink-0" style={{ width: 168, background: PC.surface, border: `1px solid ${PC.border}` }}>
            <div className="h-24 relative" style={{ background: r.color }}>
              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9.5px] font-mono backdrop-blur" style={{ background: "rgba(0,0,0,0.5)", color: "#FFFFFF" }}>{r.time}</div>
            </div>
            <div className="p-2.5">
              <div className="text-[12px] font-medium tracking-tightish leading-snug" style={{ color: PC.text, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.name}</div>
              <div className="text-[10px] font-mono mt-1 flex items-center gap-2" style={{ color: PC.muted }}>
                <span><IconFlame size={9} className="inline mr-0.5"/> {r.kcal}</span>
                <span style={{ color: PC.bad }}>{r.protein}g P</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="px-5 pb-3">
        <div className="rounded-xl p-3.5" style={{ background: "rgba(63,188,212,0.10)", border: "1px solid rgba(63,188,212,0.35)" }}>
          <div className="flex items-center gap-2 mb-1">
            <IconUtensils size={13} style={{ color: PC.accent }}/>
            <div className="text-[12px] font-semibold tracking-tightish" style={{ color: PC.text }}>Tip de hoy</div>
          </div>
          <p className="text-[11.5px] leading-relaxed" style={{ color: PC.muted }}>
            Tu fase de fortalecimiento requiere ~165g proteína/día. Toma 25-30g cada 3-4 horas para optimizar síntesis muscular.
          </p>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { PortalNutriTab });
