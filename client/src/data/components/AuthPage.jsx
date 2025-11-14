import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      navigate('/games');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

      // Try to parse JSON, but handle cases where response might not be JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, provide a meaningful error message
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error("Invalid response from server. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.message || `Login failed: ${response.status} ${response.statusText}`);
      }

      if (!data.token) {
        throw new Error("No authentication token received from server.");
      }

      localStorage.setItem('authToken', data.token);
      navigate("/games");

    } catch (err) {
      // Handle different types of errors
      if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        setError("Failed to connect to server. Please ensure the server is running and accessible at " + API_BASE_URL);
      } else if (err.name === 'AbortError') {
        setError("Request was cancelled.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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

      // Try to parse JSON, but handle cases where response might not be JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, provide a meaningful error message
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error("Invalid response from server. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.message || `Registration failed: ${response.status} ${response.statusText}`);
      }

      if (!data.token) {
        throw new Error("No authentication token received from server.");
      }

      localStorage.setItem('authToken', data.token);
      navigate("/games");

    } catch (err) {
      // Handle different types of errors
      if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        setError("Failed to connect to server. Please ensure the server is running and accessible at " + API_BASE_URL);
      } else if (err.name === 'AbortError') {
        setError("Request was cancelled.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-letterboxd-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-letterboxd-red mb-2">LOOTBOX</h1>
          <p className="text-letterboxd-text-secondary text-lg">
            {isLogin ? 'Log in to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="bg-letterboxd-card rounded-lg shadow-2xl p-8 border border-gray-800">
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-letterboxd-dark border border-gray-700 rounded-md text-letterboxd-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-letterboxd-red focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    name="dob"
                    placeholder="Date of Birth"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-letterboxd-dark border border-gray-700 rounded-md text-letterboxd-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-letterboxd-red focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-letterboxd-dark border border-gray-700 rounded-md text-letterboxd-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-letterboxd-red focus:border-transparent transition-all"
                  />
                </div>
              </>
            )}
            
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-letterboxd-dark border border-gray-700 rounded-md text-letterboxd-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-letterboxd-red focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-letterboxd-dark border border-gray-700 rounded-md text-letterboxd-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-letterboxd-red focus:border-transparent transition-all"
              />
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-letterboxd-red hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            {isLogin ? (
              <p className="text-letterboxd-text-secondary">
                Need an account?{' '}
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                  className="text-letterboxd-red hover:text-red-400 font-medium transition-colors"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-letterboxd-text-secondary">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className="text-letterboxd-red hover:text-red-400 font-medium transition-colors"
                >
                  Log In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
