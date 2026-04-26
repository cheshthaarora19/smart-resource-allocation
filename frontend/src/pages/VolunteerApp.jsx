const VolunteerApp = () => {
  const tasks = [
    {
      id: "1",
      title: "Food Distribution",
      location: "Delhi",
      status: "pending"
    }
  ];

  return (
    <div>
      <h2>Volunteer Dashboard</h2>

      {tasks.map((task) => (
        <div key={task.id} style={{ marginBottom: "20px", background: "white", padding: "15px" }}>
          <h3>{task.title}</h3>
          <p>{task.location}</p>

          <button>Accept</button>
          <button>Reject</button>

          <div style={{ marginTop: "10px" }}>
            <input type="file" />
            <textarea placeholder="Add notes"></textarea>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VolunteerApp;