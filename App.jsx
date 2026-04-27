import { useState, useEffect, useCallback } from "react";

// ─── Inline mock data (self-contained for artifact demo) ──────────────────────
const MOCK_TASKS = [
  { id: "t1", title: "Medical supply delivery – Sector 4", location: "Sector 4, Delhi", priority: 9, need_type: "health", status: "unassigned", assigned_to: null, people_affected: 120, created_at: "2025-04-24T08:30:00Z", description: "Critical shortage of medicines at the community health post. Insulin and BP meds urgently needed." },
  { id: "t2", title: "Food distribution – Camp B", location: "Camp B, Noida", priority: 7, need_type: "food", status: "assigned", assigned_to: "v1", people_affected: 80, created_at: "2025-04-23T14:00:00Z", description: "Displaced families at Camp B need daily food packets. Logistics volunteer required." },
  { id: "t3", title: "Flood evacuation support", location: "Low-lying Zone 3, Gurugram", priority: 10, need_type: "disaster", status: "in_progress", assigned_to: "v2", people_affected: 300, created_at: "2025-04-24T06:00:00Z", description: "Flash flood warning issued. Immediate evacuation assistance needed for 300+ residents." },
  { id: "t4", title: "School supply distribution", location: "Village Palam, Faridabad", priority: 4, need_type: "education", status: "completed", assigned_to: "v3", people_affected: 45, created_at: "2025-04-22T10:00:00Z", description: "Notebooks and stationery distributed to students who lost belongings." },
  { id: "t5", title: "Emergency water supply", location: "Ward 12, Gurugram", priority: 8, need_type: "health", status: "unassigned", assigned_to: null, people_affected: 200, created_at: "2025-04-24T09:15:00Z", description: "Water pipeline burst. Community needs clean drinking water immediately." },
  { id: "t6", title: "Nutrition camp setup", location: "Sector 18, Noida", priority: 6, need_type: "food", status: "assigned", assigned_to: "v4", people_affected: 60, created_at: "2025-04-23T11:00:00Z", description: "Malnutrition cases reported. Nutrition screening and food aid required." },
];

const MOCK_VOLUNTEERS = [
  { id: "v1", name: "Arjun Mehta", skills: ["medical", "logistics"], availability: "busy", rating: 4.8, tasks_completed: 23, location: "Noida", phone: "+91 98100 11111", current_task_id: "t2" },
  { id: "v2", name: "Priya Sharma", skills: ["disaster", "logistics"], availability: "busy", rating: 4.6, tasks_completed: 17, location: "Gurugram", phone: "+91 98100 22222", current_task_id: "t3" },
  { id: "v3", name: "Ravi Kumar", skills: ["education", "teaching"], availability: "available", rating: 4.9, tasks_completed: 31, location: "Faridabad", phone: "+91 98100 33333", current_task_id: null },
  { id: "v4", name: "Sneha Patel", skills: ["food", "logistics"], availability: "busy", rating: 4.5, tasks_completed: 12, location: "Delhi", phone: "+91 98100 44444", current_task_id: "t6" },
  { id: "v5", name: "Karan Singh", skills: ["medical", "health"], availability: "available", rating: 4.3, tasks_completed: 8, location: "Delhi", phone: "+91 98100 55555", current_task_id: null },
  { id: "v6", name: "Meena Joshi", skills: ["food", "education"], availability: "offline", rating: 4.7, tasks_completed: 19, location: "Noida", phone: "+91 98100 66666", current_task_id: null },
];

const WEEKLY = [
  { day: "Mon", reports: 3, resolved: 1 },
  { day: "Tue", reports: 5, resolved: 3 },
  { day: "Wed", reports: 4, resolved: 2 },
  { day: "Thu", reports: 7, resolved: 4 },
  { day: "Fri", reports: 6, resolved: 3 },
  { day: "Sat", reports: 2, resolved: 2 },
  { day: "Sun", reports: 4, resolved: 1 },
];

const ALERTS = [
  { id: "a1", region: "Gurugram", alert_type: "flood", probability: 0.87, status: "active" },
  { id: "a2", region: "Noida", alert_type: "shortage", probability: 0.65, status: "active" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const NEED_COLORS = {
  health: { bg: "#fee2e2", text: "#dc2626", dot: "#dc2626" },
  food: { bg: "#fef9c3", text: "#ca8a04", dot: "#ca8a04" },
  disaster: { bg: "#fce7f3", text: "#9d174d", dot: "#be185d" },
  education: { bg: "#dbeafe", text: "#1d4ed8", dot: "#2563eb" },
};

const STATUS_META = {
  unassigned: { label: "Unassigned", color: "#f97316" },
  assigned: { label: "Assigned", color: "#3b82f6" },
  in_progress: { label: "In Progress", color: "#8b5cf6" },
  completed: { label: "Completed", color: "#22c55e" },
};

const AVAIL_META = {
  available: { label: "Available", color: "#22c55e" },
  busy: { label: "On Task", color: "#f97316" },
  offline: { label: "Offline", color: "#9ca3af" },
};

const priorityColor = (p) => {
  if (p >= 9) return "#ef4444";
  if (p >= 7) return "#f97316";
  if (p >= 5) return "#eab308";
  return "#22c55e";
};

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  shell: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#0f1117",
    minHeight: "100vh",
    color: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    background: "#161b27",
    borderBottom: "1px solid #1e2738",
    padding: "0 32px",
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10,
  },
  logoIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16,
  },
  logoText: {
    fontSize: 17, fontWeight: 700, color: "#f1f5f9",
    letterSpacing: "-0.3px",
  },
  tabRow: {
    display: "flex", gap: 4,
  },
  tab: (active) => ({
    padding: "6px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    background: active ? "#6366f1" : "transparent",
    color: active ? "#fff" : "#94a3b8",
    transition: "all 0.15s",
  }),
  main: {
    flex: 1,
    padding: "24px 32px",
    maxWidth: 1280,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  pageTitle: {
    fontSize: 22, fontWeight: 700, color: "#f1f5f9",
    marginBottom: 6, letterSpacing: "-0.4px",
  },
  pageSubtitle: {
    fontSize: 13, color: "#64748b", marginBottom: 24,
  },
  grid2: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
  },
  grid3: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16,
  },
  grid4: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
  },
  card: {
    background: "#161b27",
    border: "1px solid #1e2738",
    borderRadius: 12,
    padding: 20,
  },
  statCard: {
    background: "#161b27",
    border: "1px solid #1e2738",
    borderRadius: 12,
    padding: "18px 20px",
  },
  statNum: {
    fontSize: 32, fontWeight: 800, lineHeight: 1, marginBottom: 4,
    letterSpacing: "-1px",
  },
  statLabel: {
    fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px",
  },
  sectionTitle: {
    fontSize: 14, fontWeight: 600, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.6px",
    marginBottom: 14, marginTop: 0,
  },
  taskRow: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "12px 0",
    borderBottom: "1px solid #1e2738",
    cursor: "pointer",
  },
  badge: (bg, text) => ({
    display: "inline-flex", alignItems: "center",
    padding: "2px 8px", borderRadius: 20,
    fontSize: 11, fontWeight: 600,
    background: bg, color: text,
  }),
  dot: (color) => ({
    width: 8, height: 8, borderRadius: "50%",
    background: color, flexShrink: 0,
  }),
  btn: (variant = "primary") => ({
    padding: "8px 16px",
    borderRadius: 7,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background: variant === "primary" ? "#6366f1" : variant === "danger" ? "#dc2626" : variant === "success" ? "#16a34a" : "#1e2738",
    color: "#fff",
    transition: "opacity 0.15s",
    display: "inline-flex", alignItems: "center", gap: 6,
  }),
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #1e2738",
    background: "#0f1117",
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #1e2738",
    background: "#0f1117",
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    cursor: "pointer",
  },
  label: {
    fontSize: 12, fontWeight: 600, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.4px",
    marginBottom: 6, display: "block",
  },
  formGroup: { marginBottom: 16 },
  alertBanner: (type) => ({
    background: type === "flood" ? "#450a0a" : "#451a03",
    border: `1px solid ${type === "flood" ? "#7f1d1d" : "#78350f"}`,
    borderRadius: 10,
    padding: "12px 16px",
    display: "flex", alignItems: "center", gap: 12,
    marginBottom: 12,
  }),
  modal: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200,
  },
  modalBox: {
    background: "#161b27",
    border: "1px solid #1e2738",
    borderRadius: 14,
    padding: 28,
    width: 480,
    maxWidth: "90vw",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  progressBar: (val, color) => ({
    height: 6, borderRadius: 99,
    background: `linear-gradient(90deg, ${color} ${val}%, #1e2738 ${val}%)`,
  }),
  toast: {
    position: "fixed", bottom: 24, right: 24,
    background: "#22c55e",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    zIndex: 999,
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    animation: "slideIn 0.3s ease",
  },
};

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.reports));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
      {data.map((d) => (
        <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, justifyContent: "flex-end", height: 64 }}>
            <div style={{ background: "#6366f1", borderRadius: "3px 3px 0 0", height: `${(d.reports / max) * 56}px`, transition: "height 0.6s ease" }} />
            <div style={{ background: "#22c55e", borderRadius: "3px 3px 0 0", height: `${(d.resolved / max) * 56}px`, marginTop: -3, opacity: 0.8 }} />
          </div>
          <span style={{ fontSize: 10, color: "#475569" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const colors = { health: "#ef4444", food: "#eab308", disaster: "#ec4899", education: "#3b82f6" };
  const total = data.reduce((s, d) => s + d.count, 0);
  let cumAngle = -90;
  const r = 44, cx = 60, cy = 60;
  const slices = data.map((d) => {
    const angle = (d.count / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, cumAngle - 0.5);
    const largeArc = angle > 180 ? 1 : 0;
    return { ...d, path: `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`, color: colors[d.type] };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={120} height={120}>
        <circle cx={cx} cy={cy} r={r} fill="#0f1117" />
        {slices.map((s) => <path key={s.type} d={s.path} fill={s.color} opacity={0.85} />)}
        <circle cx={cx} cy={cy} r={28} fill="#161b27" />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#f1f5f9" fontSize={14} fontWeight={700}>{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {slices.map((s) => (
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

function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={S.toast}>✓ {msg}</div>;
}

// ─── Assign Modal ─────────────────────────────────────────────────────────────
function AssignModal({ task, volunteers, onAssign, onClose }) {
  const [selected, setSelected] = useState(null);
  const available = volunteers.filter((v) => v.availability === "available");

  const skillMatch = (v) => v.skills.some((s) => task.need_type.includes(s) || s.includes(task.need_type));

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={S.sectionTitle}>Assign Volunteer</p>
            <h3 style={{ margin: 0, fontSize: 16, color: "#f1f5f9" }}>{task.title}</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>📍 {task.location}</p>
          </div>
          <button onClick={onClose} style={{ ...S.btn("ghost"), padding: "4px 8px", fontSize: 16 }}>✕</button>
        </div>

        {available.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No available volunteers right now.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {available.map((v) => {
              const match = skillMatch(v);
              return (
                <div
                  key={v.id}
                  onClick={() => setSelected(v.id === selected ? null : v.id)}
                  style={{
                    border: `2px solid ${selected === v.id ? "#6366f1" : "#1e2738"}`,
                    borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                    background: selected === v.id ? "#1e1e38" : "#0f1117",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{v.name}</span>
                      {match && <span style={{ ...S.badge("#1e3a2e", "#4ade80"), marginLeft: 8 }}>✦ Skill match</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: "#fbbf24", fontSize: 12 }}>★</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{v.rating}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>📍 {v.location}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>✅ {v.tasks_completed} tasks</span>
                    {v.skills.map((s) => (
                      <span key={s} style={{ ...S.badge("#1e2738", "#94a3b8") }}>{s}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={S.btn("ghost")}>Cancel</button>
          <button
            disabled={!selected}
            onClick={() => onAssign(task.id, selected)}
            style={{ ...S.btn("primary"), opacity: selected ? 1 : 0.4 }}
          >
            Confirm Assignment
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

  const handle = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title || !form.location) return;
    setLoading(true);
    await delay(600);
    setLoading(false);
    onSubmit(form);
  };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ ...S.sectionTitle, margin: 0 }}>Report New Issue</p>
          <button onClick={onClose} style={{ ...S.btn("ghost"), padding: "4px 8px", fontSize: 16 }}>✕</button>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Title *</label>
          <input style={S.input} placeholder="Brief title of the issue" value={form.title} onChange={(e) => handle("title", e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Description</label>
          <textarea style={{ ...S.input, height: 80, resize: "vertical" }} placeholder="Describe the situation..." value={form.description} onChange={(e) => handle("description", e.target.value)} />
        </div>
        <div style={{ ...S.grid2, ...S.formGroup }}>
          <div>
            <label style={S.label}>Location *</label>
            <input style={S.input} placeholder="Area / address" value={form.location} onChange={(e) => handle("location", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Need Type</label>
            <select style={S.select} value={form.need_type} onChange={(e) => handle("need_type", e.target.value)}>
              <option value="food">Food</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="disaster">Disaster</option>
            </select>
          </div>
        </div>
        <div style={{ ...S.grid2, ...S.formGroup }}>
          <div>
            <label style={S.label}>Severity (1–10): <strong style={{ color: priorityColor(form.severity) }}>{form.severity}</strong></label>
            <input type="range" min={1} max={10} value={form.severity} onChange={(e) => handle("severity", +e.target.value)} style={{ width: "100%", accentColor: "#6366f1" }} />
          </div>
          <div>
            <label style={S.label}>People Affected</label>
            <input style={S.input} type="number" placeholder="Approx. number" value={form.people_affected} onChange={(e) => handle("people_affected", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose} style={S.btn("ghost")}>Cancel</button>
          <button onClick={submit} disabled={loading || !form.title || !form.location} style={{ ...S.btn(), opacity: loading || !form.title || !form.location ? 0.5 : 1 }}>
            {loading ? "Submitting…" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NGO DASHBOARD ────────────────────────────────────────────────────────────
function NGODashboard() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [volunteers, setVolunteers] = useState(MOCK_VOLUNTEERS);
  const [filter, setFilter] = useState("all");
  const [assignTarget, setAssignTarget] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const stats = {
    total: tasks.length,
    unassigned: tasks.filter((t) => t.status === "unassigned").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    availVols: volunteers.filter((v) => v.availability === "available").length,
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const sorted = [...filtered].sort((a, b) => b.priority - a.priority);

  const handleAssign = async (task_id, volunteer_id) => {
    await delay(400);
    setTasks((ts) => ts.map((t) => t.id === task_id ? { ...t, status: "assigned", assigned_to: volunteer_id } : t));
    setVolunteers((vs) => vs.map((v) => v.id === volunteer_id ? { ...v, availability: "busy", current_task_id: task_id } : v));
    setAssignTarget(null);
    showToast("Volunteer assigned successfully!");
  };

  const handleReport = (form) => {
    const newTask = { id: "t" + Date.now(), ...form, priority: form.severity, status: "unassigned", assigned_to: null, created_at: new Date().toISOString() };
    setTasks((ts) => [newTask, ...ts]);
    setShowReport(false);
    showToast("Issue reported and added to tasks!");
  };

  const needBreakdown = ["health", "food", "disaster", "education"].map((type) => ({ type, count: tasks.filter((t) => t.need_type === type).length }));

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; } @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {/* Alerts */}
      {ALERTS.map((a) => (
        <div key={a.id} style={S.alertBanner(a.alert_type)}>
          <span style={{ fontSize: 18 }}>{a.alert_type === "flood" ? "🌊" : "⚠️"}</span>
          <div>
            <span style={{ fontWeight: 700, fontSize: 13, color: a.alert_type === "flood" ? "#fca5a5" : "#fcd34d" }}>
              {a.alert_type === "flood" ? "Flood Warning" : "Resource Shortage"} — {a.region}
            </span>
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 10 }}>
              {Math.round(a.probability * 100)}% probability
            </span>
          </div>
          <div style={{ marginLeft: "auto", ...S.progressBar(a.probability * 100, a.alert_type === "flood" ? "#ef4444" : "#f97316"), width: 80, marginRight: 4 }} />
        </div>
      ))}

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["overview", "tasks", "volunteers"].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: "7px 18px", borderRadius: 7, border: "1px solid #1e2738",
            background: activeTab === t ? "#1e2738" : "transparent",
            color: activeTab === t ? "#f1f5f9" : "#64748b",
            cursor: "pointer", fontSize: 13, fontWeight: 500, textTransform: "capitalize",
          }}>{t}</button>
        ))}
        <button onClick={() => setShowReport(true)} style={{ ...S.btn(), marginLeft: "auto" }}>+ Report Issue</button>
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <>
          {/* Stat cards */}
          <div style={{ ...S.grid4, marginBottom: 20 }}>
            {[
              { label: "Total Tasks", num: stats.total, color: "#6366f1" },
              { label: "Unassigned", num: stats.unassigned, color: "#f97316" },
              { label: "In Progress", num: stats.inProgress, color: "#8b5cf6" },
              { label: "Avail. Volunteers", num: stats.availVols, color: "#22c55e" },
            ].map((s) => (
              <div key={s.label} style={S.statCard}>
                <div style={{ ...S.statNum, color: s.color }}>{s.num}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={S.grid2}>
            {/* Weekly chart */}
            <div style={S.card}>
              <p style={S.sectionTitle}>Reports This Week</p>
              <BarChart data={WEEKLY} />
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: "#6366f1", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "#64748b" }}>Reported</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: "#22c55e", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "#64748b" }}>Resolved</span></div>
              </div>
            </div>

            {/* Donut */}
            <div style={S.card}>
              <p style={S.sectionTitle}>Need Type Breakdown</p>
              <DonutChart data={needBreakdown} />
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                  <span>Avg. Response Time</span><strong style={{ color: "#f1f5f9" }}>2.4 hrs</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                  <span>Resolution Rate</span><strong style={{ color: "#22c55e" }}>{Math.round((stats.completed / stats.total) * 100)}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Top priority tasks preview */}
          <div style={{ ...S.card, marginTop: 16 }}>
            <p style={S.sectionTitle}>🔥 Critical Tasks (Priority ≥ 8)</p>
            {tasks.filter((t) => t.priority >= 8 && t.status !== "completed").map((t) => (
              <div key={t.id} style={S.taskRow}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#0f1117", border: `2px solid ${priorityColor(t.priority)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: priorityColor(t.priority), flexShrink: 0 }}>{t.priority}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>📍 {t.location} · {t.people_affected} affected · {timeAgo(t.created_at)}</div>
                </div>
                <span style={S.badge(STATUS_META[t.status].color + "22", STATUS_META[t.status].color)}>{STATUS_META[t.status].label}</span>
                {t.status === "unassigned" && <button onClick={() => setAssignTarget(t)} style={S.btn()}>Assign</button>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* TASKS */}
      {activeTab === "tasks" && (
        <div style={S.card}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {["all", "unassigned", "assigned", "in_progress", "completed"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 14px", borderRadius: 6, border: "1px solid #1e2738",
                background: filter === f ? "#1e2738" : "transparent",
                color: filter === f ? "#f1f5f9" : "#64748b", cursor: "pointer", fontSize: 12,
                textTransform: f === "all" ? "capitalize" : "none",
              }}>{f === "all" ? "All" : STATUS_META[f]?.label || f}</button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#475569", alignSelf: "center" }}>{sorted.length} tasks</span>
          </div>

          {sorted.map((t) => {
            const nc = NEED_COLORS[t.need_type] || NEED_COLORS.food;
            const assignedVol = volunteers.find((v) => v.id === t.assigned_to);
            return (
              <div key={t.id} style={{ ...S.taskRow, flexWrap: "wrap", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#0f1117", border: `2px solid ${priorityColor(t.priority)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: priorityColor(t.priority), flexShrink: 0 }}>{t.priority}</div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>📍 {t.location} · 👥 {t.people_affected} · {timeAgo(t.created_at)}</div>
                  {assignedVol && <div style={{ fontSize: 11, color: "#6366f1", marginTop: 3 }}>→ {assignedVol.name}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={S.badge(nc.bg, nc.text)}>{t.need_type}</span>
                  <span style={S.badge(STATUS_META[t.status].color + "22", STATUS_META[t.status].color)}>{STATUS_META[t.status].label}</span>
                  {t.status === "unassigned" && <button onClick={() => setAssignTarget(t)} style={{ ...S.btn(), padding: "5px 12px", fontSize: 12 }}>Assign →</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VOLUNTEERS */}
      {activeTab === "volunteers" && (
        <div style={{ ...S.grid3 }}>
          {volunteers.map((v) => {
            const am = AVAIL_META[v.availability];
            const currentTask = tasks.find((t) => t.id === v.current_task_id);
            return (
              <div key={v.id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>📍 {v.location}</div>
                  </div>
                  <span style={{ ...S.badge(am.color + "22", am.color), fontSize: 11 }}>⬤ {am.label}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {v.skills.map((s) => <span key={s} style={S.badge("#1e2738", "#94a3b8")}>{s}</span>)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                  <span>★ {v.rating}</span>
                  <span>{v.tasks_completed} completed</span>
                  <span>{v.phone}</span>
                </div>
                {currentTask && (
                  <div style={{ background: "#0f1117", borderRadius: 7, padding: "8px 10px", fontSize: 12, color: "#94a3b8", borderLeft: "3px solid #6366f1" }}>
                    <div style={{ color: "#6366f1", fontWeight: 600, marginBottom: 2 }}>Current Task</div>
                    {currentTask.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {assignTarget && <AssignModal task={assignTarget} volunteers={volunteers} onAssign={handleAssign} onClose={() => setAssignTarget(null)} />}
      {showReport && <ReportModal onSubmit={handleReport} onClose={() => setShowReport(false)} />}
      <Toast msg={toast} />
    </div>
  );
}

// ─── VOLUNTEER INTERFACE ──────────────────────────────────────────────────────
function VolunteerInterface() {
  // Simulating logged-in as v3 (Ravi Kumar — available)
  const [me, setMe] = useState(MOCK_VOLUNTEERS[2]);
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("mytasks");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const myTasks = tasks.filter((t) => t.assigned_to === me.id || t.status === "completed" && t.assigned_to === me.id);
  const openTasks = tasks.filter((t) => t.status === "unassigned");

  const toggleAvailability = async () => {
    const next = me.availability === "available" ? "offline" : "available";
    await delay(300);
    setMe((m) => ({ ...m, availability: next }));
    showToast(`Status set to ${next}`);
  };

  const updateStatus = async (task_id, newStatus) => {
    await delay(400);
    setTasks((ts) => ts.map((t) => t.id === task_id ? { ...t, status: newStatus } : t));
    if (newStatus === "completed") {
      setMe((m) => ({ ...m, tasks_completed: m.tasks_completed + 1, availability: "available", current_task_id: null }));
    }
    showToast(newStatus === "in_progress" ? "Task marked as In Progress!" : "Task marked as Completed! Great work 🎉");
  };

  const acceptTask = async (task_id) => {
    await delay(400);
    setTasks((ts) => ts.map((t) => t.id === task_id ? { ...t, status: "assigned", assigned_to: me.id } : t));
    setMe((m) => ({ ...m, availability: "busy", current_task_id: task_id }));
    showToast("Task accepted!");
  };

  const am = AVAIL_META[me.availability];

  return (
    <div>
      {/* Profile Card */}
      <div style={{ ...S.card, display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          {me.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#f1f5f9" }}>{me.name}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>📍 {me.location} · {me.phone}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {me.skills.map((s) => <span key={s} style={S.badge("#1e2738", "#94a3b8")}>{s}</span>)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <span style={{ ...S.badge(am.color + "22", am.color), fontSize: 12 }}>⬤ {am.label}</span>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#64748b" }}>
              <span>★ {me.rating}</span>
              <span>✅ {me.tasks_completed} tasks</span>
            </div>
            <button onClick={toggleAvailability} style={{ ...S.btn(me.availability === "available" ? "danger" : "success"), fontSize: 12, padding: "6px 14px" }}>
              {me.availability === "available" ? "Go Offline" : "Go Available"}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[
          { key: "mytasks", label: `My Tasks (${myTasks.length})` },
          { key: "open", label: `Open Tasks (${openTasks.length})` },
          { key: "history", label: "History" },
        ].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "7px 18px", borderRadius: 7, border: "1px solid #1e2738",
            background: activeTab === t.key ? "#1e2738" : "transparent",
            color: activeTab === t.key ? "#f1f5f9" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 500,
          }}>{t.label}</button>
        ))}
      </div>

      {/* MY TASKS */}
      {activeTab === "mytasks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myTasks.length === 0 ? (
            <div style={{ ...S.card, textAlign: "center", padding: 40, color: "#475569" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              <div style={{ fontWeight: 600 }}>No tasks assigned to you yet.</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Browse open tasks to pick one up!</div>
            </div>
          ) : myTasks.map((t) => {
            const nc = NEED_COLORS[t.need_type] || NEED_COLORS.food;
            return (
              <div key={t.id} style={{ ...S.card, borderLeft: `4px solid ${priorityColor(t.priority)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>📍 {t.location} · 👥 {t.people_affected} affected · {timeAgo(t.created_at)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={S.badge(nc.bg, nc.text)}>{t.need_type}</span>
                    <span style={S.badge(STATUS_META[t.status].color + "22", STATUS_META[t.status].color)}>{STATUS_META[t.status].label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "#0f1117", border: `2px solid ${priorityColor(t.priority)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: priorityColor(t.priority) }}>{t.priority}</div>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 14px" }}>{t.description}</p>
                {t.status !== "completed" && (
                  <div style={{ display: "flex", gap: 10 }}>
                    {t.status === "assigned" && <button onClick={() => updateStatus(t.id, "in_progress")} style={S.btn()}>▶ Start Task</button>}
                    {t.status === "in_progress" && <button onClick={() => updateStatus(t.id, "completed")} style={S.btn("success")}>✓ Mark Complete</button>}
                  </div>
                )}
                {t.status === "completed" && <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>✓ Completed</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* OPEN TASKS */}
      {activeTab === "open" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {openTasks.length === 0 ? (
            <div style={{ ...S.card, textAlign: "center", padding: 40, color: "#475569" }}>
              <div style={{ fontSize: 40 }}>🎉</div>
              <div style={{ fontWeight: 600, marginTop: 10 }}>All tasks are assigned!</div>
            </div>
          ) : openTasks.sort((a, b) => b.priority - a.priority).map((t) => {
            const nc = NEED_COLORS[t.need_type] || NEED_COLORS.food;
            const mySkillMatch = me.skills.some((s) => t.need_type.includes(s) || s.includes(t.need_type));
            return (
              <div key={t.id} style={{ ...S.card, borderLeft: `4px solid ${priorityColor(t.priority)}`, opacity: me.availability === "offline" ? 0.5 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{t.title}</span>
                      {mySkillMatch && <span style={S.badge("#1e3a2e", "#4ade80")}>✦ Matches your skills</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>📍 {t.location} · 👥 {t.people_affected} affected</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={S.badge(nc.bg, nc.text)}>{t.need_type}</span>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: "#0f1117", border: `2px solid ${priorityColor(t.priority)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: priorityColor(t.priority) }}>{t.priority}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px" }}>{t.description}</p>
                <button
                  onClick={() => acceptTask(t.id)}
                  disabled={me.availability !== "available"}
                  style={{ ...S.btn(), opacity: me.availability === "available" ? 1 : 0.4 }}
                >
                  {me.availability === "available" ? "Accept Task" : "Set yourself available first"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* HISTORY */}
      {activeTab === "history" && (
        <div style={S.card}>
          <p style={S.sectionTitle}>Completed Tasks</p>
          {tasks.filter((t) => t.status === "completed" && t.assigned_to === me.id).length === 0 ? (
            <p style={{ color: "#475569", textAlign: "center", padding: 30 }}>No completed tasks yet.</p>
          ) : tasks.filter((t) => t.status === "completed" && t.assigned_to === me.id).map((t) => (
            <div key={t.id} style={S.taskRow}>
              <span style={{ fontSize: 18 }}>✅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>📍 {t.location}</div>
              </div>
              <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>Completed</span>
            </div>
          ))}
          <div style={{ marginTop: 20, padding: "16px", background: "#0f1117", borderRadius: 10, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
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

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("ngo");

  return (
    <div style={S.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f1117; }
        input, textarea, select { font-family: inherit; }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0f1117; } ::-webkit-scrollbar-thumb { background: #1e2738; border-radius: 3px; }
      `}</style>

      {/* Topbar */}
      <div style={S.topbar}>
        <div style={S.logo}>
          <div style={S.logoIcon}>🌐</div>
          <span style={S.logoText}>CommunityBridge</span>
          <span style={{ fontSize: 11, color: "#475569", marginLeft: 6, fontWeight: 500 }}>Smart Resource Allocation</span>
        </div>
        <div style={S.tabRow}>
          <button onClick={() => setView("ngo")} style={S.tab(view === "ngo")}>🏢 NGO Dashboard</button>
          <button onClick={() => setView("volunteer")} style={S.tab(view === "volunteer")}>🙋 Volunteer View</button>
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        {view === "ngo" && (
          <>
            <h1 style={S.pageTitle}>NGO Operations Dashboard</h1>
            <p style={S.pageSubtitle}>Monitor community needs, manage tasks, and coordinate volunteer deployment.</p>
            <NGODashboard />
          </>
        )}
        {view === "volunteer" && (
          <>
            <h1 style={S.pageTitle}>Volunteer Interface</h1>
            <p style={S.pageSubtitle}>Viewing as <strong style={{ color: "#6366f1" }}>Ravi Kumar</strong> — manage your tasks and availability.</p>
            <VolunteerInterface />
          </>
        )}
      </div>
    </div>
  );
}
