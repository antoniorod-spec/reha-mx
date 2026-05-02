/* Agenda — Vistas Mes (grid mensual) y Lista (agenda upcoming) */

/* Construye la matriz del mes Mayo 2026.
   Mayo: 1 cae viernes (en sistema L-D, idx 4). 31 días. */
const buildMonthGrid = () => {
  const firstWeekday = 4; // Vie
  const days = 31;
  const cells = [];
  // pad inicio (días del mes anterior, en gris)
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ date: 30 - (firstWeekday - 1 - i), isCurrentMonth: false, dayOfWeek: i, isAprl: true });
  }
  for (let d = 1; d <= days; d++) {
    cells.push({ date: d, isCurrentMonth: true, dayOfWeek: cells.length % 7, isAprl: false });
  }
  while (cells.length % 7 !== 0) {
    const idx = cells.length;
    cells.push({ date: idx - days - firstWeekday + 1, isCurrentMonth: false, dayOfWeek: idx % 7, isAprl: false, nextMonth: true });
  }
  return cells;
};

const MonthView = ({ theme, appts, colorBy, onSelectDay, onApptClick }) => {
  const t = tokens(theme);
  const cells = buildMonthGrid();
  const TODAY = 4; // Lun 4 May
  // Citas mapeadas por día del mes (4 + dayIdx semana actual)
  // Para visualizar más, repetimos algunas como "mock" en otras semanas
  const apptsByDate = {};
  appts.forEach(a => {
    const date = 4 + a.d;
    if (!apptsByDate[date]) apptsByDate[date] = [];
    apptsByDate[date].push(a);
  });
  // Mock: replica patrones en semanas previas y posteriores para que el mes se vea poblado
  const mockExtra = [
    { date: 1,  list: [{ t:"sesion", p:"Carlos V.", f:"Dr. Antonio R.", b:"Centro", c:true, s:1, dur:1, mins:60 }, { t:"reev", p:"Lucía T.", f:"Dr. Rafael C.", b:"Centro", c:true, s:3, dur:1, mins:60 }] },
    { date: 2,  list: [{ t:"sesion", p:"Iván M.", f:"Dr. Rafael C.", b:"Centro", c:true, s:2, dur:1, mins:60 }] },
    { date: 11, list: [{ t:"sesion", p:"Daniela E.", f:"Mtra. Paulina G.", b:"Lomas", c:true, s:0, dur:1, mins:60 }, { t:"valoracion", p:"Andrés L.", f:"Dr. Antonio R.", b:"Centro", c:false, s:2, dur:1, mins:60 }, { t:"readap", p:"Bruno C.", f:"Dr. Miguel A.", b:"Lomas", c:true, s:4, dur:1.5, mins:90 }] },
    { date: 12, list: [{ t:"alta", p:"Carlos V.", f:"Dr. Antonio R.", b:"Centro", c:true, s:1, dur:0.5, mins:30 }, { t:"sesion", p:"Mariana H.", f:"Mtra. Sofía V.", b:"Carranza", c:true, s:5, dur:1, mins:60 }] },
    { date: 13, list: [{ t:"sesion", p:"Pablo E.", f:"Dr. Miguel A.", b:"Lomas", c:true, s:1.5, dur:1, mins:60 }] },
    { date: 14, list: [{ t:"reev", p:"Iván M.", f:"Dr. Rafael C.", b:"Centro", c:true, s:2, dur:1, mins:60 }, { t:"sesion", p:"Lucía T.", f:"Dr. Rafael C.", b:"Centro", c:true, s:3.5, dur:1, mins:60 }] },
    { date: 15, list: [{ t:"valoracion", p:"José G.", f:"Dr. Rafael C.", b:"Carranza", c:true, s:1, dur:1, mins:60 }, { t:"sesion", p:"Renata J.", f:"Dr. Antonio R.", b:"Centro", c:true, s:3, dur:1, mins:60 }] },
    { date: 18, list: [{ t:"sesion", p:"Adriana S.", f:"Dr. Antonio R.", b:"Centro", c:true, s:0.5, dur:1, mins:60 }, { t:"sesion", p:"Carlos V.", f:"Dr. Antonio R.", b:"Centro", c:true, s:2, dur:1, mins:60 }, { t:"readap", p:"Bruno C.", f:"Dr. Miguel A.", b:"Lomas", c:true, s:4, dur:1.5, mins:90 }, { t:"sesion", p:"Daniela E.", f:"Mtra. Paulina G.", b:"Lomas", c:true, s:6, dur:1, mins:60 }] },
    { date: 19, list: [{ t:"sesion", p:"Mariana H.", f:"Mtra. Sofía V.", b:"Carranza", c:true, s:1, dur:1, mins:60 }] },
    { date: 20, list: [{ t:"sesion", p:"Iván M.", f:"Dr. Rafael C.", b:"Centro", c:true, s:2.5, dur:1, mins:60 }, { t:"reev", p:"Carlos V.", f:"Dr. Antonio R.", b:"Centro", c:true, s:5, dur:1, mins:60 }] },
    { date: 21, list: [{ t:"alta", p:"Iván M.", f:"Dr. Rafael C.", b:"Centro", c:true, s:1, dur:0.5, mins:30 }] },
    { date: 22, list: [{ t:"sesion", p:"Pablo E.", f:"Dr. Miguel A.", b:"Lomas", c:true, s:2, dur:1, mins:60 }, { t:"sesion", p:"Lucía T.", f:"Dr. Rafael C.", b:"Centro", c:true, s:4, dur:1, mins:60 }] },
    { date: 25, list: [{ t:"valoracion", p:"Nuevo paciente", f:"Mtra. Sofía V.", b:"Carranza", c:false, s:1, dur:1, mins:60 }] },
    { date: 26, list: [{ t:"sesion", p:"Daniela E.", f:"Mtra. Paulina G.", b:"Lomas", c:true, s:0.5, dur:1, mins:60 }, { t:"sesion", p:"Adriana S.", f:"Dr. Antonio R.", b:"Centro", c:true, s:3, dur:1, mins:60 }] },
    { date: 27, list: [{ t:"readap", p:"Bruno C.", f:"Dr. Miguel A.", b:"Lomas", c:true, s:4, dur:1.5, mins:90 }] },
    { date: 28, list: [{ t:"alta", p:"Mariana H.", f:"Mtra. Sofía V.", b:"Carranza", c:true, s:2, dur:0.5, mins:30 }, { t:"sesion", p:"Carlos V.", f:"Dr. Antonio R.", b:"Centro", c:true, s:4, dur:1, mins:60 }] },
    { date: 29, list: [{ t:"sesion", p:"Pablo E.", f:"Dr. Miguel A.", b:"Lomas", c:true, s:1, dur:1, mins:60 }] },
  ];
  mockExtra.forEach(({ date, list }) => {
    if (!apptsByDate[date]) apptsByDate[date] = [];
    apptsByDate[date].push(...list);
  });

  return (
    <Card theme={theme} padding="p-0">
      {/* Day headers */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${t.border}`, background: t.surface }}>
        {FULL_DAY_NAMES.map((d, i) => (
          <div key={i} className="px-2 py-2 text-[10.5px] font-mono uppercase tracking-wider text-center" style={{ color: t.subtle, borderLeft: i === 0 ? "none" : `1px solid ${t.borderSoft}` }}>
            {d}
          </div>
        ))}
      </div>
      {/* Cells */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "minmax(108px, auto)" }}>
        {cells.map((cell, i) => {
          const isToday = cell.isCurrentMonth && cell.date === TODAY;
          const dayAppts = (cell.isCurrentMonth && apptsByDate[cell.date]) || [];
          const visibleAppts = dayAppts.slice(0, 3);
          const more = dayAppts.length - visibleAppts.length;
          const isWeekend = cell.dayOfWeek === 5 || cell.dayOfWeek === 6;
          return (
            <div key={i}
                 onClick={() => cell.isCurrentMonth && onSelectDay && onSelectDay(cell.date)}
                 className="p-1.5 cursor-pointer transition-colors hover:bg-black/10"
                 style={{
                   borderTop: i >= 7 ? `1px solid ${t.borderSoft}` : "none",
                   borderLeft: cell.dayOfWeek > 0 ? `1px solid ${t.borderSoft}` : "none",
                   background: isWeekend && cell.isCurrentMonth ? "rgba(0,0,0,0.10)" : "transparent",
                   opacity: cell.isCurrentMonth ? 1 : 0.35,
                 }}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[12px] ${isToday ? "inline-flex items-center justify-center rounded-full font-bold" : "font-medium"}`}
                      style={isToday ? { width: 22, height: 22, background: t.accent, color: "#06101C" } : { color: t.text }}>
                  {cell.date}
                </span>
                {dayAppts.length >= 5 && cell.isCurrentMonth && (
                  <span className="text-[9px] font-mono" style={{ color: t.subtle }}>{dayAppts.length}</span>
                )}
              </div>
              <div className="space-y-0.5">
                {visibleAppts.map((a, ai) => {
                  const cfg = getApptColor(a, colorBy);
                  return (
                    <div key={ai}
                         onClick={(e) => { e.stopPropagation(); onApptClick && onApptClick(a); }}
                         className="px-1.5 py-0.5 rounded text-[10px] truncate flex items-center gap-1 hover:opacity-90"
                         style={{ background: cfg.bg, borderLeft: `2px solid ${cfg.bar}`, color: t.text }}>
                      <span className="font-mono shrink-0" style={{ color: cfg.fg }}>{fmtTime(a.s)}</span>
                      <span className="truncate">{a.p.split(" ")[0]}</span>
                    </div>
                  );
                })}
                {more > 0 && (
                  <div className="px-1.5 py-0.5 text-[9.5px] font-mono" style={{ color: t.subtle }}>
                    +{more} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/* Vista Lista (Agenda) — próximas citas agrupadas por día */
const ListView = ({ theme, appts, colorBy, selectedIdx, setSelectedIdx }) => {
  const t = tokens(theme);
  const TODAY = 4;
  const grouped = AGENDA_DAYS.map((d, di) => ({
    di,
    label: FULL_DAY_NAMES[di],
    date: d.date,
    items: appts.filter(a => a.d === di).sort((a, b) => a.s - b.s),
  })).filter(g => g.items.length > 0);

  if (grouped.length === 0) {
    return (
      <Card theme={theme} padding="p-12" className="text-center">
        <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
          <IconCalendar size={20} style={{ color: t.subtle }}/>
        </div>
        <div className="text-[14px] font-medium" style={{ color: t.muted }}>No hay citas con los filtros actuales</div>
      </Card>
    );
  }

  return (
    <Card theme={theme} padding="p-0">
      {grouped.map((g, gi) => {
        const isToday = g.di === NOW_DAY_IDX;
        return (
          <div key={gi} style={{ borderTop: gi === 0 ? "none" : `1px solid ${t.border}` }}>
            <div className="px-4 py-2.5 sticky top-[64px] z-10 flex items-center gap-3" style={{ background: t.surface, borderBottom: `1px solid ${t.borderSoft}` }}>
              <div className="flex flex-col items-center w-9 shrink-0">
                <div className="text-[9px] font-mono uppercase" style={{ color: isToday ? t.accent : t.subtle }}>{AGENDA_DAYS[g.di].label}</div>
                <div className={`text-[18px] font-semibold tracking-tighter2 ${isToday ? "rounded-full inline-flex items-center justify-center" : ""}`}
                     style={isToday ? { width: 26, height: 26, background: t.accent, color: "#06101C", lineHeight: 1 } : { color: t.text }}>
                  {g.date}
                </div>
              </div>
              <div className="text-[12.5px] font-medium tracking-tightish" style={{ color: t.text }}>
                {isToday ? "Hoy · " : ""}{g.label}
              </div>
              <div className="ml-auto text-[11px] font-mono" style={{ color: t.subtle }}>
                {g.items.length} cita{g.items.length === 1 ? "" : "s"}
              </div>
            </div>
            <div>
              {g.items.map((a) => {
                const idx = appts.indexOf(a);
                const cfg = getApptColor(a, colorBy);
                const isSel = idx === selectedIdx;
                return (
                  <button key={idx} onClick={() => setSelectedIdx(idx)}
                          className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-black/5 transition-colors"
                          style={{ borderTop: `1px solid ${t.borderSoft}`, background: isSel ? t.surface2 : "transparent" }}>
                    <div className="w-1 self-stretch rounded shrink-0" style={{ background: cfg.bar, minHeight: 38 }}/>
                    <div className="w-20 shrink-0">
                      <div className="text-[12.5px] font-semibold font-mono tracking-tightish" style={{ color: t.text }}>{fmtTime(a.s)}</div>
                      <div className="text-[10.5px] font-mono mt-0.5" style={{ color: t.subtle }}>{a.mins} min</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.fg, border: `1px solid ${cfg.border}` }}>
                          {APPT_TYPES[a.t].label}
                        </span>
                        {a.c && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.12)", color: "#34D399" }}>
                            <IconCheck size={9}/> Confirmada
                          </span>
                        )}
                      </div>
                      <div className="text-[13.5px] font-semibold tracking-tightish" style={{ color: t.text }}>{a.p}</div>
                      <div className="text-[11.5px] font-mono mt-0.5" style={{ color: t.muted }}>
                        {a.f} · {branchPill(a.b).name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </Card>
  );
};

Object.assign(window, { MonthView, ListView, buildMonthGrid });
