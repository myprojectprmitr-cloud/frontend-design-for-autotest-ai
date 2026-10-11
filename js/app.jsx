/* App root: hash routes → screens. One route per Figma frame. */
const ROUTES = {
  "/dark/upload":     { screen: "DarkUpload",     group: "dark",    label: "Upload Recording" },
  "/dark/dashboard":  { screen: "DarkDashboard",  group: "dark",    label: "Dashboard" },
  "/dark/test-cases": { screen: "DarkTestCases",  group: "dark",    label: "Test Cases" },
  "/dark/workflow":   { screen: "DarkWorkflow",   group: "dark",    label: "AI Workflow Builder" },
  "/dark/scripts":    { screen: "DarkScripts",    group: "dark",    label: "Automation Scripts" },
  "/dark/runs":       { screen: "DarkRuns",       group: "dark",    label: "Test Runs & Live Runner" },
  "/light/dashboard": { screen: "LightDashboard", group: "light",   label: "QA Dashboard" },
  "/light/create":    { screen: "LightCreate",    group: "light",   label: "Create Test & Analysis" },
  "/light/failure":   { screen: "LightFailure",   group: "light",   label: "Failure Analysis" },
  "/light/runner":    { screen: "LightRunner",    group: "light",   label: "Live Test Runner" },
  "/light/workflow":  { screen: "LightWorkflow",  group: "light",   label: "Workflow & Script" },
  "/light/test-cases": { screen: "LightTestCases", group: "light",  label: "Test Cases" },
  "/light/scripts":   { screen: "LightScripts",   group: "light",   label: "Automation Scripts" },
  "/login":           { screen: "Login",          group: "auth",    label: "Sign in" }
};

// Extension screens (not drawn in the Figma) exist in both the Dark and Light themes.
[
  ["projects", "Projects", "Projects"], ["failures", "Failures", "Failures"], ["bugs", "BugReports", "Bug Reports"],
  ["self-healing", "SelfHealing", "Self-Healing"], ["analytics", "Analytics", "Analytics"], ["settings", "Settings", "Settings"],
  ["help", "Help", "Help & Documentation"], ["all-runs", "AllRuns", "All Test Runs"], ["report", "RunReport", "Run Report"]
].forEach(([key, screen, label]) => {
  ROUTES[`/dark/${key}`] = { screen, group: "dark", label };
  ROUTES[`/light/${key}`] = { screen, group: "light", label };
});

function DesignSwitcher({ route }) {
  const current = ROUTES[route] ? ROUTES[route].group : "dark";
  const ref = useRef(null);
  useLayoutEffect(() => {
    window.gsap.from(ref.current, { y: 40, autoAlpha: 0, duration: 0.6, delay: 0.6, ease: "power3.out" });
  }, []);
  const opts = [["dark", "Dark", "/dark/dashboard"], ["light", "Light", "/light/dashboard"]];
  // Stay on the same page when the other theme has it (e.g. /dark/projects → /light/projects).
  // A few designed screens have different names in each theme.
  const ALIAS = { upload: { light: "create" }, create: { dark: "upload" }, runs: { light: "runner" }, runner: { dark: "runs" }, failure: { dark: "failures" } };
  const page = route.split("/")[2];
  const target = (group, fallback) => {
    const name = (ALIAS[page] && ALIAS[page][group]) || page;
    return ROUTES[`/${group}/${name}`] ? `/${group}/${name}` : fallback;
  };
  return (
    <div className="switcher" ref={ref} role="tablist" aria-label="Design theme">
      {opts.map(([key, label, to]) => (
        <button key={key} className={current === key ? "active" : ""} onClick={() => go(target(key, to))}>{label}</button>
      ))}
    </div>
  );
}

function App() {
  const route = useHashRoute();
  const def = ROUTES[route] || ROUTES["/dark/dashboard"];
  const Screen = window[def.screen];

  useEffect(() => {
    document.title = `${def.label} — AutoTestAI`;
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <ToastProvider>
      {Screen ? <Screen key={route} theme={def.group} /> : <div style={{ color: "#fff", padding: 40 }}>Missing screen: {def.screen}</div>}
      {def.group !== "auth" && <DesignSwitcher route={route} />}
    </ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
