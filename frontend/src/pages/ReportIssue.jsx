import { useState } from "react";

const ReportIssue = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    type: "food"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    alert("Issue submitted!");
  };

  return (
    <div>
      <h2>Report an Issue</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          maxWidth: "500px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          >
            <option value="food">Food</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="disaster">Disaster</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px"
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;