import axios from "axios";
import React, { useContext, useState, memo, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../main";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaUpload } from "react-icons/fa";
import "./Application.css";

const Application = memo(() => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    coverLetter: "",
    phone: "",
    address: "",
  });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const { id } = useParams();

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    setFileError("");
    
    if (!file) {
      setResume(null);
      return;
    }
    
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Please select a valid image file (PNG, JPEG, or WEBP)");
      setResume(null);
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setFileError("File size should be less than 2MB");
      setResume(null);
      return;
    }
    
    setResume(file);
  }, []);

  const handleApplication = useCallback(async (e) => {
    e.preventDefault();
    
    const { name, email, phone, address, coverLetter } = formData;
    if (!name || !email || !phone || !address || !coverLetter) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (!resume) {
      setFileError("Please upload your resume");
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append("resume", resume);
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
      setResume(null);
      toast.success(response.data.message);
      navigateTo("/job/getall");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, resume, id, navigateTo]);

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

            <div className="form-group">
              <label className="form-label">
                <FaUpload className="label-icon" />
                Resume *
              </label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  className="file-input"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="file-upload-label">
                  <FaUpload className="upload-icon" />
                  <span>{resume ? resume.name : "Choose resume file"}</span>
                  <small>PNG, JPEG, WEBP (Max 2MB)</small>
                </label>
                {fileError && <p className="error-text">{fileError}</p>}
              </div>
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