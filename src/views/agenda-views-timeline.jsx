/* Agenda — Vistas Día y Semana (timeline desktop) */

const HOUR_HEIGHT = 56; // px por hora
const HOURS_TO_SHOW = 14; // 07:00 → 21:00
const HOUR_OFFSET = -1; // primer slot = 07:00 (s = -1 mapea a 07:00)

/* Indicador de "ahora": línea horizontal cyan */
const NowLine = ({ theme }) => {
  const t = tokens(theme);
  // NOW_HOUR=11.7 → 11:42 → s = 11.7 - 8 = 3.7 → posición = (3.7 + 1) * HOUR_HEIGHT = 4.7 * 56 = ~263
  const top = (NOW_HOUR - 8 + 1) * HOUR_HEIGHT;
  return (
    <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top }}>
      <div className="flex items-center">
        <div className="w-2.5 h-2.5 rounded-full -ml-1.5 shrink-0" style={{ background: "#FB7185", boxShadow: "0 0 0 3px rgba(251,113,133,0.25)" }}/>
        <div className="flex-1 h-px" style={{ background: "#FB7185" }}/>
      </div>
    </div>
  );
};

/* Tarjeta de cita en timeline */
const TimelineAppt = ({ theme, a, colorBy, onClick, isSelected, compact }) => {
  const t = tokens(theme);
  const cfg = getApptColor(a, colorBy);
  // a.s es 0 = 08:00 ; queremos que 0 caiga en (1)*HOUR_HEIGHT (porque 07:00 ocupa el slot 0)
  const top = (a.s + 1) * HOUR_HEIGHT + 1;
  const height = a.dur * HOUR_HEIGHT - 2;
  const isShort = a.dur <= 0.6;
  return (
    <button onClick={onClick}
            className="absolute rounded-md text-left transition-all overflow-hidden group"
            style={{
              top, height,
              left: 4, right: 4,
              background: cfg.bg,
              border: `1px solid ${isSelected ? cfg.fg : cfg.border}`,
              borderLeft: `3px solid ${cfg.bar}`,
              boxShadow: isSelected ? `0 0 0 2px ${cfg.fg}33` : "none",
              padding: isShort ? "3px 6px" : compact ? "4px 8px" : "5px 8px",
            }}>
      <div className="flex items-center gap-1 text-[10px] font-mono leading-none" style={{ color: cfg.fg }}>
        <span>{fmtTime(a.s)}</span>
        {a.c && <IconCheck size={9} style={{ color: "#34D399" }}/>}
      </div>
      <div className={`${isShort ? "text-[10.5px]" : "text-[11.5px]"} font-semibold leading-tight tracking-tightish mt-0.5 truncate`} style={{ color: t.text }}>
        {a.p.split(" ").slice(0, 2).join(" ")}
      </div>
      {!isShort && (
        <div className="text-[10px] font-mono leading-tight mt-0.5 truncate" style={{ color: cfg.fg, opacity: 0.85 }}>
          {APPT_TYPES[a.t].label}
        </div>
      )}
      {a.dur >= 1.4 && !compact && (
        <div className="text-[10px] font-mono mt-1 truncate opacity-70" style={{ color: t.muted }}>
          {a.f.split(" ").slice(0, 2).join(" ")}
        </div>
      )}
    </button>
  );
};

/* Vista Día — timeline una sola columna ancha */
const DayView = ({ theme, dayIdx, appts, colorBy, selectedIdx, setSelectedIdx, onCreateAt }) => {
  const t = tokens(theme);
  const dayAppts = appts.filter(a => a.d === dayIdx);
  const isToday = dayIdx === NOW_DAY_IDX;
  const dayLabel = `${FULL_DAY_NAMES[dayIdx]} ${AGENDA_DAYS[dayIdx].date} de mayo`;

  return (
    <Card theme={theme} padding="p-0">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${t.border}`, background: t.surface }}>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{isToday ? "Hoy" : "Día"}</div>
          <div className="text-[16px] font-semibold tracking-tightish" style={{ color: isToday ? t.accent : t.text }}>{dayLabel}</div>
        </div>
        <div className="text-[11px] font-mono" style={{ color: t.muted }}>{dayAppts.length} cita{dayAppts.length === 1 ? "" : "s"}</div>
      </div>

      {/* Timeline */}
      <div className="grid relative" style={{ gridTemplateColumns: `48px 1fr` }}>
        {/* Hour labels */}
        <div>
          {Array.from({ length: HOURS_TO_SHOW }).map((_, i) => (
            <div key={i} className="text-[10px] font-mono pr-2 text-right" style={{ height: HOUR_HEIGHT, color: t.subtle, paddingTop: 2 }}>
              {(7 + i).toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>
        {/* Day column */}
        <div className="relative" style={{ borderLeft: `1px solid ${t.borderSoft}` }}>
          {Array.from({ length: HOURS_TO_SHOW }).map((_, i) => (
            <div key={i}
                 className="cursor-cell hover:bg-black/10"
                 onClick={() => onCreateAt && onCreateAt(dayIdx, i - 1)}
                 style={{ height: HOUR_HEIGHT, borderTop: i === 0 ? "none" : `1px solid ${t.borderSoft}` }}/>
          ))}
          {dayAppts.map((a) => {
            const idx = appts.indexOf(a);
            return (
              <TimelineAppt key={idx} theme={theme} a={a} colorBy={colorBy}
                            onClick={() => setSelectedIdx(idx)}
                            isSelected={idx === selectedIdx}/>
            );
          })}
          {isToday && <NowLine theme={theme}/>}
        </div>
      </div>
    </Card>
  );
};

/* Vista Semana — 7 columnas */
const WeekView = ({ theme, appts, colorBy, selectedIdx, setSelectedIdx, onCreateAt }) => {
  const t = tokens(theme);

  return (
    <Card theme={theme} padding="p-0" className="overflow-x-auto h-scroll">
      {/* Header con días */}
      <div className="grid sticky top-0 z-20" style={{ gridTemplateColumns: `48px repeat(7, minmax(80px, 1fr))`, minWidth: 600, background: t.surface, borderBottom: `1px solid ${t.border}` }}>
        <div></div>
        {AGENDA_DAYS.map((d, i) => {
          const isToday = i === NOW_DAY_IDX;
          return (
            <div key={i} className="px-2 py-2.5 text-center" style={{ borderLeft: `1px solid ${t.borderSoft}` }}>
              <div className="text-[10px] font-mono uppercase" style={{ color: isToday ? t.accent : t.subtle }}>{d.label}</div>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className={isToday ? "inline-flex items-center justify-center rounded-full" : ""}
                      style={isToday ? { width: 22, height: 22, background: t.accent, color: "#06101C" } : {}}>
                  <span className="text-[14px] font-semibold tracking-tightish" style={{ color: isToday ? "#06101C" : t.text }}>{d.date}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid relative" style={{ gridTemplateColumns: `48px repeat(7, 1fr)`, minWidth: 600 }}>
        <div>
          {Array.from({ length: HOURS_TO_SHOW }).map((_, i) => (
            <div key={i} className="text-[10px] font-mono pr-2 text-right" style={{ height: HOUR_HEIGHT, color: t.subtle, paddingTop: 2 }}>
              {(7 + i).toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>
        {AGENDA_DAYS.map((_, di) => {
          const isToday = di === NOW_DAY_IDX;
          const dayAppts = appts.filter(a => a.d === di);
          return (
            <div key={di} className="relative"
                 style={{ borderLeft: `1px solid ${t.borderSoft}`, background: isToday ? "rgba(63,188,212,0.03)" : "transparent" }}>
              {Array.from({ length: HOURS_TO_SHOW }).map((_, hi) => (
                <div key={hi}
                     className="cursor-cell hover:bg-black/10"
                     onClick={() => onCreateAt && onCreateAt(di, hi - 1)}
                     style={{ height: HOUR_HEIGHT, borderTop: hi === 0 ? "none" : `1px solid ${t.borderSoft}` }}/>
              ))}
              {dayAppts.map(a => {
                const idx = appts.indexOf(a);
                return (
                  <TimelineAppt key={idx} theme={theme} a={a} colorBy={colorBy}
                                onClick={() => setSelectedIdx(idx)}
                                isSelected={idx === selectedIdx} compact/>
                );
              })}
              {isToday && <NowLine theme={theme}/>}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

Object.assign(window, { DayView, WeekView, NowLine, TimelineAppt, HOUR_HEIGHT });
