import { Link } from "react-router-dom";
import "./Login.css";

function Register() {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Create Account</h2>
        <form>
          <input type="text" placeholder="Enter Name" />
          <input type="email" placeholder="Enter Email" />
          <input type="password" placeholder="Enter Password" />
          <button type="submit">Register</button>
        </form>

        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;