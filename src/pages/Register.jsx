import { Link } from "react-router-dom";
import "./Login.css";

function Register() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Create Account</h2>

        <form>
          <input type="text" placeholder="Enter Name" />
          <input type="email" placeholder="Enter Email" />
          <input type="password" placeholder="Enter Password" />

          <button type="submit" className="login-btn">
            Register
          </button>
        </form>

        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;