/* Figma: "Test Cases — AutoTestAI" (1:1299) */
function DarkTestCases() {
  const { data, loading, error } = useApi(() => API.getTestCases());
  const ref = usePageAnim(!!data);
  const act = useAction();
  const [tab, setTab] = useState("All");
  const [open, setOpen] = useState("TC-001");
  const [cases, setCases] = useState([]);
  const [prompt, setPrompt] = useState("Add edge cases for leap year dates and special characters in names");
  const tbodyRef = useRef(null);
  const expandRef = useRef(null);

  useEffect(() => { if (data) setCases(data.cases); }, [data]);
  useEffect(() => { if (tbodyRef.current) window.Anim.staggerIn(tbodyRef.current.querySelectorAll("tr.tc-row")); }, [tab]);
  useLayoutEffect(() => { if (open && expandRef.current) window.Anim.expand(expandRef.current); }, [open]);

  if (loading) return <DarkShell active="Test Cases"><main className="page"><PageLoading /></main></DarkShell>;
  if (error) return <DarkShell active="Test Cases"><main className="page"><ErrorBox error={error} /></main></DarkShell>;

  const tabs = [["All", 18], ["Functional", 6], ["Negative", 4], ["Boundary", 3], ["Security", 3], ["Regression", 2]];
  const shown = cases.filter(c => tab === "All" || c.type === tab);
  const approvedCount = cases.filter(c => c.checked).length;
  const typeStyle = {
    Functional: { background: "rgba(77,142,255,.25)", color: "#a8c3ff" },
    Negative: { background: "rgba(87,27,193,.35)", color: "#d0bcff" },
    Boundary: { background: "#32353c", color: "#c7c4d7" },
    Security: { background: "#32353c", color: "#ffb68b" }
  };
  const prioStyle = {
    High: { background: "rgba(87,27,193,.35)", color: "#d0bcff" },
    Medium: { background: "#32353c", color: "#c7c4d7" },
    Critical: { background: "#93000a", color: "#ffdad6" },
    Low: { background: "transparent", color: "#c7c4d7" }
  };
  const toggle = (id) => setCases(list => list.map(c => c.id === id ? { ...c, checked: !c.checked } : c));

  return (
    <DarkShell active="Test Cases">
      <main className="page" ref={ref}>
        <div className="glow" style={{ width: 420, height: 300, right: 40, top: 200, background: "rgba(128,131,255,.1)" }} />
        <div className="page-inner">
          <div className="row-between a-up" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="row xs mono" style={{ gap: 8 }}>
                <span className="badge b-gray" style={{ fontSize: 10 }}>SUITE: {data.suite}</span>
                <span className="row" style={{ gap: 4, color: "#c0c1ff" }}><span className="dot live" /> Synchronized with HEAD</span>
              </div>
              <h1 className="row" style={{ fontSize: 30, letterSpacing: "-0.8px", marginTop: 10, gap: 10 }}>
                Generated Test Cases <span className="badge b-accent" style={{ fontSize: 10, borderRadius: 99 }}>v2.4 Synthetic</span>
              </h1>
              <p className="muted" style={{ maxWidth: 540, marginTop: 6 }}>AI-generated scenarios based on the learned application workflow for "Student Registration Flow".</p>
            </div>
            <div className="col" style={{ gap: 8, alignItems: "flex-start" }}>
              <button className="btn" onClick={() => setCases(l => l.map(c => c.checked ? { ...c, status: "Approved" } : c))}><Icon n="check-check" s={14} /> Bulk Approve ({cases.filter(c => c.status !== "Approved").length || data.stats[2].v})</button>
              <button className="btn btn-primary" onClick={() => go("/dark/scripts")}>Generate Automation Scripts <Icon n="arrow-right" s={14} /></button>
            </div>
          </div>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {data.stats.map(s => (
              <div className="card a-up" key={s.k} style={{ padding: "14px 12px" }}>
                <div className="xs upper muted" style={{ letterSpacing: ".1em" }}>{s.k}</div>
                <div className="row-between" style={{ marginTop: 6, alignItems: "flex-end" }}>
                  <span style={{ fontSize: 22, fontWeight: 600, color: s.warn ? "#ffb4ab" : s.suffix ? "#d0bcff" : "#e1e2eb" }}>
                    <Counter value={s.v} decimals={s.decimals || 0} suffix={s.suffix || ""} />
                    {s.of && <span className="small muted" style={{ fontWeight: 400 }}> / {s.of}</span>}
                  </span>
                  <span className="badge" style={s.warn ? { background: "rgba(147,0,10,.45)", color: "#ffb4ab", fontSize: 10 } : { background: "rgba(77,142,255,.18)", color: "#a8c3ff", fontSize: 10 }}>{s.badge}</span>
                </div>
                <Progress value={s.fill} color={s.warn ? "#ffb4ab" : "#c0c1ff"} height={3} style={{ marginTop: 10 }} />
              </div>
            ))}
          </section>

          {/* Prompt-assisted generation */}
          <section className="card row a-up" style={{ padding: 12, gap: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 4, background: "#571bc1", display: "grid", placeItems: "center", color: "#e9ddff" }}><Icon n="wand-sparkles" s={16} /></div>
            <div style={{ minWidth: 280 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Prompt-Assisted Generation</div>
              <div className="small muted" style={{ fontSize: 12 }}>Inject synthesized test permutations into active suite</div>
            </div>
            <label className="input grow" style={{ height: 32 }}>
              <Icon n="bot" s={14} /><input value={prompt} onChange={e => setPrompt(e.target.value)} style={{ fontSize: 12 }} />
              <span className="kbd" style={{ whiteSpace: "nowrap" }}>Alt + ↵</span>
            </label>
            <button className="btn" style={{ background: "#571bc1", color: "#e9ddff", border: 0 }} onClick={(e) => act(() => API.synthesizeCases(prompt), e)}>Synthesize <Icon n="zap" s={13} /></button>
          </section>

          {/* Filters */}
          <div className="row-between a-up">
            <div className="tabs">
              {tabs.map(([t, c]) => (
                <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {t} <span className="badge b-gray">{c}</span>
                </button>
              ))}
            </div>
            <span className="xs row muted" style={{ gap: 8 }}>Sort: Risk Priority ↓ <Icon n="sliders-horizontal" s={13} /></span>
          </div>

          {/* Table */}
          <section className="card a-up" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}><Check on={approvedCount === cases.length} onClick={() => setCases(l => l.map(c => ({ ...c, checked: approvedCount !== cases.length })))} /></th>
                  <th>ID</th><th>Scenario Title</th><th>Type</th><th>Priority</th><th>Steps</th><th>Expected Result</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody ref={tbodyRef}>
                {shown.map(c => (
                  <React.Fragment key={c.id}>
                    <tr className="tc-row row-hover" style={{ cursor: "pointer" }} onClick={() => setOpen(open === c.id ? null : c.id)}>
                      <td onClick={e => e.stopPropagation()}><Check on={c.checked} onClick={() => toggle(c.id)} /></td>
                      <td className="mono small" style={{ color: "#c0c1ff" }}>{c.id}</td>
                      <td style={{ maxWidth: 290 }}>
                        <span className="row" style={{ gap: 6 }}>
                          <Icon n={open === c.id ? "chevron-down" : "chevron-right"} s={13} />
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                        </span>
                      </td>
                      <td><span className="badge" style={{ ...typeStyle[c.type], fontSize: 10 }}>{c.type}</span></td>
                      <td><span className="badge" style={{ ...prioStyle[c.priority], fontSize: 10 }}>{c.priority}</span></td>
                      <td className="small muted mono">{c.steps} steps</td>
                      <td className="small" style={{ maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.expected}</td>
                      <td><DarkStatus status={c.status} /></td>
                      <td><span className="row" style={{ gap: 12 }}><Icon n="play" s={12} /><Icon n="code" s={13} /></span></td>
                    </tr>
                    {open === c.id && (
                      <tr>
                        <td colSpan={9} style={{ padding: 0, borderBottom: "1px solid rgba(70,69,84,.5)" }}>
                          <div ref={expandRef} style={{ overflow: "hidden" }}>
                            <div className="tc-expand">
                              <div>
                                <div className="row-between" style={{ marginBottom: 12 }}>
                                  <div className="card-title" style={{ fontSize: 14 }}><Icon n="circle-check" s={15} /> Execution Sequence Trace</div>
                                  <span className="xs muted">Est. runtime ~1.42s</span>
                                </div>
                                <div className="small" style={{ padding: "8px 10px", background: "#191c22", border: "1px solid rgba(70,69,84,.35)", marginBottom: 10 }}>
                                  <b className="mono" style={{ fontSize: 11 }}>PRECONDITIONS:</b> App route is <span style={{ color: "#c0c1ff" }}>/login</span>; seeded fixture user sarah.jenkins present in test environment.
                                </div>
                                <div className="col" style={{ gap: 6 }}>
                                  {data.trace.map((s, i) => (
                                    <div className="step-row a-log" key={i}>
                                      <span className="step-num">{i + 1}</span>
                                      <span className="grow">{s.t} <span style={{ color: "#c0c1ff" }} className="mono">{s.code}</span>{s.rest}</span>
                                      {s.tag ? <span className="badge b-blue" style={{ fontSize: 10 }}>{s.tag}</span> : <span className="xs muted">{s.note}</span>}
                                      <span className="xs muted mono">{s.ms}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="col" style={{ gap: 10 }}>
                                <div className="card card-pad" style={{ background: "#191c22" }}>
                                  <div className="row-between">
                                    <div className="card-title" style={{ fontSize: 14 }}><Icon n="brain" s={15} /> AI Reasoning Engine</div>
                                    <span className="badge b-solid" style={{ fontSize: 10 }}>Confidence 99.1%</span>
                                  </div>
                                  <p className="small muted" style={{ marginTop: 8, lineHeight: "18px" }}>
                                    Synthesized from real recording timestamp 00:04-00:28. High confidence critical path verified across 12 regression runs without DOM drift.
                                  </p>
                                  <div className="xs row" style={{ gap: 6, marginTop: 10, padding: "6px 8px", background: "#0b0e14", border: "1px solid #272a30" }}>
                                    <Icon n="check" s={11} /> 6 DOM elements auto-bound with multi-resilient fallbacks
                                  </div>
                                </div>
                                <div className="card card-pad" style={{ background: "#191c22" }}>
                                  <div className="xs upper muted" style={{ marginBottom: 8 }}>DOM Resiliency Matrix</div>
                                  <div className="col" style={{ gap: 4 }}>
                                    {data.matrix.map(([k, v]) => <div className="kv mono" key={k}><span>{k}</span><span style={{ color: "#c0c1ff" }}>{v}</span></div>)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </section>

          {/* Readiness */}
          <section className="card row-between a-up" style={{ padding: 16 }}>
            <div className="row" style={{ gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 4, background: "#272a3a", display: "grid", placeItems: "center", color: "#c0c1ff" }}><Icon n="badge-check" s={20} /></div>
              <div>
                <div className="row" style={{ fontWeight: 500, fontSize: 15 }}>Automation Readiness <span className="badge b-blue" style={{ fontSize: 10 }}>18 of 18 ready</span></div>
                <div className="small muted" style={{ fontSize: 12, maxWidth: 460 }}>All 18 test cases mapped to verified locators. 0 missing selectors. Framework target: Playwright TypeScript.</div>
              </div>
            </div>
            <div className="col" style={{ gap: 8, alignItems: "flex-end" }}>
              <div className="row"><button className="btn" onClick={() => go("/dark/scripts")}><Icon n="square-terminal" s={14} /> Edit in Playground</button><button className="btn" onClick={() => downloadFile("student_registration.feature", ["Feature: Student Registration Flow", ...cases.map(c => `\n  Scenario: ${c.id} ${c.title}\n    Given the user is on the login page\n    When the scenario steps run (${c.steps} steps)\n    Then ${c.expected}`)].join("\n"))}><Icon n="file-output" s={14} /> Export Gherkin</button></div>
              <button className="btn" onClick={() => go("/dark/bugs")}><Icon n="arrow-left-right" s={14} /> Push to Jira / TestRail</button>
            </div>
          </section>
        </div>
      </main>
    </DarkShell>
  );
}
window.DarkTestCases = DarkTestCases;
