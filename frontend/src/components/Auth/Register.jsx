import React, { useContext, useState, memo, useCallback } from "react";
import { FaRegUser, FaPencilAlt, FaPhone, FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import "./Register.css";

const Register = memo(() => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { isAuthorized, setIsAuthorized } = useContext(Context);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const { name, email, phone, password, role } = formData;

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/user/register",
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      toast.success(data.message);
      setFormData({ email: "", name: "", phone: "", password: "", role: "" });
      setIsAuthorized(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, setIsAuthorized]);

  const handleGoogleLogin = useCallback(() => {
    // Store the selected role in localStorage before redirecting to Google OAuth
    if (formData.role) {
      localStorage.setItem('selectedRole', formData.role);
    }
    window.location.href = "http://localhost:4000/api/v1/auth/google";
  }, [formData.role]);

  if (isAuthorized) {
    return <Navigate to="/" />;
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-form-section">
          <div className="auth-header">
            <img src="/careerconnect-black.png" alt="CareerConnect" className="auth-logo" />
            <h1 className="auth-title">Join CareerConnect</h1>
            <p className="auth-subtitle">Create your account and start your career journey</p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <FaRegUser className="label-icon" />
                I want to register as *
              </label>
              <div className="input-wrapper">
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className={`form-select ${errors.role ? 'error' : ''}`}
                  required
                >
                  <option value="" disabled>Choose your role</option>
                  <option value="Employer">🏢 Employer - I want to hire talent</option>
                  <option value="Job Seeker">👤 Job Seeker - I'm looking for opportunities</option>
                </select>
                <FaRegUser className="select-icon" />
              </div>
              {errors.role && <span className="error-text">{errors.role}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaPencilAlt className="label-icon" />
                Full Name *
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                />
                <FaPencilAlt className="input-icon" />
              </div>
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <MdOutlineMailOutline className="label-icon" />
                Email Address *
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                />
                <MdOutlineMailOutline className="input-icon" />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaPhone className="label-icon" />
                Phone Number *
              </label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                />
                <FaPhone className="input-icon" />
              </div>
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <RiLock2Fill className="label-icon" />
                Password *
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className={`auth-btn primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="auth-btn google"
            >
              <FaGoogle className="google-icon" />
              Continue with Google
            </button>

            <p className="auth-footer">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </form>
        </div>

        <div className="auth-image-section">
          <div className="image-container">
            <img src="/register.png" alt="Join our community" />
            <div className="image-overlay">
              <h3>Start Your Career Journey</h3>
              <p>Join thousands of professionals who found their dream jobs through CareerConnect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Register;
