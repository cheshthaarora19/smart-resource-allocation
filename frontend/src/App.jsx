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
        <button onClick={() => setActivePage("dashboard")}>
          Dashboard
        </button>
        <button onClick={() => setActivePage("report")}>
          Report Issue
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Smart Resource Allocation System</h1>

        {activePage === "dashboard" && <Dashboard />}
        {activePage === "report" && <ReportIssue />}
      </div>
    </div>
  );
}

export default App;