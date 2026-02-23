import { Link } from "react-router-dom";

function Login() {
  return (
    <div>
      <h2>Login Page</h2>
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
}

export default Login;