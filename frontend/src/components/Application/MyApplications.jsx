import React, { useContext, useEffect, useState, memo, useCallback } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaTrash, FaEye, FaCalendarAlt, FaBriefcase } from "react-icons/fa";
import ResumeModal from "./ResumeModal";
import API_BASE_URL from "../../config/api";
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

const MyApplications = () => {
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
        `${API_BASE_URL}/application/delete/${id}`,
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
      ? `${API_BASE_URL}/application/employer/getall`
      : `${API_BASE_URL}/application/jobseeker/getall`;

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  return (
    <section className="my_applications page">
      <div className="container">
        <h1>
          {user && user.role === "Job Seeker" ? "My Applications" : "Applications From Job Seekers"}
        </h1>
        {applications.length <= 0 ? (
          <div className="no-applications">
            <h4>No Applications Found</h4>
            <p>
              {user && user.role === "Job Seeker" 
                ? "You haven't applied for any jobs yet."
                : "No one has applied for your jobs yet."
              }
            </p>
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map((element) => (
              <div className="application-card" key={element._id}>
                <div className="card-header">
                  <div className="applicant-info">
                    <div className="applicant-avatar">
                      <FaUser />
                    </div>
                    <div className="applicant-details">
                      <h3>{element.name}</h3>
                      <p className="applicant-email">{element.email}</p>
                      <p className="applicant-phone">{element.phone}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusClass(element.status)}`}>
                    {element.status}
                  </span>
                </div>

                <div className="card-content">
                  <div className="job-info">
                    <div className="info-item">
                      <FaBriefcase className="info-icon" />
                      <span>Applied for: <strong>{element.jobId?.title || "Job Title"}</strong></span>
                    </div>
                    <div className="info-item">
                      <FaCalendarAlt className="info-icon" />
                      <span>Applied on: {formatDate(element.createdAt)}</span>
                    </div>
                  </div>

                  <div className="cover-letter-preview">
                    <h4>Cover Letter:</h4>
                    <p>{element.coverLetter.substring(0, 100)}...</p>
                  </div>

                  <div className="card-actions">
                    {user && user.role === "Employer" ? (
                      <Link 
                        to={`/applicant/${element._id}`} 
                        className="action-btn view-profile"
                      >
                        <FaEye />
                        View Profile
                      </Link>
                    ) : (
                      <button 
                        onClick={() => deleteApplication(element._id)}
                        className="action-btn delete"
                      >
                        <FaTrash />
                        Delete Application
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </section>
  );
};

export default MyApplications;