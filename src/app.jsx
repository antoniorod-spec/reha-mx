/* App root — responsive */

const App = () => {
  const [theme, setTheme] = useTheme("dark");
  const [view, setView] = React.useState("dashboard");
  const [branchId, setBranchId] = React.useState("all");
  const [branchOpen, setBranchOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const { isMobile } = useViewport();
  const setPatientFromName = (n) => {};
  const t = tokens(theme);

  React.useEffect(() => {
    if (view === "dashboard" && branchId !== "all") setView("branch-dashboard");
    else if (view === "branch-dashboard" && branchId === "all") setView("dashboard");
  }, [branchId]);

  const renderView = () => {
    switch (view) {
      case "dashboard":        return <Dashboard theme={theme} branchId={branchId} setView={setView} setPatientFromName={setPatientFromName} isMobile={isMobile}/>;
      case "branch-dashboard": return <BranchDashboard theme={theme} branchId={branchId} setView={setView} setPatientFromName={setPatientFromName} isMobile={isMobile}/>;
      case "agenda":           return <Agenda theme={theme} branchId={branchId} isMobile={isMobile}/>;
      case "patients":         return <PatientsList theme={theme} isMobile={isMobile} setView={setView}/>;
      case "patient":          return <Patient theme={theme} isMobile={isMobile}/>;
      case "branches":         return <Branches theme={theme} isMobile={isMobile}/>;
      case "team":             return <Team theme={theme} isMobile={isMobile}/>;
      case "settings":         return <Settings theme={theme} isMobile={isMobile}/>;
      case "protocols":        return <Protocols theme={theme} isMobile={isMobile}/>;
      case "payments":         return <Payments theme={theme} isMobile={isMobile}/>;
      case "billing":          return <Billing theme={theme} isMobile={isMobile}/>;
      case "reports":          return <Reports theme={theme} branchId={branchId} isMobile={isMobile}/>;
      case "portal":           return <Portal theme={theme} isMobile={isMobile}/>;
      default:                 return <Dashboard theme={theme} branchId={branchId} setView={setView} setPatientFromName={setPatientFromName} isMobile={isMobile}/>;
    }
  };

  const items = [
    { id: "dashboard",        l: "1 · Consolidado",  v: () => { setBranchId("all"); setView("dashboard"); } },
    { id: "patients",         l: "Pacientes",        v: () => { setView("patients"); } },
    { id: "branch-dashboard", l: "Por sucursal",     v: () => { setBranchId("centro"); setView("branch-dashboard"); } },
    { id: "agenda",           l: "Agenda",           v: () => { setView("agenda"); } },
    { id: "branches",         l: "Sucursales",       v: () => { setView("branches"); } },
  ];

  const QuickNav = () => (
    <div className="fixed z-30"
         style={{
           bottom: isMobile ? 8 : 16,
           left: isMobile ? 8 : "50%",
           right: isMobile ? 8 : "auto",
           transform: isMobile ? "none" : "translateX(-50%)",
         }}>
      <div className="h-scroll rounded-xl"
           style={{ background: theme === "dark" ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.96)", border: `1px solid ${t.border}`, backdropFilter: "blur(10px)", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
        <div className="flex items-center gap-1 p-1.5 no-wrap">
          {items.map((q) => {
            const active = (q.id === view) || (q.id === "portal" && view === "settings");
            return (
              <button key={q.id} onClick={q.v}
                      className="px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium tracking-tightish transition-colors shrink-0"
                      style={{ background: active ? t.accent : "transparent", color: active ? "#0A0A0A" : t.muted }}>
                {q.l}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex" style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <Sidebar theme={theme} view={view} setView={setView}
               branchId={branchId} setBranchId={setBranchId}
               branchOpen={branchOpen} setBranchOpen={setBranchOpen}
               isMobile={isMobile} sheetOpen={sheetOpen} setSheetOpen={setSheetOpen}/>
      <div className="flex-1 min-w-0">
        <Topbar theme={theme} setTheme={setTheme} branchId={branchId} isMobile={isMobile} setSheetOpen={setSheetOpen}/>
        {isMobile && <MobileBranchStrip theme={theme} branchId={branchId} setBranchId={setBranchId}/>}
        <div style={{ paddingBottom: isMobile ? 80 : 70 }}>
          {renderView()}
        </div>
      </div>
      <QuickNav/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
