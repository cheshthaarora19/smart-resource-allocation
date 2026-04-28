import { useState, useEffect } from "react";
import { getTasks, getVolunteers, reportIssue, assignVolunteer, updateTaskStatus, updateVolunteerAvailability, getAnalytics, login, getToken, clearToken } from "./api/index.js";

// ─── Fallback mock data (used if backend is offline) ─────────────────────────
const MOCK_TASKS = [
  { id: "t1", title: "Medical supply delivery – Sector 4", location: "Sector 4, Delhi", priority: 9, need_type: "health", status: "unassigned", assigned_to: null, people_affected: 120, created_at: "2025-04-24T08:30:00Z", description: "Critical shortage of medicines at the community health post." },
  { id: "t2", title: "Food distribution – Camp B", location: "Camp B, Noida", priority: 7, need_type: "food", status: "assigned", assigned_to: "v1", people_affected: 80, created_at: "2025-04-23T14:00:00Z", description: "Displaced families need daily food packets." },
  { id: "t3", title: "Flood evacuation support", location: "Low-lying Zone 3, Gurugram", priority: 10, need_type: "disaster", status: "in_progress", assigned_to: "v2", people_affected: 300, created_at: "2025-04-24T06:00:00Z", description: "Flash flood warning. Immediate evacuation assistance needed." },
  { id: "t4", title: "School supply distribution", location: "Village Palam, Faridabad", priority: 4, need_type: "education", status: "completed", assigned_to: "v3", people_affected: 45, created_at: "2025-04-22T10:00:00Z", description: "Notebooks distributed to students who lost belongings." },
  { id: "t5", title: "Emergency water supply", location: "Ward 12, Gurugram", priority: 8, need_type: "health", status: "unassigned", assigned_to: null, people_affected: 200, created_at: "2025-04-24T09:15:00Z", description: "Water pipeline burst. Community needs clean drinking water." },
  { id: "t6", title: "Nutrition camp setup", location: "Sector 18, Noida", priority: 6, need_type: "food", status: "assigned", assigned_to: "v4", people_affected: 60, created_at: "2025-04-23T11:00:00Z", description: "Malnutrition cases reported. Nutrition screening required." },
];

const MOCK_VOLUNTEERS = [
  { id: "v1", name: "Arjun Mehta",  skills: ["medical","logistics"],   availability: "busy",      rating: 4.8, tasks_completed: 23, location: "Noida",     phone: "+91 98100 11111", current_task_id: "t2" },
  { id: "v2", name: "Priya Sharma", skills: ["disaster","logistics"],   availability: "busy",      rating: 4.6, tasks_completed: 17, location: "Gurugram",  phone: "+91 98100 22222", current_task_id: "t3" },
  { id: "v3", name: "Ravi Kumar",   skills: ["education","teaching"],   availability: "available", rating: 4.9, tasks_completed: 31, location: "Faridabad", phone: "+91 98100 33333", current_task_id: null },
  { id: "v4", name: "Sneha Patel",  skills: ["food","logistics"],       availability: "busy",      rating: 4.5, tasks_completed: 12, location: "Delhi",     phone: "+91 98100 44444", current_task_id: "t6" },
  { id: "v5", name: "Karan Singh",  skills: ["medical","health"],       availability: "available", rating: 4.3, tasks_completed: 8,  location: "Delhi",     phone: "+91 98100 55555", current_task_id: null },
  { id: "v6", name: "Meena Joshi",  skills: ["food","education"],       availability: "offline",   rating: 4.7, tasks_completed: 19, location: "Noida",     phone: "+91 98100 66666", current_task_id: null },
];

const MOCK_ANALYTICS = { total_tasks: 6, completed_tasks: 1, active_volunteers: 4, avg_response_time: 2.4 };

const WEEKLY = [
  { day: "Mon", reports: 3, resolved: 1 }, { day: "Tue", reports: 5, resolved: 3 },
  { day: "Wed", reports: 4, resolved: 2 }, { day: "Thu", reports: 7, resolved: 4 },
  { day: "Fri", reports: 6, resolved: 3 }, { day: "Sat", reports: 2, resolved: 2 },
  { day: "Sun", reports: 4, resolved: 1 },
];

const ALERTS = [
  { id: "a1", region: "Gurugram", alert_type: "flood",    probability: 0.87 },
  { id: "a2", region: "Noida",    alert_type: "shortage", probability: 0.65 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const NEED_COLORS  = { health: { bg: "#fee2e2", text: "#dc2626" }, food: { bg: "#fef9c3", text: "#ca8a04" }, disaster: { bg: "#fce7f3", text: "#9d174d" }, education: { bg: "#dbeafe", text: "#1d4ed8" } };
const STATUS_META  = { unassigned: { label: "Unassigned", color: "#f97316" }, assigned: { label: "Assigned", color: "#3b82f6" }, in_progress: { label: "In Progress", color: "#8b5cf6" }, completed: { label: "Completed", color: "#22c55e" } };
const AVAIL_META   = { available: { label: "Available", color: "#22c55e" }, busy: { label: "On Task", color: "#f97316" }, offline: { label: "Offline", color: "#9ca3af" } };
const priorityColor = p => p >= 9 ? "#ef4444" : p >= 7 ? "#f97316" : p >= 5 ? "#eab308" : "#22c55e";
const timeAgo = iso => { const h = Math.floor((Date.now() - new Date(iso)) / 3600000); return h < 1 ? "< 1h ago" : h < 24 ? `${h}h ago` : `${Math.floor(h/24)}d ago`; };

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  card:      { background: "#161b27", border: "1px solid #1e2738", borderRadius: 12, padding: 20 },
  statCard:  { background: "#161b27", border: "1px solid #1e2738", borderRadius: 12, padding: "18px 20px" },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14, marginTop: 0 },
  taskRow:   { display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #1e2738" },
  badge:     (bg, text) => ({ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color: text }),
  btn:       (v = "primary") => ({ padding: "8px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", background: v === "primary" ? "#6366f1" : v === "danger" ? "#dc2626" : v === "success" ? "#16a34a" : "#1e2738", display: "inline-flex", alignItems: "center", gap: 6 }),
  input:     { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #1e2738", background: "#0f1117", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select:    { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #1e2738", background: "#0f1117", color: "#e2e8f0", fontSize: 14, outline: "none", cursor: "pointer" },
  label:     { fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6, display: "block" },
  modal:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modalBox:  { background: "#161b27", border: "1px solid #1e2738", borderRadius: 14, padding: 28, width: 480, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto" },
  toast:     { position: "fixed", bottom: 24, right: 24, background: "#22c55e", color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" },
  grid2:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3:     { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  grid4:     { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
};

// ─── Small components ─────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={S.toast}>✓ {msg}</div>;
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
      <div style={{ width: 32, height: 32, border: "3px solid #1e2738", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}

function OfflineBanner() {
  return (
    <div style={{ background: "#451a03", border: "1px solid #78350f", borderRadius: 10, padding: "10px 16px", marginBottom: 14, fontSize: 13, color: "#fcd34d" }}>
      ⚠️ Backend offline — showing demo data. Start your server at <code>localhost:5000</code> and refresh.
    </div>
  );
}

function BarChart() {
  const max = Math.max(...WEEKLY.map(d => d.reports));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
      {WEEKLY.map(d => (
        <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, justifyContent: "flex-end", height: 64 }}>
            <div style={{ background: "#6366f1", borderRadius: "3px 3px 0 0", height: `${(d.reports / max) * 56}px` }} />
            <div style={{ background: "#22c55e", borderRadius: "3px 3px 0 0", height: `${(d.resolved / max) * 56}px`, marginTop: -3, opacity: 0.8 }} />
          </div>
          <span style={{ fontSize: 10, color: "#475569" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ tasks }) {
  const colors = { health: "#ef4444", food: "#eab308", disaster: "#ec4899", education: "#3b82f6" };
  const breakdown = ["health","food","disaster","education"].map(type => ({ type, count: tasks.filter(t => t.need_type === type).length }));
  const total = breakdown.reduce((s, d) => s + d.count, 0) || 1;
  let cumAngle = -90;
  const r = 44, cx = 60, cy = 60;
  const polar = (a) => ({ x: cx + r * Math.cos(a * Math.PI / 180), y: cy + r * Math.sin(a * Math.PI / 180) });
  const slices = breakdown.map(d => {
    const angle = (d.count / total) * 360;
    const s = polar(cumAngle), e = polar(cumAngle + angle - 0.5);
    cumAngle += angle;
    return { ...d, color: colors[d.type], path: `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${e.x} ${e.y} Z` };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={120} height={120}>
        <circle cx={cx} cy={cy} r={r} fill="#0f1117" />
        {slices.map(s => <path key={s.type} d={s.path} fill={s.color} opacity={0.85} />)}
        <circle cx={cx} cy={cy} r={28} fill="#161b27" />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#f1f5f9" fontSize={14} fontWeight={700}>{tasks.length}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {slices.map(s => (
          <div key={s.type} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: 12, color: "#94a3b8", textTransform: "capitalize" }}>{s.type}</span>
            <span style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 700, marginLeft: "auto" }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Assign Modal ─────────────────────────────────────────────────────────────
function AssignModal({ task, volunteers, onAssign, onClose, loading }) {
  const [selected, setSelected] = useState(null);
  const available = volunteers.filter(v => v.availability === "available");
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={S.sectionTitle}>Assign Volunteer</p>
            <h3 style={{ margin: 0, fontSize: 16, color: "#f1f5f9" }}>{task.title}</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>📍 {task.location}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {available.length === 0
          ? <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No available volunteers right now.</p>
          : available.map(v => {
            const match = v.skills.some(s => task.need_type === s || s === task.need_type);
            return (
              <div key={v.id} onClick={() => setSelected(v.id === selected ? null : v.id)}
                style={{ border: `2px solid ${selected === v.id ? "#6366f1" : "#1e2738"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", background: selected === v.id ? "#1e1e38" : "#0f1117", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{v.name}</span>
                  <span style={{ fontSize: 12, color: "#fbbf24" }}>★ {v.rating}</span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>📍 {v.location}</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>✅ {v.tasks_completed} tasks</span>
                  {match && <span style={S.badge("#1e3a2e", "#4ade80")}>✦ Skill match</span>}
                  {v.skills.map(s => <span key={s} style={S.badge("#1e2738", "#94a3b8")}>{s}</span>)}
                </div>
              </div>
            );
          })
        }
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={S.btn("ghost")}>Cancel</button>
          <button disabled={!selected || loading} onClick={() => onAssign(task.id, selected)}
            style={{ ...S.btn(), opacity: selected && !loading ? 1 : 0.4 }}>
            {loading ? "Assigning…" : "Confirm Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({ onSubmit, onClose }) {
  const [form, setForm] = useState({ title: "", description: "", location: "", need_type: "food", severity: 5, people_affected: "" });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title || !form.location) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ ...S.sectionTitle, margin: 0 }}>Report New Issue</p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Title *</label>
          <input style={S.input} placeholder="Brief title of the issue" value={form.title} onChange={e => set("title", e.target.value)} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Description</label>
          <textarea style={{ ...S.input, height: 80, resize: "vertical" }} placeholder="Describe the situation..." value={form.description} onChange={e => set("description", e.target.value)} />
        </div>
        <div style={{ ...S.grid2, marginBottom: 14 }}>
          <div>
            <label style={S.label}>Location *</label>
            <input style={S.input} placeholder="Area / address" value={form.location} onChange={e => set("location", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Need Type</label>
            <select style={S.select} value={form.need_type} onChange={e => set("need_type", e.target.value)}>
              <option value="food">Food</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="disaster">Disaster</option>
            </select>
          </div>
        </div>
        <div style={{ ...S.grid2, marginBottom: 18 }}>
          <div>
            <label style={S.label}>Severity (1–10): <strong style={{ color: priorityColor(form.severity) }}>{form.severity}</strong></label>
            <input type="range" min={1} max={10} value={form.severity} onChange={e => set("severity", +e.target.value)} style={{ width: "100%", accentColor: "#6366f1" }} />
          </div>
          <div>
            <label style={S.label}>People Affected</label>
            <input style={S.input} type="number" placeholder="Approx. number" value={form.people_affected} onChange={e => set("people_affected", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={S.btn("ghost")}>Cancel</button>
          <button onClick={submit} disabled={loading || !form.title || !form.location}
            style={{ ...S.btn(), opacity: loading || !form.title || !form.location ? 0.5 : 1 }}>
            {loading ? "Submitting…" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NGO DASHBOARD ────────────────────────────────────────────────────────────
function NGODashboard({ tasks, setTasks, volunteers, setVolunteers, analytics, offline }) {
  const [filter, setFilter]         = useState("all");
  const [assignTarget, setAssign]   = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [toast, setToast]           = useState("");
  const [activeTab, setActiveTab]   = useState("overview");
  const [assignLoading, setAssignLoading] = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const stats = {
    total:      tasks.length,
    unassigned: tasks.filter(t => t.status === "unassigned").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed:  tasks.filter(t => t.status === "completed").length,
    availVols:  volunteers.filter(v => v.availability === "available").length,
  };

  const filtered = (filter === "all" ? tasks : tasks.filter(t => t.status === filter))
    .slice().sort((a, b) => b.priority - a.priority);

  // ── Backend-wired handlers ──────────────────────────────────────────────────
  const handleAssign = async (task_id, volunteer_id) => {
    setAssignLoading(true);
    try {
      await assignVolunteer({ task_id, volunteer_id });
    } catch (_) { /* backend offline – optimistic update still applies */ }
    // Optimistic UI update
    setTasks(ts => ts.map(t => t.id === task_id ? { ...t, status: "assigned", assigned_to: volunteer_id } : t));
    setVolunteers(vs => vs.map(v => v.id === volunteer_id ? { ...v, availability: "busy", current_task_id: task_id } : v));
    setAssignLoading(false);
    setAssign(null);
    showToast("Volunteer assigned successfully!");
  };

  const handleReport = async (form) => {
    try {
      await reportIssue(form);
    } catch (_) { /* offline fallback */ }
    // Optimistic UI update
    const newTask = { id: "t" + Date.now(), ...form, priority: form.severity, status: "unassigned", assigned_to: null, created_at: new Date().toISOString() };
    setTasks(ts => [newTask, ...ts]);
    setShowReport(false);
    showToast("Issue reported successfully!");
  };

  const tabBtn = active => ({
    padding: "7px 18px", borderRadius: 7, border: "1px solid #1e2738",
    background: active ? "#1e2738" : "transparent",
    color: active ? "#f1f5f9" : "#64748b",
    cursor: "pointer", fontSize: 13, fontWeight: 500, textTransform: "capitalize",
  });

  return (
    <div>
      {offline && <OfflineBanner />}

      {/* Alerts */}
      {ALERTS.map(a => (
        <div key={a.id} style={{ background: a.alert_type === "flood" ? "#450a0a" : "#451a03", border: `1px solid ${a.alert_type === "flood" ? "#7f1d1d" : "#78350f"}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 18 }}>{a.alert_type === "flood" ? "🌊" : "⚠️"}</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: a.alert_type === "flood" ? "#fca5a5" : "#fcd34d" }}>
            {a.alert_type === "flood" ? "Flood Warning" : "Resource Shortage"} — {a.region}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4 }}>{Math.round(a.probability * 100)}% probability</span>
        </div>
      ))}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["overview","tasks","volunteers"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={tabBtn(activeTab === t)}>{t}</button>
        ))}
        <button onClick={() => setShowReport(true)} style={{ ...S.btn(), marginLeft: "auto" }}>+ Report Issue</button>
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <>
          <div style={{ ...S.grid4, marginBottom: 20 }}>
            {[
              { label: "Total Tasks",      num: analytics?.total_tasks      ?? stats.total,      color: "#6366f1" },
              { label: "Unassigned",        num: stats.unassigned,                                color: "#f97316" },
              { label: "In Progress",       num: stats.inProgress,                                color: "#8b5cf6" },
              { label: "Avail. Volunteers", num: analytics?.active_volunteers ?? stats.availVols, color: "#22c55e" },
            ].map(s => (
              <div key={s.label} style={S.statCard}>
                <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, marginBottom: 4, color: s.color }}>{s.num}</div>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ ...S.grid2, marginBottom: 16 }}>
            <div style={S.card}>
              <p style={S.sectionTitle}>Reports This Week</p>
              <BarChart />
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: "#6366f1", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "#64748b" }}>Reported</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: "#22c55e", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "#64748b" }}>Resolved</span></div>
              </div>
            </div>
            <div style={S.card}>
              <p style={S.sectionTitle}>Need Type Breakdown</p>
              <DonutChart tasks={tasks} />
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                  <span>Avg. Response Time</span>
                  <strong style={{ color: "#f1f5f9" }}>{analytics?.avg_response_time ?? "2.4"} hrs</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                  <span>Resolution Rate</span>
                  <strong style={{ color: "#22c55e" }}>
                    {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <p style={S.sectionTitle}>🔥 Critical Tasks (Priority ≥ 8)</p>
            {tasks.filter(t => t.priority >= 8 && t.status !== "completed").sort((a,b) => b.priority - a.priority).map(t => (
              <div key={t.id} style={S.taskRow}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#0f1117", border: `2px solid ${priorityColor(t.priority)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: priorityColor(t.priority), flexShrink: 0 }}>{t.priority}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>📍 {t.location} · {t.people_affected} affected · {timeAgo(t.created_at)}</div>
                </div>
                <span style={S.badge(STATUS_META[t.status].color + "22", STATUS_META[t.status].color)}>{STATUS_META[t.status].label}</span>
                {t.status === "unassigned" && <button onClick={() => setAssign(t)} style={{ ...S.btn(), padding: "6px 12px", fontSize: 12 }}>Assign →</button>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* TASKS */}
      {activeTab === "tasks" && (
        <div style={S.card}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {["all","unassigned","assigned","in_progress","completed"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid #1e2738", background: filter === f ? "#1e2738" : "transparent", color: filter === f ? "#f1f5f9" : "#64748b", cursor: "pointer", fontSize: 12 }}>
                {f === "all" ? "All" : STATUS_META[f]?.label || f}
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#475569", alignSelf: "center" }}>{filtered.length} tasks</span>
          </div>
          {filtered.map(t => {
            const nc = NEED_COLORS[t.need_type] || NEED_COLORS.food;
            const vol = volunteers.find(v => v.id === t.assigned_to);
            return (
              <div key={t.id} style={{ ...S.taskRow, flexWrap: "wrap", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#0f1117", border: `2px solid ${priorityColor(t.priority)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: priorityColor(t.priority), flexShrink: 0 }}>{t.priority}</div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>📍 {t.location} · 👥 {t.people_affected} · {timeAgo(t.created_at)}{vol ? <span style={{ color: "#6366f1" }}> · → {vol.name}</span> : null}</div>
                </div>
                <span style={S.badge(nc.bg, nc.text)}>{t.need_type}</span>
                <span style={S.badge(STATUS_META[t.status].color + "22", STATUS_META[t.status].color)}>{STATUS_META[t.status].label}</span>
                {t.status === "unassigned" && <button onClick={() => setAssign(t)} style={{ ...S.btn(), padding: "5px 12px", fontSize: 12 }}>Assign →</button>}
              </div>
            );
          })}
        </div>
      )}

      {/* VOLUNTEERS */}
      {activeTab === "volunteers" && (
        <div style={S.grid3}>
          {volunteers.map(v => {
            const am = AVAIL_META[v.availability];
            const ct = tasks.find(t => t.id === v.current_task_id);
            return (
              <div key={v.id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>📍 {v.location}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: am.color }}>⬤ {am.label}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {v.skills.map(s => <span key={s} style={S.badge("#1e2738", "#94a3b8")}>{s}</span>)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: ct ? 10 : 0 }}>
                  <span>★ {v.rating}</span><span>{v.tasks_completed} tasks</span><span>{v.phone}</span>
                </div>
                {ct && (
                  <div style={{ background: "#0f1117", borderRadius: 7, padding: "8px 10px", fontSize: 12, color: "#94a3b8", borderLeft: "3px solid #6366f1" }}>
                    <div style={{ color: "#6366f1", fontWeight: 600, marginBottom: 2 }}>Current Task</div>
                    {ct.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {assignTarget && <AssignModal task={assignTarget} volunteers={volunteers} onAssign={handleAssign} onClose={() => setAssign(null)} loading={assignLoading} />}
      {showReport   && <ReportModal onSubmit={handleReport} onClose={() => setShowReport(false)} />}
      <Toast msg={toast} />
    </div>
  );
}

// ─── VOLUNTEER INTERFACE ──────────────────────────────────────────────────────
function VolunteerInterface({ tasks, setTasks, volunteers, setVolunteers, offline }) {
  const ME_ID = "v3"; // Ravi Kumar — change to logged-in user ID when auth is added
  const me = volunteers.find(v => v.id === ME_ID) || MOCK_VOLUNTEERS[2];

  const [tab, setTab]   = useState("mytasks");
  const [toast, setToast] = useState("");

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const myTasks   = tasks.filter(t => t.assigned_to === ME_ID && t.status !== "completed");
  const openTasks = tasks.filter(t => t.status === "unassigned").sort((a,b) => b.priority - a.priority);
  const doneTasks = tasks.filter(t => t.assigned_to === ME_ID && t.status === "completed");

  const toggleAvail = async () => {
    const next = me.availability === "available" ? "offline" : "available";
    try { await updateVolunteerAvailability({ volunteer_id: ME_ID, availability: next }); } catch (_) {}
    setVolunteers(vs => vs.map(v => v.id === ME_ID ? { ...v, availability: next } : v));
    showToast(`Status set to ${next}`);
  };

  const startTask = async id => {
    try { await updateTaskStatus({ task_id: id, status: "in_progress" }); } catch (_) {}
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: "in_progress" } : t));
    showToast("Task started!");
  };

  const completeTask = async id => {
    try { await updateTaskStatus({ task_id: id, status: "completed" }); } catch (_) {}
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: "completed" } : t));
    setVolunteers(vs => vs.map(v => v.id === ME_ID ? { ...v, tasks_completed: v.tasks_completed + 1, availability: "available", current_task_id: null } : v));
    showToast("Task completed! Great work 🎉");
  };

  const acceptTask = async id => {
    try { await assignVolunteer({ task_id: id, volunteer_id: ME_ID }); } catch (_) {}
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: "assigned", assigned_to: ME_ID } : t));
    setVolunteers(vs => vs.map(v => v.id === ME_ID ? { ...v, availability: "busy", current_task_id: id } : v));
    showToast("Task accepted!");
  };

  const am = AVAIL_META[me.availability];
  const tabBtn = active => ({ padding: "7px 18px", borderRadius: 7, border: "1px solid #1e2738", background: active ? "#1e2738" : "transparent", color: active ? "#f1f5f9" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 500 });

  const TaskCard = ({ t, children }) => {
    const nc = NEED_COLORS[t.need_type] || NEED_COLORS.food;
    return (
      <div style={{ ...S.card, borderLeft: `4px solid ${priorityColor(t.priority)}`, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{t.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>📍 {t.location} · 👥 {t.people_affected} · {timeAgo(t.created_at)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={S.badge(nc.bg, nc.text)}>{t.need_type}</span>
            <span style={S.badge(STATUS_META[t.status].color + "22", STATUS_META[t.status].color)}>{STATUS_META[t.status].label}</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px", lineHeight: 1.6 }}>{t.description}</p>
        {children}
      </div>
    );
  };

  return (
    <div>
      {offline && <OfflineBanner />}

      {/* Profile */}
      <div style={{ ...S.card, display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {me.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#f1f5f9" }}>{me.name}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>📍 {me.location} · {me.phone}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {me.skills.map(s => <span key={s} style={S.badge("#1e2738", "#94a3b8")}>{s}</span>)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: am.color }}>⬤ {am.label}</span>
          <div style={{ fontSize: 12, color: "#64748b" }}>★ {me.rating} · ✅ {me.tasks_completed} tasks</div>
          <button onClick={toggleAvail} style={{ ...S.btn(me.availability === "available" ? "danger" : "success"), fontSize: 12, padding: "6px 14px" }}>
            {me.availability === "available" ? "Go Offline" : "Go Available"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        <button onClick={() => setTab("mytasks")} style={tabBtn(tab === "mytasks")}>My Tasks ({myTasks.length})</button>
        <button onClick={() => setTab("open")}    style={tabBtn(tab === "open")}>Open Tasks ({openTasks.length})</button>
        <button onClick={() => setTab("history")} style={tabBtn(tab === "history")}>History ({doneTasks.length})</button>
      </div>

      {/* My Tasks */}
      {tab === "mytasks" && (
        myTasks.length === 0
          ? <div style={{ ...S.card, textAlign: "center", padding: 40, color: "#475569" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              <div style={{ fontWeight: 600 }}>No tasks assigned to you yet.</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Browse open tasks to pick one up!</div>
            </div>
          : myTasks.map(t => (
            <TaskCard key={t.id} t={t}>
              {t.status === "assigned"    && <button onClick={() => startTask(t.id)}    style={S.btn()}>▶ Start Task</button>}
              {t.status === "in_progress" && <button onClick={() => completeTask(t.id)} style={S.btn("success")}>✓ Mark Complete</button>}
            </TaskCard>
          ))
      )}

      {/* Open Tasks */}
      {tab === "open" && (
        openTasks.length === 0
          ? <div style={{ ...S.card, textAlign: "center", padding: 40, color: "#475569" }}>
              <div style={{ fontSize: 40 }}>🎉</div>
              <div style={{ fontWeight: 600, marginTop: 10 }}>All tasks are assigned!</div>
            </div>
          : openTasks.map(t => {
            const mySkillMatch = me.skills.some(s => t.need_type === s || s === t.need_type);
            return (
              <TaskCard key={t.id} t={t}>
                {mySkillMatch && <div style={{ marginBottom: 10 }}><span style={S.badge("#1e3a2e", "#4ade80")}>✦ Matches your skills</span></div>}
                <button onClick={() => me.availability === "available" && acceptTask(t.id)}
                  disabled={me.availability !== "available"}
                  style={{ ...S.btn(), opacity: me.availability === "available" ? 1 : 0.4 }}>
                  {me.availability === "available" ? "Accept Task" : "Set yourself available first"}
                </button>
              </TaskCard>
            );
          })
      )}

      {/* History */}
      {tab === "history" && (
        <div style={S.card}>
          <p style={S.sectionTitle}>Completed Tasks</p>
          {doneTasks.length === 0
            ? <p style={{ color: "#475569", textAlign: "center", padding: 30 }}>No completed tasks yet.</p>
            : doneTasks.map(t => (
              <div key={t.id} style={S.taskRow}>
                <span style={{ fontSize: 18 }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>📍 {t.location}</div>
                </div>
                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>Completed</span>
              </div>
            ))
          }
          <div style={{ marginTop: 20, padding: 16, background: "#0f1117", borderRadius: 10, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            <div><div style={{ fontSize: 24, fontWeight: 800, color: "#6366f1" }}>{me.tasks_completed}</div><div style={{ fontSize: 11, color: "#64748b" }}>Total Completed</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 800, color: "#fbbf24" }}>★ {me.rating}</div><div style={{ fontSize: 11, color: "#64748b" }}>Rating</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 800, color: "#22c55e" }}>{me.tasks_completed * 12}+</div><div style={{ fontSize: 11, color: "#64748b" }}>People Helped</div></div>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
}

// ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const res = await login({ email, password });
    setLoading(false);
    if (res?.success) {
      onLogin(res.user);
    } else {
      setError(res?.message || "Login failed. Check credentials.");
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0f1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } input { font-family: inherit; }`}</style>
      <div style={{ background: "#161b27", border: "1px solid #1e2738", borderRadius: 14, padding: 36, width: 380, maxWidth: "90vw" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>🌐</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>CommunityBridge</div>
            <div style={{ fontSize: 11, color: "#475569" }}>Smart Resource Allocation</div>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6, display: "block" }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #1e2738", background: "#0f1117", color: "#e2e8f0", fontSize: 14, outline: "none" }}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6, display: "block" }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #1e2738", background: "#0f1117", color: "#e2e8f0", fontSize: 14, outline: "none" }}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        {error && <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#fca5a5", marginBottom: 14 }}>{error}</div>}
        <button onClick={submit} disabled={loading || !email || !password}
          style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading || !email || !password ? 0.5 : 1 }}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <div style={{ marginTop: 16, padding: "10px 12px", background: "#0f1117", borderRadius: 8, fontSize: 12, color: "#64748b" }}>
          Use credentials from your backend DB or run the seed script first.
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]             = useState("ngo");
  const [tasks, setTasks]           = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [analytics, setAnalytics]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [offline, setOffline]       = useState(false);
  const [user, setUser]             = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if already logged in (token in localStorage)
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Try to load data — if it works, we're still logged in
      setUser({ name: "User", role: "admin" }); // placeholder until /api/auth/me exists
    }
    setAuthChecked(true);
  }, []);

  // ── Load all data from backend on mount / after login ──────────────────────
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [t, v, a] = await Promise.all([getTasks(), getVolunteers(), getAnalytics()]);
      if (t && v) {
        setTasks(t);
        setVolunteers(v);
        setAnalytics(a);
        setOffline(false);
      } else {
        console.warn("Backend unreachable — using mock data");
        setTasks(MOCK_TASKS);
        setVolunteers(MOCK_VOLUNTEERS);
        setAnalytics(MOCK_ANALYTICS);
        setOffline(true);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setTasks([]);
    setVolunteers([]);
  };

  if (!authChecked) return null;
  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0f1117", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f1117; }
        input, textarea, select { font-family: inherit; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f1117; }
        ::-webkit-scrollbar-thumb { background: #1e2738; border-radius: 3px; }
      `}</style>

      {/* Topbar */}
      <div style={{ background: "#161b27", borderBottom: "1px solid #1e2738", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌐</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>CommunityBridge</span>
          <span style={{ fontSize: 11, color: "#475569", marginLeft: 4 }}>Smart Resource Allocation</span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[["ngo","🏢 NGO Dashboard"],["volunteer","🙋 Volunteer View"]].map(([v,label]) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: view === v ? "#6366f1" : "transparent", color: view === v ? "#fff" : "#94a3b8" }}>{label}</button>
          ))}
          <button onClick={handleLogout} style={{ marginLeft: 8, padding: "6px 12px", borderRadius: 6, border: "1px solid #1e2738", background: "none", color: "#64748b", cursor: "pointer", fontSize: 12 }}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 32px" }}>
        {view === "ngo" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>NGO Operations Dashboard</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Monitor community needs, manage tasks, and coordinate volunteer deployment.</p>
            {loading ? <Spinner /> : <NGODashboard tasks={tasks} setTasks={setTasks} volunteers={volunteers} setVolunteers={setVolunteers} analytics={analytics} offline={offline} />}
          </>
        )}
        {view === "volunteer" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Volunteer Interface</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Viewing as <strong style={{ color: "#6366f1" }}>{user?.name || "Volunteer"}</strong> — manage your tasks and availability.</p>
            {loading ? <Spinner /> : <VolunteerInterface tasks={tasks} setTasks={setTasks} volunteers={volunteers} setVolunteers={setVolunteers} offline={offline} />}
          </>
        )}
      </div>
    </div>
  );
}
