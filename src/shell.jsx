/* Shell: sidebar, topbar, branch selector, theme tokens — responsive */

const useTheme = (initial = "dark") => {
  const [theme, setTheme] = React.useState(initial);
  React.useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    document.body.classList.toggle("theme-dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  return [theme, setTheme];
};

const useViewport = () => {
  const [w, setW] = React.useState(typeof window !== "undefined" ? window.innerWidth : 1440);
  React.useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return { w, isMobile: w < 768, isTablet: w >= 768 && w < 1100, isDesktop: w >= 1100 };
};

const tokens = (theme) => theme === "dark" ? {
  bg: "#06101C", surface: "#0A1825", surface2: "#0F2030", border: "#15293C", borderSoft: "#0F2030",
  text: "#F0F7FB", muted: "#9BB3C4", subtle: "#5F7B91",
  accent: "#3FBCD4", accentSoft: "rgba(63,188,212,0.14)",
  navy: "#1B3A5C", navySoft: "rgba(27,58,92,0.45)",
  good: "#34D399", bad: "#F87171", info: "#3FBCD4",
} : {
  bg: "#F4F8FB", surface: "#FFFFFF", surface2: "#EEF4F8", border: "#D9E4EC", borderSoft: "#E6EDF3",
  text: "#0E2438", muted: "#42627A", subtle: "#6B8499",
  accent: "#1B92AE", accentSoft: "rgba(63,188,212,0.14)",
  navy: "#1B3A5C", navySoft: "rgba(27,58,92,0.10)",
  good: "#0F8A5F", bad: "#DC2626", info: "#1B92AE",
};

const NAV = [
  { id: "dashboard", label: "Dashboard",     icon: IconLayout   },
  { id: "agenda",    label: "Agenda",        icon: IconCalendar },
  { id: "patients",  label: "Pacientes",     icon: IconUsers    },
  { id: "patient",   label: "Expediente",    icon: IconFile     },
  { id: "protocols", label: "Protocolos",    icon: IconActivity },
  { id: "payments",  label: "Pagos",         icon: IconCard     },
  { id: "billing",   label: "Facturación",   icon: IconReceipt  },
  { id: "reports",   label: "Reportes",      icon: IconChart    },
  { id: "branches",  label: "Sucursales",    icon: IconBuilding },
  { id: "team",      label: "Equipo",        icon: IconTeam     },
  { id: "settings",  label: "Configuración", icon: IconSettings },
];

const Logo = ({ theme }) => {
  const t = tokens(theme);
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-7 h-7 rounded-md flex items-center justify-center shrink-0"
           style={{ background: "linear-gradient(135deg, #1B3A5C 0%, #3FBCD4 100%)" }}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="15" cy="6" r="1.6" fill="#FFFFFF" stroke="none"/>
          <path d="M5 19c2-1 3-3 4-4l2.5 2 3-2 3.5 4"/>
          <path d="M9.5 11l3-2 2 2.5"/>
        </svg>
      </div>
      <div className="leading-none min-w-0">
        <div className="text-[15px] font-semibold tracking-tightish" style={{ color: t.text }}>MoveWell<span style={{ color: t.accent }}>.</span>mx</div>
        <div className="text-[10px] font-mono mt-0.5 truncate" style={{ color: t.subtle }}>Reha · v 2.4 · Producción</div>
      </div>
    </div>
  );
};

const BranchSelector = ({ theme, branchId, setBranchId, open, setOpen }) => {
  const t = tokens(theme);
  const all = [...BRANCHES, CONSOLIDATED];
  const current = all.find(b => b.id === branchId);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg transition-colors"
              style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
        <div className="flex items-center gap-2 min-w-0">
          {branchId === "all" ? (
            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <IconLayers size={14} style={{ color: t.muted }}/>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-md shrink-0 flex items-center justify-center" style={{ background: `${current.color}1A`, border: `1px solid ${current.color}66` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: current.color, boxShadow: `0 0 6px ${current.color}` }}/>
            </div>
          )}
          <div className="min-w-0 text-left">
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Sucursal</div>
            <div className="text-[13px] font-medium truncate tracking-tightish" style={{ color: t.text }}>
              {branchId === "all" ? "Vista consolidada" : current.short}
            </div>
          </div>
        </div>
        <IconChevronDown size={14} style={{ color: t.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}/>
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1.5 rounded-lg p-1 shadow-2xl"
             style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>
          {BRANCHES.map((b) => (
            <button key={b.id}
                    onClick={() => { setBranchId(b.id); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left transition-colors hover:bg-white/5"
                    style={{ background: branchId === b.id ? t.surface2 : "transparent" }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: b.color, boxShadow: `0 0 6px ${b.color}` }}/>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate tracking-tightish" style={{ color: t.text }}>{b.name}</div>
                <div className="text-[11px] font-mono truncate" style={{ color: t.subtle }}>{b.patients} pac. · {b.fisios} fisios</div>
              </div>
              {branchId === b.id && <IconCheck size={14} style={{ color: t.accent }}/>}
            </button>
          ))}
          <div className="my-1 mx-2 h-px" style={{ background: t.border }}/>
          <button onClick={() => { setBranchId("all"); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left transition-colors hover:bg-white/5"
                  style={{ background: branchId === "all" ? t.surface2 : "transparent" }}>
            <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0" style={{ border: `1px solid ${t.muted}` }}>
              <IconLayers size={9} style={{ color: t.muted }}/>
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium tracking-tightish" style={{ color: t.text }}>Vista consolidada</div>
              <div className="text-[11px] font-mono" style={{ color: t.subtle }}>todas las sucursales</div>
            </div>
            {branchId === "all" && <IconCheck size={14} style={{ color: t.accent }}/>}
          </button>
        </div>
      )}
    </div>
  );
};

const SidebarBody = ({ theme, view, setView, branchId, setBranchId, branchOpen, setBranchOpen, onNavigate }) => {
  const t = tokens(theme);
  return (
    <>
      <div className="px-4 pt-5 pb-3"><Logo theme={theme}/></div>
      <div className="px-3 pb-3">
        <BranchSelector theme={theme} branchId={branchId} setBranchId={setBranchId} open={branchOpen} setOpen={setBranchOpen}/>
      </div>
      <div className="px-3 pt-2 pb-1">
        <div className="text-[10px] font-mono uppercase tracking-wider px-2 pb-1.5" style={{ color: t.subtle }}>Workspace</div>
      </div>
      <nav className="flex-1 px-2 overflow-y-auto">
        {NAV.map((n) => {
          const active = view === n.id;
          return (
            <button key={n.id} onClick={() => { setView(n.id); onNavigate && onNavigate(); }}
                    className="relative w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors"
                    style={{ background: active ? t.surface2 : "transparent", color: active ? t.text : t.muted }}>
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r" style={{ background: t.accent }}/>}
              <n.icon size={15} />
              <span className="text-[13px] font-medium tracking-tightish">{n.label}</span>
              {n.id === "agenda" && (
                <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>27</span>
              )}
              {n.id === "billing" && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: t.accent }}/>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-3 pt-3 pb-4 border-t" style={{ borderColor: t.border }}>
        <div className="rounded-lg p-2.5" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
          <div className="flex items-center gap-2">
            <IconShield size={14} style={{ color: t.good }}/>
            <span className="text-[11px] font-medium tracking-tightish" style={{ color: t.text }}>NOM-024 cumplido</span>
          </div>
          <div className="text-[10px] font-mono mt-1" style={{ color: t.subtle }}>Última auditoría: 03 Abr</div>
        </div>
      </div>
    </>
  );
};

const Sidebar = ({ theme, view, setView, branchId, setBranchId, branchOpen, setBranchOpen, isMobile, sheetOpen, setSheetOpen }) => {
  const t = tokens(theme);
  if (!isMobile) {
    return (
      <aside className="shrink-0 flex flex-col h-screen sticky top-0" style={{ width: 244, background: t.surface, borderRight: `1px solid ${t.border}` }}>
        <SidebarBody theme={theme} view={view} setView={setView} branchId={branchId} setBranchId={setBranchId} branchOpen={branchOpen} setBranchOpen={setBranchOpen}/>
      </aside>
    );
  }
  // Mobile: drawer
  return (
    <>
      {sheetOpen && (
        <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.65)" }} onClick={() => setSheetOpen(false)}/>
      )}
      <aside className="fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-transform"
             style={{ width: 280, background: t.surface, borderRight: `1px solid ${t.border}`, transform: sheetOpen ? "translateX(0)" : "translateX(-100%)" }}>
        <SidebarBody theme={theme} view={view} setView={setView} branchId={branchId} setBranchId={setBranchId} branchOpen={branchOpen} setBranchOpen={setBranchOpen} onNavigate={() => setSheetOpen(false)}/>
      </aside>
    </>
  );
};

const Topbar = ({ theme, setTheme, branchId, isMobile, setSheetOpen }) => {
  const t = tokens(theme);
  const all = [...BRANCHES, CONSOLIDATED];
  const current = all.find(b => b.id === branchId);
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 px-3 sm:px-5 py-2.5"
            style={{ background: theme === "dark" ? "rgba(10,10,10,0.85)" : "rgba(250,250,250,0.85)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${t.border}` }}>
      {isMobile && (
        <>
          <button onClick={() => setSheetOpen(true)} className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: t.surface2, border: `1px solid ${t.border}`, color: t.muted }}>
            <IconList size={15}/>
          </button>
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Logo theme={theme}/>
          </div>
        </>
      )}
      {!isMobile && (
        <div className="flex items-center gap-2 text-[12px] font-mono no-wrap" style={{ color: t.subtle }}>
          <span style={{ color: t.muted }}>Reha.mx</span>
          <IconChevronRight size={11}/>
          <span style={{ color: t.muted }}>MoveWell</span>
          <IconChevronRight size={11}/>
          <span className="inline-flex items-center gap-1.5" style={{ color: t.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: current.color }}/>
            {current.short}
          </span>
        </div>
      )}
      {!isMobile && (
        <div className="flex-1 max-w-xl mx-auto">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
            <IconSearch size={14} style={{ color: t.subtle }}/>
            <input placeholder="Buscar paciente, cita, factura…" className="bg-transparent outline-none flex-1 text-[12.5px] min-w-0" style={{ color: t.text }}/>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: t.muted, border: `1px solid ${t.border}`, background: t.surface }}>⌘K</kbd>
          </div>
        </div>
      )}
      {isMobile && (
        <button className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: t.surface2, border: `1px solid ${t.border}`, color: t.muted }}>
          <IconSearch size={15}/>
        </button>
      )}
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors shrink-0"
              style={{ background: t.surface2, border: `1px solid ${t.border}`, color: t.muted }}
              title="Cambiar tema">
        {theme === "dark" ? <IconSun size={15}/> : <IconMoon size={15}/>}
      </button>
      <button className="relative w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: t.surface2, border: `1px solid ${t.border}`, color: t.muted }}>
        <IconBell size={15}/>
        <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full text-[9px] font-mono flex items-center justify-center" style={{ background: t.accent, color: "#06101C" }}>4</span>
      </button>
      {!isMobile && (
        <div className="flex items-center gap-2 pl-2.5 ml-1" style={{ borderLeft: `1px solid ${t.border}` }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold" style={{ background: "linear-gradient(135deg, #3FBCD4, #1B92AE)", color: "#06101C" }}>AR</div>
          <div className="leading-tight">
            <div className="text-[12px] font-medium tracking-tightish" style={{ color: t.text }}>Dr. Antonio</div>
            <div className="text-[10px] font-mono" style={{ color: t.subtle }}>Administrador</div>
          </div>
        </div>
      )}
      {isMobile && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0" style={{ background: "linear-gradient(135deg, #1B3A5C, #3FBCD4)", color: "#FFFFFF" }}>AR</div>
      )}
    </header>
  );
};

// Mobile-only: branch chip strip below topbar
const MobileBranchStrip = ({ theme, branchId, setBranchId }) => {
  const t = tokens(theme);
  const all = [...BRANCHES, CONSOLIDATED];
  return (
    <div className="md:hidden h-scroll px-3 py-2 border-b" style={{ borderColor: t.border, background: t.bg }}>
      <div className="flex items-center gap-1.5 no-wrap">
        {all.map((b) => {
          const active = branchId === b.id;
          return (
            <button key={b.id} onClick={() => setBranchId(b.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11.5px] font-medium shrink-0 no-wrap"
                    style={{ background: active ? t.surface : "transparent", color: active ? t.text : t.muted, border: `1px solid ${active ? t.border : "transparent"}` }}>
              {b.id === "all"
                ? <IconLayers size={11}/>
                : <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }}/>}
              {b.short}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Reusable atoms
const Card = ({ theme, children, className = "", style = {}, padding = "p-4" }) => {
  const t = tokens(theme);
  return (
    <div className={`rounded-lg ${padding} ${className}`}
         style={{ background: t.surface, border: `1px solid ${t.border}`, ...style }}>
      {children}
    </div>
  );
};

const KPICard = ({ theme, k }) => {
  const t = tokens(theme);
  return (
    <Card theme={theme} padding="p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider truncate" style={{ color: t.subtle }}>{k.label}</div>
        <button className="opacity-50 hover:opacity-100 shrink-0"><IconMore size={14} style={{ color: t.muted }}/></button>
      </div>
      <div className="flex items-baseline gap-1.5 mt-2">
        <div className="text-[22px] sm:text-[26px] font-semibold tracking-tighter2" style={{ color: t.text }}>{k.value}</div>
        {k.suffix && <div className="text-[11px] font-mono" style={{ color: t.subtle }}>{k.suffix}</div>}
      </div>
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span className="inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded"
              style={{ color: k.up ? t.good : t.bad, background: k.up ? "rgba(52,211,153,0.10)" : "rgba(248,113,113,0.10)" }}>
          {k.up ? <IconArrowUp size={10}/> : <IconArrowDown size={10}/>} {k.delta}
        </span>
        {k.hint && <span className="text-[11px] font-mono truncate" style={{ color: t.subtle }}>{k.hint}</span>}
      </div>
    </Card>
  );
};

const Badge = ({ theme, children, color, soft = true }) => {
  const t = tokens(theme);
  const c = color || t.accent;
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-1.5 py-0.5 rounded no-wrap"
          style={{ color: c, background: soft ? `${c}1F` : c, border: `1px solid ${c}55` }}>
      {children}
    </span>
  );
};

Object.assign(window, { useTheme, useViewport, tokens, NAV, Sidebar, Topbar, MobileBranchStrip, Card, KPICard, Badge, BranchSelector, Logo });
