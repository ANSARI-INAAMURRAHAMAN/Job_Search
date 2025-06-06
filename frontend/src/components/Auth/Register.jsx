import React, { useContext, useState, useCallback, memo, useEffect } from "react";
import { FaRegUser, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { FaPhoneFlip } from "react-icons/fa6";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import API_BASE_URL from "../../config/api";
import "./Register.css";

const Register = memo(() => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  // Handle Google OAuth return
  useEffect(() => {
    const authStatus = searchParams.get('auth');
    const error = searchParams.get('error');
    
    if (authStatus === 'success') {
      toast.success('Successfully registered with Google!');
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
          console.error('Error fetching user after Google auth:', error);
        }
      };
      fetchUser();
    } else if (error === 'oauth_failed') {
      toast.error('Google authentication failed. Please try again.');
    }
  }, [searchParams, setIsAuthorized, setUser]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const { name, email, phone, password, role } = formData;
    
    if (!name || !email || !phone || !password || !role) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/user/register`,
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
      setFormData({ name: "", email: "", phone: "", password: "", role: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }, [formData, setIsAuthorized, setUser]);

  // Google Register Handler
  const handleGoogleRegister = useCallback(() => {
    if (!formData.role) {
      toast.error("Please select your role first");
      return;
    }
    
    // Redirect to Google OAuth with role
    window.location.href = `https://job-search-ypji.onrender.com/api/v1/auth/google?role=${formData.role}`;
  }, [formData.role]);

  if (isAuthorized) {
    return <Navigate to={"/"} />;
  }

  return (
    <section className="authPage">
      <div className="container">
        <div className="header">
          <img src="/JobZeelogo.png" alt="logo" loading="lazy" />
          <h3>Create a new account</h3>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="inputTag">
            <label>Register As</label>
            <div className="role-selector">
              <button
                type="button"
                className={formData.role === "Employer" ? "active" : ""}
                onClick={() => setFormData(prev => ({ ...prev, role: "Employer" }))}
                disabled={isLoading}
              >
                Employer
              </button>
              <button
                type="button"
                className={formData.role === "Job Seeker" ? "active" : ""}
                onClick={() => setFormData(prev => ({ ...prev, role: "Job Seeker" }))}
                disabled={isLoading}
              >
                Job Seeker
              </button>
            </div>
          </div>

          {/* Google Register Button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
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
            <label>Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                autoComplete="name"
              />
              <FaRegUser />
            </div>
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
            <label>Phone Number</label>
            <div className="input-wrapper">
              <input
                type="number"
                name="phone"
                placeholder="12345678"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading}
                autoComplete="tel"
              />
              <FaPhoneFlip />
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
                autoComplete="new-password"
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
            className="register-btn"
            disabled={isLoading || !Object.values(formData).every(Boolean)}
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                Creating Account...
              </div>
            ) : (
              "Register"
            )}
          </button>
          
          <Link to={"/login"} className="switch-link">
            Already Registered? Login Now
          </Link>
        </form>
      </div>
    </section>
  );
});

Register.displayName = 'Register';

export default Register;