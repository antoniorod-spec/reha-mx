/* Patient portal - mobile mockup using IOSFrame */

const Portal = ({ theme }) => {
  const t = tokens(theme);
  const [tab, setTab] = React.useState("inicio");

  return (
    <div className="px-6 pt-5 pb-10">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tighter2" style={{ color: t.text }}>Portal del paciente</h1>
          <div className="text-[12px] font-mono mt-1" style={{ color: t.subtle }}>App móvil · Vista del paciente · iOS / Android</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11.5px] font-mono"
                style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"/> Carlos Vázquez · MoveWell Centro
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[420px_1fr] gap-6 items-start">
        <div className="flex justify-center">
          <IOSDevice width={390} height={820} dark={true}>
            <div className="h-full w-full" style={{ background: "#06101C", color: "#F0F7FB", paddingTop: 54, paddingBottom: 90, position: "relative" }}>
              {/* Header */}
              <div className="px-5 pt-3 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-semibold"
                         style={{ background: "linear-gradient(135deg, #1B3A5C, #3FBCD4)", color: "#FFFFFF" }}>CV</div>
                    <div>
                      <div className="text-[11px] font-mono" style={{ color: "#9BB3C4" }}>Hola,</div>
                      <div className="text-[15px] font-semibold tracking-tightish">Carlos</div>
                    </div>
                  </div>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#0A1825", border: "1px solid #15293C" }}>
                    <IconBell size={15} style={{ color: "#9BB3C4" }}/>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[10.5px] font-mono" style={{ color: "#5F7B91" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#3FBCD4" }}/>
                  MoveWell Centro · Sem. 8 de 12
                </div>
              </div>

              {/* Next appointment */}
              <div className="px-5 pb-3">
                <div className="rounded-2xl p-4 relative overflow-hidden"
                     style={{ background: "linear-gradient(135deg, rgba(63,188,212,0.16), rgba(63,188,212,0.04))", border: "1px solid rgba(63,188,212,0.35)" }}>
                  <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#7DD3DF" }}>Próxima cita</div>
                  <div className="text-[18px] font-semibold tracking-tightish mt-1.5">Martes · 11:00</div>
                  <div className="text-[12px] mt-0.5" style={{ color: "#C9DCE6" }}>Sesión con Dr. Antonio · MoveWell Centro</div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <button className="px-3 py-1.5 rounded-lg text-[11.5px] font-semibold flex items-center gap-1.5" style={{ background: "#3FBCD4", color: "#06101C" }}>
                      <IconCheck size={12}/> Confirmar asistencia
                    </button>
                    <button className="px-3 py-1.5 rounded-lg text-[11.5px] font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "#FAFAFA", border: "1px solid #2A2A2A" }}>Reagendar</button>
                  </div>
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full" style={{ background: "radial-gradient(circle, rgba(63,188,212,0.25), transparent 70%)" }}/>
                </div>
              </div>

              {/* Today's protocol */}
              <div className="px-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] font-semibold tracking-tightish">Tu protocolo de hoy</div>
                  <span className="text-[10px] font-mono" style={{ color: "#5F7B91" }}>4 ejercicios · ~32 min</span>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ background: "#0A1825", border: "1px solid #15293C" }}>
                  {EXERCISES_TODAY.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5" style={{ borderTop: i === 0 ? "none" : "1px solid #161616" }}>
                      <div className="w-12 h-12 rounded-lg shrink-0 relative overflow-hidden flex items-center justify-center" style={{ background: e.thumb }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.85)" }}>
                            <IconPlay size={9} style={{ color: "#06101C" }}/>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-medium tracking-tightish truncate">{e.name}</div>
                        <div className="text-[10.5px] font-mono mt-0.5" style={{ color: "#9BB3C4" }}>{e.set} · {e.side}</div>
                      </div>
                      <button className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: i < 2 ? "rgba(52,211,153,0.12)" : "#141414", border: `1px solid ${i < 2 ? "rgba(52,211,153,0.4)" : "#1F1F1F"}` }}>
                        {i < 2 ? <IconCheck size={11} style={{ color: "#34D399" }}/> : <IconChevronRight size={11} style={{ color: "#9BB3C4" }}/>}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress chart */}
              <div className="px-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] font-semibold tracking-tightish">Tu progreso esta semana</div>
                  <span className="text-[10px] font-mono" style={{ color: "#34D399" }}>Adherencia 71%</span>
                </div>
                <div className="rounded-xl p-3.5" style={{ background: "#0A1825", border: "1px solid #15293C" }}>
                  <div className="flex items-end justify-between gap-1.5" style={{ height: 90 }}>
                    {ADHERENCIA_SEMANA.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full flex flex-col-reverse" style={{ height: 70 }}>
                          <div className="w-full rounded-t" style={{ height: `${d.v}%`, background: d.v === 0 ? "#1F1F1F" : d.v < 50 ? "#0F2438" : "#3FBCD4" }}/>
                        </div>
                        <div className="text-[10px] font-mono" style={{ color: i === 0 ? "#3FBCD4" : "#737373" }}>{d.d}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2.5 border-t" style={{ borderColor: "#15293C" }}>
                    <span className="text-[10px] font-mono" style={{ color: "#5F7B91" }}>5 / 7 días completos</span>
                    <span className="text-[10px] font-mono" style={{ color: "#3FBCD4" }}>+12% vs sem. pasada →</span>
                  </div>
                </div>
              </div>

              {/* Quick chips */}
              <div className="px-5 pb-4 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {[
                  { label: "Reportar dolor", icon: IconHeart },
                  { label: "Mensajear fisio", icon: IconMessage },
                  { label: "Ver factura", icon: IconReceipt },
                ].map((c, i) => (
                  <button key={i} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-medium shrink-0"
                          style={{ background: "#0A1825", border: "1px solid #15293C", color: "#FAFAFA" }}>
                    <c.icon size={12} style={{ color: "#9BB3C4" }}/> {c.label}
                  </button>
                ))}
              </div>

              {/* Tab bar */}
              <div className="absolute bottom-0 left-0 right-0 px-2 pb-6 pt-2" style={{ background: "rgba(6,16,28,0.92)", backdropFilter: "blur(10px)", borderTop: "1px solid #15293C" }}>
                <div className="grid grid-cols-5">
                  {[
                    { id: "inicio", icon: IconHome,    l: "Inicio" },
                    { id: "plan",   icon: IconActivity,l: "Plan"   },
                    { id: "citas",  icon: IconCalendar,l: "Citas"  },
                    { id: "chat",   icon: IconMessage, l: "Chat"   },
                    { id: "yo",     icon: IconUser,    l: "Yo"     },
                  ].map((tb) => {
                    const active = tab === tb.id;
                    return (
                      <button key={tb.id} onClick={() => setTab(tb.id)}
                              className="flex flex-col items-center gap-0.5 py-1"
                              style={{ color: active ? "#3FBCD4" : "#737373" }}>
                        <tb.icon size={17}/>
                        <span className="text-[9.5px] font-medium tracking-tightish">{tb.l}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </IOSDevice>
        </div>

        {/* Right side: explainer */}
        <div className="space-y-3 pt-4">
          <Card theme={theme} padding="p-4">
            <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: t.subtle }}>App del paciente · iOS / Android</div>
            <div className="text-[18px] font-semibold tracking-tighter2 mb-2" style={{ color: t.text }}>La otra cara de Reha.mx</div>
            <p className="text-[13px] leading-relaxed" style={{ color: t.muted }}>
              Cada paciente recibe acceso a su protocolo personalizado, con video-guías, recordatorios por WhatsApp y reportes de adherencia que llegan en tiempo real al fisio.
            </p>
          </Card>
          <Card theme={theme} padding="p-0">
            <div className="px-4 pt-4 pb-2 text-[12px] font-semibold tracking-tightish" style={{ color: t.text }}>Lo que el paciente puede hacer</div>
            {[
              { icon: IconPlay,     l: "Ejecutar su protocolo diario", s: "Video-guías con conteo automático de series" },
              { icon: IconHeart,    l: "Reportar dolor (EVA)",         s: "Datos llegan al expediente al instante" },
              { icon: IconCalendar, l: "Confirmar y reagendar",        s: "Sincroniza con la agenda del fisio" },
              { icon: IconMessage,  l: "Chat asíncrono con su fisio",  s: "Mensajes con audio y video" },
              { icon: IconWatch,    l: "Conectar wearable (Garmin / Apple Watch)", s: "HRV, sueño, carga semanal" },
              { icon: IconReceipt,  l: "Pagar y descargar CFDI",       s: "Factura electrónica desde la app" },
            ].map((r, i) => (
              <div key={i} className="px-4 py-2.5 flex items-start gap-2.5" style={{ borderTop: `1px solid ${t.borderSoft}` }}>
                <div className="w-7 h-7 rounded-md shrink-0 flex items-center justify-center" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
                  <r.icon size={13} style={{ color: t.accent }}/>
                </div>
                <div>
                  <div className="text-[12.5px] font-medium tracking-tightish" style={{ color: t.text }}>{r.l}</div>
                  <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>{r.s}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card theme={theme} padding="p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconWhatsApp size={14} style={{ color: "#34D399" }}/>
              <div className="text-[12px] font-semibold tracking-tightish" style={{ color: t.text }}>Sin descargar la app</div>
            </div>
            <p className="text-[11.5px] leading-relaxed" style={{ color: t.muted }}>
              Si el paciente no instala la app, la mayoría del flujo funciona vía WhatsApp Business: confirmaciones, recordatorios, links a videos del protocolo y avisos de pago.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Portal });
