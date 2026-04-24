import { reportIssue } from "../services/api";
import { useState } from "react";

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    need_type: "food"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await reportIssue(formData);
    console.log("Server Response:", result);

    alert("Issue submitted successfully");
  };

  return (
    <div>
      <h2>Report an Issue</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
        />
        <br />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <br />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />
        <br />

        <select
          name="need_type"
          value={formData.need_type}
          onChange={handleChange}
        >
          <option value="food">Food</option>
          <option value="health">Health</option>
          <option value="education">Education</option>
          <option value="disaster">Disaster</option>
        </select>
        <br /><br />

        <button type="submit">Submit</button>

      </form>
    </div>
  );
};

export default ReportIssue;