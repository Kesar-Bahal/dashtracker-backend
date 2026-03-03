import { useState } from "react";
import { Link } from "react-router-dom";
import "./AddActivity.css";

function AddActivity() {

  const [topic, setTopic] = useState("");
  const [hours, setHours] = useState("");

  // ✅ Render backend URL
  const BASE_URL = "https://dashtracker-backen.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    await fetch(`${BASE_URL}/activities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id,
        topic,
        hours: Number(hours)
      })
    });

    window.location.href = "/dashboard";
  };

  return (
    <div className="activity-container">
      <div className="activity-box">
        <h2>Add Study Activity</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Topic Name"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Hours Studied"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
          />

          <button type="submit">Add Activity</button>
        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          <Link to="/dashboard">Back to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}

export default AddActivity;