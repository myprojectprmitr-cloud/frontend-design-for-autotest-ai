/* Extension screen: Projects (linked from the sidebar, not drawn in the Figma). */
function Projects({ theme }) {
  return (
    <Screen theme={theme} active="Projects" crumbs={["Workspace", "Projects"]} loader={() => API.getProjects()}>
      {(data) => <ProjectsBody theme={theme} initial={data} />}
    </Screen>
  );
}

function ProjectsBody({ theme, initial }) {
  const act = useAction();
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState("grid");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", url: "https://", framework: "Playwright", repo: "" });
  const gridRef = useRef(null);

  useEffect(() => { if (gridRef.current) window.Anim.staggerIn(gridRef.current.children); }, [filter, view]);

  const shown = list.filter(p =>
    (filter === "All" || p.status === filter || (filter === "Attention" && (p.status === "Failing" || p.health < 85))) &&
    (p.name + p.repo).toLowerCase().includes(q.toLowerCase()));
  const totalTests = list.reduce((a, p) => a + p.tests, 0);
  const avgHealth = list.reduce((a, p) => a + p.health, 0) / list.length;

  const create = (e) => {
    if (!form.name.trim()) return;
    act(() => API.createProject(form), e).then(() => {
      setList(l => [{ id: form.name.toLowerCase().replace(/\W+/g, "-"), name: form.name, repo: form.repo || "—", branch: "main", framework: form.framework, health: 100, passRate: 0, tests: 0, workflows: 0, lastRun: "Never", status: "Queued", env: ["Staging"], trend: [0, 0, 0, 0, 0, 0, 0], owners: ["PS"] }, ...l]);
      setOpen(false);
      setForm({ name: "", url: "https://", framework: "Playwright", repo: "" });
    });
  };

  return (
    <>
      <PageHead
        eyebrow={<><span>WORKSPACE</span><Icon n="chevron-right" s={11} /><span>Enterprise Core</span></>}
        title="Projects"
        badge={<Pill tone="info">{list.length} apps under test</Pill>}
        sub="Every application AutoTestAI is learning and testing, with live health across your environments."
        actions={<>
          <button className="btn" onClick={() => go(pagePath(theme, "analytics"))}><Icon n="chart-line" s={14} /> Compare</button>
          <button className="btn btn-primary" onClick={() => setOpen(true)}><Icon n="plus" s={14} /> New Project</button>
        </>}
      />

      <div className="grid-4">
        <Kpi label="Projects" value={list.length} icon="folder" sub="2 added this month" />
        <Kpi label="Total tests" value={totalTests} icon="list-checks" sub="+48 this week" tone="ok" />
        <Kpi label="Avg. health" value={avgHealth} decimals={1} suffix="%" icon="heart-pulse" sub="SLO target 95%" />
        <Kpi label="Need attention" value={list.filter(p => p.status === "Failing").length} icon="triangle-alert" sub="Failing on latest run" tone="bad" />
      </div>

      <div className="row-between a-up" style={{ flexWrap: "wrap", gap: 12 }}>
        <div className="tabs">
          {["All", "Passing", "Failing", "Running", "Healed", "Attention"].map(t => (
            <button key={t} className={`tab ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
        <div className="row">
          <label className="input" style={{ width: 240, height: 32 }}>
            <Icon n="search" s={13} /><input placeholder="Search projects or repos..." value={q} onChange={e => setQ(e.target.value)} />
          </label>
          <div className="seg">
            <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Icon n="layout-grid" s={13} /></button>
            <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view"><Icon n="list" s={13} /></button>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid-auto" ref={gridRef}>
          {shown.map(p => (
            <div key={p.id} className="card card-pad a-up" style={{ cursor: "pointer", transition: "transform .2s, border-color .2s" }}
              onMouseEnter={e => window.gsap.to(e.currentTarget, { y: -3, duration: 0.2 })}
              onMouseLeave={e => window.gsap.to(e.currentTarget, { y: 0, duration: 0.2 })}
              onClick={() => go(pagePath(theme, "dashboard"))}>
              <div className="row-between">
                <div className="row" style={{ gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "var(--radius)", background: "var(--info-bg)", color: "var(--link)", display: "grid", placeItems: "center", fontWeight: 600 }}>{p.name[0]}</div>
                  <div>
                    <b style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</b>
                    <div className="xs mono muted row" style={{ gap: 4 }}><Icon n="git-branch" s={11} />{p.repo} · {p.branch}</div>
                  </div>
                </div>
                <StatusPill status={p.status} />
              </div>
              <div className="row-between" style={{ marginTop: 16, alignItems: "flex-end" }}>
                <div>
                  <div className="xs muted">Pass rate</div>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>{p.passRate ? `${p.passRate}%` : "—"}</div>
                </div>
                <Sparkline data={p.trend} color={p.status === "Failing" ? "var(--c-fail)" : "var(--link)"} />
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="row-between xs" style={{ marginBottom: 5 }}><span className="muted">Health</span><b className="mono">{p.health}%</b></div>
                <div className="hbar" style={{ background: "var(--surface-3)" }}><i className="a-fill" style={{ width: `${p.health}%`, background: p.health < 85 ? "var(--c-fail)" : "var(--c-pass)" }} /></div>
              </div>
              <div className="row-between xs muted" style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border-soft)" }}>
                <span className="row" style={{ gap: 10 }}>
                  <span className="row" style={{ gap: 4 }}><Icon n="list-checks" s={12} />{p.tests} tests</span>
                  <span className="row" style={{ gap: 4 }}><Icon n="git-fork" s={12} />{p.workflows}</span>
                  <span className="row" style={{ gap: 4 }}><Icon n="clock" s={12} />{p.lastRun}</span>
                </span>
                <span className="avatar-stack">{p.owners.map(o => <Avatar key={o} initials={o} color={PEOPLE[o]} />)}</span>
              </div>
              <div className="row" style={{ gap: 6, marginTop: 10 }}>
                <Pill tone="muted">{p.framework}</Pill>
                {p.env.map(e => <Pill key={e} tone="info">{e}</Pill>)}
              </div>
            </div>
          ))}
          {shown.length === 0 && <div className="card card-pad muted">No projects match.</div>}
        </div>
      ) : (
        <section className="card a-up" style={{ overflow: "hidden" }}>
          <table className="table">
            <thead><tr><th>Project</th><th>Status</th><th>Framework</th><th>Tests</th><th>Pass rate</th><th>Health</th><th>Trend</th><th>Last run</th></tr></thead>
            <tbody ref={gridRef}>
              {shown.map(p => (
                <tr key={p.id} className="row-hover" style={{ cursor: "pointer" }} onClick={() => go(pagePath(theme, "dashboard"))}>
                  <td><b style={{ fontWeight: 500 }}>{p.name}</b><div className="xs mono muted">{p.repo}</div></td>
                  <td><StatusPill status={p.status} /></td>
                  <td className="small">{p.framework}</td>
                  <td className="mono small">{p.tests}</td>
                  <td className="mono small">{p.passRate ? `${p.passRate}%` : "—"}</td>
                  <td style={{ width: 120 }}><div className="hbar" style={{ background: "var(--surface-3)" }}><i style={{ width: `${p.health}%`, background: p.health < 85 ? "var(--c-fail)" : "var(--c-pass)" }} /></div></td>
                  <td><Sparkline data={p.trend} w={80} h={22} color={p.status === "Failing" ? "var(--c-fail)" : "var(--link)"} /></td>
                  <td className="small muted">{p.lastRun}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New project" width={520}
        footer={<><button className="btn" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={create} disabled={!form.name.trim()}>Create project</button></>}>
        <div className="modal-body col" style={{ gap: 14 }}>
          <label className="field"><span>Project name</span><div className="input"><input autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Library Portal" /></div></label>
          <label className="field"><span>Application base URL</span><div className="input"><Icon n="link" s={13} /><input className="mono" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} /></div></label>
          <label className="field"><span>Repository (optional)</span><div className="input"><Icon n="github" s={13} /><input value={form.repo} onChange={e => setForm({ ...form, repo: e.target.value })} placeholder="org/repo" /></div></label>
          <div className="field"><span>Framework</span>
            <div className="seg" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
              {["Playwright", "Selenium", "Cypress"].map(f => <button key={f} className={form.framework === f ? "active" : ""} onClick={() => setForm({ ...form, framework: f })} style={{ fontSize: 12, padding: 6 }}>{f}</button>)}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
window.Projects = Projects;
