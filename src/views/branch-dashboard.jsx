/* Branch dashboard - reuses Dashboard layout but coerces to current branch */
const BranchDashboard = ({ theme, branchId, setView, setPatientFromName }) => {
  // If "all", show centro by default for the branch view
  const effective = branchId === "all" ? "centro" : branchId;
  return <Dashboard theme={theme} branchId={effective} setView={setView} setPatientFromName={setPatientFromName}/>;
};
Object.assign(window, { BranchDashboard });
