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
      { id: "d2e1", name: "Peso muerto rumano (RDL)", target: "4x6-8", rest: "2-3 min", equip: "Barra libre", canonicalId: "cx_rdl" },
      { id: "d2e2", name: "Sentadilla hack (secundario)", target: "3x10-12", rest: "2 min", equip: "Máquina hack", canonicalId: "cx_sentadilla_hack" },
      { id: "d2e3", name: "Hip thrust", target: "3x10-12", rest: "2 min", equip: "Barra / Máquina" },
      { id: "d2e4", name: "Curl femoral", target: "3x12-15", rest: "90 seg", equip: "Máquina" },
      { id: "d2e5", name: "Elevación de talones de pie", target: "3x15", rest: "60 seg", equip: "Máquina" },
      { id: "d2e6", name: "Abdomen en banco declinado", target: "3x10-15", rest: "60 seg", equip: "Banco declinado", canonicalId: "cx_abdomen_declinado" },
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
      { id: "d4e1", name: "Sentadilla hack", target: "4x6-8", rest: "2-3 min", equip: "Máquina hack", canonicalId: "cx_sentadilla_hack" },
      { id: "d4e2", name: "Peso muerto rumano c/mancuernas (secundario)", target: "3x10-12", rest: "2 min", equip: "Mancuernas", canonicalId: "cx_rdl" },
      { id: "d4e3", name: "Prensa de piernas (pies altos)", target: "3x10-12", rest: "90 seg", equip: "Máquina prensa" },
      { id: "d4e4", name: "Extensión de cuádriceps", target: "3x12-15", rest: "90 seg", equip: "Máquina" },
      { id: "d4e5", name: "Elevación de talones sentado", target: "4x12-15", rest: "60 seg", equip: "Máquina" },
      { id: "d4e6", name: "Abdomen en banco declinado", target: "3x10-15", rest: "60 seg", equip: "Banco declinado", canonicalId: "cx_abdomen_declinado" },
    ],
  },
};

const RK = "bitacora_rutina_v1";
const LK = "bitacora_logs_v1";
const BWK = "bitacora_bodyweight_v1";
const LNK = "bitacora_linkmap_v1"; // vínculos manuales entre ejercicios (anulan canonicalId)

let routine = loadJSON(RK, DEFAULT_ROUTINE);
let logs = loadJSON(LK, {});
let bodyweightLog = loadJSON(BWK, []); // [{id, date, weight, unit, notes, synced}]
let linkMap = loadJSON(LNK, {}); // { exId: groupKey } — se edita desde "Vincular ejercicios"
let activeDay = Object.keys(routine)[0];
migrateCanonicalLogs(); // one-time: merges old per-day history into shared canonical keys
let editMode = false;
let expanded = {};
let pendingDeleteIds = new Set(); // log ids hidden while their undo window is open
let undoTimers = {}; // logId -> {timeout, exId, exName, entry}

function sortByDateAsc(arr) {
  return arr.slice().sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
function sortByDateDesc(arr) {
  return arr.slice().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

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
function saveBodyweight() {
  try { localStorage.setItem(BWK, JSON.stringify(bodyweightLog)); } catch (e) { showToast("No se pudo guardar"); }
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
// Some exercises are the literal same movement done on two different days (e.g. "Sentadilla
// hack" as primary on Day 4 and secondary on Day 2). Those share a canonicalId so their
// weight/reps history and PRs are tracked as ONE continuous progression, not two separate ones.
function logKey(ex) {
  // Un vínculo manual (pantalla "Vincular ejercicios") siempre gana sobre el canonicalId
  // fijo del código — así vincular o desvincular nunca requiere tocar app.js.
  if (Object.prototype.hasOwnProperty.call(linkMap, ex.id)) return linkMap[ex.id];
  return ex.canonicalId || ex.id;
}
function saveLinkMap() {
  try { localStorage.setItem(LNK, JSON.stringify(linkMap)); } catch (e) { showToast("No se pudo guardar"); }
}

// One-time migration: some exercises used to have separate per-day histories (e.g. "Sentadilla
// hack" logged under a Day 2 id and a Day 4 id) that now share one canonicalId. Without this,
// that old history would look like it "disappeared" since the app now reads from the shared key.
function migrateCanonicalLogs() {
  const MIGRATION_FLAG = "bitacora_canonical_migration_v1";
  if (localStorage.getItem(MIGRATION_FLAG)) return;
  let changed = false;
  Object.values(routine).forEach((day) => {
    day.exercises.forEach((ex) => {
      const key = logKey(ex);
      if (key === ex.id) return; // not a shared exercise, nothing to migrate
      const oldArr = logs[ex.id];
      if (!oldArr || oldArr.length === 0) return;
      const target = logs[key] || [];
      oldArr.forEach((entry) => {
        const dup = target.some((t) => t.date === entry.date && t.weight === entry.weight && t.unit === entry.unit && t.reps === entry.reps && (t.equip || "") === (entry.equip || ""));
        if (!dup) target.push(entry.dayLabel ? entry : { ...entry, dayLabel: day.label });
      });
      logs[key] = target;
      delete logs[ex.id];
      changed = true;
    });
  });
  if (changed) saveLogs();
  localStorage.setItem(MIGRATION_FLAG, "1");
}
function fmtDate(iso) { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y.slice(2)}`; }
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(() => t.classList.add("hidden"), 2000);
}

// ---------- Undo-able delete: hides the row instantly, finalizes after a grace window ----------
function scheduleUndoableDelete(exId, logId, exName) {
  const entry = (logs[exId] || []).find((l) => l.id === logId);
  if (!entry) return;
  pendingDeleteIds.add(logId);
  render();

  const bar = document.getElementById("undoBar");
  bar.innerHTML = `<span>Registro eliminado</span><button class="undo-btn" id="undoBtnAction">Deshacer</button>`;
  bar.classList.remove("hidden");
  document.getElementById("undoBtnAction").addEventListener("click", () => {
    clearTimeout(undoTimers[logId]?.timeout);
    delete undoTimers[logId];
    pendingDeleteIds.delete(logId);
    bar.classList.add("hidden");
    render();
  });

  const timeout = setTimeout(() => {
    pendingDeleteIds.delete(logId);
    logs[exId] = (logs[exId] || []).filter((l) => l.id !== logId);
    saveLogs();
    bar.classList.add("hidden");
    render();
    gsDeleteRow(entry.dayLabel || routine[activeDay].label, exName, entry);
    delete undoTimers[logId];
  }, 4000);
  undoTimers[logId] = { timeout, exId, exName, entry };
}

// ---------- Rest timer ----------
function parseRestSeconds(restStr) {
  const nums = String(restStr || "").match(/\d+(\.\d+)?/g);
  if (!nums) return 90;
  const vals = nums.map(Number);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const isMinutes = /min/i.test(restStr);
  return Math.round(avg * (isMinutes ? 60 : 1));
}

let restTimerInterval = null;
function startRestTimer(restStr, label) {
  clearInterval(restTimerInterval);
  let remaining = parseRestSeconds(restStr);
  const bar = document.getElementById("restTimerBar");
  bar.classList.remove("hidden");

  const render_ = () => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    bar.innerHTML = `
      <div>
        <div class="rest-timer-label">Descanso — ${esc(label)}</div>
        <div class="rest-timer-time">${m}:${String(s).padStart(2, "0")}</div>
      </div>
      <div class="rest-timer-actions">
        <button class="rest-timer-btn" id="restAdd15">+15s</button>
        <button class="rest-timer-btn" id="restSkip">Saltar</button>
      </div>
    `;
    document.getElementById("restAdd15").addEventListener("click", () => { remaining += 15; render_(); });
    document.getElementById("restSkip").addEventListener("click", stopRestTimer);
  };
  render_();

  restTimerInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      playBeep();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      stopRestTimer();
      return;
    }
    render_();
  }, 1000);
}
function stopRestTimer() {
  clearInterval(restTimerInterval);
  document.getElementById("restTimerBar").classList.add("hidden");
}
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) { /* audio not available, silently skip */ }
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
  main.innerHTML = day.exercises.map((ex, i) => cardHTML(ex, i === 0, i === day.exercises.length - 1)).join("") +
    (editMode ? `<button class="add-ex-btn" id="addExBtn">+ Agregar ejercicio</button>` : "");
  document.getElementById("btnEdit").classList.toggle("active", editMode);
  gsUpdateStatus();

  // wire events
  day.exercises.forEach((ex) => wireCard(ex, day.exercises));
  if (editMode) {
    document.getElementById("addExBtn").addEventListener("click", () => {
      const newId = `${activeDay}_${Date.now()}`;
      routine[activeDay].exercises.push({ id: newId, name: "Nuevo ejercicio", target: "3x10-12", rest: "90 seg", equip: "" });
      saveRoutine();
      scheduleRoutineSync();
      render();
    });
  }
}

function cardHTML(ex, isFirst, isLast) {
  const entries = sortByDateDesc(logs[logKey(ex)] || []).filter((l) => !pendingDeleteIds.has(l.id));
  const last = entries[0];
  let prId = null;
  if (entries.length > 0) {
    let best = entries[0];
    entries.forEach((e) => { if (e.weight > best.weight) best = e; });
    prId = best.id;
  }
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
        <div style="display:flex;flex-direction:column;align-items:center;">
          <button class="order-btn" data-action="move-up" ${isFirst ? "disabled style='opacity:0.25;'" : ""}>&#9650;</button>
          <button class="order-btn" data-action="move-down" ${isLast ? "disabled style='opacity:0.25;'" : ""}>&#9660;</button>
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
      <button class="timer-icon-btn" data-action="start-timer">&#9202; Descanso</button>
      ${entries.length > 0 ? `<button class="hist-btn" data-action="toggle-hist">${entries.length} registro${entries.length !== 1 ? "s" : ""} ${expanded[ex.id] ? "&#9650;" : "&#9660;"}</button>` : ""}
    </div>
    <div class="form hidden" data-role="form">
      <input class="input-full" type="date" data-field="date" value="${todayISO()}" style="margin-bottom:2px;">
      <div class="form-row">
        <button class="stepper-btn" data-step="weight" data-dir="-1">&minus;</button>
        <input class="input" type="number" inputmode="decimal" placeholder="Peso" data-field="weight" value="${last ? last.weight : ""}">
        <button class="stepper-btn" data-step="weight" data-dir="1">&plus;</button>
        <div class="unit-toggle">
          <button class="unit-btn ${(!last || last.unit === "lb") ? "active" : ""}" data-unit="lb">lb</button>
          <button class="unit-btn ${(last && last.unit === "kg") ? "active" : ""}" data-unit="kg">kg</button>
        </div>
      </div>
      <div class="form-row">
        <button class="stepper-btn" data-step="reps" data-dir="-1">&minus;</button>
        <input class="input" type="number" inputmode="numeric" placeholder="Reps" data-field="reps" value="${last ? last.reps : ""}">
        <button class="stepper-btn" data-step="reps" data-dir="1">&plus;</button>
      </div>
      <input class="input-full" placeholder="Equipo usado (opcional)" data-field="equip">
      <input class="input-full" placeholder="Notas (opcional)" data-field="notes">
      <button class="save-btn" data-action="save-log">&#10003; Guardar</button>
    </div>
    <div class="history ${expanded[ex.id] ? "" : "hidden"}" data-role="history">
      ${entries.map((l) => `
        <div class="hist-row" data-log-id="${l.id}">
          <span class="hist-date">${fmtDate(l.date)}</span>
          <span class="hist-val ${l.id === prId ? "pr-badge" : ""}">${l.id === prId ? "&#127942; " : ""}${l.weight}${l.unit} × ${l.reps}r</span>
          ${l.equip ? `<span class="hist-equip">${esc(l.equip)}</span>` : "<span></span>"}
          <button class="hist-del" data-action="del-log">&#128465;</button>
        </div>
      `).join("")}
    </div>
  </div>`;
}

function wireCard(ex, dayExercises) {
  const card = document.querySelector(`.card[data-id="${ex.id}"]`);
  if (!card) return;

  if (editMode) {
    card.querySelectorAll("[data-field]").forEach((inp) => {
      inp.addEventListener("input", () => {
        ex[inp.dataset.field] = inp.value;
        saveRoutine();
        scheduleRoutineSync();
      });
    });
    const rm = card.querySelector('[data-action="remove"]');
    if (rm) rm.addEventListener("click", () => {
      routine[activeDay].exercises = routine[activeDay].exercises.filter((e) => e.id !== ex.id);
      saveRoutine();
      scheduleRoutineSync();
      render();
    });
    const moveUp = card.querySelector('[data-action="move-up"]');
    if (moveUp) moveUp.addEventListener("click", () => {
      const arr = routine[activeDay].exercises;
      const idx = arr.findIndex((e) => e.id === ex.id);
      if (idx > 0) { [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; saveRoutine(); scheduleRoutineSync(); render(); }
    });
    const moveDown = card.querySelector('[data-action="move-down"]');
    if (moveDown) moveDown.addEventListener("click", () => {
      const arr = routine[activeDay].exercises;
      const idx = arr.findIndex((e) => e.id === ex.id);
      if (idx < arr.length - 1) { [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]; saveRoutine(); scheduleRoutineSync(); render(); }
    });
    return;
  }

  const formEl = card.querySelector('[data-role="form"]');
  const toggleBtn = card.querySelector('[data-action="toggle-form"]');
  if (toggleBtn) toggleBtn.addEventListener("click", () => {
    formEl.classList.toggle("hidden");
    toggleBtn.innerHTML = formEl.classList.contains("hidden") ? "+ Registrar" : "&times; Cancelar";
  });

  const timerBtn = card.querySelector('[data-action="start-timer"]');
  if (timerBtn) timerBtn.addEventListener("click", () => startRestTimer(ex.rest, ex.name));

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

  formEl.querySelectorAll(".stepper-btn").forEach((sb) => {
    sb.addEventListener("click", () => {
      const field = sb.dataset.step;
      const dir = parseInt(sb.dataset.dir, 10);
      const input = formEl.querySelector(`[data-field="${field}"]`);
      const unit = formEl.querySelector(".unit-btn.active")?.dataset.unit || "lb";
      const step = field === "weight" ? (unit === "kg" ? 2.5 : 5) : 1;
      const cur = parseFloat(input.value) || 0;
      const next = Math.max(0, cur + dir * step);
      input.value = field === "weight" ? (Math.round(next * 100) / 100) : Math.round(next);
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
    const weightNum = parseFloat(weight);

    // PR detection: compare against previous best (before adding this entry)
    const key = logKey(ex);
    const priorEntries = logs[key] || [];
    const priorMax = priorEntries.reduce((max, l) => Math.max(max, l.weight), 0);
    const isNewPR = priorEntries.length > 0 && weightNum > priorMax;

    const entry = { id: `${Date.now()}`, date: dateVal, weight: weightNum, unit, reps: parseInt(reps, 10), equip: equip.trim(), notes: notes.trim(), synced: false, dayLabel: routine[activeDay].label };
    logs[key] = [entry, ...priorEntries];
    saveLogs();
    showToast(isNewPR ? "🏆 ¡Nuevo PR de peso!" : "Registrado");
    render();
    gsAppendRow(routine[activeDay].label, key, entry.id, [ex.name, entry.date, entry.weight, entry.unit, entry.reps, entry.equip, entry.notes]);
  });

  card.querySelectorAll('[data-action="del-log"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("[data-log-id]");
      const logId = row.dataset.logId;
      scheduleUndoableDelete(logKey(ex), logId, ex.name);
    });
  });
}

// ---------- Google Sheets integration ----------
const GS_CLIENT_ID_KEY = "bitacora_gs_client_id";
const GS_SHEET_ID_KEY = "bitacora_gs_sheet_id";
const GS_EMAIL_HINT_KEY = "bitacora_gs_email_hint";
const GS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const GS_ROUTINE_SHEET = "Rutina (estructura)";
const GS_BW_SHEET = "Peso corporal";

let gsAccessToken = null;
let gsClientId = localStorage.getItem(GS_CLIENT_ID_KEY) || "";
let gsSpreadsheetId = localStorage.getItem(GS_SHEET_ID_KEY) || "";
let gsEmailHint = localStorage.getItem(GS_EMAIL_HINT_KEY) || "";
let gsCreatePromise = null; // prevents two concurrent calls from both creating a spreadsheet

function gsRelativeSyncTime() {
  if (!gsLastSyncAt) return null;
  const mins = Math.floor((Date.now() - gsLastSyncAt.getTime()) / 60000);
  if (mins < 1) return "justo ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `hace ${hrs}h`;
}

function gsUpdateStatus() {
  const el = document.getElementById("sheetsStatus");
  if (!el) return; // called before DOM ready in rare cases
  const pendingCount = Object.values(logs).reduce((sum, arr) => sum + arr.filter((l) => !l.synced).length, 0);
  if (gsInFlightCount > 0) {
    el.textContent = "⟳ Sincronizando con Google Sheets...";
    el.classList.remove("hidden");
  } else if (gsSpreadsheetId && gsAccessToken) {
    const syncTime = gsRelativeSyncTime();
    el.textContent = pendingCount > 0
      ? `✓ Conectado — ${pendingCount} pendiente${pendingCount !== 1 ? "s" : ""} por sincronizar`
      : `✓ Sincronizado${syncTime ? ` (${syncTime})` : ""}`;
    el.classList.remove("hidden");
  } else if (gsSpreadsheetId || pendingCount > 0) {
    el.textContent = pendingCount > 0
      ? `Desconectado — ${pendingCount} registro${pendingCount !== 1 ? "s" : ""} pendiente${pendingCount !== 1 ? "s" : ""} de sincronizar (toca el ícono de hoja)`
      : "Google Sheets vinculado, pero desconectado esta sesión — toca el ícono de hoja para reconectar";
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

// ---------- Auth via full-page redirect (classic OAuth2 implicit flow) ----------
// We deliberately avoid Google's newer popup-based Identity Services client here — it
// behaves inconsistently across mobile browsers. A plain redirect to Google's own login
// page and back is the oldest, most universally compatible way to get an access token,
// since it's just a normal page navigation, not a JS-managed popup.
function gsRedirectUri() {
  return window.location.origin + window.location.pathname;
}
function gsBuildAuthUrl(promptVal) {
  const params = new URLSearchParams({
    client_id: gsClientId,
    redirect_uri: gsRedirectUri(),
    response_type: "token",
    scope: GS_SCOPE,
    include_granted_scopes: "true",
    prompt: promptVal || "select_account",
  });
  if (gsEmailHint) params.set("login_hint", gsEmailHint);
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
function gsStartAuthRedirect() {
  if (!gsClientId) { showToast("Configura primero el Client ID"); return; }
  window.location.href = gsBuildAuthUrl("select_account");
}
// Called once at page load: if Google just redirected back here with a token in the
// URL fragment (#access_token=...), capture it and clean the URL.
function gsHandleRedirectReturn() {
  if (!location.hash || !location.hash.includes("access_token")) return false;
  const params = new URLSearchParams(location.hash.substring(1));
  const token = params.get("access_token");
  if (token) gsAccessToken = token;
  history.replaceState(null, "", location.pathname + location.search);
  return !!token;
}

let gsInFlightCount = 0;
let gsLastSyncAt = null;

async function gsFetch(url, options = {}) {
  if (!gsAccessToken) throw new Error("not-connected");
  gsInFlightCount++;
  gsUpdateStatus();
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${gsAccessToken}` },
    });
    if (res.status === 401) {
      gsAccessToken = null; // expired/invalid — the user needs to reconnect (redirect flow can't refresh silently)
      throw new Error("token-expired");
    }
    if (res.ok) gsLastSyncAt = new Date();
    return res;
  } finally {
    gsInFlightCount--;
    gsUpdateStatus();
  }
}

async function gsCreateSpreadsheet() {
  // Guard against two concurrent calls both creating a spreadsheet (same race as the token bug)
  if (gsCreatePromise) return gsCreatePromise;
  gsCreatePromise = (async () => {
    const body = {
      properties: { title: "Bitácora de Rutina" },
      sheets: [
        { properties: { title: GS_ROUTINE_SHEET } },
        { properties: { title: GS_BW_SHEET } },
        ...Object.values(routine).map((d) => ({ properties: { title: d.label } })),
      ],
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

    // write header row to each day's log sheet
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
    // write header + current structure to the routine sheet
    await gsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(GS_ROUTINE_SHEET)}!A1:E1?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [["Día", "Ejercicio", "Series x Reps", "Descanso", "Equipo prioritario"]] }),
      }
    );
    const structRows = [];
    Object.values(routine).forEach((day) => {
      day.exercises.forEach((ex) => { structRows.push([day.label, ex.name, ex.target, ex.rest, ex.equip || ""]); });
    });
    if (structRows.length > 0) {
      await gsFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(GS_ROUTINE_SHEET)}!A2:E100000:append?valueInputOption=USER_ENTERED`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: structRows }) }
      );
    }
    // write header row to the bodyweight sheet
    await gsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(GS_BW_SHEET)}!A1:D1?valueInputOption=USER_ENTERED`,
      { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: [["Fecha", "Peso", "Unidad", "Notas"]] }) }
    );
    return gsSpreadsheetId;
  })();
  try {
    return await gsCreatePromise;
  } finally {
    gsCreatePromise = null;
  }
}

// If the linked spreadsheet was deleted externally (Drive shows "file has been deleted"),
// Google's API replies 404. This wrapper detects that automatically, forgets the stale ID,
// marks local history as pending again, creates a fresh spreadsheet, and retries once —
// no manual "forget sheet" step needed.
async function gsRecreateAfterDeletion() {
  gsSpreadsheetId = "";
  localStorage.removeItem(GS_SHEET_ID_KEY);
  Object.values(logs).forEach((arr) => arr.forEach((l) => { l.synced = false; }));
  saveLogs();
  await gsCreateSpreadsheet();
}

async function gsFetchWithAutoRecreate(buildUrl, options) {
  if (!gsSpreadsheetId) await gsCreateSpreadsheet();
  let res = await gsFetch(buildUrl(gsSpreadsheetId), options);
  if (res.status === 404) {
    await gsRecreateAfterDeletion();
    res = await gsFetch(buildUrl(gsSpreadsheetId), options);
  }
  return res;
}

async function gsAppendRow(dayLabel, exId, entryId, rowValues) {
  if (!gsClientId) return; // not configured, silently skip
  try {
    await gsFetchWithAutoRecreate(
      (id) => `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(dayLabel)}!A:G:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [rowValues] }),
      }
    );
    // mark as synced so a later "sync pending" pass doesn't resend it
    if (exId && entryId) {
      const arr = logs[exId] || [];
      const found = arr.find((l) => l.id === entryId);
      if (found) { found.synced = true; saveLogs(); }
    }
    gsUpdateStatus();
  } catch (e) {
    showToast("No se pudo sincronizar con Sheets (se guardó localmente, pendiente)");
  }
}

async function gsSyncPending() {
  if (!gsClientId) { showToast("Configura primero el Client ID"); return; }
  const pending = [];
  const seenEntryIds = new Set(); // avoid double-queueing entries shared by two days (same canonicalId)
  Object.entries(routine).forEach(([dayKey, day]) => {
    day.exercises.forEach((ex) => {
      (logs[logKey(ex)] || []).forEach((entry) => {
        if (entry.synced || seenEntryIds.has(entry.id)) return;
        seenEntryIds.add(entry.id);
        pending.push({ dayLabel: entry.dayLabel || day.label, ex, entry });
      });
    });
  });
  if (pending.length === 0) { showToast("No hay registros pendientes"); return; }

  showToast(`Sincronizando ${pending.length} registros...`);
  let ok = 0, fail = 0;
  if (!gsAccessToken) {
    showToast("Conéctate primero con Google");
    gsStartAuthRedirect();
    return;
  }
  if (!gsSpreadsheetId) {
    try { await gsCreateSpreadsheet(); } catch (e) { showToast("No se pudo crear la hoja"); return; }
  }
  for (const { dayLabel, ex, entry } of pending) {
    try {
      await gsFetchWithAutoRecreate(
        (id) => `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(dayLabel)}!A:G:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values: [[ex.name, entry.date, entry.weight, entry.unit, entry.reps, entry.equip || "", entry.notes || ""]] }),
        }
      );
      entry.synced = true;
      ok++;
    } catch (e) {
      fail++;
    }
  }
  saveLogs();
  gsUpdateStatus();
  showToast(`Sincronizado: ${ok}${fail > 0 ? `, fallaron: ${fail}` : ""}`);
}

// ---------- Pull data FROM Sheets (so every device converges on the same data) ----------
function gsExtractSheetId(input) {
  const s = input.trim();
  const m = s.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(s)) return s; // looks like a raw ID already
  return null;
}

async function gsLinkExistingSheet(idOrUrl) {
  const id = gsExtractSheetId(idOrUrl);
  if (!id) { showToast("No pude leer ese enlace/ID"); return; }
  gsSpreadsheetId = id;
  localStorage.setItem(GS_SHEET_ID_KEY, id);
  if (!gsAccessToken) {
    showToast("Conectando con Google...");
    gsStartAuthRedirect(); // page navigates away and back; the pull happens automatically on return
    return;
  }
  await gsPullAll();
  showToast("Hoja vinculada y datos traídos");
}

// ---------- Keep the routine structure (exercises, sets/reps, rest, equipment) in sync ----------
let gsRoutineSyncTimer = null;
function scheduleRoutineSync() {
  if (!gsClientId) return; // Sheets not configured, nothing to do
  clearTimeout(gsRoutineSyncTimer);
  gsRoutineSyncTimer = setTimeout(() => { gsSyncRoutineStructure(); }, 1200);
}

async function gsEnsureTabExists(title, headerRow) {
  const metaRes = await gsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}?fields=sheets.properties`);
  if (metaRes.status === 404) { await gsRecreateAfterDeletion(); return; }
  if (!metaRes.ok) return;
  const meta = await metaRes.json();
  const exists = (meta.sheets || []).some((s) => s.properties.title === title);
  if (exists) return;
  await gsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title, index: 0 } } }] }),
  });
  await gsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(title)}!A1:${String.fromCharCode(64 + headerRow.length)}1?valueInputOption=USER_ENTERED`,
    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: [headerRow] }) }
  );
}
async function gsEnsureRoutineTabExists() {
  return gsEnsureTabExists(GS_ROUTINE_SHEET, ["Día", "Ejercicio", "Series x Reps", "Descanso", "Equipo prioritario"]);
}

async function gsSyncRoutineStructure() {
  if (!gsClientId) return;
  try {
    if (!gsSpreadsheetId) { await gsCreateSpreadsheet(); }
    else { await gsEnsureRoutineTabExists(); }
    if (!gsSpreadsheetId) return;

    const rows = [];
    Object.values(routine).forEach((day) => {
      day.exercises.forEach((ex) => {
        rows.push([day.label, ex.name, ex.target, ex.rest, ex.equip || ""]);
      });
    });

    // clear old content then write the current structure fresh (simplest way to reflect
    // renames/removals/reorders correctly without diffing row by row)
    await gsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(GS_ROUTINE_SHEET)}!A2:E100000:clear`,
      { method: "POST" }
    );
    if (rows.length > 0) {
      await gsFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(GS_ROUTINE_SHEET)}!A2:E100000:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values: rows }),
        }
      );
    }
    gsUpdateStatus();
  } catch (e) {
    // best-effort — routine structure sync failing shouldn't block using the app
  }
}

// ---------- Bodyweight sync ----------
async function gsAppendBodyweight(entryId, rowValues) {
  if (!gsClientId) return;
  try {
    if (!gsSpreadsheetId) { await gsCreateSpreadsheet(); }
    else { await gsEnsureTabExists(GS_BW_SHEET, ["Fecha", "Peso", "Unidad", "Notas"]); }
    await gsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(GS_BW_SHEET)}!A:D:append?valueInputOption=USER_ENTERED`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: [rowValues] }) }
    );
    const found = bodyweightLog.find((l) => l.id === entryId);
    if (found) { found.synced = true; saveBodyweight(); }
    gsUpdateStatus();
  } catch (e) {
    showToast("No se pudo sincronizar el peso (guardado localmente, pendiente)");
  }
}

async function gsDeleteBodyweightRow(entry) {
  if (!gsClientId || !gsSpreadsheetId) return;
  if (!entry.synced) return;
  try {
    const metaRes = await gsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}?fields=sheets.properties`);
    if (metaRes.status === 404) { await gsRecreateAfterDeletion(); return; }
    if (!metaRes.ok) return;
    const meta = await metaRes.json();
    const sheetMeta = (meta.sheets || []).find((s) => s.properties.title === GS_BW_SHEET);
    if (!sheetMeta) return;
    const sheetId = sheetMeta.properties.sheetId;

    const valRes = await gsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(GS_BW_SHEET)}!A2:D100000`);
    if (!valRes.ok) return;
    const data = await valRes.json();
    const rows = data.values || [];
    const idx = rows.findIndex((row) => {
      const [date, weight, unit, notes] = row;
      return date === entry.date && parseFloat(weight) === entry.weight && (unit || "lb") === entry.unit && (notes || "") === (entry.notes || "");
    });
    if (idx === -1) return;
    const sheetRowIndex = idx + 1;
    await gsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: sheetRowIndex, endIndex: sheetRowIndex + 1 } } }] }),
    });
  } catch (e) { /* best-effort cleanup */ }
}

async function gsDeleteRow(dayLabel, exName, entry) {
  if (!gsClientId || !gsSpreadsheetId) return; // nothing configured, only local matters
  if (!entry.synced) return; // was never pushed to Sheets, nothing to remove there
  try {
    const metaRes = await gsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}?fields=sheets.properties`
    );
    if (metaRes.status === 404) { await gsRecreateAfterDeletion(); return; }
    if (!metaRes.ok) return;
    const meta = await metaRes.json();
    const sheetMeta = (meta.sheets || []).find((s) => s.properties.title === dayLabel);
    if (!sheetMeta) return;
    const sheetId = sheetMeta.properties.sheetId;

    const valRes = await gsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(dayLabel)}!A2:G100000`
    );
    if (!valRes.ok) return;
    const data = await valRes.json();
    const rows = data.values || [];
    const idx = rows.findIndex((row) => {
      const [name, date, weight, unit, reps, equip, notes] = row;
      return name === exName && date === entry.date &&
        parseFloat(weight) === entry.weight && (unit || "lb") === entry.unit &&
        parseInt(reps, 10) === entry.reps && (equip || "") === (entry.equip || "") &&
        (notes || "") === (entry.notes || "");
    });
    if (idx === -1) return; // couldn't find a matching row, nothing to delete

    const sheetRowIndex = idx + 1; // +1 because row 0 (0-based) is the header
    await gsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: { sheetId, dimension: "ROWS", startIndex: sheetRowIndex, endIndex: sheetRowIndex + 1 },
          },
        }],
      }),
    });
  } catch (e) {
    // silent — the local delete already succeeded, this is just best-effort cleanup in Sheets
  }
}

async function gsPullAll(silent) {
  if (!gsClientId || !gsSpreadsheetId) return { pulled: 0 };
  if (!gsAccessToken) {
    if (!silent) { showToast("Conectando con Google..."); gsStartAuthRedirect(); }
    return { pulled: 0 };
  }
  let pulled = 0;
  try {
    let metaRes = await gsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}?fields=sheets.properties.title`
    );
    if (metaRes.status === 404) {
      // the linked spreadsheet was deleted externally — heal automatically and stop this pull
      // (a brand-new sheet has nothing to pull; future writes will populate it)
      await gsRecreateAfterDeletion();
      if (!silent) showToast("La hoja vinculada ya no existía — se creó una nueva automáticamente");
      return { pulled: 0 };
    }
    if (!metaRes.ok) throw new Error("meta-failed");
    const meta = await metaRes.json();
    const sheetTitles = (meta.sheets || []).map((s) => s.properties.title);
    const nameIndex = buildNameIndex();

    for (const title of sheetTitles) {
      if (title === GS_ROUTINE_SHEET) continue; // structure sheet, not a log sheet
      if (title === GS_BW_SHEET) {
        const bwRes = await gsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(GS_BW_SHEET)}!A2:D100000`);
        if (!bwRes.ok) continue;
        const bwData = await bwRes.json();
        (bwData.values || []).forEach((row) => {
          const [date, weight, unit, notes] = row;
          if (!date || weight == null) return;
          const w = parseFloat(weight);
          if (isNaN(w)) return;
          const dup = bodyweightLog.some((l) => l.date === date && l.weight === w && l.unit === (unit || "lb") && (l.notes || "") === (notes || ""));
          if (dup) return;
          bodyweightLog.push({ id: `pull_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, date, weight: w, unit: unit || "lb", notes: notes || "", synced: true });
          pulled++;
        });
        continue;
      }
      const valRes = await gsFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(title)}!A2:G100000`
      );
      if (!valRes.ok) continue;
      const data = await valRes.json();
      const rows = data.values || [];
      rows.forEach((row) => {
        const [name, date, weight, unit, reps, equip, notes] = row;
        if (!name || !date || weight == null || reps == null) return;
        const exId = matchExercise(name, nameIndex);
        if (!exId) return;
        const w = parseFloat(weight), rp = parseInt(reps, 10);
        if (isNaN(w) || isNaN(rp)) return;
        const existing = logs[exId] || [];
        const dup = existing.some((l) => l.date === date && l.weight === w && l.unit === (unit || "lb") && l.reps === rp && (l.equip || "") === (equip || ""));
        if (dup) return;
        existing.push({
          id: `pull_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          date, weight: w, unit: unit || "lb", reps: rp, equip: equip || "", notes: notes || "",
          synced: true,
        });
        logs[exId] = existing;
        pulled++;
      });
    }
    if (pulled > 0) { saveLogs(); saveBodyweight(); render(); }
  } catch (e) {
    if (!silent) showToast("No se pudo traer datos de Sheets");
    return { pulled };
  }
  return { pulled };
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
      gsRenderModal();
    });
    document.getElementById("gsCloseModal").addEventListener("click", gsCloseModal);
    return;
  }
  const connected = !!gsAccessToken;
  const pendingCount = Object.values(logs).reduce((sum, arr) => sum + arr.filter((l) => !l.synced).length, 0);
  body.innerHTML = `
    <p style="font-size:11px;color:var(--txt-dim);margin-bottom:2px;">Client ID guardado en ESTE dispositivo (cópialo y compáralo con Google Cloud):</p>
    <div style="font-size:11px;font-family:monospace;color:var(--txt);background:var(--bg-raised);border:1px solid var(--line);border-radius:6px;padding:8px;margin-bottom:10px;word-break:break-all;user-select:all;">${esc(gsClientId)}</div>
    <p style="font-size:13px;color:var(--txt-dim);margin-bottom:10px;">
      ${gsSpreadsheetId ? "Hoja vinculada." : "Aún no se ha creado la hoja — se crea sola al conectar."}
      ${connected ? " Conectado ✓" : " No conectado esta sesión."}
    </p>
    ${pendingCount > 0 ? `<p style="font-size:12.5px;color:var(--accent);margin-bottom:10px;">${pendingCount} registro${pendingCount !== 1 ? "s" : ""} pendiente${pendingCount !== 1 ? "s" : ""} de sincronizar</p>` : ""}
    <p style="font-size:12px;color:var(--txt-dim);margin-bottom:6px;">Cuenta de Google a usar (evita que el navegador use otra sola):</p>
    <input id="gsEmailHintInput" class="input-full" placeholder="tucorreo@gmail.com" value="${esc(gsEmailHint)}" style="margin-bottom:8px;">
    <button class="hist-btn" id="gsSaveEmailHintBtn" style="width:100%;justify-content:center;margin-bottom:8px;">Guardar cuenta</button>
    <a href="https://accounts.google.com/logout" target="_blank" rel="noopener" class="hist-btn" style="width:100%;justify-content:center;margin-bottom:12px;text-decoration:none;box-sizing:border-box;">Cerrar sesión de Google en este navegador</a>
    <button class="save-btn" id="gsConnectBtn" style="margin-bottom:8px;">${connected ? "Reconectar" : "Conectar con Google"}</button>
    ${connected && gsSpreadsheetId ? `<button class="log-btn" id="gsPullBtn" style="width:100%;justify-content:center;margin-bottom:8px;">Actualizar desde Sheets</button>` : ""}
    ${pendingCount > 0 ? `<button class="log-btn" id="gsSyncBtn" style="width:100%;justify-content:center;margin-bottom:8px;">Sincronizar ${pendingCount} pendiente${pendingCount !== 1 ? "s" : ""}</button>` : ""}
    ${gsSpreadsheetId ? `<button class="hist-btn" id="gsOpenBtn" style="width:100%;justify-content:center;margin-bottom:8px;">Abrir hoja en Google Sheets</button>` : ""}
    <div style="border-top:1px solid var(--line);margin:10px 0;padding-top:10px;">
      <p style="font-size:12px;color:var(--txt-dim);margin-bottom:6px;">¿Ya tienes la hoja creada en otro dispositivo? Pega el enlace aquí para usar la misma:</p>
      <input id="gsLinkInput" class="input-full" placeholder="Enlace o ID de Google Sheets" style="margin-bottom:8px;">
      <button class="hist-btn" id="gsLinkBtn" style="width:100%;justify-content:center;margin-bottom:8px;">Vincular y traer datos</button>
    </div>
    <button class="hist-btn" id="gsResetBtn" style="width:100%;justify-content:center;margin-bottom:8px;">Cambiar Client ID</button>
    <button class="hist-btn" id="forceUpdateBtn" style="width:100%;justify-content:center;margin-bottom:8px;">&#8635; Forzar actualización de la app</button>
    <div style="border-top:1px solid var(--line);margin:10px 0;padding-top:10px;">
      <p style="font-size:12px;color:var(--danger);font-weight:700;margin-bottom:6px;">Zona de reinicio</p>
      <button class="hist-btn" id="gsClearLocalBtn" style="width:100%;justify-content:center;margin-bottom:8px;border-color:var(--danger);color:var(--danger);">Borrar historial local (este dispositivo)</button>
      ${connected && gsSpreadsheetId ? `<button class="hist-btn" id="gsClearSheetBtn" style="width:100%;justify-content:center;border-color:var(--danger);color:var(--danger);">Borrar también los datos en Google Sheets</button>` : ""}
    </div>
    <button class="hist-btn" id="gsCloseModal" style="width:100%;justify-content:center;">Cerrar</button>
  `;
  document.getElementById("gsSaveEmailHintBtn").addEventListener("click", () => {
    const val = document.getElementById("gsEmailHintInput").value.trim();
    gsEmailHint = val;
    localStorage.setItem(GS_EMAIL_HINT_KEY, val);
    gsAccessToken = null; // the old token belonged to whichever account was active before; force a fresh redirect
    showToast(val ? "Cuenta guardada — vuelve a conectar" : "Cuenta borrada");
    gsRenderModal();
  });
  document.getElementById("gsConnectBtn").addEventListener("click", () => {
    gsStartAuthRedirect(); // navigates the whole page to Google; picks back up in gsHandleRedirectReturn() on return
  });
  const pullBtn = document.getElementById("gsPullBtn");
  if (pullBtn) pullBtn.addEventListener("click", async () => {
    const res = await gsPullAll(false);
    showToast(res.pulled > 0 ? `${res.pulled} registros nuevos traídos` : "Ya estabas al día");
    gsRenderModal();
  });
  const linkBtn = document.getElementById("gsLinkBtn");
  if (linkBtn) linkBtn.addEventListener("click", async () => {
    const val = document.getElementById("gsLinkInput").value;
    if (!val.trim()) return;
    await gsLinkExistingSheet(val);
    gsUpdateStatus();
    gsRenderModal();
  });
  const syncBtn = document.getElementById("gsSyncBtn");
  if (syncBtn) syncBtn.addEventListener("click", async () => {
    await gsSyncPending();
    gsRenderModal();
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
  document.getElementById("forceUpdateBtn").addEventListener("click", async () => {
    showToast("Actualizando...");
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (e) { /* best-effort, reload anyway */ }
    location.reload();
  });
  const clearLocalBtn = document.getElementById("gsClearLocalBtn");
  if (clearLocalBtn) clearLocalBtn.addEventListener("click", () => {
    if (!confirm("¿Borrar TODO el historial guardado en este dispositivo (sets Y peso corporal)? Esto no se puede deshacer. (La rutina/ejercicios no se borran)")) return;
    logs = {};
    bodyweightLog = [];
    saveLogs();
    saveBodyweight();
    render();
    gsUpdateStatus();
    gsRenderModal();
    showToast("Historial local borrado");
  });
  const clearSheetBtn = document.getElementById("gsClearSheetBtn");
  if (clearSheetBtn) clearSheetBtn.addEventListener("click", async () => {
    if (!confirm("¿Borrar TODOS los datos en tu Google Sheet (sets y peso corporal, se mantienen los encabezados)? Esto no se puede deshacer.")) return;
    if (!confirm("Confirma de nuevo: esto borra los datos en la hoja de Google, no solo en este dispositivo.")) return;
    try {
      for (const day of Object.values(routine)) {
        await gsFetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(day.label)}!A2:G100000:clear`,
          { method: "POST" }
        );
      }
      await gsFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${gsSpreadsheetId}/values/${encodeURIComponent(GS_BW_SHEET)}!A2:D100000:clear`,
        { method: "POST" }
      );
      showToast("Datos borrados en Google Sheets");
    } catch (e) {
      showToast("No se pudo borrar en Sheets");
    }
    gsRenderModal();
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

// Every day-instance definition, NOT deduplicated — needed so name-matching (imports, Sheets
// pull) recognizes every historical name variant and still resolves to the shared canonical key.
function allExerciseDefinitionsFlat() {
  const list = [];
  Object.entries(routine).forEach(([dayKey, day]) => {
    day.exercises.forEach((ex) => list.push({ ...ex, dayKey, dayLabel: day.label }));
  });
  return list;
}

// Deduplicated by canonical log key — for display lists (exercise picker, PR table) where a
// shared exercise (same movement, logged from two different days) should appear only once.
function allExercisesFlat() {
  const seen = {};
  const list = [];
  allExerciseDefinitionsFlat().forEach((ex) => {
    const key = logKey(ex);
    if (seen[key]) { seen[key].dayLabels.push(ex.dayLabel); return; }
    const item = { ...ex, id: key, dayLabels: [ex.dayLabel] };
    seen[key] = item;
    list.push(item);
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
  const entries = sortByDateAsc(logs[exId] || []); // chronological, oldest to newest
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
      const key = logKey(ex);
      (logs[key] || []).forEach((e) => {
        // A shared exercise (same movement logged from two different days) only counts
        // toward the day it was actually performed on, using the entry's own dayLabel —
        // otherwise its volume would be counted twice (once per day that references it).
        const belongsToThisDay = e.dayLabel ? e.dayLabel === day.label : true; // legacy entries without dayLabel: include once, best effort
        if (belongsToThisDay) total += (e.weight || 0) * (e.reps || 0);
      });
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

function statsOverviewHTML() {
  const allLogs = Object.values(logs).flat();
  const totalEntries = allLogs.length;
  const distinctDates = new Set(allLogs.map((l) => l.date));
  const totalSessions = distinctDates.size;
  const totalVolume = allLogs.reduce((sum, l) => sum + (l.weight || 0) * (l.reps || 0), 0);

  const countByEx = {};
  Object.entries(logs).forEach(([exId, arr]) => { countByEx[exId] = arr.length; });
  let mostTrainedId = null, mostTrainedCount = 0;
  Object.entries(countByEx).forEach(([exId, c]) => { if (c > mostTrainedCount) { mostTrainedCount = c; mostTrainedId = exId; } });
  const mostTrainedEx = allExercisesFlat().find((e) => e.id === mostTrainedId);

  if (totalEntries === 0) {
    return `<p style="font-size:13px;color:var(--txt-dim);">Aún no hay registros para mostrar un resumen.</p>`;
  }

  const cards = [
    { label: "Sesiones totales", value: totalSessions },
    { label: "Registros totales", value: totalEntries },
    { label: "Volumen histórico", value: `${Math.round(totalVolume).toLocaleString()}` },
    { label: "Más entrenado", value: mostTrainedEx ? mostTrainedEx.name : "—", small: true },
  ];
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
    ${cards.map((c) => `
      <div class="card" style="padding:10px;text-align:center;">
        <div style="font-size:11px;color:var(--txt-dim);">${c.label}</div>
        <div style="font-size:${c.small ? "13px" : "18px"};font-weight:700;color:var(--accent);line-height:1.3;">${esc(c.value)}</div>
      </div>
    `).join("")}
  </div>`;
}

function statsRenderWeeklyVolume() {
  const wrap = document.getElementById("statsWeeklyVolumeArea");
  const allLogs = Object.values(logs).flat();
  if (allLogs.length === 0) {
    wrap.innerHTML = `<p style="font-size:13px;color:var(--txt-dim);">Aún no hay historial suficiente.</p>`;
    return;
  }
  const NUM_WEEKS = 10;
  const vols = new Array(NUM_WEEKS).fill(0);
  allLogs.forEach((l) => {
    const w = statsWeeksAgo(l.date);
    if (w >= 0 && w < NUM_WEEKS) vols[NUM_WEEKS - 1 - w] += (l.weight || 0) * (l.reps || 0);
  });
  wrap.innerHTML = `<div class="card"><canvas id="weeklyVolCanvas" height="140"></canvas></div>`;
  destroyChart("weeklyVol");
  const ctx = document.getElementById("weeklyVolCanvas").getContext("2d");
  statsCharts.weeklyVol = new Chart(ctx, {
    type: "bar",
    data: {
      labels: vols.map((_, i) => `${NUM_WEEKS - 1 - i}`),
      datasets: [{ label: "Volumen total (peso × reps)", data: vols, backgroundColor: CHART_COLORS[2] }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: "Semanas atrás", color: "#9A9EA6" }, ticks: { color: "#9A9EA6" }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: "#9A9EA6" }, grid: { color: "#2C3036" } },
      },
    },
  });
}

function statsRenderPRTable() {
  const wrap = document.getElementById("statsPRArea");
  const exList = allExercisesFlat().filter((ex) => (logs[ex.id] || []).length > 0);
  if (exList.length === 0) {
    wrap.innerHTML = `<p style="font-size:13px;color:var(--txt-dim);">Aún no hay récords que mostrar.</p>`;
    return;
  }
  const rows = exList.map((ex) => {
    const entries = logs[ex.id];
    let bestW = entries[0], bestE1 = entries[0];
    entries.forEach((e) => {
      if (e.weight > bestW.weight) bestW = e;
      if (epley1RM(e.weight, e.reps) > epley1RM(bestE1.weight, bestE1.reps)) bestE1 = e;
    });
    return { name: ex.name, dayLabel: ex.dayLabels.join(" y "), bestW, bestE1RM: epley1RM(bestE1.weight, bestE1.reps) };
  });
  wrap.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${rows.map((r) => `
        <div class="card" style="padding:10px;">
          <div style="font-size:12.5px;font-weight:600;margin-bottom:4px;">${esc(r.name)}</div>
          <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--txt-dim);">
            <span>${esc(r.dayLabel)}</span>
            <span style="color:var(--accent);font-weight:700;">PR: ${r.bestW.weight}${r.bestW.unit} × ${r.bestW.reps}r &nbsp;·&nbsp; 1RM est: ${r.bestE1RM.toFixed(1)}${r.bestW.unit}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function statsRender() {
  const body = document.getElementById("statsBody");
  const exList = allExercisesFlat();
  const defaultId = statsRender._lastEx || exList[0]?.id;
  body.innerHTML = `
    <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:6px;">Resumen general</div>
    ${statsOverviewHTML()}

    <div style="font-size:13px;font-weight:700;color:var(--accent);margin:20px 0 6px;">Volumen semanal total (todos los ejercicios)</div>
    <div id="statsWeeklyVolumeArea"></div>

    <div style="font-size:13px;font-weight:700;color:var(--accent);margin:20px 0 6px;">Progresión por ejercicio</div>
    ${statsBuildExerciseSelect(defaultId)}
    <div id="statsExerciseArea"></div>

    <div style="font-size:13px;font-weight:700;color:var(--accent);margin:20px 0 6px;">Consistencia (sesiones por semana)</div>
    <div id="statsConsistencyArea"></div>

    <div style="font-size:13px;font-weight:700;color:var(--accent);margin:20px 0 6px;">Volumen histórico por día de rutina</div>
    <div id="statsVolumeArea"></div>

    <div style="font-size:13px;font-weight:700;color:var(--accent);margin:20px 0 6px;">Récords personales (todos los ejercicios)</div>
    <div id="statsPRArea"></div>
  `;
  document.getElementById("statsExSelect").addEventListener("change", (e) => {
    statsRender._lastEx = e.target.value;
    statsRenderExerciseChart._filter = null;
    statsRenderExerciseChart(e.target.value);
  });
  statsRenderWeeklyVolume();
  if (defaultId) statsRenderExerciseChart(defaultId);
  statsRenderConsistency();
  statsRenderVolumePerDay();
  statsRenderPRTable();
}

document.getElementById("btnStats").addEventListener("click", () => {
  document.getElementById("statsModal").classList.remove("hidden");
  statsRender();
});
document.getElementById("statsCloseBtn").addEventListener("click", () => {
  document.getElementById("statsModal").classList.add("hidden");
});

// ---------- Bodyweight tracking ----------
let bwChart = null;
function bwRender() {
  const body = document.getElementById("bwBody");
  const sorted = sortByDateDesc(bodyweightLog);
  const chronological = sortByDateAsc(bodyweightLog);

  body.innerHTML = `
    <div class="card" style="margin-bottom:14px;">
      <input class="input-full" type="date" id="bwDate" value="${todayISO()}" style="margin-bottom:8px;">
      <div class="form-row" style="margin-bottom:8px;">
        <input class="input" type="number" inputmode="decimal" placeholder="Peso" id="bwWeight">
        <div class="unit-toggle">
          <button class="unit-btn active" data-bwunit="lb">lb</button>
          <button class="unit-btn" data-bwunit="kg">kg</button>
        </div>
      </div>
      <input class="input-full" placeholder="Notas (opcional)" id="bwNotes" style="margin-bottom:8px;">
      <button class="save-btn" id="bwSaveBtn">&#10003; Registrar peso</button>
    </div>
    ${chronological.length > 1 ? `<div class="card" style="margin-bottom:14px;"><canvas id="bwChartCanvas" height="160"></canvas></div>` : ""}
    <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:8px;">Historial</div>
    ${sorted.length === 0 ? `<p style="font-size:13px;color:var(--txt-dim);">Aún no has registrado tu peso.</p>` : sorted.map((l) => `
      <div class="bw-row" data-bw-id="${l.id}">
        <span>${fmtDate(l.date)}</span>
        <span style="font-weight:700;">${l.weight}${l.unit}</span>
        <span style="color:var(--txt-dim);flex:1;text-align:right;margin-right:8px;">${esc(l.notes || "")}</span>
        <button class="hist-del" data-action="bw-del">&#128465;</button>
      </div>
    `).join("")}
  `;

  document.querySelectorAll("[data-bwunit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-bwunit]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.getElementById("bwSaveBtn").addEventListener("click", () => {
    const date = document.getElementById("bwDate").value || todayISO();
    const weight = document.getElementById("bwWeight").value;
    const notes = document.getElementById("bwNotes").value;
    const unit = document.querySelector("[data-bwunit].active")?.dataset.bwunit || "lb";
    if (!weight) { showToast("Falta el peso"); return; }
    const entry = { id: `${Date.now()}`, date, weight: parseFloat(weight), unit, notes: notes.trim(), synced: false };
    bodyweightLog.push(entry);
    saveBodyweight();
    showToast("Peso registrado");
    bwRender();
    gsAppendBodyweight(entry.id, [entry.date, entry.weight, entry.unit, entry.notes]);
  });

  document.querySelectorAll('[data-action="bw-del"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest("[data-bw-id]").dataset.bwId;
      const entry = bodyweightLog.find((l) => l.id === id);
      bodyweightLog = bodyweightLog.filter((l) => l.id !== id);
      saveBodyweight();
      bwRender();
      if (entry) gsDeleteBodyweightRow(entry);
    });
  });

  if (chronological.length > 1) {
    if (bwChart) bwChart.destroy();
    const ctx = document.getElementById("bwChartCanvas").getContext("2d");
    bwChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: chronological.map((l) => fmtDate(l.date)),
        datasets: [{ label: `Peso corporal (${chronological[0].unit})`, data: chronological.map((l) => l.weight), borderColor: CHART_COLORS[0], backgroundColor: CHART_COLORS[0], tension: 0.25, pointRadius: 3 }],
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
}
document.getElementById("btnBodyweight").addEventListener("click", () => {
  document.getElementById("bwModal").classList.remove("hidden");
  bwRender();
});
document.getElementById("bwCloseBtn").addEventListener("click", () => {
  document.getElementById("bwModal").classList.add("hidden");
});
// ---------- Vincular ejercicios manualmente (anula canonicalId desde el sitio) ----------

// Une dos ejercicios (o los suma a un grupo ya vinculado) para que compartan un solo
// historial. Si cualquiera de los dos ya tenía registros propios, se fusionan sin duplicar.
function linkExercises(idA, idB) {
  if (idA === idB) return;
  const defs = allExerciseDefinitionsFlat();
  const exA = defs.find((e) => e.id === idA);
  const exB = defs.find((e) => e.id === idB);
  if (!exA || !exB) return;

  const keyA = logKey(exA);
  const keyB = logKey(exB);
  if (keyA === keyB) { showToast("Ya están vinculados"); return; }

  const groupIds = [...new Set(defs.filter((e) => logKey(e) === keyA || logKey(e) === keyB).map((e) => e.id))];
  const newKey = keyA;

  const entriesA = logs[keyA] || [];
  const entriesB = logs[keyB] || [];
  const merged = entriesA.slice();
  entriesB.forEach((entry) => {
    const dup = merged.some((e) => e.date === entry.date && e.weight === entry.weight && e.unit === entry.unit && e.reps === entry.reps && (e.equip || "") === (entry.equip || ""));
    if (!dup) merged.push(entry);
  });
  logs[newKey] = merged;
  if (keyB !== newKey) delete logs[keyB];

  groupIds.forEach((id) => {
    const ex = defs.find((e) => e.id === id);
    const natural = ex.canonicalId || ex.id;
    if (natural === newKey) delete linkMap[id];
    else linkMap[id] = newKey;
  });

  saveLinkMap();
  saveLogs();
  showToast("Ejercicios vinculados");
  render();
}

// Saca UN ejercicio de su grupo. Sus propios registros (identificados por el dayLabel con
// que se guardaron) se separan; el resto del grupo sigue compartiendo historial.
function unlinkSingle(exId) {
  const defs = allExerciseDefinitionsFlat();
  const ex = defs.find((e) => e.id === exId);
  if (!ex) return;
  const groupKey = logKey(ex);
  const members = defs.filter((e) => logKey(e) === groupKey);
  if (members.length <= 1) return;

  const standaloneKey = ex.id;
  linkMap[exId] = standaloneKey;

  const groupEntries = logs[groupKey] || [];
  const mine = groupEntries.filter((e) => e.dayLabel === ex.dayLabel);
  const rest = groupEntries.filter((e) => e.dayLabel !== ex.dayLabel);
  logs[groupKey] = rest;
  logs[standaloneKey] = (logs[standaloneKey] || []).concat(mine);

  saveLinkMap();
  saveLogs();
  showToast("Ejercicio desvinculado");
  render();
  linksRender();
}

// Desarma un grupo completo: cada ejercicio recupera su propio historial (por dayLabel).
function unlinkGroup(groupKey) {
  const defs = allExerciseDefinitionsFlat();
  const members = defs.filter((e) => logKey(e) === groupKey);
  if (members.length <= 1) return;
  const groupEntries = logs[groupKey] || [];

  members.forEach((ex) => {
    linkMap[ex.id] = ex.id;
    const mine = groupEntries.filter((e) => e.dayLabel === ex.dayLabel);
    logs[ex.id] = (logs[ex.id] || []).concat(mine);
  });
  const claimedDays = new Set(members.map((m) => m.dayLabel));
  const leftover = groupEntries.filter((e) => !claimedDays.has(e.dayLabel));
  if (leftover.length > 0) logs[members[0].id] = (logs[members[0].id] || []).concat(leftover);
  delete logs[groupKey];

  saveLinkMap();
  saveLogs();
  showToast("Grupo desvinculado");
  render();
  linksRender();
}

function linksRender() {
  const body = document.getElementById("linksBody");
  const defs = allExerciseDefinitionsFlat();

  const groups = {};
  defs.forEach((ex) => { (groups[logKey(ex)] = groups[logKey(ex)] || []).push(ex); });
  const linkedGroups = Object.entries(groups).filter(([, members]) => members.length > 1);

  const groupsHTML = linkedGroups.length === 0
    ? `<p style="font-size:13px;color:var(--txt-dim);margin-bottom:16px;">Aún no hay ejercicios vinculados.</p>`
    : linkedGroups.map(([key, members]) => `
        <div class="card" style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:12px;color:var(--txt-dim);">Comparten historial</span>
            <button class="hist-btn" data-unlink-group="${esc(key)}">Desvincular grupo</button>
          </div>
          ${members.map((m) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);">
              <div>
                <div style="font-size:13px;font-weight:600;">${esc(m.name)}</div>
                <div style="font-size:11px;color:var(--txt-dim);">${esc(m.dayLabel)}</div>
              </div>
              <button class="hist-btn" data-unlink-id="${m.id}">Quitar</button>
            </div>
          `).join("")}
        </div>
      `).join("");

  const options = defs.map((ex) => `<option value="${ex.id}">${esc(ex.dayLabel)} — ${esc(ex.name)}</option>`).join("");

  body.innerHTML = `
    <p style="font-size:13px;color:var(--txt-dim);margin-bottom:14px;">
      Vincula dos ejercicios que sean el mismo movimiento (p. ej. repetido en dos días) para que compartan un único historial de peso y reps.
    </p>
    <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:8px;">Grupos vinculados</div>
    ${groupsHTML}
    <div style="font-size:13px;font-weight:700;color:var(--accent);margin:20px 0 8px;">Vincular nuevos</div>
    <select id="linkSelA" class="input-full" style="margin-bottom:8px;">${options}</select>
    <select id="linkSelB" class="input-full" style="margin-bottom:10px;">${options}</select>
    <button class="save-btn" id="linkGoBtn">Vincular estos dos</button>
  `;

  body.querySelectorAll("[data-unlink-id]").forEach((btn) => {
    btn.addEventListener("click", () => unlinkSingle(btn.dataset.unlinkId));
  });
  body.querySelectorAll("[data-unlink-group]").forEach((btn) => {
    btn.addEventListener("click", () => unlinkGroup(btn.dataset.unlinkGroup));
  });
  document.getElementById("linkGoBtn").addEventListener("click", () => {
    const idA = document.getElementById("linkSelA").value;
    const idB = document.getElementById("linkSelB").value;
    if (idA === idB) { showToast("Elige dos ejercicios distintos"); return; }
    linkExercises(idA, idB);
    linksRender();
  });
}

document.getElementById("btnLinks").addEventListener("click", () => {
  document.getElementById("linksModal").classList.remove("hidden");
  linksRender();
});
document.getElementById("linksCloseBtn").addEventListener("click", () => {
  document.getElementById("linksModal").classList.add("hidden");
});

// ---------- Import / Export Excel ----------
document.getElementById("btnImport").addEventListener("click", () => document.getElementById("importFile").click());

document.getElementById("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true });
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
      scheduleRoutineSync();
      activeDay = Object.keys(routine)[0];
      render();
      showToast(`Rutina importada (${importedCount} días)`);
    } else {
      showToast("No se encontraron hojas de días válidas");
    }

    // Also scan the whole workbook for historical logs (any sheet with date columns)
    importFullHistory(wb);
  } catch (err) {
    showToast("Error al leer el archivo");
  }
  e.target.value = "";
});

// ---------- Full history import (any sheet with date-headed columns) ----------
function normName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^ss\d+\s+/i, "")
    .replace(/\s*\(ss\d+\)\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildNameIndex() {
  const idx = [];
  allExerciseDefinitionsFlat().forEach((ex) => idx.push({ id: logKey(ex), norm: normName(ex.name) }));
  return idx;
}

function matchExercise(rawName, nameIndex) {
  const n = normName(rawName);
  if (!n || n.length < 4) return null; // avoid spurious matches from short/numeric fragments
  let best = nameIndex.find((e) => e.norm === n);
  if (best) return best.id;
  // fuzzy: substring either direction, prefer longest overlap (min 4 chars to avoid false positives)
  let bestLen = 0;
  nameIndex.forEach((e) => {
    if (e.norm.length < 4) return;
    if (e.norm.includes(n) || n.includes(e.norm)) {
      const len = Math.min(e.norm.length, n.length);
      if (len >= 4 && len > bestLen) { bestLen = len; best = e; }
    }
  });
  return best ? best.id : null;
}

const HIST_CELL_RE = /^\s*([\d.]+)\s*(kg|lb)\s*(?:xl)?\s*\|\s*(\d+)\s*r\+?\s*(?:\|\s*(.+))?\s*$/i;

function importFullHistory(wb) {
  const nameIndex = buildNameIndex();
  let imported = 0, skippedUnparsed = 0;
  const unmatched = new Set();

  wb.SheetNames.forEach((sheetName) => {
    const ws = wb.Sheets[sheetName];
    if (!ws["!ref"]) return;
    const range = XLSX.utils.decode_range(ws["!ref"]);

    for (let r = range.s.r; r <= range.e.r; r++) {
      // find date columns in this row
      const dateCols = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        if (cell && cell.t === "d" && cell.v instanceof Date) {
          dateCols.push({ c, iso: cell.v.toISOString().slice(0, 10) });
        }
      }
      if (dateCols.length < 1) continue; // not a header row

      // scan subsequent rows until we hit another header row or run out
      for (let rr = r + 1; rr <= range.e.r; rr++) {
        // stop if this row is itself a new header (has date cells)
        let isHeader = false;
        for (const dc of dateCols) {
          const c2 = ws[XLSX.utils.encode_cell({ r: rr, c: dc.c })];
          if (c2 && c2.t === "d") { isHeader = true; break; }
        }
        if (isHeader) break;

        // find the exercise name: first non-empty text cell left of the first date column
        let name = null;
        for (let c = range.s.c; c < dateCols[0].c; c++) {
          const cell = ws[XLSX.utils.encode_cell({ r: rr, c })];
          if (cell && cell.v != null && String(cell.v).trim() !== "") { name = String(cell.v).trim(); break; }
        }
        if (!name) continue;

        const exId = matchExercise(name, nameIndex);
        if (!exId) { unmatched.add(name); continue; }

        dateCols.forEach(({ c, iso }) => {
          const cell = ws[XLSX.utils.encode_cell({ r: rr, c })];
          if (!cell || cell.v == null || String(cell.v).trim() === "") return;
          const raw = String(cell.v).trim();
          const m = raw.match(HIST_CELL_RE);
          if (!m) { skippedUnparsed++; return; }
          const weight = parseFloat(m[1]);
          const unit = m[2].toLowerCase();
          const reps = parseInt(m[3], 10);
          const equip = (m[4] || "").trim();

          const existing = logs[exId] || [];
          const dup = existing.some((l) => l.date === iso && l.weight === weight && l.unit === unit && l.reps === reps && (l.equip || "") === equip);
          if (dup) return;

          existing.push({
            id: `imp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            date: iso, weight, unit, reps, equip, notes: "Importado de Excel",
          });
          logs[exId] = existing;
          imported++;
        });
      }
    }
  });

  if (imported > 0) saveLogs();
  render();

  let msg = `Historial importado: ${imported} registros.`;
  if (skippedUnparsed > 0) msg += ` ${skippedUnparsed} celdas no se pudieron leer (formato distinto).`;
  if (unmatched.size > 0) msg += `\n\nEjercicios sin coincidencia (no importados):\n- ${[...unmatched].join("\n- ")}`;
  if (imported > 0 || skippedUnparsed > 0 || unmatched.size > 0) {
    setTimeout(() => alert(msg), 300);
  }
}

document.getElementById("btnExport").addEventListener("click", () => {
  const wb = XLSX.utils.book_new();
  Object.values(routine).forEach((day) => {
    const rows = [["Ejercicio", "Fecha", "Peso", "Unidad", "Reps", "Equipo", "Notas"]];
    day.exercises.forEach((ex) => {
      const allEntries = logs[logKey(ex)] || [];
      // shared exercises (same movement logged from 2 days) only list entries actually
      // performed on THIS day's tab, so the export mirrors the original day-by-day structure
      const dayEntries = allEntries.filter((e) => (e.dayLabel ? e.dayLabel === day.label : true));
      const entries = sortByDateAsc(dayEntries);
      if (entries.length === 0) {
        rows.push([ex.name, "", "", "", "", "", ""]);
      } else {
        entries.forEach((entry) => {
          rows.push([ex.name, entry.date, entry.weight, entry.unit, entry.reps, entry.equip || "", entry.notes || ""]);
        });
      }
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 34 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 20 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, ws, day.label);
  });
  // Bodyweight sheet
  const bwRows = [["Fecha", "Peso", "Unidad", "Notas"]];
  sortByDateAsc(bodyweightLog).forEach((l) => bwRows.push([l.date, l.weight, l.unit, l.notes || ""]));
  const bwWs = XLSX.utils.aoa_to_sheet(bwRows);
  bwWs["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, bwWs, "Peso corporal");

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

// ---------- Handle returning from Google's login redirect ----------
const gsJustConnected = gsHandleRedirectReturn();
if (gsJustConnected) {
  showToast("Conectado a Google");
  (async () => {
    const res = await gsPullAll(true);
    if (res && res.pulled > 0) showToast(`${res.pulled} registros nuevos traídos de Sheets`);
    await gsSyncRoutineStructure(); // catch up any structural edits made while offline
    gsUpdateStatus();
  })();
} else {
  gsUpdateStatus(); // reflect "connected earlier but no token this pageload" etc.
}
