/* Portal paciente — Tab Citas (calendario + reservar) */

const RESERVA_SLOTS = [
  { day: "Mar 5",  weekday: "Mar", slots: ["09:00", "10:00", "11:00", "12:00"] },
  { day: "Mié 6",  weekday: "Mié", slots: ["08:00", "10:00", "16:00", "17:00"] },
  { day: "Jue 7",  weekday: "Jue", slots: ["09:00", "11:00", "15:00", "18:00"] },
  { day: "Vie 8",  weekday: "Vie", slots: ["10:00", "11:00", "12:00", "16:00"] },
];

const PROXIMAS_CITAS = [
  { date: "Mar 5 May",  time: "11:00", title: "Sesión 12 de 24",   fisio: "Dr. Antonio R.", branch: "Centro",   confirmed: true,  type: "sesion" },
  { date: "Jue 7 May",  time: "11:00", title: "Sesión 13 de 24",   fisio: "Dr. Antonio R.", branch: "Centro",   confirmed: true,  type: "sesion" },
  { date: "Lun 11 May", time: "11:00", title: "Reevaluación",       fisio: "Dr. Antonio R.", branch: "Centro",   confirmed: false, type: "reev"   },
  { date: "Mar 12 May", time: "16:00", title: "Crioterapia",        fisio: "Mtro. Iván R.",  branch: "Lomas",    confirmed: false, type: "crio"   },
];

const PortalCitasTab = () => {
  const [mode, setMode] = React.useState("upcoming"); // upcoming | book
  const [selDay, setSelDay] = React.useState(0);
  const [selSlot, setSelSlot] = React.useState(null);

  return (
    <div className="pb-2">
      <PortalHeader title="Mis citas" subtitle={mode === "book" ? "Reservar nueva" : `${PROXIMAS_CITAS.length} próximas`}
                    right={
                      <button onClick={() => setMode(mode === "book" ? "upcoming" : "book")}
                              className="px-3 h-9 rounded-md flex items-center gap-1.5 text-[11.5px] font-semibold"
                              style={{ background: mode === "book" ? PC.surface : PC.accent, color: mode === "book" ? PC.text : "#06101C", border: `1px solid ${mode === "book" ? PC.border : "transparent"}` }}>
                        {mode === "book" ? "Cancelar" : <><IconPlus size={12}/> Reservar</>}
                      </button>
                    }/>

      {mode === "upcoming" && (
        <>
          {/* Next big card */}
          <div className="px-5 pb-3">
            <div className="rounded-xl p-4 relative overflow-hidden"
                 style={{ background: "linear-gradient(135deg, rgba(63,188,212,0.16), rgba(63,188,212,0.04))", border: `1px solid ${PC.accent}55` }}>
              <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#7DD3DF" }}>Próxima</div>
              <div className="text-[20px] font-semibold tracking-tighter2 mt-1" style={{ color: PC.text }}>{PROXIMAS_CITAS[0].date}</div>
              <div className="text-[14px] font-semibold tracking-tightish font-mono mt-0.5" style={{ color: PC.accent }}>{PROXIMAS_CITAS[0].time}</div>
              <div className="text-[12px] mt-1" style={{ color: PC.muted }}>{PROXIMAS_CITAS[0].title} · {PROXIMAS_CITAS[0].fisio}</div>
              <div className="text-[10.5px] font-mono mt-0.5 flex items-center gap-1" style={{ color: PC.subtle }}>
                <IconMapPin size={9}/> Reha {PROXIMAS_CITAS[0].branch} · Av. Reforma 247
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button className="py-2.5 rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5" style={{ background: PC.accent, color: "#06101C" }}>
                  <IconMapPin size={11}/> Cómo llegar
                </button>
                <button className="py-2.5 rounded-md text-[12px] font-medium flex items-center justify-center gap-1.5" style={{ background: PC.surface, color: PC.text, border: `1px solid ${PC.border}` }}>
                  <IconClock size={11}/> Reagendar
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming list */}
          <PSection title="Más adelante"/>
          <div className="px-5 pb-3 space-y-2">
            {PROXIMAS_CITAS.slice(1).map((c, i) => (
              <div key={i} className="rounded-xl px-3.5 py-3 flex items-center gap-3" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
                <div className="text-center w-12 shrink-0">
                  <div className="text-[9px] font-mono uppercase" style={{ color: PC.subtle }}>{c.date.split(" ")[0]}</div>
                  <div className="text-[18px] font-semibold tracking-tighter2 leading-none" style={{ color: PC.text }}>{c.date.split(" ")[1]}</div>
                  <div className="text-[9.5px] font-mono mt-0.5" style={{ color: PC.subtle }}>{c.date.split(" ")[2]}</div>
                </div>
                <div className="w-px self-stretch" style={{ background: PC.borderSoft }}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-semibold font-mono" style={{ color: PC.accent }}>{c.time}</span>
                    {c.confirmed ? (
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(52,211,153,0.18)", color: PC.good }}>
                        <IconCheck size={8}/> OK
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded" style={{ background: PC.surface2, color: PC.subtle }}>Por confirmar</span>
                    )}
                  </div>
                  <div className="text-[12.5px] font-medium tracking-tightish mt-0.5 truncate" style={{ color: PC.text }}>{c.title}</div>
                  <div className="text-[10.5px] font-mono mt-0.5 truncate" style={{ color: PC.muted }}>{c.fisio} · {c.branch}</div>
                </div>
                <IconChevronRight size={13} style={{ color: PC.subtle }}/>
              </div>
            ))}
          </div>

          <PSection title="Historial" sub="Sesiones completadas: 11"/>
          <div className="px-5 pb-3 space-y-1.5">
            {[
              { d: "Vie 1 May",  s: "Sesión 11", note: "EVA 3/10 · Bien" },
              { d: "Mié 29 Abr", s: "Sesión 10", note: "EVA 4/10" },
              { d: "Lun 27 Abr", s: "Sesión 9",  note: "EVA 4/10" },
            ].map((h, i) => (
              <div key={i} className="rounded-lg px-3 py-2 flex items-center gap-3" style={{ background: PC.surface, border: `1px solid ${PC.borderSoft}` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: PC.subtle }}/>
                <div className="text-[11px] font-mono w-20 shrink-0" style={{ color: PC.muted }}>{h.d}</div>
                <div className="flex-1 text-[12px] font-medium" style={{ color: PC.text }}>{h.s}</div>
                <div className="text-[10.5px] font-mono" style={{ color: PC.subtle }}>{h.note}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {mode === "book" && (
        <>
          {/* Tipo de cita */}
          <PSection title="Tipo de cita"/>
          <div className="px-5 pb-3 grid grid-cols-2 gap-2">
            {[
              { l: "Sesión",       icon: IconActivity, on: true },
              { l: "Reevaluación", icon: IconChart,    on: false },
              { l: "Crioterapia",  icon: IconWatch,    on: false },
              { l: "Nutrición",    icon: IconHeart,    on: false },
            ].map((c, i) => (
              <button key={i}
                      className="rounded-xl py-3 flex flex-col items-center gap-1"
                      style={{ background: c.on ? PC.accent + "1F" : PC.surface, border: `1px solid ${c.on ? PC.accent : PC.border}` }}>
                <c.icon size={15} style={{ color: c.on ? PC.accent : PC.muted }}/>
                <span className="text-[11.5px] font-medium" style={{ color: c.on ? PC.accent : PC.text }}>{c.l}</span>
              </button>
            ))}
          </div>

          {/* Sucursal + Fisio */}
          <PSection title="Con tu fisio"/>
          <div className="px-5 pb-3">
            <div className="rounded-xl px-3 py-3 flex items-center gap-3" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
              <PAvatar initials="AR" size={36} gradient="linear-gradient(135deg,#3FBCD4,#7DD3DF)"/>
              <div className="flex-1">
                <div className="text-[13px] font-medium" style={{ color: PC.text }}>Dr. Antonio R.</div>
                <div className="text-[10.5px] font-mono mt-0.5" style={{ color: PC.subtle }}>Asignado · Reha Centro</div>
              </div>
              <button className="text-[11px] font-mono" style={{ color: PC.accent }}>Cambiar</button>
            </div>
          </div>

          {/* Day picker */}
          <PSection title="Elige día"/>
          <div className="px-5 pb-3 grid grid-cols-4 gap-2">
            {RESERVA_SLOTS.map((d, i) => (
              <button key={i} onClick={() => { setSelDay(i); setSelSlot(null); }}
                      className="rounded-xl py-2.5 flex flex-col items-center"
                      style={{ background: selDay === i ? PC.accent : PC.surface, border: `1px solid ${selDay === i ? PC.accent : PC.border}` }}>
                <span className="text-[9.5px] font-mono uppercase" style={{ color: selDay === i ? "rgba(6,16,28,0.7)" : PC.subtle }}>{d.weekday}</span>
                <span className="text-[16px] font-semibold tracking-tighter2 mt-0.5" style={{ color: selDay === i ? "#06101C" : PC.text }}>{d.day.split(" ")[1]}</span>
              </button>
            ))}
          </div>

          {/* Slot picker */}
          <PSection title="Horario disponible"/>
          <div className="px-5 pb-3 grid grid-cols-3 gap-2">
            {RESERVA_SLOTS[selDay].slots.map((s, i) => {
              const active = selSlot === s;
              return (
                <button key={i} onClick={() => setSelSlot(s)}
                        className="rounded-md py-2.5 text-[12.5px] font-semibold font-mono"
                        style={{ background: active ? PC.accent : PC.surface, color: active ? "#06101C" : PC.text, border: `1px solid ${active ? PC.accent : PC.border}` }}>
                  {s}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div className="px-5 pt-2 pb-3">
            <button disabled={!selSlot}
                    className="w-full py-3.5 rounded-md text-[13.5px] font-semibold flex items-center justify-center gap-2"
                    style={{ background: selSlot ? PC.accent : PC.surface, color: selSlot ? "#06101C" : PC.subtle, border: `1px solid ${selSlot ? PC.accent : PC.border}` }}>
              {selSlot ? <>Confirmar {RESERVA_SLOTS[selDay].day} {selSlot} →</> : "Selecciona un horario"}
            </button>
            {selSlot && (
              <div className="text-[10.5px] font-mono mt-2 text-center" style={{ color: PC.subtle }}>
                Se descuenta 1 sesión de tu Plan Premium · Recibirás confirmación por WhatsApp
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

Object.assign(window, { PortalCitasTab });
