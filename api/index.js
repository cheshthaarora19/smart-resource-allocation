const BASE_URL = "http://localhost:5000/api";

// ─── Auth token helpers ───────────────────────────────────────────────────────
// Call setToken(token) after login, getToken() is used automatically in all requests
let _token = localStorage.getItem("cb_token") || "";

export const setToken = (token) => {
  _token = token;
  localStorage.setItem("cb_token", token);
};

export const getToken = () => _token;

export const clearToken = () => {
  _token = "";
  localStorage.removeItem("cb_token");
};

// ─── Safe fetch — never throws, returns null on failure ───────────────────────
const safeFetch = async (url, options = {}) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    if (_token) headers["Authorization"] = `Bearer ${_token}`;

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      console.warn("Unauthorized — token expired or missing");
      clearToken();
      return null;
    }
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = async ({ email, password }) => {
  const res = await safeFetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (res?.success && res.token) {
    setToken(res.token);
  }
  return res;
};

export const register = async ({ name, email, password, role, phone }) => {
  const res = await safeFetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password, role, phone }),
  });
  if (res?.success && res.token) {
    setToken(res.token);
  }
  return res;
};

// ─── Reports / Tasks ──────────────────────────────────────────────────────────
// Backend has no GET /tasks — tasks come from reports
export const getTasks = async () => {
  const res = await safeFetch(`${BASE_URL}/reports`);
  // Reports are the tasks in this backend — map them to the shape our UI expects
  if (!res?.data) return null;
  return res.data.map((r) => ({
    id: r._id,
    title: r.title,
    description: r.description,
    location: r.location?.address || "",
    need_type: r.need_type,
    priority: r.priority_score || r.severity || 5,
    status: r.status === "pending" ? "unassigned"
          : r.status === "resolved" ? "completed"
          : r.status, // assigned stays assigned
    assigned_to: r.assigned_to || null,
    people_affected: r.people_affected,
    created_at: r.createdAt,
  }));
};

export const getVolunteers = async () => {
  const res = await safeFetch(`${BASE_URL}/volunteers`);
  if (!res?.data) return null;
  // Map populated volunteer profile to shape our UI expects
  return res.data.map((v) => ({
    id: v._id,
    name: v.user_id?.name || "Unknown",
    phone: v.user_id?.phone || "",
    location: v.user_id?.location?.address || "",
    skills: v.skills || [],
    availability: v.availability,
    rating: v.rating,
    tasks_completed: v.tasks_completed,
    current_task_id: v.current_task_id || null,
  }));
};

export const getAnalytics = async () => {
  const summaryRes = await safeFetch(`${BASE_URL}/analytics/summary`);
  const volRes = await safeFetch(`${BASE_URL}/analytics/volunteers`);

  if (!summaryRes?.data || !volRes?.data) return null;

  return {
    total_tasks: summaryRes.data.summary.total_reports,
    completed_tasks: summaryRes.data.summary.resolved_reports,
    pending_tasks: summaryRes.data.summary.pending_reports,

    in_progress_tasks: summaryRes.data.summary.pending_reports, // FIXED

    active_volunteers: volRes.data?.available_volunteers || 0,
    busy_volunteers: volRes.data?.busy_volunteers || 0,
    
    avg_response_time: summaryRes.data.summary.avg_response_time || 0,

    need_type_breakdown: summaryRes.data.by_need_type,
    daily_trend: summaryRes.data.daily_trend
  };
};

// ─── Submit a report (POST /api/reports) ─────────────────────────────────────
// Backend expects: title, description, need_type, lat, lng, address, severity, people_affected
export const reportIssue = async (data) => {
  return safeFetch(`${BASE_URL}/reports`, {
    method: "POST",
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      need_type: data.need_type,
      lat: data.lat || 28.6139,       // default to Delhi if no coords
      lng: data.lng || 77.2090,
      address: data.location,
      severity: data.severity,
      people_affected: data.people_affected || 1,
    }),
  });
};

// ─── Assign volunteer (POST /api/assign) ─────────────────────────────────────
// Backend uses report_id (not task_id) and volunteer_id
export const assignVolunteer = async ({ task_id, volunteer_id }) => {
  return safeFetch(`${BASE_URL}/assign`, {
    method: "POST",
    body: JSON.stringify({
      report_id: task_id,   // task_id == report _id in this backend
      volunteer_id,
    }),
  });
};

// ─── Update task status (PATCH /api/tasks/:task_id/status) ───────────────────
export const updateTaskStatus = async ({ task_id, status }) => {
  // Map our UI status back to backend status
  const backendStatus = status === "unassigned" ? "unassigned"
    : status === "completed" ? "completed"
    : status;

  return safeFetch(`${BASE_URL}/tasks/${task_id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: backendStatus }),
  });
};

// ─── Update volunteer availability (PATCH /api/volunteers/:id/availability) ──
export const updateVolunteerAvailability = async ({ volunteer_id, availability }) => {
  return safeFetch(`${BASE_URL}/volunteers/${volunteer_id}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ availability }),
  });
};
