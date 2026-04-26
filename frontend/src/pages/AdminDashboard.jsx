const AdminDashboard = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <div className="card">Total Requests: 120</div>
        <div className="card">Active Volunteers: 45</div>
        <div className="card">Completed Tasks: 80</div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <select>
          <option>Region</option>
          <option>Delhi</option>
          <option>Mumbai</option>
        </select>

        <select>
          <option>Category</option>
          <option>Food</option>
          <option>Health</option>
        </select>

        <select>
          <option>Urgency</option>
          <option>High</option>
          <option>Medium</option>
        </select>
      </div>
    </div>
  );
};

export default AdminDashboard;