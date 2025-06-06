import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload, FaArrowLeft, FaCalendarAlt, FaBriefcase } from "react-icons/fa";
import "./ApplicantProfile.css";

const ApplicantProfile = () => {
  const { applicationId } = useParams();
  const { isAuthorized, user } = useContext(Context);
  const [application, setApplication] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized || user?.role !== "Employer") {
      navigateTo("/");
      return;
    }
    fetchApplicationDetails();
  }, [applicationId, isAuthorized, user]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/v1/application/${applicationId}`,
        { withCredentials: true }
      );
      setApplication(response.data.application);
      setApplicant(response.data.application.applicantID);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch application details");
      toast.error("Failed to load applicant profile");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (status) => {
    try {
      await axios.put(
        `http://localhost:4000/api/v1/application/status/${applicationId}`,
        { status },
        { withCredentials: true }
      );
      toast.success(`Application ${status.toLowerCase()} successfully`);
      setApplication(prev => ({ ...prev, status }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const downloadResume = () => {
    if (application?.resume?.url) {
      window.open(application.resume.url, '_blank');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthorized || user?.role !== "Employer") {
    return null;
  }

  if (loading) {
    return (
      <section className="applicant-profile">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading applicant profile...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="applicant-profile">
        <div className="container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <Link to="/applications/me" className="back-btn">Back to Applications</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="applicant-profile">
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <Link to="/applications/me" className="back-link">
            <FaArrowLeft />
            Back to Applications
          </Link>
          <h1>Applicant Profile</h1>
        </div>

        <div className="profile-content">
          {/* Applicant Info Card */}
          <div className="applicant-card">
            <div className="applicant-avatar">
              <FaUser />
            </div>
            <div className="applicant-info">
              <h2>{application?.name}</h2>
              <p className="applicant-role">Job Applicant</p>
              <div className="contact-info">
                <div className="contact-item">
                  <FaEnvelope />
                  <span>{application?.email}</span>
                </div>
                <div className="contact-item">
                  <FaPhone />
                  <span>{application?.phone}</span>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt />
                  <span>{application?.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="application-details">
            <div className="details-card">
              <h3>
                <FaBriefcase />
                Application Information
              </h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Applied For:</span>
                  <span className="detail-value">{application?.jobId?.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Application Date:</span>
                  <span className="detail-value">{formatDate(application?.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current Status:</span>
                  <span className={`status-badge ${application?.status?.toLowerCase()}`}>
                    {application?.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Company:</span>
                  <span className="detail-value">{application?.jobId?.category}</span>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="details-card">
              <h3>Cover Letter</h3>
              <div className="cover-letter">
                <p>{application?.coverLetter}</p>
              </div>
            </div>

            {/* Resume Section */}
            <div className="details-card">
              <h3>Resume</h3>
              <div className="resume-section">
                {application?.resume?.url ? (
                  <div className="resume-preview">
                    <img 
                      src={application.resume.url} 
                      alt="Resume" 
                      className="resume-image"
                    />
                    <button onClick={downloadResume} className="download-btn">
                      <FaDownload />
                      View Full Resume
                    </button>
                  </div>
                ) : (
                  <p>No resume uploaded</p>
                )}
              </div>
            </div>

            {/* User Profile Information */}
            {applicant && (
              <div className="details-card">
                <h3>
                  <FaUser />
                  User Profile
                </h3>
                <div className="user-profile-info">
                  <div className="profile-detail">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{applicant.name}</span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{applicant.email}</span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{applicant.phone}</span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{applicant.role}</span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Member Since:</span>
                    <span className="detail-value">{formatDate(applicant.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-section">
            <h3>Application Actions</h3>
            <div className="action-buttons">
              <button 
                onClick={() => updateApplicationStatus("Accepted")}
                className="action-btn accept"
                disabled={application?.status === "Accepted"}
              >
                Accept Application
              </button>
              <button 
                onClick={() => updateApplicationStatus("Rejected")}
                className="action-btn reject"
                disabled={application?.status === "Rejected"}
              >
                Reject Application
              </button>
              <button 
                onClick={() => updateApplicationStatus("Pending")}
                className="action-btn pending"
                disabled={application?.status === "Pending"}
              >
                Mark as Pending
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplicantProfile;
