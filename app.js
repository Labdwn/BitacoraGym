// ---------- Data ----------
const DEFAULT_ROUTINE = {
  dia1: {
    label: "Día 1",
    focus: "Upper A — Pectoral superior + espalda grosor",
    exercises: [
      { id: "d1e1", name: "Press inclinado con mancuernas", target: "4x6-8", rest: "2-3 min", equip: "Mancuernas" },
      { id: "d1e2", name: "Press plano en máquina", target: "3x10-12", rest: "90 seg", equip: "Máquina" },
      { id: "d1e3", name: "Remo con barra (Pendlay)", target: "4x8-10", rest: "2-3 min", equip: "Barra libre" },
      { id: "d1e4", name: "Press militar con mancuernas", target: "3x8-10", rest: "2 min", equip: "Mancuernas" },
      { id: "d1e5", name: "Jalón al pecho agarre ancho", target: "3x10-12", rest: "90 seg", equip: "Polea" },
      { id: "d1e6", name: "Elevaciones laterales", target: "3x12-15", rest: "60-90 seg", equip: "Mancuerna bilateral" },
      { id: "d1e7", name: "Curl inclinado con mancuerna (SS1)", target: "4x10-12", rest: "—", equip: "Mancuerna banco inclinado" },
      { id: "d1e8", name: "Extensión de tríceps overhead (SS1)", target: "3x10-15", rest: "90 seg entre rondas", equip: "Mancuerna / Polea" },
    ],
  },
  dia2: {
    label: "Día 2",
    focus: "Lower A — Isquio/glúteo prioridad",
    exercises: [
      { id: "d2e1", name: "Peso muerto rumano (RDL)", target: "4x6-8", rest: "2-3 min", equip: "Barra libre" },
      { id: "d2e2", name: "Sentadilla hack (secundario)", target: "3x10-12", rest: "2 min", equip: "Máquina hack" },
      { id: "d2e3", name: "Hip thrust", target: "3x10-12", rest: "2 min", equip: "Barra / Máquina" },
      { id: "d2e4", name: "Curl femoral", target: "3x12-15", rest: "90 seg", equip: "Máquina" },
      { id: "d2e5", name: "Elevación de talones de pie", target: "3x15", rest: "60 seg", equip: "Máquina" },
      { id: "d2e6", name: "Abdomen en banco declinado", target: "3x10-15", rest: "60 seg", equip: "Banco declinado" },
    ],
  },
  dia3: {
    label: "Día 3",
    focus: "Upper B — Pectoral superior + espalda ancho",
    exercises: [
      { id: "d3e1", name: "Press inclinado con barra o unilateral", target: "4x8-10", rest: "2 min", equip: "Barra / Mancuerna" },
      { id: "d3e2", name: "Aperturas o pec deck", target: "3x12-15", rest: "90 seg", equip: "Pec deck" },
      { id: "d3e3", name: "Dominadas (lastre al superar 12 reps)", target: "4x6-10", rest: "2-3 min", equip: "Peso corporal / lastre" },
      { id: "d3e4", name: "Remo T o mancuerna a un brazo", target: "3x10-12", rest: "2 min", equip: "Máquina remo T" },
      { id: "d3e5", name: "Face pulls", target: "3x12-15", rest: "90 seg", equip: "Polea (cuerda)" },
      { id: "d3e6", name: "Elevaciones laterales (variante)", target: "3x12-15", rest: "60-90 seg", equip: "Cable / polea" },
      { id: "d3e7", name: "Curl martillo (SS2)", target: "3x12-15", rest: "—", equip: "Mancuerna" },
      { id: "d3e8", name: "Extensión de tríceps polea abajo (SS2)", target: "3x10-12", rest: "90 seg entre rondas", equip: "Polea (cuerda)" },
    ],
  },
  dia4: {
    label: "Día 4",
    focus: "Lower B — Cuádriceps prioridad + isquio secundario",
    exercises: [
      { id: "d4e1", name: "Sentadilla hack", target: "4x6-8", rest: "2-3 min", equip: "Máquina hack" },
      { id: "d4e2", name: "Peso muerto rumano c/mancuernas (secundario)", target: "3x10-12", rest: "2 min", equip: "Mancuernas" },
      { id: "d4e3", name: "Prensa de piernas (pies altos)", target: "3x10-12", rest: "90 seg", equip: "Máquina prensa" },
      { id: "d4e4", name: "Extensión de cuádriceps", target: "3x12-15", rest: "90 seg", equip: "Máquina" },
      { id: "d4e5", name: "Elevación de talones sentado", target: "4x12-15", rest: "60 seg", equip: "Máquina" },
      { id: "d4e6", name: "Abdomen en banco declinado", target: "3x10-15", rest: "60 seg", equip: "Banco declinado" },
    ],
  },
};

const RK = "bitacora_rutina_v1";
const LK = "bitacora_logs_v1";

let routine = loadJSON(RK, DEFAULT_ROUTINE);
let logs = loadJSON(LK, {});
let activeDay = Object.keys(routine)[0];
let editMode = false;
let expanded = {};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveRoutine() {
  try { localStorage.setItem(RK, JSON.stringify(routine)); } catch (e) { showToast("No se pudo guardar"); }
}
function saveLogs() {
  try { localStorage.setItem(LK, JSON.stringify(logs)); } catch (e) { showToast("No se pudo guardar"); }
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso) { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y.slice(2)}`; }
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(() => t.classList.add("hidden"), 2000);
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Render ----------
function renderTabs() {
  const tabRow = document.getElementById("tabRow");
  tabRow.innerHTML = Object.keys(routine).map((k) =>
    `<button class="tab ${k === activeDay ? "active" : ""}" data-day="${k}">${esc(routine[k].label)}</button>`
  ).join("");
  tabRow.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => { activeDay = btn.dataset.day; render(); });
  });
  document.getElementById("focusBar").textContent = routine[activeDay].focus;
}

function render() {
  renderTabs();
  const main = document.getElementById("main");
  const day = routine[activeDay];
  main.innerHTML = day.exercises.map((ex) => cardHTML(ex)).join("") +
    (editMode ? `<button class="add-ex-btn" id="addExBtn">+ Agregar ejercicio</button>` : "");
  document.getElementById("btnEdit").classList.toggle("active", editMode);

  // wire events
  day.exercises.forEach((ex) => wireCard(ex));
  if (editMode) {
    document.getElementById("addExBtn").addEventListener("click", () => {
      const newId = `${activeDay}_${Date.now()}`;
      routine[activeDay].exercises.push({ id: newId, name: "Nuevo ejercicio", target: "3x10-12", rest: "90 seg", equip: "" });
      saveRoutine();
      render();
    });
  }
}

function cardHTML(ex) {
  const entries = logs[ex.id] || [];
  const last = entries[0];
  if (editMode) {
    return `
    <div class="card" data-id="${ex.id}">
      <div class="card-head">
        <div style="flex:1;min-width:0;">
          <input class="edit-input" data-field="name" value="${esc(ex.name)}">
          <div class="meta-row">
            <input class="edit-input-small" data-field="target" value="${esc(ex.target)}" placeholder="4x6-8">
            <input class="edit-input-small" data-field="rest" value="${esc(ex.rest)}" placeholder="2 min">
          </div>
          <input class="edit-input-small" data-field="equip" value="${esc(ex.equip)}" placeholder="Equipo prioritario" style="margin-top:6px;width:100%;">
        </div>
        <button class="remove-btn" data-action="remove">&#128465;</button>
      </div>
    </div>`;
  }
  return `
  <div class="card" data-id="${ex.id}">
    <div class="card-head">
      <div style="flex:1;min-width:0;">
        <div class="ex-name">${esc(ex.name)}</div>
        <div class="meta-row">
          <span class="tag">${esc(ex.target)}</span>
          <span class="tag-dim">${esc(ex.rest)}</span>
        </div>
        ${ex.equip ? `<div class="equip-line">${esc(ex.equip)}</div>` : ""}
      </div>
    </div>
    <div class="card-actions">
      <button class="log-btn" data-action="toggle-form">+ Registrar</button>
      ${entries.length > 0 ? `<button class="hist-btn" data-action="toggle-hist">${entries.length} registro${entries.length !== 1 ? "s" : ""} ${expanded[ex.id] ? "&#9650;" : "&#9660;"}</button>` : ""}
    </div>
    <div class="form hidden" data-role="form">
      <input class="input-full" type="date" data-field="date" value="${todayISO()}" style="margin-bottom:2px;">
      <div class="form-row">
        <input class="input" type="number" inputmode="decimal" placeholder="Peso" data-field="weight" value="${last ? last.weight : ""}">
        <div class="unit-toggle">
          <button class="unit-btn ${(!last || last.unit === "lb") ? "active" : ""}" data-unit="lb">lb</button>
          <button class="unit-btn ${(last && last.unit === "kg") ? "active" : ""}" data-unit="kg">kg</button>
        </div>
        <input class="input" type="number" inputmode="numeric" placeholder="Reps" data-field="reps" value="${last ? last.reps : ""}">
      </div>
      <input class="input-full" placeholder="Equipo usado (opcional)" data-field="equip">
      <input class="input-full" placeholder="Notas (opcional)" data-field="notes">
      <button class="save-btn" data-action="save-log">&#10003; Guardar</button>
    </div>
    <div class="history ${expanded[ex.id] ? "" : "hidden"}" data-role="history">
      ${entries.map((l) => `
        <div class="hist-row" data-log-id="${l.id}">
          <span class="hist-date">${fmtDate(l.date)}</span>
          <span class="hist-val">${l.weight}${l.unit} × ${l.reps}r</span>
          ${l.equip ? `<span class="hist-equip">${esc(l.equip)}</span>` : "<span></span>"}
          <button class="hist-del" data-action="del-log">&#128465;</button>
        </div>
      `).join("")}
    </div>
  </div>`;
}

function wireCard(ex) {
  const card = document.querySelector(`.card[data-id="${ex.id}"]`);
  if (!card) return;

  if (editMode) {
    card.querySelectorAll("[data-field]").forEach((inp) => {
      inp.addEventListener("input", () => {
        ex[inp.dataset.field] = inp.value;
        saveRoutine();
      });
    });
    const rm = card.querySelector('[data-action="remove"]');
    if (rm) rm.addEventListener("click", () => {
      routine[activeDay].exercises = routine[activeDay].exercises.filter((e) => e.id !== ex.id);
      saveRoutine();
      render();
    });
    return;
  }

  const formEl = card.querySelector('[data-role="form"]');
  const toggleBtn = card.querySelector('[data-action="toggle-form"]');
  if (toggleBtn) toggleBtn.addEventListener("click", () => {
    formEl.classList.toggle("hidden");
    toggleBtn.innerHTML = formEl.classList.contains("hidden") ? "+ Registrar" : "&times; Cancelar";
  });

  const histBtn = card.querySelector('[data-action="toggle-hist"]');
  if (histBtn) histBtn.addEventListener("click", () => {
    expanded[ex.id] = !expanded[ex.id];
    render();
  });

  formEl.querySelectorAll(".unit-btn").forEach((ub) => {
    ub.addEventListener("click", () => {
      formEl.querySelectorAll(".unit-btn").forEach((b) => b.classList.remove("active"));
      ub.classList.add("active");
      formEl.dataset.unit = ub.dataset.unit;
    });
  });

  const saveBtn = card.querySelector('[data-action="save-log"]');
  if (saveBtn) saveBtn.addEventListener("click", () => {
    const weight = formEl.querySelector('[data-field="weight"]').value;
    const reps = formEl.querySelector('[data-field="reps"]').value;
    const equip = formEl.querySelector('[data-field="equip"]').value;
    const notes = formEl.querySelector('[data-field="notes"]').value;
    const dateVal = formEl.querySelector('[data-field="date"]').value || todayISO();
    const unit = formEl.querySelector(".unit-btn.active")?.dataset.unit || "lb";
    if (!weight || !reps) { showToast("Falta peso o reps"); return; }
    const entry = { id: `${Date.now()}`, date: dateVal, weight: parseFloat(weight), unit, reps: parseInt(reps, 10), equip: equip.trim(), notes: notes.trim() };
    logs[ex.id] = [entry, ...(logs[ex.id] || [])];
    saveLogs();
    showToast("Registrado");
    render();
    gsAppendRow(routine[activeDay].label, [ex.name, entry.date, entry.weight, entry.unit, entry.reps, entry.equip, entry.notes]);
  });

  card.querySelectorAll('[data-action="del-log"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("[data-log-id]");
      const logId = row.dataset.logId;
      logs[ex.id] = (logs[ex.id] || []).filter((l) => l.id !== logId);
      saveLogs();
      render();
    });
  });
}

// ---------- Google Sheets integration ----------
const GS_CLIENT_ID_KEY = "bitacora_gs_client_id";
const GS_SHEET_ID_KEY = "bitacora_gs_sheet_id";
const GS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

let gsAccessToken = null;
let gsTokenClient = null;
let gsClientId = localStorage.getItem(GS_CLIENT_ID_KEY) || "";
let gsSpreadsheetId = localStorage.getItem(GS_SHEET_ID_KEY) || "";

function gsUpdateStatus() {
  const el = document.getElementById("sheetsStatus");
  if (gsSpreadsheetId && gsAccessToken) {
    el.textContent = "✓ Conectado a Google Sheets — cada registro se guarda ahí también";
    el.classList.remove("hidden");
  } else if (gsSpreadsheetId) {
    el.textContent = "Google Sheets vinculado, pero desconectado esta sesión — toca el ícono de hoja para reconectar";
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

function gsInitTokenClient() {
  if (!gsClientId || !window.google) return null;
  return google.accounts.oauth2.initTokenClient({
    client_id: gsClientId,
    scope: GS_SCOPE,
    callback: () => {}, // set per-request
  });
}

function gsRequestToken(promptMode) {
  return new Promise((resolve, reject) => {
    if (!gsTokenClient) gsTokenClient = gsInitTokenClient();
    if (!gsTokenClient) { reject(new Error("no-client")); return; }
    gsTokenClient.callback = (resp) => {
      if (resp.error) { reject(resp); return; }
      gsAccessToken = resp.access_token;
      resolve(gsAccessToken);
    };
    gsTokenClient.requestAccessToken({ prompt: promptMode });
  });
}

async function gsFetch(url, options = {}) {
  if (!gsAccessToken) await gsRequestToken("");
  let res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${gsAccessToken}` },
  });
  if (res.status === 401) {
    // token expired, retry once with a fresh one
    await gsRequestToken("");
    res = await fetch(url, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${gsAccessToken}` },
    });
  }
  return res;
}

async function gsCreateSpreadsheet() {
  const body = {
    properties: { title: "Bitácora de Rutina" },
    sheets: Object.values(routine).map((d) => ({ properties: { title: d.label } })),
  };
  const res = await gsFetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("create-failed");
  const data = await res.json();
  gsSpreadsheetId = data.spreadsheetId;
  localStorage.setItem(GS_SHEET_ID_KEY, gsSpreadsheetId);

  // write header row to each sheet
  for (const day of Object.values(routine)) {
    await gsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(day.label)}!A1:G1?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [["Ejercicio", "Fecha", "Peso", "Unidad", "Reps", "Equipo", "Notas"]] }),
      }
    );
  }
  return gsSpreadsheetId;
}

async function gsAppendRow(dayLabel, rowValues) {
  if (!gsClientId) return; // not configured, silently skip
  try {
    if (!gsSpreadsheetId) await gsCreateSpreadsheet();
    await gsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(dayLabel)}!A:G:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [rowValues] }),
      }
    );
    gsUpdateStatus();
  } catch (e) {
    showToast("No se pudo sincronizar con Sheets (se guardó localmente)");
  }
}

function gsOpenSheet() {
  if (gsSpreadsheetId) {
    window.open(`https://docs.google.com/spreadsheets/d/${gsSpreadsheetId}/edit`, "_blank");
  }
}

function gsRenderModal() {
  const body = document.getElementById("sheetsModalBody");
  if (!gsClientId) {
    body.innerHTML = `
      <p style="font-size:13px;color:var(--txt-dim);margin-bottom:10px;">
        Pega el Client ID de tu proyecto de Google Cloud (termina en .apps.googleusercontent.com).
      </p>
      <input id="gsClientInput" class="input-full" placeholder="Client ID" style="margin-bottom:10px;">
      <button class="save-btn" id="gsSaveClient">Guardar</button>
      <button class="hist-btn" id="gsCloseModal" style="width:100%;margin-top:8px;justify-content:center;">Cerrar</button>
    `;
    document.getElementById("gsSaveClient").addEventListener("click", () => {
      const v = document.getElementById("gsClientInput").value.trim();
      if (!v) return;
      gsClientId = v;
      localStorage.setItem(GS_CLIENT_ID_KEY, v);
      gsTokenClient = null;
      gsRenderModal();
    });
    document.getElementById("gsCloseModal").addEventListener("click", gsCloseModal);
    return;
  }
  const connected = !!gsAccessToken;
  body.innerHTML = `
    <p style="font-size:13px;color:var(--txt-dim);margin-bottom:10px;">
      ${gsSpreadsheetId ? "Hoja vinculada." : "Aún no se ha creado la hoja — se crea sola al conectar."}
      ${connected ? " Conectado ✓" : " No conectado esta sesión."}
    </p>
    <button class="save-btn" id="gsConnectBtn" style="margin-bottom:8px;">${connected ? "Reconectar" : "Conectar con Google"}</button>
    ${gsSpreadsheetId ? `<button class="hist-btn" id="gsOpenBtn" style="width:100%;justify-content:center;margin-bottom:8px;">Abrir hoja en Google Sheets</button>` : ""}
    <button class="hist-btn" id="gsResetBtn" style="width:100%;justify-content:center;margin-bottom:8px;">Cambiar Client ID</button>
    <button class="hist-btn" id="gsCloseModal" style="width:100%;justify-content:center;">Cerrar</button>
  `;
  document.getElementById("gsConnectBtn").addEventListener("click", async () => {
    try {
      await gsRequestToken("consent");
      showToast("Conectado a Google");
      gsUpdateStatus();
      gsRenderModal();
    } catch (e) {
      showToast("No se pudo conectar");
    }
  });
  const openBtn = document.getElementById("gsOpenBtn");
  if (openBtn) openBtn.addEventListener("click", gsOpenSheet);
  document.getElementById("gsResetBtn").addEventListener("click", () => {
    gsClientId = "";
    gsSpreadsheetId = "";
    gsAccessToken = null;
    localStorage.removeItem(GS_CLIENT_ID_KEY);
    localStorage.removeItem(GS_SHEET_ID_KEY);
    gsRenderModal();
    gsUpdateStatus();
  });
  document.getElementById("gsCloseModal").addEventListener("click", gsCloseModal);
}

function gsOpenModal() {
  document.getElementById("sheetsModal").classList.remove("hidden");
  gsRenderModal();
}
function gsCloseModal() {
  document.getElementById("sheetsModal").classList.add("hidden");
}

document.getElementById("btnSheets").addEventListener("click", gsOpenModal);
gsUpdateStatus();

// ---------- Stats & Charts ----------
let statsCharts = {}; // keep Chart.js instances to destroy on redraw
const CHART_COLORS = ["#B08D57", "#5C7A63", "#7A8CB0", "#B85C4A", "#9A7AB0", "#B0A557"];

function epley1RM(weight, reps) {
  return weight * (1 + reps / 30);
}

function allExercisesFlat() {
  const list = [];
  Object.entries(routine).forEach(([dayKey, day]) => {
    day.exercises.forEach((ex) => list.push({ ...ex, dayKey, dayLabel: day.label }));
  });
  return list;
}

function destroyChart(key) {
  if (statsCharts[key]) { statsCharts[key].destroy(); delete statsCharts[key]; }
}

function statsBuildExerciseSelect(selectedId) {
  const exList = allExercisesFlat();
  const options = exList.map((ex) =>
    `<option value="${ex.id}" ${ex.id === selectedId ? "selected" : ""}>${esc(ex.dayLabel)} — ${esc(ex.name)}</option>`
  ).join("");
  return `<select id="statsExSelect" class="input-full" style="margin-bottom:10px;">${options}</select>`;
}

function statsRenderExerciseChart(exId) {
  const entries = (logs[exId] || []).slice().reverse(); // oldest to newest
  const wrap = document.getElementById("statsExerciseArea");
  if (entries.length === 0) {
    wrap.innerHTML = `<p style="font-size:13px;color:var(--txt-dim);">Aún no hay registros para este ejercicio.</p>`;
    return;
  }

  const equipVariants = [...new Set(entries.map((e) => e.equip || "(sin especificar)"))];
  const filterHTML = equipVariants.length > 1
    ? `<div class="meta-row" style="margin-bottom:10px;">
        <button class="tag ${!statsRenderExerciseChart._equipFilter ? "active" : ""}" data-equip-filter="__all__" style="cursor:pointer;border:none;">Todos</button>
        ${equipVariants.map((v) => `<button class="tag-dim" data-equip-filter="${esc(v)}" style="cursor:pointer;border:1px solid var(--line);background:transparent;border-radius:6px;padding:3px 8px;">${esc(v)}</button>`).join("")}
      </div>`
    : "";

  const activeFilter = statsRenderExerciseChart._filter || "__all__";
  const filtered = activeFilter === "__all__" ? entries : entries.filter((e) => (e.equip || "(sin especificar)") === activeFilter);

  const maxWeight = Math.max(...entries.map((e) => e.weight));
  const maxE1RM = Math.max(...entries.map((e) => epley1RM(e.weight, e.reps)));
  const lastEntry = entries[entries.length - 1];

  wrap.innerHTML = `
    ${filterHTML}
    <div class="card" style="margin-bottom:12px;">
      <canvas id="exChartCanvas" height="180"></canvas>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div class="card" style="padding:10px;text-align:center;">
        <div style="font-size:11px;color:var(--txt-dim);">PR peso</div>
        <div style="font-size:18px;font-weight:700;color:var(--accent);">${maxWeight}${entries[0].unit}</div>
      </div>
      <div class="card" style="padding:10px;text-align:center;">
        <div style="font-size:11px;color:var(--txt-dim);">1RM estimado (máx)</div>
        <div style="font-size:18px;font-weight:700;color:var(--accent);">${maxE1RM.toFixed(1)}${entries[0].unit}</div>
      </div>
      <div class="card" style="padding:10px;text-align:center;">
        <div style="font-size:11px;color:var(--txt-dim);">Registros totales</div>
        <div style="font-size:18px;font-weight:700;">${entries.length}</div>
      </div>
      <div class="card" style="padding:10px;text-align:center;">
        <div style="font-size:11px;color:var(--txt-dim);">Último registro</div>
        <div style="font-size:14px;font-weight:700;">${fmtDate(lastEntry.date)}</div>
      </div>
    </div>
  `;

  wrap.querySelectorAll("[data-equip-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      statsRenderExerciseChart._filter = btn.dataset.equipFilter;
      statsRenderExerciseChart(exId);
    });
  });

  destroyChart("exChart");
  const ctx = document.getElementById("exChartCanvas").getContext("2d");
  statsCharts.exChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: filtered.map((e) => fmtDate(e.date)),
      datasets: [
        {
          label: `Peso (${filtered[0]?.unit || ""})`,
          data: filtered.map((e) => e.weight),
          borderColor: CHART_COLORS[0],
          backgroundColor: CHART_COLORS[0],
          tension: 0.25,
          pointRadius: 4,
        },
        {
          label: "1RM estimado",
          data: filtered.map((e) => Math.round(epley1RM(e.weight, e.reps) * 10) / 10),
          borderColor: CHART_COLORS[1],
          backgroundColor: CHART_COLORS[1],
          borderDash: [5, 4],
          tension: 0.25,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#F2F0EA", font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: "#9A9EA6", font: { size: 10 } }, grid: { color: "#2C3036" } },
        y: { ticks: { color: "#9A9EA6", font: { size: 10 } }, grid: { color: "#2C3036" } },
      },
    },
  });
}

function statsWeeksAgo(dateISO) {
  const d = new Date(dateISO);
  const now = new Date();
  return Math.floor((now - d) / (7 * 24 * 60 * 60 * 1000));
}

function statsRenderConsistency() {
  const wrap = document.getElementById("statsConsistencyArea");
  const allDates = new Set();
  Object.values(logs).forEach((arr) => arr.forEach((e) => allDates.add(e.date)));
  if (allDates.size === 0) {
    wrap.innerHTML = `<p style="font-size:13px;color:var(--txt-dim);">Aún no hay sesiones registradas.</p>`;
    return;
  }
  const NUM_WEEKS = 10;
  const counts = new Array(NUM_WEEKS).fill(0);
  allDates.forEach((d) => {
    const w = statsWeeksAgo(d);
    if (w >= 0 && w < NUM_WEEKS) counts[NUM_WEEKS - 1 - w]++;
  });
  wrap.innerHTML = `<div class="card"><canvas id="consistencyCanvas" height="140"></canvas></div>`;
  destroyChart("consistency");
  const ctx = document.getElementById("consistencyCanvas").getContext("2d");
  statsCharts.consistency = new Chart(ctx, {
    type: "bar",
    data: {
      labels: counts.map((_, i) => `S-${NUM_WEEKS - 1 - i}`).reverse().map((_, i) => `${NUM_WEEKS - 1 - i}`),
      datasets: [{ label: "Sesiones", data: counts, backgroundColor: CHART_COLORS[0] }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: "Semanas atrás", color: "#9A9EA6" }, ticks: { color: "#9A9EA6" }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: "#9A9EA6", stepSize: 1 }, grid: { color: "#2C3036" } },
      },
    },
  });
}

function statsRenderVolumePerDay() {
  const wrap = document.getElementById("statsVolumeArea");
  const dayLabels = Object.values(routine).map((d) => d.label);
  const volumes = Object.entries(routine).map(([dayKey, day]) => {
    let total = 0;
    day.exercises.forEach((ex) => {
      (logs[ex.id] || []).forEach((e) => { total += (e.weight || 0) * (e.reps || 0); });
    });
    return total;
  });
  if (volumes.every((v) => v === 0)) {
    wrap.innerHTML = `<p style="font-size:13px;color:var(--txt-dim);">Aún no hay suficiente historial para calcular volumen.</p>`;
    return;
  }
  wrap.innerHTML = `<div class="card"><canvas id="volumeCanvas" height="160"></canvas></div>
    <p style="font-size:11px;color:var(--txt-dim);margin-top:6px;">Volumen = peso × reps sumado de todo el historial registrado en cada día.</p>`;
  destroyChart("volume");
  const ctx = document.getElementById("volumeCanvas").getContext("2d");
  statsCharts.volume = new Chart(ctx, {
    type: "bar",
    data: { labels: dayLabels, datasets: [{ label: "Volumen total", data: volumes, backgroundColor: CHART_COLORS.slice(0, dayLabels.length) }] },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#9A9EA6" }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: "#9A9EA6" }, grid: { color: "#2C3036" } },
      },
    },
  });
}

function statsRender() {
  const body = document.getElementById("statsBody");
  const exList = allExercisesFlat();
  const defaultId = statsRender._lastEx || exList[0]?.id;
  body.innerHTML = `
    <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:6px;">Progresión por ejercicio</div>
    ${statsBuildExerciseSelect(defaultId)}
    <div id="statsExerciseArea"></div>

    <div style="font-size:13px;font-weight:700;color:var(--accent);margin:20px 0 6px;">Consistencia (sesiones por semana)</div>
    <div id="statsConsistencyArea"></div>

    <div style="font-size:13px;font-weight:700;color:var(--accent);margin:20px 0 6px;">Volumen histórico por día de rutina</div>
    <div id="statsVolumeArea"></div>
  `;
  document.getElementById("statsExSelect").addEventListener("change", (e) => {
    statsRender._lastEx = e.target.value;
    statsRenderExerciseChart._filter = null;
    statsRenderExerciseChart(e.target.value);
  });
  if (defaultId) statsRenderExerciseChart(defaultId);
  statsRenderConsistency();
  statsRenderVolumePerDay();
}

document.getElementById("btnStats").addEventListener("click", () => {
  document.getElementById("statsModal").classList.remove("hidden");
  statsRender();
});
document.getElementById("statsCloseBtn").addEventListener("click", () => {
  document.getElementById("statsModal").classList.add("hidden");
});

// ---------- Import / Export Excel ----------
document.getElementById("btnImport").addEventListener("click", () => document.getElementById("importFile").click());

document.getElementById("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const dayKeys = Object.keys(DEFAULT_ROUTINE);
    let importedCount = 0;

    wb.SheetNames.forEach((sheetName, idx) => {
      if (!/^D[ií]a/i.test(sheetName)) return;
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
      const headerRowIdx = rows.findIndex((r) => Array.isArray(r) && r.some((c) => String(c).trim() === "Ejercicio"));
      if (headerRowIdx === -1) return;
      const header = rows[headerRowIdx].map((c) => String(c || "").trim());
      const colEj = header.indexOf("Ejercicio");
      const colSr = header.indexOf("Series x Reps");
      const colDesc = header.indexOf("Descanso");
      const colEquip = header.indexOf("Equipo prioritario");

      const exercises = [];
      for (let i = headerRowIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[colEj] || String(row[colEj]).trim() === "") break;
        exercises.push({
          id: `imp_${sheetName}_${i}`,
          name: String(row[colEj]).trim(),
          target: colSr >= 0 ? String(row[colSr] || "").trim() : "",
          rest: colDesc >= 0 ? String(row[colDesc] || "").trim() : "",
          equip: colEquip >= 0 ? String(row[colEquip] || "").trim() : "",
        });
      }
      if (exercises.length > 0) {
        const dayKey = dayKeys[idx] || `dia_${idx}`;
        routine[dayKey] = { label: routine[dayKey]?.label || sheetName, focus: routine[dayKey]?.focus || sheetName, exercises };
        importedCount++;
      }
    });

    if (importedCount > 0) {
      saveRoutine();
      activeDay = Object.keys(routine)[0];
      render();
      showToast(`Rutina importada (${importedCount} días)`);
    } else {
      showToast("No se encontraron hojas de días válidas");
    }
  } catch (err) {
    showToast("Error al leer el archivo");
  }
  e.target.value = "";
});

document.getElementById("btnExport").addEventListener("click", () => {
  const wb = XLSX.utils.book_new();
  Object.values(routine).forEach((day) => {
    const rows = [["Ejercicio", "Fecha", "Peso", "Unidad", "Reps", "Equipo", "Notas"]];
    day.exercises.forEach((ex) => {
      const entries = logs[ex.id] || [];
      if (entries.length === 0) {
        rows.push([ex.name, "", "", "", "", "", ""]);
      } else {
        entries.slice().reverse().forEach((entry) => {
          rows.push([ex.name, entry.date, entry.weight, entry.unit, entry.reps, entry.equip || "", entry.notes || ""]);
        });
      }
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 34 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 20 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, ws, day.label);
  });
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Registro_Rutina_${todayISO()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Excel exportado");
});

document.getElementById("btnEdit").addEventListener("click", () => {
  editMode = !editMode;
  render();
});

// ---------- Register service worker for offline/installable support ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

// ---------- Initial render ----------
render();
