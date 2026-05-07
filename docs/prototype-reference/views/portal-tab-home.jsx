/* Portal paciente — Tab Inicio (Home) */

const PortalHomeTab = ({ onOpenAppt, onOpenProtocol, onOpenChat, onOpenPaquetes, onOpenReportarDolor }) => {
  const me = PATIENT_ME;
  const todayDone = TODAY_PROTOCOL.filter(e => e.done).length;
  const todayPct = Math.round((todayDone / TODAY_PROTOCOL.length) * 100);

  return (
    <div className="pb-2">
      {/* Greeting */}
      <div className="px-5 pt-3 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <PAvatar initials={me.initials}/>
          <div>
            <div className="text-[11px] font-mono" style={{ color: PC.muted }}>Hola,</div>
            <div className="text-[16px] font-semibold tracking-tightish" style={{ color: PC.text }}>{me.name.split(" ")[0]}</div>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center relative" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <IconBell size={15} style={{ color: PC.muted }}/>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: PC.bad }}/>
        </button>
      </div>

      {/* Phase + adherence pill */}
      <div className="px-5 pb-3">
        <div className="rounded-xl px-3.5 py-3 flex items-center gap-3" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <div className="relative w-12 h-12 shrink-0">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke={PC.surface2} strokeWidth="3"/>
              <circle cx="18" cy="18" r="15" fill="none" stroke={PC.accent} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${(me.weekNum/me.weekTotal)*94} 94`}/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold font-mono" style={{ color: PC.text }}>
              S{me.weekNum}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: PC.subtle }}>{me.phase}</div>
            <div className="text-[13.5px] font-semibold tracking-tightish leading-tight mt-0.5" style={{ color: PC.text }}>
              Semana {me.weekNum} de {me.weekTotal}
            </div>
            <div className="text-[10.5px] font-mono mt-0.5" style={{ color: PC.muted }}>{me.diagnosis}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9.5px] font-mono uppercase" style={{ color: PC.subtle }}>Adherencia</div>
            <div className="text-[16px] font-semibold tracking-tighter2" style={{ color: PC.good }}>{me.adherence}%</div>
          </div>
        </div>
      </div>

      {/* Next appointment hero */}
      <div className="px-5 pb-3">
        <button onClick={onOpenAppt} className="w-full text-left">
          <div className="rounded-2xl p-4 relative overflow-hidden"
               style={{ background: "linear-gradient(135deg, rgba(63,188,212,0.18), rgba(63,188,212,0.04))", border: `1px solid ${PC.accent}55` }}>
            <div className="flex items-start justify-between mb-1">
              <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#7DD3DF" }}>Tu próxima cita</div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.18)", color: PC.good }}>
                <IconCheck size={9}/> Confirmada
              </span>
            </div>
            <div className="text-[20px] font-semibold tracking-tighter2 leading-tight" style={{ color: PC.text }}>{me.nextAppt.day}</div>
            <div className="text-[14px] font-semibold tracking-tightish font-mono mt-0.5" style={{ color: PC.accent }}>
              {me.nextAppt.time} <span style={{ color: PC.muted, fontWeight: 500 }}>· {me.nextAppt.duration}</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <PAvatar initials="AR" size={26} gradient="linear-gradient(135deg,#3FBCD4,#7DD3DF)"/>
              <div>
                <div className="text-[12px] font-medium" style={{ color: PC.text }}>{me.fisio}</div>
                <div className="text-[10px] font-mono" style={{ color: PC.subtle }}>{me.branch} · {me.nextAppt.type}</div>
              </div>
            </div>
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background: "radial-gradient(circle, rgba(63,188,212,0.25), transparent 70%)" }}/>
          </div>
        </button>
      </div>

      {/* Quick actions row */}
      <div className="px-5 pb-3 grid grid-cols-4 gap-2">
        {[
          { l: "Reportar dolor", icon: IconHeart,    color: PC.bad,    onClick: onOpenReportarDolor },
          { l: "Plan de hoy",    icon: IconActivity, color: PC.accent, onClick: onOpenProtocol },
          { l: "Mensaje",        icon: IconMessage,  color: "#A78BFA", onClick: onOpenChat },
          { l: "Paquetes",       icon: IconPackage,  color: PC.warn,   onClick: onOpenPaquetes },
        ].map((a, i) => (
          <button key={i} onClick={a.onClick}
                  className="rounded-xl py-2.5 flex flex-col items-center gap-1"
                  style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: a.color + "1F" }}>
              <a.icon size={14} style={{ color: a.color }}/>
            </div>
            <span className="text-[10px] font-medium leading-tight text-center" style={{ color: PC.text }}>{a.l}</span>
          </button>
        ))}
      </div>

      {/* Today protocol preview */}
      <PSection title="Tu protocolo de hoy" sub={`${todayDone}/${TODAY_PROTOCOL.length} ejercicios · ~32 min`} action="Ver todo →"/>
      <div className="px-5 pb-3">
        <div className="rounded-xl px-3.5 pt-3 pb-1" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PProgress value={todayPct}/>
            </div>
          </div>
          <div className="text-[11px] font-mono mb-2" style={{ color: PC.muted }}>{todayPct}% completado</div>
          <div className="-mx-1.5">
            {TODAY_PROTOCOL.slice(0, 3).map((e, i) => (
              <div key={i} className="flex items-center gap-2.5 px-1.5 py-2" style={{ borderTop: i === 0 ? "none" : `1px solid ${PC.borderSoft}` }}>
                <div className="w-10 h-10 rounded-lg shrink-0 relative overflow-hidden flex items-center justify-center" style={{ background: e.thumb }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.85)" }}>
                    <IconPlay size={8} style={{ color: "#06101C" }}/>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium tracking-tightish truncate" style={{ color: PC.text, textDecoration: e.done ? "line-through" : "none", opacity: e.done ? 0.5 : 1 }}>{e.name}</div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: PC.subtle }}>{e.set} · {e.duration}</div>
                </div>
                {e.done ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(52,211,153,0.18)" }}>
                    <IconCheck size={10} style={{ color: PC.good }}/>
                  </div>
                ) : (
                  <button className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: PC.accent }}>
                    <IconPlay size={9} style={{ color: "#06101C" }}/>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={onOpenProtocol} className="w-full py-2 mt-1 rounded-md text-[11.5px] font-semibold flex items-center justify-center gap-1.5"
                  style={{ background: PC.accent + "26", color: PC.accent, border: `1px solid ${PC.accent}55` }}>
            Continuar protocolo →
          </button>
        </div>
      </div>

      {/* Adherence chart */}
      <PSection title="Tu semana" sub="5 de 7 días completos" action="+12% vs anterior"/>
      <div className="px-5 pb-3">
        <div className="rounded-xl p-3.5" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
            {ADHERENCIA_7D.map((d, i) => {
              const isToday = i === 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col-reverse" style={{ height: 60 }}>
                    <div className="w-full rounded-t-sm" style={{
                      height: `${Math.max(d.v, 4)}%`,
                      background: d.v === 0 ? PC.surface2 : d.v < 50 ? "#1B3A5C" : isToday ? PC.accent : PC.accent + "B3",
                    }}/>
                  </div>
                  <div className="text-[9.5px] font-mono" style={{ color: isToday ? PC.accent : PC.subtle }}>{d.d}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wearable sync mini */}
      <PSection title="Tu wearable" sub="Apple Watch · Sincronizado hace 2 min"/>
      <div className="px-5 pb-3 grid grid-cols-3 gap-2">
        {[
          { l: "FC reposo", v: "58", u: "bpm",   color: PC.good   },
          { l: "Sueño",     v: "7.4",u: "h",     color: "#A78BFA" },
          { l: "HRV",       v: "62", u: "ms",    color: PC.accent },
        ].map((m, i) => (
          <div key={i} className="rounded-xl px-2.5 py-2" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
            <div className="text-[9px] font-mono uppercase tracking-wider" style={{ color: PC.subtle }}>{m.l}</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[18px] font-semibold tracking-tighter2 font-mono" style={{ color: m.color }}>{m.v}</span>
              <span className="text-[10px] font-mono" style={{ color: PC.muted }}>{m.u}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="h-2"/>
    </div>
  );
};

Object.assign(window, { PortalHomeTab });
