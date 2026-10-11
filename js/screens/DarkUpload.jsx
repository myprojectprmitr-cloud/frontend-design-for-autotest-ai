/* Figma: "Upload Recording — AutoTestAI" (1:2) */
function DarkUpload() {
  const { data, loading, error } = useApi(() => API.getRecording());
  const ref = usePageAnim(!!data);
  const act = useAction();
  const toast = useToast();
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [browser, setBrowser] = useState("Chrome");
  const [engine, setEngine] = useState("Playwright");
  const [synth, setSynth] = useState(null);
  const inputRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => { if (data) setSynth(data.synthesis); }, [data]);
  useEffect(() => {
    if (!data || !iconRef.current) return;
    const tw = window.gsap.to(iconRef.current, { y: -6, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    return () => tw.kill();
  }, [data]);

  if (loading) return <DarkShell active="Recordings"><main className="page"><PageLoading /></main></DarkShell>;
  if (error) return <DarkShell active="Recordings"><main className="page"><ErrorBox error={error} /></main></DarkShell>;

  const v = data.video;
  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) setFile(f);
  };
  const selected = (synth || []).filter(s => s.on).length;

  return (
    <DarkShell active="Recordings">
      <main className="page" ref={ref}>
        <div className="glow" style={{ width: 384, height: 384, left: 340, top: -60, background: "rgba(128,131,255,.12)" }} />
        <div className="glow" style={{ width: 288, height: 288, right: 60, top: 140, background: "rgba(208,188,255,.08)" }} />
        <div className="page-inner">
          {/* Breadcrumb + header */}
          <div className="a-up">
            <div className="row small muted mono" style={{ gap: 6, fontSize: 11 }}>
              WORKFLOWS <Icon n="chevron-right" s={11} /> NEW AUTOMATED TEST <Icon n="chevron-right" s={11} />
              <span className="badge b-gray" style={{ fontSize: 10 }}>Step 1: Ingestion &amp; Analysis</span>
            </div>
            <div className="row-between" style={{ alignItems: "flex-end", marginTop: 10 }}>
              <div>
                <h1 className="row" style={{ fontSize: 32, letterSpacing: "-0.8px", gap: 10 }}>
                  Teach AutoTestAI your application <span className="badge b-accent" style={{ fontSize: 10 }}><Icon n="eye" s={11} /> Neural Vision</span>
                </h1>
                <p className="muted" style={{ fontSize: 15, lineHeight: "22px", marginTop: 8, maxWidth: 720 }}>
                  Upload a screen recording of a user completing a workflow. AI will analyze it, detect UI controls, and generate automation.
                </p>
              </div>
              <div className="card row small" style={{ padding: "10px 14px", gap: 14, background: "rgba(25,28,34,.8)" }}>
                <span className="row" style={{ gap: 6 }}><span className="dot" style={{ color: "#c0c1ff" }} /> Model Target: CV-Vision-v4.2b</span>
                <span className="faint">•</span>
                <span>Latency ~140ms</span>
              </div>
            </div>
          </div>

          {/* Pipeline */}
          <section className="card a-up" style={{ padding: 12 }}>
            <div className="row-between" style={{ marginBottom: 12, padding: "2px 4px" }}>
              <div className="card-title"><Icon n="network" s={16} /> Autonomous Ingestion Pipeline <span className="badge b-gray">7 Stages</span></div>
              <span className="small row" style={{ gap: 6 }}><Icon n="timer" s={13} /> Est. total compute: <b>18.4s</b></span>
            </div>
            <div className="pipeline">
              {data.stages.map(s => (
                <div key={s.n} className={`pstage a-pop ${s.state === "active" ? "active" : ""}`}>
                  <div className="row-between">
                    <span className="n" style={s.state === "active" ? { color: "#e1e2eb" } : null}>{s.n}</span>
                    {s.state === "done" && <Icon n="circle-check" s={14} style={{ color: "#c0c1ff" }} />}
                    {s.state === "active" && <span className="dot live" style={{ color: "#c0c1ff" }} />}
                    {s.state === "queued" && <Icon n={s.icon} s={14} className="faint" />}
                  </div>
                  <div style={{ fontWeight: 500, marginTop: 4, color: s.state === "queued" ? "#918fa0" : "#e1e2eb", fontSize: s.state === "active" ? 13 : 13 }}>{s.name}</div>
                  <div className="xs row" style={{ gap: 4, color: s.state === "active" ? "#c7c4d7" : "#918fa0" }}>
                    {s.sub} {s.state === "done" && <Icon n="check" s={10} />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Drop zone + video */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 396px", gap: 16 }} className="split-2">
            <section
              className={`card dropzone a-up ${drag ? "drag" : ""}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
            >
              <div className="upload-icon" ref={iconRef}><Icon n="cloud-upload" s={28} /></div>
              <h2 style={{ fontSize: 24, letterSpacing: "-0.4px" }}>{file ? file.name : "Drop your screen recording here"}</h2>
              <p className="muted" style={{ fontSize: 13 }}>{file ? `${(file.size / 1048576).toFixed(1)} MB ready to ingest` : "or browse files from your computer (MP4, WebM, MOV up to 500MB)"}</p>
              <div className="row" style={{ gap: 8, marginTop: 10 }}>
                <button className="btn btn-lg" onClick={() => inputRef.current.click()}><Icon n="folder-open" s={16} /> Browse System Files</button>
                <button className="btn btn-lg" onClick={() => toast("In-browser recording needs screen-capture permission and a backend to upload to.")}><Icon n="video" s={16} /> Record In-Browser</button>
                <input ref={inputRef} type="file" accept="video/*" hidden onChange={e => e.target.files[0] && setFile(e.target.files[0])} />
              </div>
              <div className="row xs muted" style={{ gap: 16, marginTop: 22 }}>
                <span className="row" style={{ gap: 4 }}><Icon n="gauge" s={12} /> 60 FPS Native Ingest</span>
                <span className="row" style={{ gap: 4 }}><Icon n="lock" s={12} /> Zero Data Retention (HIPAA Compliant)</span>
                <span className="row" style={{ gap: 4 }}><Icon n="monitor" s={12} /> Up to 4K Res</span>
              </div>
            </section>

            <section className="card card-pad a-up">
              <div className="row-between" style={{ marginBottom: 12 }}>
                <div className="card-title"><span className="dot live" style={{ color: "#c0c1ff" }} /> Ingested Master Video</div>
                <span className="badge b-gray">Ready for analysis</span>
              </div>
              <div className="video-frame">
                <div className="row-between xs" style={{ position: "absolute", left: 10, right: 10, top: 8, zIndex: 2 }}>
                  <span className="row" style={{ gap: 4 }}><span style={{ width: 9, height: 9, borderRadius: "50%", border: "2px solid #ffb68b" }} /> RAW STREAM</span>
                  <span>{v.res}</span>
                </div>
                <MiniAppPreview />
                <div className="row-between" style={{ position: "absolute", left: 8, right: 8, bottom: 8, zIndex: 2 }}>
                  <span className="row mono xs" style={{ gap: 6 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#c0c1ff", color: "#1000a9", display: "grid", placeItems: "center" }}><Icon n="play" s={10} /></span>
                    {v.time} / {v.time}
                  </span>
                  <span className="badge b-solid" style={{ fontSize: 10 }}>CV Anchors: 100%</span>
                </div>
              </div>
              <div className="row-between" style={{ marginTop: 16 }}>
                <b style={{ fontWeight: 500 }}>{v.file}</b><span className="xs muted">{v.size}</span>
              </div>
              <div className="row-between xs muted" style={{ marginTop: 4 }}>
                <span>Codec: {v.codec}</span><span>Bitrate: {v.bitrate}</span>
              </div>
              <div className="row-between xs" style={{ marginTop: 20 }}>
                <span className="row" style={{ gap: 5, color: "#c0c1ff" }}><Icon n="circle-check" s={12} /> Upload completed &amp; indexed</span><b>100%</b>
              </div>
              <Progress value={100} color="#c0c1ff" height={4} style={{ marginTop: 6 }} />
            </section>
          </div>

          {/* Environment + synthesis */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="split-2">
            <section className="card card-pad a-up">
              <div className="card-title" style={{ marginBottom: 16 }}><Icon n="sliders-horizontal" s={16} /> Target Environment Configuration</div>
              <div className="col" style={{ gap: 6 }}>
                <span className="small muted" style={{ fontSize: 12 }}>Project Workspace</span>
                <div className="input" style={{ justifyContent: "space-between" }}>
                  <span className="row" style={{ gap: 8 }}><Icon n="building-2" s={14} /> Student Management Portal <span className="badge b-gray" style={{ fontSize: 10 }}>feature/student-onboarding</span></span>
                  <Icon n="chevrons-up-down" s={13} />
                </div>
              </div>
              <div className="col" style={{ gap: 6, marginTop: 14 }}>
                <div className="row-between"><span className="small muted" style={{ fontSize: 12 }}>Target Base URL</span>
                  <span className="xs row" style={{ gap: 4, color: "#a8c3ff" }}><span className="dot live" /> Live Ping: HTTP 200 OK (38ms)</span></div>
                <div className="input" style={{ justifyContent: "space-between" }}>
                  <span className="row mono small" style={{ gap: 8 }}><Icon n="link" s={13} /> https://staging.studentportal.io/login</span>
                  <Icon n="copy" s={13} />
                </div>
              </div>
              <div className="col" style={{ gap: 6, marginTop: 14 }}>
                <span className="small muted" style={{ fontSize: 12 }}>Target Emulation Browsers</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {[["Chrome", "Chromium v126", "chrome"], ["Firefox", "Gecko v125", "globe"], ["WebKit", "Safari 17.4", "compass"]].map(([n, s, ic]) => (
                    <button key={n} className={`choice ${browser === n ? "on" : ""}`} onClick={() => setBrowser(n)}>
                      <span className="row" style={{ gap: 8 }}><Icon n={ic} s={16} /><span className="col"><b style={{ fontWeight: 500 }}>{n}</b><span className="xs muted">{s}</span></span></span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="col" style={{ gap: 6, marginTop: 14 }}>
                <span className="small muted" style={{ fontSize: 12 }}>Automation Engine &amp; Syntax</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["Playwright", "TypeScript / Python (Fast & Resilient)", "zap"], ["Selenium Grid", "Java / Python / C# (Legacy Grid)", "terminal-square"]].map(([n, s, ic]) => (
                    <button key={n} className={`choice ${engine === n ? "on" : ""}`} onClick={() => setEngine(n)}>
                      <span className="row-between">
                        <span className="row" style={{ gap: 6 }}><Icon n={ic} s={15} /><b style={{ fontWeight: 500 }}>{n}</b></span>
                        <span style={{ width: 12, height: 12, borderRadius: "50%", border: engine === n ? "3px solid #c0c1ff" : "1px solid #464554", background: engine === n ? "#1000a9" : "#272a30" }} />
                      </span>
                      <span className="xs muted" style={{ display: "block", marginTop: 4 }}>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="card card-pad a-up">
              <div className="row-between" style={{ marginBottom: 16 }}>
                <div className="card-title"><Icon n="wand-sparkles" s={16} /> AI Synthesis Pipeline</div>
                <span className="badge b-accent">GPT-4o Vision + CV</span>
              </div>
              <div className="col" style={{ gap: 8 }}>
                {(synth || []).map((s, i) => (
                  <div key={s.title} className={`synth-row a-left ${s.smart ? "smart" : ""}`}>
                    <Icon n={s.icon} s={18} />
                    <div className="grow">
                      <div style={{ fontWeight: 500 }} className="row">{s.title} {s.smart && <span className="badge b-solid" style={{ fontSize: 9, padding: "0 4px" }}>SMART</span>}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{s.sub}</div>
                    </div>
                    <Check on={s.on} onClick={() => setSynth(list => list.map((x, j) => j === i ? { ...x, on: !x.on } : x))} />
                  </div>
                ))}
              </div>
              <div className="row-between xs" style={{ marginTop: 18 }}>
                <span className="muted">Reasoning Engine:</span><b>Deep Semantic Reasoning (GPT-4o Vision + CV)</b>
              </div>
            </section>
          </div>

          {/* Footer */}
          <section className="card footer-bar a-up">
            <div className="row" style={{ gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 4, background: "#0b0e14", display: "grid", placeItems: "center" }}><Icon n="badge-check" s={20} /></div>
              <div>
                <div style={{ fontWeight: 500 }}>Ready to build workflow suite</div>
                <div className="small muted" style={{ fontSize: 12 }}>Estimated execution time: 18 seconds • {selected + 1} automated tests will be authored</div>
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-lg btn-ghost" onClick={() => go("/dark/dashboard")}>Cancel</button>
              <button className="btn btn-lg" onClick={() => toast("Draft saved.")}>Save Draft</button>
              <button className="btn btn-lg btn-primary" onClick={(e) => act(() => API.analyzeRecording({ browser, engine, steps: synth }), e).then(() => setTimeout(() => go("/dark/workflow"), 900))}>
                <Icon n="zap" s={16} /> Analyze Recording &amp; Build Workflow
              </button>
            </div>
          </section>
        </div>
      </main>
    </DarkShell>
  );
}

/* Tiny wireframe of the recorded app inside the video frame */
function MiniAppPreview() {
  return (
    <svg viewBox="0 0 360 200" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <rect x="0" y="0" width="360" height="200" fill="#0b0e14" />
      <rect x="10" y="26" width="60" height="150" fill="#12151c" />
      {[0, 1, 2, 3, 4].map(i => <rect key={i} x="18" y={36 + i * 14} width="40" height="5" rx="1" fill="#272a30" />)}
      <rect x="120" y="30" width="140" height="140" rx="2" fill="#151925" stroke="#4d8eff" strokeWidth=".8" />
      <text x="190" y="44" fill="#c7c4d7" fontSize="6" textAnchor="middle" fontFamily="Inter">Student Registration | AutoTestAI</text>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <g key={i}>
          <rect x="130" y={54 + i * 17} width={i % 2 ? 120 : 56} height="8" rx="1" fill="#1d2026" stroke="#4d8eff" strokeWidth=".5" />
          {i % 2 === 0 && <rect x="194" y={54 + i * 17} width="56" height="8" rx="1" fill="#1d2026" stroke="#4d8eff" strokeWidth=".5" />}
        </g>
      ))}
      <rect x="150" y="156" width="80" height="8" rx="1" fill="#272a30" stroke="#4d8eff" strokeWidth=".6" />
      <rect x="80" y="70" width="34" height="10" fill="rgba(87,27,193,.6)" />
      <rect x="268" y="70" width="34" height="10" fill="rgba(87,27,193,.6)" />
      <rect x="268" y="40" width="80" height="110" fill="none" stroke="#272a30" />
      {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x="276" y={50 + i * 15} width={30 + (i % 3) * 10} height="4" fill="#32353c" />)}
    </svg>
  );
}
window.DarkUpload = DarkUpload;
