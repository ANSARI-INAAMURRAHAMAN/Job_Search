import React, { useContext, useState, useCallback, memo, useEffect } from "react";
import { FaRegUser, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE_URL from "../../config/api";
import "./Login.css";

const Login = memo(() => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  // Handle Google OAuth return
  useEffect(() => {
    const authStatus = searchParams.get("auth");
    const error = searchParams.get("error");
    const role = searchParams.get("role");

    if (authStatus === "success") {
      toast.success("Successfully logged in with Google!");
      setIsAuthorized(true);

      // Fetch user data
      const fetchUser = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/user/getuser`,
            { withCredentials: true }
          );
          setUser(response.data.user);
        } catch (error) {
          console.error("Error fetching user after Google auth:", error);
        }
      };
      fetchUser();
    } else if (error === "oauth_failed") {
      toast.error("Google authentication failed. Please try again.");
    }
  }, [searchParams, setIsAuthorized, setUser]);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const { email, password, role } = formData;

      if (!email || !password || !role) {
        toast.error("Please fill all fields");
        return;
      }

      setIsLoading(true);

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/user/login`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        toast.success(data.message);
        setUser(data.user);
        setIsAuthorized(true);
        setFormData({ email: "", password: "", role: "" });
      } catch (error) {
        console.error("Login error:", error);
        toast.error(error.response?.data?.message || "Login failed");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, setIsAuthorized, setUser]
  );

  // Google Login Handler
  const handleGoogleLogin = useCallback(() => {
    // Store current origin for proper redirects
    sessionStorage.setItem('oauth_origin', window.location.origin);
    
    // Redirect to backend Google OAuth without role parameter
    // Role will be selected on the role selection page for new users
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://job-search-ypji.onrender.com/api/v1';
    window.location.href = `${backendUrl}/auth/google`;
  }, []);

  if (isAuthorized) {
    return <Navigate to={"/"} />;
  }

  return (
    <section className="authPage">
      <div className="container">
        <div className="header">
          <img src="/JobZeelogo.png" alt="logo" loading="lazy" />
          <h3>Login to your account</h3>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="inputTag">
            <label>Login As</label>
            <div className="role-selector">
              <button
                type="button"
                className={formData.role === "Employer" ? "active" : ""}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, role: "Employer" }))
                }
                disabled={isLoading}
              >
                Employer
              </button>
              <button
                type="button"
                className={formData.role === "Job Seeker" ? "active" : ""}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, role: "Job Seeker" }))
                }
                disabled={isLoading}
              >
                Job Seeker
              </button>
            </div>
          </div>

          <div className="google-auth-section" style={{ marginTop: '20px' }}>
            <div className="divider" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              margin: '20px 0',
              textAlign: 'center'
            }}>
              <hr style={{ flex: 1, border: 'none', height: '1px', backgroundColor: '#ddd' }} />
              <span style={{ margin: '0 15px', color: '#666' }}>Or continue with Google</span>
              <hr style={{ flex: 1, border: 'none', height: '1px', backgroundColor: '#ddd' }} />
            </div>
            
            <button
              type="button"
              className="google-login-btn"
              onClick={handleGoogleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#fff',
                color: '#333',
                cursor: 'pointer',
                width: '100%',
                fontSize: '16px'
              }}
            >
              <FaGoogle style={{ color: '#4285f4' }} />
              Continue with Google
            </button>
          </div>

          <div className="inputTag">
            <label>Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                placeholder="zk@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                autoComplete="email"
              />
              <MdOutlineMailOutline />
            </div>
          </div>

          <div className="inputTag">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Your Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={
              isLoading ||
              !formData.email ||
              !formData.password ||
              !formData.role
            }
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>

          <Link to={"/register"} className="switch-link">
            New User? Register Now
          </Link>
        </form>
      </div>
    </section>
  );
});

Login.displayName = "Login";

export default Login;