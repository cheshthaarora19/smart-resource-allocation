export const mockTasks = [
  { id: "t1", title: "Medical supply delivery – Sector 4", location: "Sector 4, Delhi", priority: 9, need_type: "health", status: "unassigned", assigned_to: null, people_affected: 120, created_at: "2025-04-24T08:30:00Z", description: "Critical shortage of medicines at the community health post. Insulin and BP meds urgently needed." },
  { id: "t2", title: "Food distribution – Camp B", location: "Camp B, Noida", priority: 7, need_type: "food", status: "assigned", assigned_to: "v1", people_affected: 80, created_at: "2025-04-23T14:00:00Z", description: "Displaced families at Camp B need daily food packets. Logistics volunteer required." },
  { id: "t3", title: "Flood evacuation support", location: "Low-lying Zone 3, Gurugram", priority: 10, need_type: "disaster", status: "in_progress", assigned_to: "v2", people_affected: 300, created_at: "2025-04-24T06:00:00Z", description: "Flash flood warning issued. Immediate evacuation assistance needed for 300+ residents." },
  { id: "t4", title: "School supply distribution", location: "Village Palam, Faridabad", priority: 4, need_type: "education", status: "completed", assigned_to: "v3", people_affected: 45, created_at: "2025-04-22T10:00:00Z", description: "Notebooks and stationery to be distributed to students who lost belongings in fire." },
  { id: "t5", title: "Emergency water supply", location: "Ward 12, Gurugram", priority: 8, need_type: "health", status: "unassigned", assigned_to: null, people_affected: 200, created_at: "2025-04-24T09:15:00Z", description: "Water pipeline burst. Community needs clean drinking water cans immediately." },
  { id: "t6", title: "Nutrition camp setup", location: "Sector 18, Noida", priority: 6, need_type: "food", status: "assigned", assigned_to: "v4", people_affected: 60, created_at: "2025-04-23T11:00:00Z", description: "Malnutrition cases reported in the area. Nutrition screening and food aid required." },
];

export const mockVolunteers = [
  { id: "v1", name: "Arjun Mehta", skills: ["medical", "logistics"], availability: "busy", rating: 4.8, tasks_completed: 23, location: "Noida", phone: "+91 98100 11111", current_task_id: "t2", last_active: "2025-04-24T10:00:00Z" },
  { id: "v2", name: "Priya Sharma", skills: ["disaster", "logistics"], availability: "busy", rating: 4.6, tasks_completed: 17, location: "Gurugram", phone: "+91 98100 22222", current_task_id: "t3", last_active: "2025-04-24T09:45:00Z" },
  { id: "v3", name: "Ravi Kumar", skills: ["education", "teaching"], availability: "available", rating: 4.9, tasks_completed: 31, location: "Faridabad", phone: "+91 98100 33333", current_task_id: null, last_active: "2025-04-24T08:00:00Z" },
  { id: "v4", name: "Sneha Patel", skills: ["food", "logistics"], availability: "busy", rating: 4.5, tasks_completed: 12, location: "Delhi", phone: "+91 98100 44444", current_task_id: "t6", last_active: "2025-04-24T09:00:00Z" },
  { id: "v5", name: "Karan Singh", skills: ["medical", "health"], availability: "available", rating: 4.3, tasks_completed: 8, location: "Delhi", phone: "+91 98100 55555", current_task_id: null, last_active: "2025-04-23T18:00:00Z" },
  { id: "v6", name: "Meena Joshi", skills: ["food", "education"], availability: "offline", rating: 4.7, tasks_completed: 19, location: "Noida", phone: "+91 98100 66666", current_task_id: null, last_active: "2025-04-22T12:00:00Z" },
];

export const mockAnalytics = {
  total_tasks: 6,
  completed_tasks: 1,
  active_volunteers: 4,
  pending_tasks: 2,
  in_progress_tasks: 1,
  avg_response_time: 2.4,
  weekly: [
    { day: "Mon", reports: 3, resolved: 1 },
    { day: "Tue", reports: 5, resolved: 3 },
    { day: "Wed", reports: 4, resolved: 2 },
    { day: "Thu", reports: 7, resolved: 4 },
    { day: "Fri", reports: 6, resolved: 3 },
    { day: "Sat", reports: 2, resolved: 2 },
    { day: "Sun", reports: 4, resolved: 1 },
  ],
  need_type_breakdown: [
    { type: "health", count: 2 },
    { type: "food", count: 2 },
    { type: "disaster", count: 1 },
    { type: "education", count: 1 },
  ],
};

export const mockAlerts = [
  { id: "a1", region: "Gurugram", alert_type: "flood", probability: 0.87, predicted_date: "2025-04-25T00:00:00Z", status: "active" },
  { id: "a2", region: "Noida", alert_type: "shortage", probability: 0.65, predicted_date: "2025-04-26T00:00:00Z", status: "active" },
];
