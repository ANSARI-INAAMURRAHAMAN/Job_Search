import React, { useContext, useEffect, useState, memo, useCallback } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaTrash, FaEye } from "react-icons/fa";
import ResumeModal from "./ResumeModal";
import "./MyApplications.css";

const ApplicationCard = memo(({ application, onDelete, onViewResume, showDeleteBtn = false }) => (
  <div className="application-card">
    <div className="application-header">
      <div className="applicant-info">
        <h3 className="applicant-name">{application.name}</h3>
        <span className="application-date">
          Applied: {new Date(application.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="application-actions">
        <button 
          onClick={() => onViewResume(application.resume.url)}
          className="action-btn view-btn"
          title="View Resume"
        >
          <FaEye />
        </button>
        {showDeleteBtn && (
          <button 
            onClick={() => onDelete(application._id)}
            className="action-btn delete-btn"
            title="Delete Application"
          >
            <FaTrash />
          </button>
        )}
      </div>
    </div>

    <div className="application-details">
      <div className="detail-item">
        <FaEnvelope className="detail-icon" />
        <span>{application.email}</span>
      </div>
      <div className="detail-item">
        <FaPhone className="detail-icon" />
        <span>{application.phone}</span>
      </div>
      <div className="detail-item">
        <FaMapMarkerAlt className="detail-icon" />
        <span>{application.address}</span>
      </div>
    </div>

    <div className="cover-letter">
      <div className="cover-letter-header">
        <FaFileAlt className="detail-icon" />
        <span>Cover Letter</span>
      </div>
      <p className="cover-letter-text">{application.coverLetter}</p>
    </div>

    <div className="resume-preview">
      <img 
        src={application.resume.url} 
        alt="Resume preview"
        onClick={() => onViewResume(application.resume.url)}
        className="resume-thumbnail"
      />
      <span className="resume-label">Click to view full resume</span>
    </div>
  </div>
));

const MyApplications = memo(() => {
  const { user, isAuthorized } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");
  const navigateTo = useNavigate();

  const deleteApplication = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/v1/application/delete/${id}`,
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setApplications(prev => prev.filter(app => app._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete application");
    }
  }, []);

  const openModal = useCallback((imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
      return;
    }

    const endpoint = user?.role === "Employer" 
      ? "http://localhost:4000/api/v1/application/employer/getall"
      : "http://localhost:4000/api/v1/application/jobseeker/getall";

    axios.get(endpoint, { withCredentials: true })
      .then(res => {
        setApplications(res.data.applications);
        setLoading(false);
      })
      .catch(error => {
        toast.error(error.response?.data?.message || "Failed to fetch applications");
        setLoading(false);
      });
  }, [isAuthorized, user?.role, navigateTo]);

  if (loading) {
    return (
      <div className="applications-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  const isJobSeeker = user?.role === "Job Seeker";
  const title = isJobSeeker ? "My Applications" : "Applications From Job Seekers";

  return (
    <div className="applications-container">
      <div className="applications-wrapper">
        <div className="applications-header">
          <h1 className="page-title">{title}</h1>
          <div className="applications-stats">
            <span className="stat-number">{applications.length}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>

        {applications.length > 0 ? (
          <div className="applications-grid">
            {applications.map((application, index) => (
              <div key={application._id} style={{ animationDelay: `${index * 0.1}s` }}>
                <ApplicationCard
                  application={application}
                  onDelete={deleteApplication}
                  onViewResume={openModal}
                  showDeleteBtn={isJobSeeker}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <h3>No Applications Found</h3>
            <p>
              {isJobSeeker 
                ? "You haven't applied to any jobs yet."
                : "No applications have been submitted for your job postings yet."
              }
            </p>
          </div>
        )}
      </div>

      {modalOpen && (
        <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </div>
  );
});

export default MyApplications;
