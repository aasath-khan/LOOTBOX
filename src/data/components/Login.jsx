import { useNavigate } from "react-router-dom";
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents page reload
    navigate("/Games"); // Navigates to Game.jsx
  };
  return (
    <div className="login-container">
      <h1>THIS IS LOOTBOX</h1>
      <p>Login to continue</p>
      <form className="login-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login