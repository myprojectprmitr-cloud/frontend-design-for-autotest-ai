/* Frontend ↔ backend communication.
   - Axios instance configured from window.APP_CONFIG.
   - When USE_MOCK is true, a custom Axios adapter answers from window.MOCK_DB
     so the UI works without a server. Turn it off to hit the real API.
   - apiFetch() is the same call made with the native Fetch API, for places
     where Axios is not wanted. */
(function () {
  var cfg = window.APP_CONFIG || {};

  function mockAdapter(config) {
    var method = (config.method || "get").toUpperCase();
    var path = (config.url || "").replace(/^https?:\/\/[^/]+/, "").replace(cfg.API_BASE_URL || "", "");
    var key = method + " " + path.split("?")[0];
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        var data = window.MOCK_DB[key];
        if (data === undefined) {
          var err = new Error("Mock: no route for " + key);
          err.response = { status: 404, data: { error: "Not found" } };
          return reject(err);
        }
        resolve({
          data: JSON.parse(JSON.stringify(data)),
          status: 200, statusText: "OK", headers: {}, config: config, request: {}
        });
      }, cfg.MOCK_LATENCY_MS || 300);
    });
  }

  var client = window.axios.create({
    baseURL: cfg.API_BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" }
  });
  if (cfg.USE_MOCK) client.defaults.adapter = mockAdapter;

  // Attach auth token if the app stores one.
  client.interceptors.request.use(function (config) {
    var token = null;
    try { token = localStorage.getItem("autotest_token"); } catch (e) {}
    if (token) config.headers.Authorization = "Bearer " + token;
    return config;
  });
  client.interceptors.response.use(
    function (res) { return res; },
    function (error) {
      console.error("[api]", error.message);
      return Promise.reject(error);
    }
  );

  function apiFetch(path, options) {
    options = options || {};
    if (cfg.USE_MOCK) {
      return mockAdapter({ method: options.method || "GET", url: path }).then(function (r) { return r.data; });
    }
    return fetch(cfg.API_BASE_URL + path, {
      method: options.method || "GET",
      headers: { "Content-Type": "application/json" },
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  window.API = {
    client: client,
    fetch: apiFetch,
    // Dark (autonomous) screens
    getDashboard: function () { return client.get("/dashboard").then(function (r) { return r.data; }); },
    getRecording: function () { return client.get("/recordings/current").then(function (r) { return r.data; }); },
    analyzeRecording: function (payload) { return client.post("/recordings/analyze", payload).then(function (r) { return r.data; }); },
    getTestCases: function () { return client.get("/test-cases").then(function (r) { return r.data; }); },
    synthesizeCases: function (prompt) { return client.post("/test-cases/synthesize", { prompt: prompt }).then(function (r) { return r.data; }); },
    getWorkflow: function (id) { return client.get("/workflows/" + id).then(function (r) { return r.data; }); },
    getScript: function (id) { return client.get("/scripts/" + id).then(function (r) { return r.data; }); },
    runTests: function (payload) { return client.post("/runs", payload).then(function (r) { return r.data; }); },
    getLiveRun: function () { return client.get("/runs/live").then(function (r) { return r.data; }); },
    pauseRun: function () { return client.post("/runs/live/pause").then(function (r) { return r.data; }); },
    stopRun: function () { return client.post("/runs/live/stop").then(function (r) { return r.data; }); },
    createJira: function (ids) { return client.post("/jira/tickets", { ids: ids }).then(function (r) { return r.data; }); },
    // Light (QA) screens — these use the Fetch API path to show both clients
    getQaDashboard: function () { return apiFetch("/qa/dashboard"); },
    getQaCreate: function () { return apiFetch("/qa/create"); },
    analyzeQa: function (payload) { return apiFetch("/qa/analyze", { method: "POST", body: payload }); },
    getFailure: function (id) { return apiFetch("/qa/failures/" + id); },
    applyFix: function (id) { return apiFetch("/qa/failures/" + id + "/apply-fix", { method: "POST" }); },
    getQaRun: function (id) { return apiFetch("/qa/runs/" + id); },
    getQaWorkflow: function (id) { return apiFetch("/qa/workflows/" + id); }
  };

  // Extension screens (pages linked from the design but not drawn in it).
  var get = function (path) { return client.get(path).then(function (r) { return r.data; }); };
  var post = function (path, body) { return client.post(path, body).then(function (r) { return r.data; }); };
  Object.assign(window.API, {
    getProjects: function () { return get("/projects"); },
    createProject: function (p) { return post("/projects", p); },
    getFailures: function () { return get("/failures"); },
    fixFailure: function (id) { return post("/failures/fix", { id: id }); },
    rerunFailure: function (id) { return post("/failures/rerun", { id: id }); },
    getBugs: function () { return get("/bugs"); },
    createBug: function (b) { return post("/bugs", b); },
    pushBugToJira: function (id) { return post("/bugs/jira", { id: id }); },
    getHealing: function () { return get("/healing"); },
    decideHealing: function (id, approve) { return post("/healing/decision", { id: id, approve: approve }); },
    getAnalytics: function (range) { return get("/analytics?range=" + encodeURIComponent(range || "12w")); },
    getRuns: function () { return get("/runs"); },
    getRunReport: function (id) { return get("/runs/report?id=" + encodeURIComponent(id || "")); },
    getNotifications: function () { return get("/notifications"); },
    getSettings: function () { return get("/settings"); },
    saveSettings: function (s) { return client.put("/settings", s).then(function (r) { return r.data; }); },
    inviteMember: function (m) { return post("/team/invite", m); },
    getHelp: function () { return get("/help"); },
    login: function (creds) {
      return post("/auth/login", creds).then(function (r) {
        try { localStorage.setItem("autotest_token", r.token); } catch (e) {}
        return r;
      });
    },
    logout: function () { try { localStorage.removeItem("autotest_token"); } catch (e) {} }
  });
})();
