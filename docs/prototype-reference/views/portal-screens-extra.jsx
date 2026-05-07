/* Portal paciente — Pantallas extra (stack-based modal-style screens) */

/* ─── 1. Detalle de cita ─── */
const ScreenCitaDetail = ({ onBack, appt }) => {
  const a = appt || {
    title: "Sesión 12 de 24",
    fisio: "Dr. Antonio R.",
    fisioColor: "#3FBCD4",
    branch: "Reha Centro",
    date: "Martes 5 de mayo",
    time: "11:00",
    duration: "60 min",
    type: "Fortalecimiento",
    confirmed: true,
    addr: "Av. Reforma 247, Col. Tequisquiapan, SLP",
    notes: "Trae shorts y agua. Si traes wearable, llégalo cargado.",
  };
  return (
    <div className="flex flex-col h-full" style={{ background: PC.bg }}>
      <PortalHeader title="Detalle de cita" subtitle={a.type} onBack={onBack}/>
      <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ scrollbarWidth: "none" }}>
        {/* Hero */}
        <div className="rounded-2xl px-5 py-5 mb-3"
             style={{ background: "linear-gradient(135deg, rgba(63,188,212,0.15), rgba(6,16,28,0.0))",
                      border: `1px solid ${PC.border}` }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono"
                  style={{ background: a.confirmed ? "rgba(52,211,153,0.15)" : "rgba(245,158,11,0.15)",
                           color: a.confirmed ? PC.good : PC.warn }}>
              {a.confirmed ? "✓ Confirmada" : "⏳ Pendiente"}
            </span>
            <span className="text-[10.5px] font-mono" style={{ color: PC.subtle }}>{a.duration}</span>
          </div>
          <div className="text-[22px] font-semibold tracking-tighter2 mb-1" style={{ color: PC.text }}>{a.date}</div>
          <div className="text-[28px] font-mono font-bold" style={{ color: PC.accent }}>{a.time}</div>
          <div className="text-[12.5px] mt-2" style={{ color: PC.muted }}>{a.title}</div>
        </div>

        {/* Fisio */}
        <PCard className="px-4 py-3 mb-3 flex items-center gap-3">
          <PAvatar initials="AR" size={42} gradient={`linear-gradient(135deg,#1B3A5C,${a.fisioColor})`}/>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-medium" style={{ color: PC.text }}>{a.fisio}</div>
            <div className="text-[10.5px] font-mono mt-0.5" style={{ color: PC.subtle }}>Tu fisio asignado</div>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(52,211,153,0.15)" }}>
            <IconWhatsApp size={16} style={{ color: PC.good }}/>
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: PC.surface2 }}>
            <IconPhone size={14} style={{ color: PC.muted }}/>
          </button>
        </PCard>

        {/* Ubicación */}
        <PCard className="overflow-hidden mb-3">
          <div className="h-32 relative" style={{ background: "linear-gradient(135deg,#0D1F30,#15293C)" }}>
            <svg viewBox="0 0 200 80" className="w-full h-full opacity-50">
              <path d="M0 40 Q 50 20, 100 50 T 200 35" stroke={PC.accent} strokeWidth="1" fill="none"/>
              <path d="M0 60 L 200 60" stroke={PC.border} strokeDasharray="4 4"/>
              <path d="M30 0 L 30 80 M 70 0 L 70 80 M 130 0 L 130 80 M 170 0 L 170 80" stroke={PC.border} strokeDasharray="4 4"/>
              <circle cx="100" cy="45" r="4" fill={PC.accent}/>
              <circle cx="100" cy="45" r="10" fill={PC.accent} opacity="0.2"/>
            </svg>
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-[10px] font-mono"
                 style={{ background: PC.surface, color: PC.muted, border: `1px solid ${PC.border}` }}>
              📍 4.2 km · 12 min
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[13px] font-medium" style={{ color: PC.text }}>{a.branch}</div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: PC.subtle }}>{a.addr}</div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 h-9 rounded-lg text-[11.5px] font-medium"
                      style={{ background: PC.surface2, color: PC.text, border: `1px solid ${PC.border}` }}>
                Cómo llegar
              </button>
              <button className="flex-1 h-9 rounded-lg text-[11.5px] font-medium"
                      style={{ background: PC.surface2, color: PC.text, border: `1px solid ${PC.border}` }}>
                Llamar a sucursal
              </button>
            </div>
          </div>
        </PCard>

        {/* Notas */}
        <PCard className="px-4 py-3 mb-3">
          <div className="text-[10.5px] font-mono uppercase tracking-wider mb-1.5" style={{ color: PC.subtle }}>Notas para tu sesión</div>
          <div className="text-[12.5px] leading-relaxed" style={{ color: PC.text }}>{a.notes}</div>
        </PCard>

        {/* Recordatorios */}
        <PCard className="px-4 py-3 mb-3">
          <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: PC.subtle }}>Recordatorios automáticos</div>
          {[
            { i: "📱", l: "WhatsApp 24h antes",  ok: true },
            { i: "🔔", l: "Push 2h antes",       ok: true },
            { i: "📧", l: "Email confirmación",  ok: false },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2.5 py-1.5">
              <div className="text-[14px]">{r.i}</div>
              <div className="flex-1 text-[12px]" style={{ color: PC.text }}>{r.l}</div>
              <div className="w-9 h-5 rounded-full relative" style={{ background: r.ok ? PC.accent : PC.surface2 }}>
                <div className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
                     style={{ left: r.ok ? 18 : 2, background: r.ok ? "#06101C" : PC.muted }}/>
              </div>
            </div>
          ))}
        </PCard>

        {/* Acciones */}
        <div className="space-y-2">
          <button className="w-full h-11 rounded-xl text-[13px] font-semibold"
                  style={{ background: PC.accent, color: "#06101C" }}>
            Reagendar cita
          </button>
          <button className="w-full h-11 rounded-xl text-[13px] font-medium"
                  style={{ background: "transparent", color: PC.bad, border: `1px solid rgba(251,113,133,0.3)` }}>
            Cancelar cita
          </button>
        </div>

        <div className="text-[10.5px] font-mono mt-3 text-center" style={{ color: PC.subtle }}>
          Cancela con 4h+ de anticipación sin penalización.
        </div>
      </div>
    </div>
  );
};

/* ─── 2. Detalle de ejercicio ─── */
const ScreenEjercicioDetail = ({ onBack, ex }) => {
  const e = ex || TODAY_PROTOCOL[2]; // Curl nórdico excéntrico
  const [setIdx, setSetIdx] = React.useState(0);
  const [rir, setRir] = React.useState(2);
  const [completed, setCompleted] = React.useState([false, false, false, false]);
  const totalSets = parseInt(e.set.split("×")[0]) || 4;
  const reps = e.set.split("×")[1]?.trim() || "6";

  const completeSet = () => {
    setCompleted(prev => { const n = [...prev]; n[setIdx] = true; return n; });
    if (setIdx < totalSets - 1) setSetIdx(setIdx + 1);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: PC.bg }}>
      {/* Video hero */}
      <div className="relative" style={{ height: 240, background: e.thumb }}>
        <button onClick={onBack} className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
          <IconChevronLeft size={15} className="text-white"/>
        </button>
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.95)" }}>
            <IconPlay size={26} style={{ color: "#06101C" }}/>
          </button>
        </div>
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-[10px] font-mono text-white"
             style={{ background: "rgba(0,0,0,0.6)" }}>0:00 / 1:32</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-5" style={{ scrollbarWidth: "none" }}>
        <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: PC.accent }}>Ejercicio 3 de 5</div>
        <div className="text-[20px] font-semibold tracking-tighter2 mb-1" style={{ color: PC.text }}>{e.name}</div>
        <div className="text-[12px] font-mono" style={{ color: PC.muted }}>{e.set} · {e.side} · {e.duration}</div>

        {/* Set tracker */}
        <div className="grid grid-cols-4 gap-2 mt-4 mb-3">
          {Array.from({ length: totalSets }).map((_, i) => {
            const done = completed[i];
            const active = i === setIdx && !done;
            return (
              <div key={i} className="rounded-xl px-2 py-3 text-center"
                   style={{
                     background: done ? "rgba(52,211,153,0.12)" : (active ? "rgba(63,188,212,0.12)" : PC.surface),
                     border: `1px solid ${done ? PC.good : (active ? PC.accent : PC.border)}`,
                   }}>
                <div className="text-[9.5px] font-mono uppercase" style={{ color: done ? PC.good : (active ? PC.accent : PC.subtle) }}>
                  {done ? "✓" : `Set ${i+1}`}
                </div>
                <div className="text-[20px] font-bold tracking-tighter2 mt-0.5" style={{ color: done ? PC.good : (active ? PC.accent : PC.muted) }}>{reps}</div>
                <div className="text-[9px] font-mono" style={{ color: PC.subtle }}>reps</div>
              </div>
            );
          })}
        </div>

        {/* RIR slider */}
        <PCard className="px-4 py-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[12.5px] font-medium" style={{ color: PC.text }}>RIR de este set</div>
              <div className="text-[10.5px] font-mono" style={{ color: PC.subtle }}>Reps que sentías que aún podías hacer</div>
            </div>
            <div className="text-[24px] font-bold font-mono" style={{ color: PC.accent }}>{rir}</div>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((n) => {
              const active = rir === n;
              return (
                <button key={n} onClick={() => setRir(n)}
                        className="flex-1 h-10 rounded-lg text-[12px] font-mono font-bold transition-colors"
                        style={{
                          background: active ? PC.accent : PC.surface2,
                          color: active ? "#06101C" : PC.muted,
                        }}>{n}</button>
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5 text-[9.5px] font-mono" style={{ color: PC.subtle }}>
            <span>Al fallo</span><span>Muy fácil</span>
          </div>
        </PCard>

        {/* Tips */}
        <PCard className="px-4 py-3 mb-3">
          <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: PC.subtle }}>Cómo hacerlo bien</div>
          <ul className="space-y-1.5">
            {[
              "Mantén el core activo durante todo el descenso",
              "Baja en 4 segundos, sube ayudándote con las manos",
              "Si sientes calambre, detente y avísame por chat",
            ].map((tip, i) => (
              <li key={i} className="flex gap-2 text-[12px] leading-relaxed" style={{ color: PC.muted }}>
                <span style={{ color: PC.accent }}>•</span><span>{tip}</span>
              </li>
            ))}
          </ul>
        </PCard>

        {/* Acciones */}
        <button onClick={completeSet}
                className="w-full h-12 rounded-xl text-[14px] font-semibold tracking-tightish"
                style={{ background: PC.accent, color: "#06101C" }}>
          Completar set {setIdx + 1} →
        </button>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <button className="h-10 rounded-xl text-[11.5px] font-medium"
                  style={{ background: PC.surface, color: PC.muted, border: `1px solid ${PC.border}` }}>
            ⏸ Reportar molestia
          </button>
          <button className="h-10 rounded-xl text-[11.5px] font-medium"
                  style={{ background: PC.surface, color: PC.muted, border: `1px solid ${PC.border}` }}>
            ⏭ Saltar ejercicio
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── 3. Reportar dolor / PROMs ─── */
const ScreenPROMs = ({ onBack }) => {
  const [eva, setEva] = React.useState(3);
  const [stage, setStage] = React.useState("eva"); // eva | knee | done
  const [tegner, setTegner] = React.useState(4);
  const knee = [
    { q: "¿Tu rodilla se siente estable al caminar?",  a: ["Siempre", "Casi siempre", "A veces", "Pocas veces", "Nunca"], v: 3 },
    { q: "¿Has tenido sensación de bloqueo o trabazón?", a: ["No",       "1 vez",       "2-3 veces", "Frecuente",   "Constante"], v: 0 },
    { q: "¿Puedes subir escaleras sin dolor?",         a: ["Sí",       "Casi sin dolor","Algo de dolor","Mucho dolor", "Imposible"], v: 1 },
    { q: "¿Sientes inflamación al final del día?",     a: ["Nada",     "Muy leve",    "Moderada",   "Notable",     "Mucha"], v: 1 },
  ];
  const [responses, setResponses] = React.useState(knee.map(() => null));

  const evaColor = eva <= 3 ? PC.good : (eva <= 6 ? PC.warn : PC.bad);
  const evaLabel = eva === 0 ? "Sin dolor" : eva <= 3 ? "Leve" : eva <= 6 ? "Moderado" : "Severo";

  return (
    <div className="flex flex-col h-full" style={{ background: PC.bg }}>
      <PortalHeader title="¿Cómo te sientes hoy?" subtitle="Evaluación rápida · 2 min" onBack={onBack}/>

      <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ scrollbarWidth: "none" }}>
        {stage === "eva" && (
          <div>
            <div className="rounded-2xl px-5 py-6 text-center mb-3"
                 style={{ background: "linear-gradient(135deg, rgba(63,188,212,0.08), rgba(6,16,28,0))", border: `1px solid ${PC.border}` }}>
              <div className="text-[10.5px] font-mono uppercase tracking-wider mb-1" style={{ color: PC.subtle }}>Escala EVA · Dolor</div>
              <div className="text-[14px]" style={{ color: PC.muted }}>En este momento, tu dolor es:</div>
              <div className="text-[72px] font-bold tracking-tighter2 mt-2" style={{ color: evaColor }}>{eva}</div>
              <div className="text-[14px] font-medium" style={{ color: evaColor }}>{evaLabel}</div>
              <div className="text-[11px] font-mono mt-1" style={{ color: PC.subtle }}>(0 = nada, 10 = peor imaginable)</div>

              {/* Slider */}
              <div className="mt-5 px-2">
                <input type="range" min="0" max="10" value={eva} onChange={(e) => setEva(parseInt(e.target.value))}
                       className="w-full" style={{ accentColor: evaColor }}/>
                <div className="flex justify-between text-[9.5px] font-mono mt-1" style={{ color: PC.subtle }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <span key={n} style={{ color: n === eva ? evaColor : PC.subtle }}>{n}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Localización */}
            <PCard className="px-4 py-3 mb-3">
              <div className="text-[12px] font-medium mb-2" style={{ color: PC.text }}>¿Dónde duele más?</div>
              <div className="flex flex-wrap gap-2">
                {["Rodilla der.", "Rodilla izq.", "Cadera", "Lumbar", "Cuádriceps", "Isquios", "Pantorrilla", "Otro"].map((p) => (
                  <button key={p}
                          className="px-3 h-8 rounded-full text-[11.5px]"
                          style={{ background: PC.surface2, color: PC.muted, border: `1px solid ${PC.border}` }}>
                    {p}
                  </button>
                ))}
              </div>
            </PCard>

            <PCard className="px-4 py-3 mb-3">
              <div className="text-[12px] font-medium mb-2" style={{ color: PC.text }}>¿Cuándo aparece?</div>
              <div className="flex flex-wrap gap-2">
                {["Reposo", "Caminando", "Subiendo escaleras", "Después del ejercicio", "En la noche"].map((p) => (
                  <button key={p}
                          className="px-3 h-8 rounded-full text-[11.5px]"
                          style={{ background: PC.surface2, color: PC.muted, border: `1px solid ${PC.border}` }}>
                    {p}
                  </button>
                ))}
              </div>
            </PCard>

            <button onClick={() => setStage("knee")}
                    className="w-full h-12 rounded-xl text-[14px] font-semibold"
                    style={{ background: PC.accent, color: "#06101C" }}>
              Continuar →
            </button>
          </div>
        )}

        {stage === "knee" && (
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: PC.accent }}>KOOS · Función de rodilla</div>
            <div className="text-[18px] font-semibold tracking-tighter2 mb-1" style={{ color: PC.text }}>4 preguntas rápidas</div>
            <div className="text-[12px] mb-4" style={{ color: PC.muted }}>Sin presión, contesta lo que sientes hoy.</div>

            <div className="space-y-3">
              {knee.map((q, qi) => (
                <PCard key={qi} className="px-4 py-3">
                  <div className="text-[12.5px] font-medium mb-3" style={{ color: PC.text }}>{qi + 1}. {q.q}</div>
                  <div className="space-y-1.5">
                    {q.a.map((opt, ai) => {
                      const sel = responses[qi] === ai;
                      return (
                        <button key={ai}
                                onClick={() => setResponses(prev => { const n = [...prev]; n[qi] = ai; return n; })}
                                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors"
                                style={{
                                  background: sel ? "rgba(63,188,212,0.1)" : PC.surface2,
                                  border: `1px solid ${sel ? PC.accent : "transparent"}`,
                                }}>
                          <div className="w-4 h-4 rounded-full flex items-center justify-center"
                               style={{ background: sel ? PC.accent : "transparent", border: `1.5px solid ${sel ? PC.accent : PC.border}` }}>
                            {sel && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#06101C" }}/>}
                          </div>
                          <span className="text-[12px]" style={{ color: sel ? PC.text : PC.muted }}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </PCard>
              ))}

              {/* Tegner activity */}
              <PCard className="px-4 py-3">
                <div className="text-[12.5px] font-medium mb-1" style={{ color: PC.text }}>Tegner · Nivel de actividad</div>
                <div className="text-[10.5px] font-mono mb-3" style={{ color: PC.subtle }}>0 = sedentario, 10 = deporte profesional</div>
                <div className="flex items-baseline gap-2 mb-3">
                  <div className="text-[44px] font-bold tracking-tighter2" style={{ color: PC.accent }}>{tegner}</div>
                  <div className="text-[12px]" style={{ color: PC.muted }}>{
                    ["Sedentario", "Caminata ligera", "Bicicleta plana", "Trabajo manual", "Trote ligero", "Trote regular", "Tenis recreativo", "Fútbol amateur", "Fútbol competitivo", "Élite recreacional", "Profesional"][tegner]
                  }</div>
                </div>
                <input type="range" min="0" max="10" value={tegner} onChange={(e) => setTegner(parseInt(e.target.value))}
                       className="w-full" style={{ accentColor: PC.accent }}/>
              </PCard>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setStage("eva")}
                      className="h-12 rounded-xl text-[13px] font-medium"
                      style={{ background: PC.surface, color: PC.muted, border: `1px solid ${PC.border}` }}>
                ← Anterior
              </button>
              <button onClick={() => setStage("done")}
                      className="h-12 rounded-xl text-[13px] font-semibold"
                      style={{ background: PC.accent, color: "#06101C" }}>
                Enviar evaluación
              </button>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                 style={{ background: "linear-gradient(135deg,#34D399,#1B9F70)" }}>
              <IconCheck size={36} className="text-white" strokeWidth={3}/>
            </div>
            <div className="text-[22px] font-semibold tracking-tighter2 mb-2" style={{ color: PC.text }}>¡Gracias, Carlos!</div>
            <div className="text-[13px] leading-relaxed mb-6 px-4" style={{ color: PC.muted }}>
              Tus respuestas se enviaron al expediente. Dr. Antonio R. las revisa antes de tu próxima sesión.
            </div>
            <PCard className="w-full px-4 py-4 text-left mb-4">
              <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: PC.subtle }}>Tu progreso</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono" style={{ color: PC.muted }}>EVA hoy</div>
                  <div className="text-[20px] font-bold" style={{ color: evaColor }}>{eva}/10</div>
                </div>
                <div style={{ color: PC.good }}>↘</div>
                <div>
                  <div className="text-[11px] font-mono" style={{ color: PC.muted }}>Hace 4 semanas</div>
                  <div className="text-[20px] font-bold" style={{ color: PC.subtle }}>5/10</div>
                </div>
              </div>
              <div className="text-[11px] font-mono mt-3" style={{ color: PC.good }}>
                Bajaste {5 - eva} puntos en 4 semanas. ¡Vas excelente!
              </div>
            </PCard>
            <button onClick={onBack}
                    className="w-full h-12 rounded-xl text-[14px] font-semibold"
                    style={{ background: PC.accent, color: "#06101C" }}>
              Listo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── 4. Pago / factura ─── */
const ScreenPago = ({ onBack }) => {
  const [stage, setStage] = React.useState("checkout"); // checkout | processing | success
  const [method, setMethod] = React.useState("card");
  const [needFactura, setNeedFactura] = React.useState(false);

  return (
    <div className="flex flex-col h-full" style={{ background: PC.bg }}>
      <PortalHeader title="Pago seguro" subtitle="Pack 16 sesiones" onBack={onBack}/>

      <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ scrollbarWidth: "none" }}>
        {stage === "checkout" && (
          <div>
            {/* Resumen */}
            <PCard className="px-4 py-4 mb-3">
              <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: PC.subtle }}>Resumen de tu compra</div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[20px]"
                     style={{ background: "linear-gradient(135deg,rgba(63,188,212,0.2),rgba(63,188,212,0.05))" }}>📦</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold tracking-tightish" style={{ color: PC.text }}>Pack 16 sesiones</div>
                  <div className="text-[11px] font-mono mt-0.5" style={{ color: PC.subtle }}>Vigencia 5 meses · Plan nutri incluido</div>
                </div>
              </div>
              <div className="border-t mt-3 pt-3 space-y-1.5" style={{ borderColor: PC.borderSoft }}>
                <Row k="Subtotal"   v="$13,600.00"/>
                <Row k="Descuento"  v="-$2,400.00" highlight={PC.good}/>
                <Row k="IVA (16%)"  v="incluido" subtle/>
                <div className="border-t mt-2 pt-2" style={{ borderColor: PC.borderSoft }}>
                  <Row k="Total"      v="$11,200.00 MXN" big/>
                </div>
              </div>
            </PCard>

            {/* Método de pago */}
            <div className="text-[11px] font-mono uppercase tracking-wider mb-2 mt-4" style={{ color: PC.subtle }}>Método de pago</div>
            <div className="space-y-2">
              {[
                { id: "card",   l: "Tarjeta •••• 4321",       s: "Visa · Vence 09/27", icon: "💳" },
                { id: "newcard",l: "Otra tarjeta",              s: "Crédito o débito",   icon: "➕" },
                { id: "spei",   l: "SPEI / Transferencia",      s: "Confirmación 24h",   icon: "🏦" },
                { id: "msi",    l: "12 MSI sin tarjeta nueva",  s: "$933.33 / mes",      icon: "📅" },
              ].map((m) => {
                const sel = method === m.id;
                return (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                          className="w-full px-4 py-3 rounded-xl flex items-center gap-3"
                          style={{ background: sel ? "rgba(63,188,212,0.08)" : PC.surface, border: `1px solid ${sel ? PC.accent : PC.border}` }}>
                    <div className="text-[18px]">{m.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="text-[13px] font-medium" style={{ color: PC.text }}>{m.l}</div>
                      <div className="text-[10.5px] font-mono mt-0.5" style={{ color: PC.subtle }}>{m.s}</div>
                    </div>
                    <div className="w-4 h-4 rounded-full" style={{ background: sel ? PC.accent : "transparent", border: `1.5px solid ${sel ? PC.accent : PC.border}` }}/>
                  </button>
                );
              })}
            </div>

            {/* Factura */}
            <button onClick={() => setNeedFactura(!needFactura)}
                    className="w-full mt-4 px-4 py-3 rounded-xl flex items-center gap-3"
                    style={{ background: PC.surface, border: `1px solid ${needFactura ? PC.accent : PC.border}` }}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                   style={{ background: needFactura ? PC.accent : "transparent", border: `1.5px solid ${needFactura ? PC.accent : PC.border}` }}>
                {needFactura && <IconCheck size={11} style={{ color: "#06101C" }} strokeWidth={3}/>}
              </div>
              <div className="flex-1 text-left">
                <div className="text-[12.5px] font-medium" style={{ color: PC.text }}>Necesito factura CFDI</div>
                <div className="text-[10.5px] font-mono mt-0.5" style={{ color: PC.subtle }}>Sat 4.0 · timbrado en 2 min</div>
              </div>
            </button>

            {needFactura && (
              <PCard className="px-4 py-3 mt-2 space-y-3">
                <FormField label="RFC" value="" onChange={() => {}} placeholder="Ej. VAVC970812ABC"/>
                <FormField label="Razón social" value="" onChange={() => {}} placeholder="Persona física o moral"/>
                <FormSelect label="Uso CFDI" value="D01" onChange={() => {}}
                            options={["D01 · Honorarios médicos", "G03 · Gastos en general", "P01 · Por definir"]}/>
                <FormSelect label="Régimen fiscal" value="612" onChange={() => {}}
                            options={["612 · PF Actividad empresarial", "626 · RESICO", "601 · PM General"]}/>
              </PCard>
            )}

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-3 mt-5 mb-3 text-[10px] font-mono" style={{ color: PC.subtle }}>
              <span>🔒 256-bit SSL</span>
              <span>·</span>
              <span>💳 Stripe</span>
              <span>·</span>
              <span>🇲🇽 SAT 4.0</span>
            </div>

            <button onClick={() => { setStage("processing"); setTimeout(() => setStage("success"), 1500); }}
                    className="w-full h-12 rounded-xl text-[14px] font-semibold"
                    style={{ background: PC.accent, color: "#06101C" }}>
              Pagar $11,200.00
            </button>
          </div>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full mb-5 relative" style={{ background: PC.surface }}>
              <div className="absolute inset-0 rounded-full" style={{
                border: `3px solid ${PC.surface2}`,
                borderTopColor: PC.accent,
                animation: "spin 1s linear infinite",
              }}/>
            </div>
            <div className="text-[16px] font-semibold mb-1" style={{ color: PC.text }}>Procesando pago…</div>
            <div className="text-[12px] font-mono" style={{ color: PC.muted }}>Esto toma 2-3 segundos</div>
          </div>
        )}

        {stage === "success" && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                 style={{ background: "linear-gradient(135deg,#34D399,#1B9F70)" }}>
              <IconCheck size={36} className="text-white" strokeWidth={3}/>
            </div>
            <div className="text-[22px] font-semibold tracking-tighter2 mb-2" style={{ color: PC.text }}>¡Pago exitoso!</div>
            <div className="text-[13px] mb-6" style={{ color: PC.muted }}>16 sesiones añadidas a tu cuenta</div>

            <PCard className="px-4 py-4 mb-3 text-left">
              <Row k="Folio"        v="REH-2026-04382" mono/>
              <Row k="Monto"        v="$11,200.00 MXN" mono/>
              <Row k="Método"       v="Visa •••• 4321" mono/>
              <Row k="Fecha"        v="04 May 2026, 11:24" mono/>
              <Row k="CFDI"         v="A1F2E883-4..." mono link="Descargar"/>
            </PCard>

            <div className="grid grid-cols-2 gap-2">
              <button className="h-11 rounded-xl text-[12px] font-medium"
                      style={{ background: PC.surface, color: PC.muted, border: `1px solid ${PC.border}` }}>
                📄 Descargar recibo
              </button>
              <button onClick={onBack} className="h-11 rounded-xl text-[12px] font-semibold"
                      style={{ background: PC.accent, color: "#06101C" }}>
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ k, v, big, mono, subtle, highlight, link }) => (
  <div className="flex items-baseline justify-between py-1">
    <span className={`${big ? "text-[14px] font-medium" : "text-[12px]"}`} style={{ color: PC.muted }}>{k}</span>
    <div className="flex items-center gap-2">
      <span className={`${big ? "text-[18px] font-bold tracking-tighter2" : (mono ? "text-[12px] font-mono" : "text-[12px]")}`}
            style={{ color: subtle ? PC.subtle : (highlight || PC.text) }}>{v}</span>
      {link && <button className="text-[10.5px] font-mono" style={{ color: PC.accent }}>{link}</button>}
    </div>
  </div>
);

/* ─── 5. Notificaciones ─── */
const ScreenNotificaciones = ({ onBack }) => {
  const ICON_MAP = {
    calendar: IconCalendar, check: IconCheck, message: IconMessage,
    trophy: IconActivity, heart: IconHeart,
  };
  const groups = [
    { l: "Hoy",     items: NOTIFICACIONES_PORTAL.slice(0, 3) },
    { l: "Esta semana", items: NOTIFICACIONES_PORTAL.slice(3) },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: PC.bg }}>
      <PortalHeader title="Notificaciones" subtitle="5 recientes" onBack={onBack}
                    right={<button className="text-[11px] font-mono" style={{ color: PC.accent }}>Marcar leídas</button>}/>

      <div className="flex-1 overflow-y-auto pb-5" style={{ scrollbarWidth: "none" }}>
        {groups.map((g, gi) => (
          <div key={gi}>
            <div className="px-5 pt-3 pb-1.5 text-[10.5px] font-mono uppercase tracking-wider" style={{ color: PC.subtle }}>{g.l}</div>
            {g.items.map((n, i) => {
              const Icon = ICON_MAP[n.icon] || IconBell;
              return (
                <div key={i} className="px-5 py-3 flex items-start gap-3" style={{ borderTop: `1px solid ${PC.borderSoft}` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                       style={{ background: `${n.color}25` }}>
                    <Icon size={15} style={{ color: n.color }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium" style={{ color: PC.text }}>{n.title}</div>
                    <div className="text-[11.5px] mt-0.5 leading-relaxed" style={{ color: PC.muted }}>{n.sub}</div>
                    <div className="text-[10px] font-mono mt-1" style={{ color: PC.subtle }}>{n.time}</div>
                  </div>
                  {i === 0 && gi === 0 && <div className="w-2 h-2 rounded-full mt-2" style={{ background: PC.accent }}/>}
                </div>
              );
            })}
          </div>
        ))}

        {/* Empty zone footer */}
        <div className="px-5 pt-6 pb-2 text-center text-[10.5px] font-mono" style={{ color: PC.subtle }}>
          No hay más notificaciones.
        </div>

        {/* Settings link */}
        <div className="px-5 pt-3">
          <button className="w-full px-4 py-3 rounded-xl flex items-center gap-3"
                  style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
            <IconSettings size={15} style={{ color: PC.muted }}/>
            <span className="text-[12.5px] flex-1 text-left" style={{ color: PC.text }}>Configurar notificaciones</span>
            <IconChevronRight size={13} style={{ color: PC.subtle }}/>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── 6. Documentos clínicos ─── */
const ScreenDocumentos = ({ onBack }) => {
  const docs = [
    { tipo: "consent", title: "Consentimiento informado de tratamiento",  date: "04 May 2026", size: "1.2 MB", signed: true,  emoji: "✍️" },
    { tipo: "consent", title: "Aviso de privacidad LFPDPPP",              date: "04 May 2026", size: "0.8 MB", signed: true,  emoji: "🔒" },
    { tipo: "rec",     title: "Receta · Fisioterapia post-LCA",           date: "04 May 2026", size: "0.4 MB", signed: false, emoji: "💊" },
    { tipo: "report",  title: "Resumen clínico inicial",                  date: "04 May 2026", size: "2.1 MB", signed: false, emoji: "📋" },
    { tipo: "imagen",  title: "RM Rodilla derecha (preoperatoria)",       date: "10 Mar 2026", size: "8.3 MB", signed: false, emoji: "🩻" },
    { tipo: "report",  title: "Reporte quirúrgico · LCA",                 date: "12 Mar 2026", size: "1.8 MB", signed: false, emoji: "🏥" },
    { tipo: "cfdi",    title: "CFDI · Pack 16 sesiones",                  date: "04 May 2026", size: "0.3 MB", signed: false, emoji: "🧾" },
  ];
  const [filter, setFilter] = React.useState("todos");
  const filtered = filter === "todos" ? docs : docs.filter(d => d.tipo === filter);

  return (
    <div className="flex flex-col h-full" style={{ background: PC.bg }}>
      <PortalHeader title="Mis documentos" subtitle={`${docs.length} archivos · ${docs.filter(d => d.signed).length} firmados`} onBack={onBack}/>

      {/* Filter chips */}
      <div className="px-5 pt-2 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2 no-wrap">
          {[
            { id: "todos",   l: "Todos" },
            { id: "consent", l: "Consentimientos" },
            { id: "rec",     l: "Recetas" },
            { id: "report",  l: "Reportes" },
            { id: "imagen",  l: "Imágenes" },
            { id: "cfdi",    l: "Facturas" },
          ].map((c) => {
            const sel = filter === c.id;
            return (
              <button key={c.id} onClick={() => setFilter(c.id)}
                      className="px-3 h-8 rounded-full text-[11.5px] font-medium shrink-0"
                      style={{
                        background: sel ? PC.accent : PC.surface,
                        color: sel ? "#06101C" : PC.muted,
                        border: `1px solid ${sel ? PC.accent : PC.border}`,
                      }}>{c.l}</button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ scrollbarWidth: "none" }}>
        <div className="space-y-2">
          {filtered.map((d, i) => (
            <PCard key={i} className="px-3 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[20px] shrink-0"
                   style={{ background: PC.surface2 }}>{d.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium tracking-tightish leading-snug" style={{ color: PC.text }}>{d.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono" style={{ color: PC.subtle }}>{d.date}</span>
                  <span className="text-[10px] font-mono" style={{ color: PC.subtle }}>·</span>
                  <span className="text-[10px] font-mono" style={{ color: PC.subtle }}>{d.size}</span>
                  {d.signed && (
                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(52,211,153,0.15)", color: PC.good }}>✓ FIRMADO</span>
                  )}
                </div>
              </div>
              <button className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: PC.surface2, color: PC.muted }}>
                <IconChevronRight size={13}/>
              </button>
            </PCard>
          ))}
        </div>

        <div className="text-[10.5px] font-mono mt-4 text-center" style={{ color: PC.subtle }}>
          Tus documentos se conservan 5 años · NOM-024-SSA3-2012
        </div>
      </div>
    </div>
  );
};

/* ─── 7. Perfil completo ─── */
const ScreenPerfil = ({ onBack }) => {
  const [edit, setEdit] = React.useState(false);
  return (
    <div className="flex flex-col h-full" style={{ background: PC.bg }}>
      <PortalHeader title="Mi perfil" subtitle="Datos personales y clínicos" onBack={onBack}
                    right={
                      <button onClick={() => setEdit(!edit)} className="text-[11.5px] font-mono"
                              style={{ color: PC.accent }}>{edit ? "Guardar" : "Editar"}</button>
                    }/>

      <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ scrollbarWidth: "none" }}>
        {/* Avatar + nombre */}
        <div className="flex flex-col items-center pt-2 pb-4">
          <PAvatar initials="CV" size={80}/>
          {edit && <button className="text-[11px] font-mono mt-2" style={{ color: PC.accent }}>Cambiar foto</button>}
          <div className="text-[18px] font-semibold mt-3" style={{ color: PC.text }}>Carlos Vázquez Ruiz</div>
          <div className="text-[11.5px] font-mono mt-0.5" style={{ color: PC.subtle }}>Paciente · ID 18293 · Reha desde Mar 2026</div>
        </div>

        <Section title="Datos personales">
          <KV k="Fecha de nacimiento" v="12 Ago 1997 · 28 años" edit={edit}/>
          <KV k="Género"              v="Masculino" edit={edit}/>
          <KV k="CURP"                v="VARC970812HSPSXR04" edit={edit}/>
          <KV k="Teléfono"            v="+52 444 188 9023" edit={edit}/>
          <KV k="Email"               v="carlos.vazquez@gmail.com" edit={edit}/>
        </Section>

        <Section title="Dirección">
          <KV k="Calle y número" v="Av. Reforma 247" edit={edit}/>
          <KV k="Colonia y CP"   v="Tequisquiapan · 78230" edit={edit}/>
          <KV k="Ciudad"         v="San Luis Potosí, SLP" edit={edit}/>
        </Section>

        <Section title="Datos clínicos">
          <KV k="Diagnóstico"     v="LCA reconstruido (tendón rotuliano)" lock/>
          <KV k="Cirugía"         v="12 Mar 2026 · Pierna derecha" lock/>
          <KV k="Cirujano"        v="Dr. M. Salazar (ortopedista)" lock/>
          <KV k="Fisio asignado"  v="Dr. Antonio R." lock/>
          <KV k="Sucursal"        v="Reha Centro" lock/>
        </Section>

        <Section title="Salud">
          <KV k="Condiciones"     v="Ninguna" edit={edit}/>
          <KV k="Alergias"        v="Penicilina" edit={edit}/>
          <KV k="Medicamentos"    v="Naproxeno 250mg PRN" edit={edit}/>
          <KV k="Tipo de sangre"  v="O+" edit={edit}/>
        </Section>

        <Section title="Contacto de emergencia">
          <KV k="Nombre"     v="Ana Vázquez" edit={edit}/>
          <KV k="Parentesco" v="Hermana" edit={edit}/>
          <KV k="Teléfono"   v="+52 444 122 8801" edit={edit}/>
        </Section>

        <Section title="Datos fiscales (CFDI)">
          <KV k="RFC"            v="VARC970812AB1" edit={edit}/>
          <KV k="Razón social"   v="Carlos Vázquez Ruiz" edit={edit}/>
          <KV k="Régimen fiscal" v="612 · PF Actividad empresarial" edit={edit}/>
          <KV k="Uso CFDI"       v="D01 · Honorarios médicos" edit={edit}/>
        </Section>

        <Section title="Privacidad">
          <KV k="Aviso LFPDPPP firmado"    v="04 May 2026 · 11:23" lock/>
          <KV k="Uso de imágenes"          v="Autorizado" edit={edit}/>
          <KV k="Investigación anonimizada" v="Autorizado" edit={edit}/>
          <KV k="Marketing"                v="No autorizado" edit={edit}/>
        </Section>

        <div className="mt-5 space-y-2">
          <button className="w-full h-11 rounded-xl text-[12.5px] font-medium"
                  style={{ background: PC.surface, color: PC.text, border: `1px solid ${PC.border}` }}>
            🔐 Cambiar contraseña
          </button>
          <button className="w-full h-11 rounded-xl text-[12.5px] font-medium"
                  style={{ background: PC.surface, color: PC.text, border: `1px solid ${PC.border}` }}>
            📥 Solicitar mis datos (LFPDPPP)
          </button>
          <button className="w-full h-11 rounded-xl text-[12.5px] font-medium"
                  style={{ background: "transparent", color: PC.bad, border: `1px solid rgba(251,113,133,0.3)` }}>
            Cerrar sesión
          </button>
          <button className="w-full h-9 text-[10.5px] font-mono"
                  style={{ color: PC.subtle }}>
            Eliminar mi cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mt-3">
    <div className="text-[10.5px] font-mono uppercase tracking-wider mb-1.5 px-1" style={{ color: PC.subtle }}>{title}</div>
    <PCard className="overflow-hidden">{children}</PCard>
  </div>
);

const KV = ({ k, v, edit, lock }) => (
  <div className="px-4 py-2.5 flex items-center justify-between gap-3" style={{ borderTop: `1px solid ${PC.borderSoft}` }}>
    <div className="text-[11.5px] font-mono shrink-0" style={{ color: PC.subtle }}>{k}</div>
    <div className="flex items-center gap-1.5 min-w-0 text-right">
      <div className="text-[12px] truncate" style={{ color: PC.text }}>{v}</div>
      {edit && !lock && <IconChevronRight size={12} style={{ color: PC.subtle }}/>}
      {lock && <span className="text-[10px] font-mono" style={{ color: PC.subtle }}>🔒</span>}
    </div>
  </div>
);

Object.assign(window, {
  ScreenCitaDetail, ScreenEjercicioDetail, ScreenPROMs, ScreenPago,
  ScreenNotificaciones, ScreenDocumentos, ScreenPerfil,
});
