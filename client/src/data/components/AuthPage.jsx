import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import '../styles/Auth.css';

// It's good practice to keep the API URL in one place
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function AuthPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // State to explicitly control the form mode. Defaults to Login.
  const [isLogin, setIsLogin] = useState(true);

  // This effect remains the same - it's good!
  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      navigate('/Games');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- REFACTORED: Separate handler for Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.username || !formData.password) {
      setError("Username and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem('authToken', data.token);
      navigate("/Games");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- REFACTORED: Separate handler for Signup ---
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation for all signup fields
    const { fullName, dob, email, username, password } = formData;
    if (!fullName || !dob || !email || !username || !password) {
      setError("All fields are required for signup.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      localStorage.setItem('authToken', data.token);
      navigate("/Games");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h1>
      <p>{isLogin ? 'Log in to continue' : 'Sign up to get started'}</p>
      
      <form className="auth-form" onSubmit={isLogin ? handleLogin : handleSignup}>
        {/* --- IMPROVED: Conditional rendering is now clear --- */}
        {!isLogin && (
          <>
            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required disabled={isLoading} />
            <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} required disabled={isLoading} />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={isLoading} />
          </>
        )}
        
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required disabled={isLoading} />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required disabled={isLoading} />
        
        {error && <p className="error-message">{error}</p>}
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      {/* --- IMPROVED: Clear toggle for the user --- */}
      <div className="toggle-auth">
        {isLogin ? (
          <p>Need an account? <button onClick={() => setIsLogin(false)}>Sign Up</button></p>
        ) : (
          <p>Already have an account? <button onClick={() => setIsLogin(true)}>Login</button></p>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
