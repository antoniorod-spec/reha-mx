/* Portal paciente — Tab Plan (protocolo + ejercicio detail) */

const ExerciseDetail = ({ ex, onBack }) => (
  <div>
    {/* Hero video */}
    <div className="relative" style={{ height: 260, background: ex.thumb }}>
      <button onClick={onBack} className="absolute top-3 left-4 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur" style={{ background: "rgba(0,0,0,0.45)" }}>
        <IconChevronLeft size={15} style={{ color: "#FFFFFF" }}/>
      </button>
      <div className="absolute top-3 right-4 px-2 py-1 rounded-md text-[10.5px] font-mono backdrop-blur" style={{ background: "rgba(0,0,0,0.55)", color: "#FFFFFF" }}>3 / 5</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.92)" }}>
          <IconPlay size={22} style={{ color: "#06101C" }}/>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
        <div className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>Ejercicio 3 · Pierna der.</div>
        <div className="text-[18px] font-semibold tracking-tighter2 leading-tight" style={{ color: "#FFFFFF" }}>{ex.name}</div>
      </div>
    </div>

    <div className="px-5 pt-4 pb-3 grid grid-cols-3 gap-2">
      {[
        { l: "Series", v: "4",   u: "" },
        { l: "Reps",   v: "6",   u: "" },
        { l: "Tempo",  v: "3-1-3", u: "s" },
      ].map((m, i) => (
        <div key={i} className="rounded-xl px-2.5 py-2.5 text-center" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: PC.subtle }}>{m.l}</div>
          <div className="text-[20px] font-semibold tracking-tighter2 font-mono mt-0.5" style={{ color: PC.text }}>{m.v}<span className="text-[11px] font-normal ml-0.5" style={{ color: PC.muted }}>{m.u}</span></div>
        </div>
      ))}
    </div>

    {/* Set tracker */}
    <div className="px-5 pb-3">
      <div className="text-[12px] font-semibold tracking-tightish mb-2" style={{ color: PC.text }}>Sets</div>
      <div className="space-y-2">
        {[
          { n: 1, done: true,  reps: 6,  rir: 2 },
          { n: 2, done: true,  reps: 6,  rir: 1 },
          { n: 3, done: false, reps: "", rir: "" },
          { n: 4, done: false, reps: "", rir: "" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl px-3 py-2.5 flex items-center gap-3" style={{ background: PC.surface, border: `1px solid ${s.done ? "rgba(52,211,153,0.4)" : PC.border}` }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono"
                 style={{ background: s.done ? "rgba(52,211,153,0.18)" : PC.surface2, color: s.done ? PC.good : PC.subtle }}>
              {s.done ? <IconCheck size={11}/> : s.n}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9.5px] font-mono uppercase" style={{ color: PC.subtle }}>Reps</div>
                <div className="text-[14px] font-semibold font-mono mt-0.5" style={{ color: PC.text }}>{s.reps || "—"}</div>
              </div>
              <div>
                <div className="text-[9.5px] font-mono uppercase" style={{ color: PC.subtle }}>RIR</div>
                <div className="text-[14px] font-semibold font-mono mt-0.5" style={{ color: PC.text }}>{s.rir !== "" ? s.rir : "—"}</div>
              </div>
            </div>
            {!s.done && i === 2 && (
              <button className="px-3 py-1.5 rounded-md text-[11px] font-semibold" style={{ background: PC.accent, color: "#06101C" }}>Iniciar</button>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Notes from fisio */}
    <div className="px-5 pb-3">
      <div className="rounded-xl p-3" style={{ background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.35)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <PAvatar initials="AR" size={22} gradient="linear-gradient(135deg,#3FBCD4,#7DD3DF)"/>
          <div className="text-[11px] font-medium" style={{ color: PC.text }}>Nota del Dr. Antonio</div>
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: "#D6CFF5" }}>
          Si sientes EVA &gt; 4 al final del set, baja a 4 reps. La fase excéntrica debe ser controlada — cuenta 3 segundos al bajar.
        </p>
      </div>
    </div>
  </div>
);

const PortalPlanTab = () => {
  const [openExercise, setOpenExercise] = React.useState(null);
  if (openExercise) return <ExerciseDetail ex={openExercise} onBack={() => setOpenExercise(null)}/>;

  const me = PATIENT_ME;
  const done = TODAY_PROTOCOL.filter(e => e.done).length;
  const total = TODAY_PROTOCOL.length;
  const pct = Math.round(done/total*100);

  return (
    <div className="pb-2">
      <PortalHeader title="Plan de hoy" subtitle={`${me.phase} · Sem. ${me.weekNum}`}
                    right={<button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}><IconCalendar size={14} style={{ color: PC.muted }}/></button>}/>

      {/* Progress hero */}
      <div className="px-5 pb-3">
        <div className="rounded-xl p-4" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-mono uppercase tracking-wider" style={{ color: PC.subtle }}>Progreso</div>
            <div className="text-[11px] font-mono" style={{ color: PC.accent }}>{done}/{total} ejercicios · {pct}%</div>
          </div>
          <PProgress value={pct} height={8}/>
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${PC.borderSoft}` }}>
            <div>
              <div className="text-[9.5px] font-mono uppercase" style={{ color: PC.subtle }}>Tiempo restante</div>
              <div className="text-[15px] font-semibold tracking-tighter2 font-mono mt-0.5" style={{ color: PC.text }}>~18 min</div>
            </div>
            <button className="px-4 py-2.5 rounded-md text-[12.5px] font-semibold flex items-center gap-1.5" style={{ background: PC.accent, color: "#06101C" }}>
              <IconPlay size={11}/> Continuar
            </button>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="px-5 pb-3 space-y-2">
        {TODAY_PROTOCOL.map((e, i) => (
          <button key={i} onClick={() => setOpenExercise(e)}
                  className="w-full text-left rounded-xl flex items-center gap-3 px-2.5 py-2.5 transition-colors"
                  style={{ background: PC.surface, border: `1px solid ${e.done ? "rgba(52,211,153,0.30)" : PC.border}`, opacity: e.done ? 0.85 : 1 }}>
            <div className="w-14 h-14 rounded-lg shrink-0 relative overflow-hidden flex items-center justify-center" style={{ background: e.thumb }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.85)" }}>
                <IconPlay size={11} style={{ color: "#06101C" }}/>
              </div>
              <div className="absolute bottom-1 right-1 px-1 rounded text-[9px] font-mono" style={{ background: "rgba(0,0,0,0.6)", color: "#FFFFFF" }}>{e.duration}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium tracking-tightish leading-snug" style={{ color: PC.text, textDecoration: e.done ? "line-through" : "none" }}>{e.name}</div>
              <div className="text-[10.5px] font-mono mt-0.5" style={{ color: PC.muted }}>{e.set} · {e.side}</div>
            </div>
            {e.done ? (
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(52,211,153,0.18)" }}>
                <IconCheck size={13} style={{ color: PC.good }}/>
              </div>
            ) : (
              <IconChevronRight size={13} style={{ color: PC.subtle }}/>
            )}
          </button>
        ))}
      </div>

      {/* Tips */}
      <div className="px-5 pb-3">
        <div className="rounded-xl p-3.5" style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.35)" }}>
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.18)" }}>
              <IconWarning size={13} style={{ color: PC.warn }}/>
            </div>
            <div>
              <div className="text-[12px] font-semibold tracking-tightish mb-0.5" style={{ color: PC.text }}>Detente si sientes</div>
              <div className="text-[11.5px] leading-relaxed" style={{ color: PC.muted }}>Dolor agudo, EVA &gt; 5/10, sensación de inestabilidad o chasquido. Reporta inmediatamente al chat.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { PortalPlanTab, ExerciseDetail });
