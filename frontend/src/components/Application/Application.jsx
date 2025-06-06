import axios from "axios";
import React, { useContext, useState, memo, useCallback } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Context } from "../../main";
import { FaUser, FaEnvelope, FaPhone, FaFileUpload, FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import API_BASE_URL from "../../config/api";
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

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const { id } = useParams();

  // Handle file input change
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile) {
      // Check file type for images
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Please upload an image file (JPG, PNG, GIF, WEBP)");
        return;
      }
      
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      
      setResume(selectedFile);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleApplication = useCallback(async (e) => {
    e.preventDefault();
    
    const { name, email, phone, address, coverLetter } = formData;
    if (!name || !email || !phone || !address || !coverLetter || !resume) {
      toast.error("Please fill all fields and upload your resume");
      return;
    }

    setLoading(true);
    
    const data = new FormData();
    data.append("name", name);
    data.append("email", email);
    data.append("phone", phone);
    data.append("address", address);
    data.append("coverLetter", coverLetter);
    data.append("resume", resume);
    data.append("jobId", id);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/application/post`,
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
      
      // Reset file input
      const fileInput = document.getElementById('resume');
      if (fileInput) {
        fileInput.value = '';
      }
      
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
    <section className="application">
      <div className="container">
        <div className="application-header">
          <Link to="/job/getall" className="back-link">
            <FaArrowLeft />
            Back to Jobs
          </Link>
          <h1>Submit Your Application</h1>
          <p>Fill out the form below to apply for this position</p>
        </div>

        <form onSubmit={handleApplication} className="application-form">
          <div className="form-section">
            <h3>
              <FaUser />
              Personal Information
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <FaFileUpload />
              Resume Upload
            </h3>
            
            <div className="file-upload-section">
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="resume"
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/*"
                  onChange={handleFileChange}
                  required
                  style={{ display: 'none' }}
                />
                <label htmlFor="resume" className="file-upload-label">
                  <FaFileUpload />
                  <span>
                    {resume ? resume.name : "Choose Resume Image"}
                  </span>
                  <small>JPG, PNG, GIF, WEBP (Max 5MB)</small>
                </label>
              </div>
              
              {resume && (
                <div className="file-info">
                  <div className="file-details">
                    <span className="file-name">{resume.name}</span>
                    <span className="file-size">
                      {(resume.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="image-preview">
                    <img 
                      src={URL.createObjectURL(resume)} 
                      alt="Resume preview" 
                      className="preview-image"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setResume(null)}
                    className="remove-file-btn"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Cover Letter *</h3>
            <textarea
              rows="8"
              value={formData.coverLetter}
              onChange={(e) => handleInputChange("coverLetter", e.target.value)}
              placeholder="Write a compelling cover letter explaining why you're the perfect fit for this role..."
              required
            />
          </div>

          <div className="submit-section">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Submitting Application...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
});

export default Application;