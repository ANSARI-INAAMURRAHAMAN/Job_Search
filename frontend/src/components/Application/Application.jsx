import axios from "axios";
import React, { useContext, useState, memo, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../main";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";
import "./Application.css";

const Application = memo(() => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    coverLetter: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const { id } = useParams();

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleApplication = useCallback(async (e) => {
    e.preventDefault();
    
    const { name, email, phone, address, coverLetter } = formData;
    if (!name || !email || !phone || !address || !coverLetter) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append("jobId", id);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/application/post",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      setFormData({
        name: "",
        email: "",
        coverLetter: "",
        phone: "",
        address: "",
      });
      toast.success(response.data.message);
      navigateTo("/job/getall");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, id, navigateTo]);

  if (!isAuthorized || (user && user.role === "Employer")) {
    navigateTo("/");
  }

  return (
    <div className="application-container">
      <div className="application-wrapper">
        <div className="application-header">
          <h1 className="application-title">Submit Your Application</h1>
          <p className="application-subtitle">Fill out the form below to apply for this position</p>
        </div>

        <form onSubmit={handleApplication} className="application-form">
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <FaUser className="label-icon" />
                  Full Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <FaEnvelope className="label-icon" />
                  Email Address *
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <FaPhone className="label-icon" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <FaMapMarkerAlt className="label-icon" />
                  Address *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Application Details</h3>
            
            <div className="form-group">
              <label className="form-label">
                <FaFileAlt className="label-icon" />
                Cover Letter *
              </label>
              <textarea
                className="form-textarea"
                placeholder="Write your cover letter here..."
                value={formData.coverLetter}
                onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                rows={6}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default Application;