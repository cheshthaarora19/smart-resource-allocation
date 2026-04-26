import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>SRAS</h2>
        <button onClick={() => setActivePage("landing")}>Landing</button>
        <button onClick={() => setActivePage("heatmap")}>Heatmap</button>
        <button onClick={() => setActivePage("volunteer")}>Volunteer App</button>
        <button onClick={() => setActivePage("admin")}>Admin Dashboard</button>
        <button onClick={() => setActivePage("report")}>Report Issue</button>
        <button onClick={() => setActivePage("analytics")}>Analytics</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Smart Resource Allocation System</h1>

        {activePage === "landing" && <Landing />}
        {activePage === "heatmap" && <HeatmapDashboard />}
        {activePage === "volunteer" && <VolunteerApp />}
        {activePage === "admin" && <AdminDashboard />}
        {activePage === "report" && <ReportIssue />}
        {activePage === "analytics" && <Analytics />}
      </div>
    </div>
  );
}

export default App;