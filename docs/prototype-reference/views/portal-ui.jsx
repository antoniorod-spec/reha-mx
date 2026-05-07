/* Portal paciente — UI primitives shared across tabs (dark mode, fixed colors) */

const PC = {
  bg: "#06101C",
  surface: "#0A1825",
  surface2: "#0D1F30",
  border: "#15293C",
  borderSoft: "#102234",
  text: "#F0F7FB",
  muted: "#9BB3C4",
  subtle: "#5F7B91",
  accent: "#3FBCD4",
  good: "#34D399",
  warn: "#F59E0B",
  bad: "#FB7185",
};

/* Header bar (used across tabs) */
const PortalHeader = ({ title, subtitle, onBack, right }) => (
  <div className="px-5 pt-3 pb-3 flex items-center gap-3" style={{ background: PC.bg }}>
    {onBack && (
      <button onClick={onBack} className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
        <IconChevronLeft size={15} style={{ color: PC.text }}/>
      </button>
    )}
    <div className="flex-1 min-w-0">
      {subtitle && <div className="text-[10.5px] font-mono uppercase tracking-wider truncate" style={{ color: PC.subtle }}>{subtitle}</div>}
      <div className="text-[18px] font-semibold tracking-tighter2 truncate" style={{ color: PC.text }}>{title}</div>
    </div>
    {right}
  </div>
);

/* Section title row */
const PSection = ({ title, sub, action }) => (
  <div className="px-5 pt-4 pb-2 flex items-end justify-between">
    <div>
      <div className="text-[14px] font-semibold tracking-tightish" style={{ color: PC.text }}>{title}</div>
      {sub && <div className="text-[10.5px] font-mono mt-0.5" style={{ color: PC.subtle }}>{sub}</div>}
    </div>
    {action && <div className="text-[11px] font-mono" style={{ color: PC.accent }}>{action}</div>}
  </div>
);

/* Generic card */
const PCard = ({ children, className = "", style = {} }) => (
  <div className={`rounded-xl ${className}`} style={{ background: PC.surface, border: `1px solid ${PC.border}`, ...style }}>
    {children}
  </div>
);

/* Tab bar */
const PortalTabBar = ({ tab, setTab, fullscreen = false }) => (
  <div className={fullscreen ? "fixed bottom-0 px-2 pb-3 pt-2 z-30" : "absolute bottom-0 left-0 right-0 px-2 pb-6 pt-2 z-30"}
       style={{
         background: "rgba(6,16,28,0.96)",
         backdropFilter: "blur(10px)",
         borderTop: `1px solid ${PC.border}`,
         ...(fullscreen ? { left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480 } : {}),
       }}>
    <div className="grid grid-cols-5">
      {[
        { id: "inicio",    icon: IconHome,     l: "Inicio" },
        { id: "plan",      icon: IconActivity, l: "Plan"   },
        { id: "citas",     icon: IconCalendar, l: "Citas"  },
        { id: "nutri",     icon: IconHeart,    l: "Nutri"  },
        { id: "yo",        icon: IconUser,     l: "Yo"     },
      ].map((tb) => {
        const active = tab === tb.id;
        return (
          <button key={tb.id} onClick={() => setTab(tb.id)}
                  className="flex flex-col items-center gap-0.5 py-1"
                  style={{ color: active ? PC.accent : "#5F7B91" }}>
            <tb.icon size={17}/>
            <span className="text-[9.5px] font-medium tracking-tightish">{tb.l}</span>
          </button>
        );
      })}
    </div>
  </div>
);

/* Inline progress bar */
const PProgress = ({ value, color = PC.accent, height = 6 }) => (
  <div className="rounded-full overflow-hidden" style={{ height, background: PC.surface2 }}>
    <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}/>
  </div>
);

/* Avatar */
const PAvatar = ({ initials, size = 40, gradient = "linear-gradient(135deg,#1B3A5C,#3FBCD4)" }) => (
  <div className="rounded-full flex items-center justify-center font-semibold shrink-0"
       style={{ width: size, height: size, background: gradient, color: "#FFFFFF", fontSize: size * 0.34 }}>
    {initials}
  </div>
);

Object.assign(window, { PC, PortalHeader, PSection, PCard, PortalTabBar, PProgress, PAvatar });
