/* Portal paciente — Tab Yo (perfil + expediente + paquetes + chat) */

const MiniLineChart = ({ data, getY, color, height = 80, format = (v) => v }) => {
  const max = Math.max(...data.map(getY)) * 1.05;
  const min = Math.min(...data.map(getY)) * 0.95;
  const range = max - min || 1;
  const w = 280;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((getY(d) - min) / range) * height;
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const areaPath = path + ` L${w} ${height} L0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace('#','')})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="2"/>
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3.5 : 2} fill={color}/>
      ))}
    </svg>
  );
};

/* Mi expediente */
const ExpedienteSubview = ({ onBack }) => {
  const me = PATIENT_ME;
  return (
    <div className="pb-2">
      <PortalHeader title="Mi expediente" subtitle="Historial clínico" onBack={onBack}/>

      {/* Diagnóstico */}
      <div className="px-5 pb-3">
        <div className="rounded-xl p-3.5" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <div className="text-[10.5px] font-mono uppercase tracking-wider mb-1" style={{ color: PC.subtle }}>Diagnóstico</div>
          <div className="text-[15px] font-semibold tracking-tightish leading-snug" style={{ color: PC.text }}>{me.diagnosis}</div>
          <div className="grid grid-cols-2 gap-3 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${PC.borderSoft}` }}>
            <div>
              <div className="text-[9px] font-mono uppercase" style={{ color: PC.subtle }}>Cirugía</div>
              <div className="text-[12px] font-medium font-mono mt-0.5" style={{ color: PC.text }}>{me.surgeryDate}</div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase" style={{ color: PC.subtle }}>Fase actual</div>
              <div className="text-[12px] font-medium mt-0.5" style={{ color: PC.accent }}>{me.phase}</div>
            </div>
          </div>
        </div>
      </div>

      {/* EVA chart */}
      <PSection title="Dolor (EVA)" sub="Reportado por ti diariamente" action="Reportar →"/>
      <div className="px-5 pb-3">
        <div className="rounded-xl p-3.5" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[24px] font-semibold tracking-tighter2 font-mono" style={{ color: PC.good }}>2.5</span>
              <span className="text-[11px] font-mono ml-1" style={{ color: PC.muted }}>/10 hoy</span>
            </div>
            <span className="text-[11px] font-mono" style={{ color: PC.good }}>↓ -5.0 desde inicio</span>
          </div>
          <MiniLineChart data={PROGRESO_EVA} getY={d => d.v} color={PC.good} height={70}/>
          <div className="flex items-center justify-between mt-1.5 text-[9.5px] font-mono" style={{ color: PC.subtle }}>
            <span>S1 (inicio)</span><span>S8 (hoy)</span>
          </div>
        </div>
      </div>

      {/* Fuerza chart */}
      <PSection title="Simetría de fuerza" sub="Pierna der. vs izq."/>
      <div className="px-5 pb-3">
        <div className="rounded-xl p-3.5" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[24px] font-semibold tracking-tighter2 font-mono" style={{ color: PC.accent }}>82%</span>
              <span className="text-[11px] font-mono ml-1" style={{ color: PC.muted }}>vs pierna sana</span>
            </div>
            <span className="text-[11px] font-mono" style={{ color: PC.accent }}>+47 pts</span>
          </div>
          <MiniLineChart data={PROGRESO_FUERZA} getY={d => d.der} color={PC.accent} height={70}/>
          <div className="flex items-center justify-between mt-1.5 text-[9.5px] font-mono" style={{ color: PC.subtle }}>
            <span>Meta clínica · 90%</span><span>S8</span>
          </div>
        </div>
      </div>

      {/* ROM */}
      <PSection title="Rango de movimiento (ROM)" sub="Flexión rodilla der."/>
      <div className="px-5 pb-3">
        <div className="rounded-xl p-3.5" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[24px] font-semibold tracking-tighter2 font-mono" style={{ color: "#A78BFA" }}>138°</span>
              <span className="text-[11px] font-mono ml-1" style={{ color: PC.muted }}>flexión</span>
            </div>
            <span className="text-[11px] font-mono" style={{ color: "#A78BFA" }}>+48° desde S1</span>
          </div>
          <MiniLineChart data={PROGRESO_ROM} getY={d => d.v} color="#A78BFA" height={70}/>
        </div>
      </div>

      {/* Documentos */}
      <PSection title="Documentos" sub="Estudios y reportes"/>
      <div className="px-5 pb-3 space-y-2">
        {[
          { icon: IconFile,    name: "Resonancia MRI - Rodilla der.", date: "8 Mar 2026", size: "12.4 MB" },
          { icon: IconFile,    name: "Reporte quirúrgico Dr. Méndez", date: "12 Mar 2026", size: "248 KB" },
          { icon: IconReceipt, name: "Plan de readaptación 12 sem.", date: "20 Mar 2026", size: "1.2 MB" },
        ].map((d, i) => (
          <div key={i} className="rounded-xl px-3 py-2.5 flex items-center gap-3" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: PC.surface2, border: `1px solid ${PC.border}` }}>
              <d.icon size={13} style={{ color: PC.accent }}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium tracking-tightish truncate" style={{ color: PC.text }}>{d.name}</div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: PC.subtle }}>{d.date} · {d.size}</div>
            </div>
            <button className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ color: PC.muted }}>
              <IconDownload size={13}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Paquetes */
const PaquetesSubview = ({ onBack }) => {
  const [view, setView] = React.useState("mine"); // mine | shop
  return (
    <div className="pb-2">
      <PortalHeader title="Mis paquetes" subtitle={view === "shop" ? "Tienda" : "Activos"} onBack={onBack}/>

      <div className="px-5 pb-3">
        <div className="grid grid-cols-2 gap-1 p-0.5 rounded-md" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          {[{ v: "mine", l: "Mis paquetes" }, { v: "shop", l: "Comprar más" }].map(o => {
            const active = view === o.v;
            return (
              <button key={o.v} onClick={() => setView(o.v)}
                      className="py-2 rounded text-[11.5px] font-medium"
                      style={{ background: active ? PC.surface2 : "transparent", color: active ? PC.text : PC.muted }}>
                {o.l}
              </button>
            );
          })}
        </div>
      </div>

      {view === "mine" && (
        <>
          <div className="px-5 pb-3 space-y-2.5">
            {PACIENTE_PAQUETES.map((p, i) => {
              const pct = Math.round((p.remaining/p.total)*100);
              return (
                <div key={i} className="rounded-xl p-3.5 relative overflow-hidden"
                     style={{ background: `linear-gradient(135deg, ${p.color}1F, ${p.color}05)`, border: `1px solid ${p.color}55` }}>
                  <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: p.color }}>Activo</div>
                  <div className="text-[15px] font-semibold tracking-tightish mt-1" style={{ color: PC.text }}>{p.name}</div>
                  <div className="text-[10.5px] font-mono mt-0.5 mb-2.5" style={{ color: PC.muted }}>{p.desc}</div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[28px] font-semibold tracking-tighter2 font-mono" style={{ color: PC.text }}>{p.remaining}</span>
                    <span className="text-[12px] font-mono" style={{ color: PC.muted }}>/ {p.total} sesiones restantes</span>
                  </div>
                  <PProgress value={pct} color={p.color} height={6}/>
                  <div className="flex items-center justify-between mt-2.5 text-[10px] font-mono" style={{ color: PC.subtle }}>
                    <span>Vigencia: {p.expires}</span>
                    <span style={{ color: p.color }}>{pct}% restante</span>
                  </div>
                </div>
              );
            })}
          </div>

          <PSection title="Próximo cargo" sub="Renovación automática desactivada"/>
          <div className="px-5 pb-3">
            <div className="rounded-xl px-3.5 py-3 flex items-center gap-3" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: PC.surface2, border: `1px solid ${PC.border}` }}>
                <IconCard size={13} style={{ color: PC.muted }}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium" style={{ color: PC.text }}>Visa •••• 4321</div>
                <div className="text-[10px] font-mono mt-0.5" style={{ color: PC.subtle }}>Sin cargos programados</div>
              </div>
              <button className="text-[11px] font-mono" style={{ color: PC.accent }}>Cambiar</button>
            </div>
          </div>
        </>
      )}

      {view === "shop" && (
        <>
          <div className="px-5 pb-3 space-y-2.5">
            {PAQUETES_TIENDA.map((p, i) => (
              <div key={i} className="rounded-xl p-4 relative"
                   style={{ background: PC.surface, border: `1px solid ${p.popular ? p.color : PC.border}` }}>
                {p.popular && (
                  <div className="absolute -top-2 left-3 px-2 py-0.5 rounded text-[9.5px] font-mono uppercase tracking-wider" style={{ background: p.color, color: "#06101C" }}>Más elegido</div>
                )}
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <div className="text-[14px] font-semibold tracking-tightish" style={{ color: PC.text }}>{p.name}</div>
                    <div className="text-[10.5px] font-mono mt-0.5" style={{ color: PC.subtle }}>{p.sessions} {p.sessions === 1 ? "sesión" : "sesiones"} · ${p.per}/sesión</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[20px] font-semibold tracking-tighter2 font-mono" style={{ color: p.color }}>${p.price.toLocaleString()}</div>
                    <div className="text-[10px] font-mono" style={{ color: PC.subtle }}>MXN</div>
                  </div>
                </div>
                <div className="space-y-1 mt-2.5 mb-3 pt-2.5" style={{ borderTop: `1px solid ${PC.borderSoft}` }}>
                  {p.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2 text-[11px]" style={{ color: PC.muted }}>
                      <IconCheck size={10} style={{ color: PC.good }}/> {f}
                    </div>
                  ))}
                </div>
                <button className="w-full py-2.5 rounded-md text-[12px] font-semibold"
                        style={{ background: p.popular ? p.color : PC.surface2, color: p.popular ? "#06101C" : PC.text, border: `1px solid ${p.popular ? "transparent" : PC.border}` }}>
                  Elegir paquete
                </button>
              </div>
            ))}
          </div>
          <div className="px-5 pb-3">
            <div className="text-[10.5px] font-mono text-center" style={{ color: PC.subtle }}>
              Todos los paquetes incluyen factura CFDI 4.0 · Sin renovación automática
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* Chat con fisio */
const ChatSubview = ({ onBack }) => (
  <div className="flex flex-col" style={{ height: "100%" }}>
    <PortalHeader title="Dr. Antonio R." subtitle="● En línea · Tu fisio" onBack={onBack}
                  right={<button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}><IconPhone size={13} style={{ color: PC.muted }}/></button>}/>

    <div className="flex-1 px-4 pb-2 overflow-y-auto space-y-2.5">
      <div className="text-center text-[10px] font-mono py-2" style={{ color: PC.subtle }}>Hoy · Lun 4 May</div>
      {CHAT_MSGS.map((m, i) => {
        const mine = m.from === "yo";
        return (
          <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"} gap-2`}>
            {!mine && i > 0 && CHAT_MSGS[i-1].from !== m.from && (
              <PAvatar initials="AR" size={26} gradient="linear-gradient(135deg,#3FBCD4,#7DD3DF)"/>
            )}
            {!mine && i > 0 && CHAT_MSGS[i-1].from === m.from && <div style={{ width: 26 }}/>}
            {!mine && i === 0 && <PAvatar initials="AR" size={26} gradient="linear-gradient(135deg,#3FBCD4,#7DD3DF)"/>}
            <div className="max-w-[75%]">
              <div className="rounded-2xl px-3 py-2"
                   style={{
                     background: mine ? PC.accent : PC.surface,
                     color: mine ? "#06101C" : PC.text,
                     border: mine ? "none" : `1px solid ${PC.border}`,
                     borderBottomRightRadius: mine ? 4 : 16,
                     borderBottomLeftRadius:  mine ? 16 : 4,
                   }}>
                <div className="text-[12.5px] leading-snug">{m.text}</div>
                {m.attachment && (
                  <div className="mt-2 rounded-lg p-2 flex items-center gap-2" style={{ background: "rgba(0,0,0,0.20)" }}>
                    <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                      <IconPlay size={11} style={{ color: "#FFFFFF" }}/>
                    </div>
                    <div className="text-[10.5px] font-medium" style={{ color: mine ? "#06101C" : PC.text }}>{m.attachment.title}</div>
                  </div>
                )}
              </div>
              <div className={`text-[9.5px] font-mono mt-0.5 ${mine ? "text-right" : ""}`} style={{ color: PC.subtle }}>{m.t}</div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Composer */}
    <div className="px-3 pb-3 pt-2" style={{ background: PC.bg, borderTop: `1px solid ${PC.border}` }}>
      <div className="flex items-center gap-1.5 rounded-full px-1.5 py-1.5" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
        <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: PC.muted }}><IconPaperclip size={14}/></button>
        <input placeholder="Mensaje..." className="flex-1 bg-transparent outline-none text-[13px] px-1" style={{ color: PC.text }}/>
        <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: PC.muted }}><IconMic size={13}/></button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: PC.accent, color: "#06101C" }}><IconSend size={12}/></button>
      </div>
    </div>
  </div>
);

/* Hub principal del tab Yo */
const PortalYoTab = () => {
  const [sub, setSub] = React.useState(null);

  if (sub === "expediente") return <ExpedienteSubview onBack={() => setSub(null)}/>;
  if (sub === "paquetes")   return <PaquetesSubview   onBack={() => setSub(null)}/>;
  if (sub === "chat")       return <ChatSubview       onBack={() => setSub(null)}/>;

  const me = PATIENT_ME;
  return (
    <div className="pb-2">
      {/* Profile hero */}
      <div className="px-5 pt-4 pb-4 flex items-center gap-3">
        <PAvatar initials={me.initials} size={56}/>
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-semibold tracking-tighter2 truncate" style={{ color: PC.text }}>{me.name}</div>
          <div className="text-[11px] font-mono mt-0.5" style={{ color: PC.muted }}>Paciente · Reha desde Mar 2026</div>
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <IconSettings size={13} style={{ color: PC.muted }}/>
        </button>
      </div>

      {/* Stats compact */}
      <div className="px-5 pb-3 grid grid-cols-3 gap-2">
        {[
          { l: "Sesiones", v: "11", c: PC.accent },
          { l: "Adherencia", v: "71%", c: PC.good },
          { l: "Logros", v: "8", c: PC.warn },
        ].map((s, i) => (
          <div key={i} className="rounded-xl px-2.5 py-2.5 text-center" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
            <div className="text-[18px] font-semibold tracking-tighter2 font-mono" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[9.5px] font-mono uppercase mt-0.5" style={{ color: PC.subtle }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="px-5 pb-3 space-y-2">
        {[
          { id: "expediente", icon: IconFile,    color: PC.accent, l: "Mi expediente",  s: "Diagnóstico, gráficas, documentos" },
          { id: "paquetes",   icon: IconPackage, color: PC.warn,   l: "Mis paquetes",   s: "12 sesiones restantes · Plan Premium" },
          { id: "chat",       icon: IconMessage, color: "#A78BFA", l: "Chat con tu fisio", s: "Dr. Antonio R. · 1 mensaje nuevo" },
          { id: "wearable",   icon: IconWatch,   color: PC.good,   l: "Apple Watch",     s: "Sincronizado · HRV, sueño, FC" },
          { id: "facturas",   icon: IconReceipt, color: PC.bad,    l: "Mis facturas",    s: "5 CFDI · Total: $14,400 MXN" },
          { id: "ajustes",    icon: IconSettings,color: PC.muted,  l: "Privacidad y datos", s: "NOM-024 · Compartir con médico tratante" },
        ].map((m, i) => (
          <button key={i} onClick={() => m.id !== "ajustes" && m.id !== "wearable" && m.id !== "facturas" && setSub(m.id)}
                  className="w-full text-left rounded-xl px-3 py-3 flex items-center gap-3"
                  style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: m.color + "1F" }}>
              <m.icon size={14} style={{ color: m.color }}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium tracking-tightish truncate" style={{ color: PC.text }}>{m.l}</div>
              <div className="text-[10.5px] font-mono mt-0.5 truncate" style={{ color: PC.subtle }}>{m.s}</div>
            </div>
            <IconChevronRight size={13} style={{ color: PC.subtle }}/>
          </button>
        ))}
      </div>

      {/* Logros */}
      <PSection title="Tus logros" sub="8 desbloqueados"/>
      <div className="px-5 pb-3 grid grid-cols-4 gap-2">
        {[
          { e: "🏆", l: "Primera semana" },
          { e: "🔥", l: "5 días seguidos" },
          { e: "💪", l: "100 ejercicios" },
          { e: "📈", l: "EVA &lt; 5" },
        ].map((a, i) => (
          <div key={i} className="rounded-xl py-2.5 flex flex-col items-center gap-1" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
            <div className="text-[22px] leading-none">{a.e}</div>
            <div className="text-[9px] font-mono text-center leading-tight" style={{ color: PC.muted }}>{a.l}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 pt-2 pb-3 text-center text-[10px] font-mono" style={{ color: PC.subtle }}>
        Reha.mx · v2.4 · NOM-024 cumplido
      </div>
    </div>
  );
};

Object.assign(window, { PortalYoTab, ExpedienteSubview, PaquetesSubview, ChatSubview, MiniLineChart });
