const Dashboard = () => {
  const tasks = [
    {
      id: "1",
      title: "Food Distribution",
      location: "Delhi",
      priority: 9,
      status: "assigned"
    },
    {
      id: "2",
      title: "Medical Aid",
      location: "Mumbai",
      priority: 7,
      status: "pending"
    }
  ];

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "250px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}
          >
            <h3>{task.title}</h3>
            <p><strong>Location:</strong> {task.location}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Status:</strong> {task.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;