import React, { useContext, useState, useCallback, memo, useEffect } from "react";
import { FaRegUser, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
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
            "http://localhost:4000/api/v1/user/getuser",
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
          "http://localhost:4000/api/v1/user/login",
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
    if (!formData.role) {
      toast.error("Please select your role first");
      return;
    }

    // Redirect to Google OAuth with role
    window.location.href = `http://localhost:4000/api/v1/auth/google?role=${formData.role}`;
  }, [formData.role]);

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

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-login-btn"
            disabled={!formData.role || isLoading}
          >
            <FaGoogle />
            Continue with Google
          </button>

          <div className="divider">
            <span>OR</span>
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
