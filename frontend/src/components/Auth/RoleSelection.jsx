import React, { useState, memo, useCallback, useContext } from "react";
import { FaUserTie, FaUser, FaGoogle } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import API_BASE_URL from "../../config/api";
import "./RoleSelection.css";

const RoleSelection = memo(() => {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { setIsAuthorized, setUser } = useContext(Context);
  const navigateTo = useNavigate();
  const [searchParams] = useSearchParams();

  const isNewUser = searchParams.get('new_user') === 'true';

  const handleRoleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error("Please select your role");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/complete-google-signup`,
        { role: selectedRole },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || "Registration completed successfully!");
        setUser(response.data.user);
        setIsAuthorized(true);
        navigateTo("/");
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Role completion error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to complete registration";
      toast.error(errorMessage);
      
      // If session expired or invalid, redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired. Please sign in again.");
        navigateTo("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedRole, setIsAuthorized, setUser, navigateTo]);

  // Check authentication status on mount
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/user/getuser`,
          { withCredentials: true }
        );
        
        // If user already has a role, redirect to home
        if (response.data.user && response.data.user.role) {
          setUser(response.data.user);
          setIsAuthorized(true);
          navigateTo("/");
        }
      } catch (error) {
        // If not authenticated or needs role selection, stay on page
        if (!isNewUser) {
          navigateTo("/login");
        }
      }
    };

    checkAuthStatus();
  }, [isNewUser, navigateTo, setUser, setIsAuthorized]);

  if (!isNewUser) {
    return null; // Let useEffect handle the redirect
  }

  return (
    <div className="role-selection-container">
      <div className="role-selection-wrapper">
        <div className="role-header">
          <FaGoogle className="google-icon-large" />
          <h1 className="role-title">Almost There!</h1>
          <p className="role-subtitle">
            Please select your role to complete your registration
          </p>
        </div>

        <form onSubmit={handleRoleSubmit} className="role-form">
          <div className="role-options">
            <div 
              className={`role-option ${selectedRole === 'Job Seeker' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('Job Seeker')}
            >
              <div className="role-icon">
                <FaUser />
              </div>
              <div className="role-content">
                <h3>Job Seeker</h3>
                <p>I'm looking for job opportunities</p>
                <ul>
                  <li>Browse and apply for jobs</li>
                  <li>Upload resume and portfolio</li>
                  <li>Track application status</li>
                  <li>Get job recommendations</li>
                </ul>
              </div>
              <input
                type="radio"
                name="role"
                value="Job Seeker"
                checked={selectedRole === 'Job Seeker'}
                onChange={() => setSelectedRole('Job Seeker')}
              />
            </div>

            <div 
              className={`role-option ${selectedRole === 'Employer' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('Employer')}
            >
              <div className="role-icon">
                <FaUserTie />
              </div>
              <div className="role-content">
                <h3>Employer</h3>
                <p>I want to hire talented professionals</p>
                <ul>
                  <li>Post job openings</li>
                  <li>Review applications</li>
                  <li>Manage candidates</li>
                  <li>Build your company profile</li>
                </ul>
              </div>
              <input
                type="radio"
                name="role"
                value="Employer"
                checked={selectedRole === 'Employer'}
                onChange={() => setSelectedRole('Employer')}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`complete-btn ${loading ? 'loading' : ''}`}
            disabled={loading || !selectedRole}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Completing Registration...
              </>
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
});

export default RoleSelection;