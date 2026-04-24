import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div>
      <h1>Smart Resource Allocation System</h1>

      <button onClick={() => setPage("dashboard")}>Dashboard</button>
      <button onClick={() => setPage("report")}>Report Issue</button>

      {page === "dashboard" && <Dashboard />}
      {page === "report" && <ReportIssue />}
    </div>
  );
}

export default App;