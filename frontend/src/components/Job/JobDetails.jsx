import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../../main";
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaCalendarAlt, FaUser, FaBuilding, FaBriefcase, FaGlobe, FaTags } from "react-icons/fa";
import API_BASE_URL from "../../config/api";
import "./JobDetails.css";

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigateTo = useNavigate();
  const { isAuthorized, user } = useContext(Context);

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
      return;
    }
    
    fetchJobDetails();
  }, [id, isAuthorized, navigateTo]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/job/${id}`, {
        withCredentials: true,
      });
      setJob(res.data.job);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDeadlineNear = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <section className="job-details">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading job details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="job-details">
        <div className="container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <Link to="/job/getall" className="back-btn">Back to Jobs</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="job-details">
      <div className="container">
        {/* Header Section */}
        <div className="job-header">
          <div className="job-title-section">
            <h1>{job.title}</h1>
            <div className="job-meta-badges">
              {job.jobRole && (
                <span className={`badge ${job.jobRole?.toLowerCase().replace(' ', '-')}`}>
                  {job.jobRole}
                </span>
              )}
              {job.isRemote && <span className="badge remote">Remote</span>}
              {isDeadlineNear(job.applicationDeadline) && (
                <span className="badge urgent">Urgent</span>
              )}
              {isDeadlinePassed(job.applicationDeadline) && (
                <span className="badge expired">Expired</span>
              )}
            </div>
          </div>
          
          <div className="job-actions">
            {user?.role === "Job Seeker" && !isDeadlinePassed(job.applicationDeadline) && (
              <Link to={`/application/${job._id}`} className="apply-btn">
                <FaUser />
                Apply Now
              </Link>
            )}
            <button className="save-btn">
              ♡ Save Job
            </button>
          </div>
        </div>

        <div className="job-content">
          {/* Quick Info Cards */}
          <div className="quick-info">
            <div className="info-card">
              <FaBuilding className="info-icon" />
              <div>
                <span className="info-label">Company</span>
                <span className="info-value">{job.category}</span>
              </div>
            </div>
            
            <div className="info-card">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <span className="info-label">Location</span>
                <span className="info-value">{job.city}, {job.country}</span>
              </div>
            </div>
            
            <div className="info-card">
              <FaBriefcase className="info-icon" />
              <div>
                <span className="info-label">Job Type</span>
                <span className="info-value">{job.jobRole}</span>
              </div>
            </div>
            
            <div className="info-card">
              <FaDollarSign className="info-icon" />
              <div>
                <span className="info-label">Salary</span>
                <span className="info-value">
                  {job.fixedSalary ? 
                    `$${job.fixedSalary?.toLocaleString()}` : 
                    `$${job.salaryFrom?.toLocaleString()} - $${job.salaryTo?.toLocaleString()}`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {/* Job Description */}
            <div className="content-section">
              <h2>
                <FaTags />
                Job Description
              </h2>
              <div className="description-content">
                <p>{job.description}</p>
              </div>
            </div>

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="content-section">
                <h2>
                  <FaGlobe />
                  Required Skills
                </h2>
                <div className="skills-grid">
                  {job.requiredSkills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Details */}
            <div className="content-section">
              <h2>
                <FaClock />
                Job Information
              </h2>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Posted On:</span>
                  <span className="detail-value">
                    {job.jobPostedOn ? formatDate(job.jobPostedOn) : 'Not specified'}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Application Deadline:</span>
                  <span className={`detail-value ${isDeadlineNear(job.applicationDeadline) ? 'deadline-warning' : ''}`}>
                    {job.applicationDeadline ? formatDate(job.applicationDeadline) : 'Not specified'}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{job.category}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Detailed Location:</span>
                  <span className="detail-value">{job.location}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Remote Work:</span>
                  <span className="detail-value">{job.isRemote ? 'Available' : 'Not Available'}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Posted By:</span>
                  <span className="detail-value">{job.postedBy?.name || 'Company HR'}</span>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="content-section">
              <h2>
                <FaBuilding />
                About the Company
              </h2>
              <div className="company-info">
                <p><strong>Industry:</strong> {job.category}</p>
                <p><strong>Location:</strong> {job.city}, {job.country}</p>
                {job.postedBy?.email && (
                  <p><strong>Contact:</strong> {job.postedBy.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Application Status */}
            <div className="sidebar-card">
              <h3>Application Status</h3>
              {isDeadlinePassed(job.applicationDeadline) ? (
                <div className="status-expired">
                  <FaCalendarAlt />
                  <span>Applications Closed</span>
                </div>
              ) : (
                <div className="status-open">
                  <FaCalendarAlt />
                  <span>Applications Open</span>
                  <small>Deadline: {formatDate(job.applicationDeadline)}</small>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="sidebar-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <Link to="/job/getall" className="action-btn secondary">
                  ← Back to Jobs
                </Link>
                {user?.role === "Job Seeker" && !isDeadlinePassed(job.applicationDeadline) && (
                  <Link to={`/application/${job._id}`} className="action-btn primary">
                    Apply for this Job
                  </Link>
                )}
                <button className="action-btn outline">
                  Share Job
                </button>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="sidebar-card">
              <h3>Job Highlights</h3>
              <div className="highlights">
                <div className="highlight-item">
                  <span className="highlight-icon">💰</span>
                  <span>Competitive Salary</span>
                </div>
                {job.isRemote && (
                  <div className="highlight-item">
                    <span className="highlight-icon">🏠</span>
                    <span>Remote Work Option</span>
                  </div>
                )}
                <div className="highlight-item">
                  <span className="highlight-icon">📈</span>
                  <span>Career Growth</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">🎯</span>
                  <span>{job.jobRole} Position</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobDetails;