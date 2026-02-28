import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h2>Welcome Back 👋</h2>
        <p>Total XP: <strong>120</strong></p>

        <div className="dashboard-buttons">
          <Link to="/add">
            <button>Add Activity</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;