import { Link } from "react-router-dom";
import "./AddActivity.css";

function AddActivity() {
  return (
    <div className="activity-container">
      <div className="activity-box">
        <h2>Add Study Activity</h2>

        <form>
          <input type="text" placeholder="Topic Name" />
          <input type="number" placeholder="Hours Studied" />
          <button type="submit">Add Activity</button>
          <p style={{ textAlign: "center", marginTop: "15px" }}>
  <Link to="/dashboard">Back to Dashboard</Link>
</p>
        </form>
      </div>
    </div>
  );
}

export default AddActivity;