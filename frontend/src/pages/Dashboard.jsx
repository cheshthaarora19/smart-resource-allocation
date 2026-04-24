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

      {tasks.map((task) => (
        <div key={task.id} style={{border: "1px solid black", margin: "10px", padding: "10px"}}>
          <h3>{task.title}</h3>
          <p>Location: {task.location}</p>
          <p>Priority: {task.priority}</p>
          <p>Status: {task.status}</p>
        </div>
      ))}

    </div>
  );
};

export default Dashboard;