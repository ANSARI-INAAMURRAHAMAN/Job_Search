import React, { useContext, useEffect, useState, memo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../../main";
import { FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaCalendar, FaBuilding, FaArrowLeft } from "react-icons/fa";
import "./JobDetails.css";

const JobDetails = memo(() => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigateTo = useNavigate();
  const { isAuthorized, user } = useContext(Context);

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
      return;
    }

    axios
      .get(`http://localhost:4000/api/v1/job/${id}`, { withCredentials: true })
      .then((res) => {
        setJob(res.data.job);
        setLoading(false);
      })
      .catch(() => {
        navigateTo("/notfound");
      });
  }, [id, isAuthorized, navigateTo]);

  if (loading) {
    return (
      <div className="job-details-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-container">
      <div className="job-details-wrapper">
        <button onClick={() => navigateTo(-1)} className="back-btn">
          <FaArrowLeft /> Back to Jobs
        </button>
        
        <div className="job-header">
          <div className="job-title-section">
            <h1 className="job-title">{job.title}</h1>
            <span className="job-category">{job.category}</span>
          </div>
          <div className="job-meta">
            <div className="meta-item">
              <FaCalendar />
              <span>Posted: {new Date(job.jobPostedOn).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="job-content">
          <div className="job-info-grid">
            <div className="info-card">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <h3>Location</h3>
                <p>{job.city}, {job.country}</p>
                {job.location && <p className="sub-text">{job.location}</p>}
              </div>
            </div>

            <div className="info-card">
              <FaDollarSign className="info-icon" />
              <div>
                <h3>Salary</h3>
                <p className="salary">
                  {job.fixedSalary ? `$${job.fixedSalary}` : `$${job.salaryFrom} - $${job.salaryTo}`}
                </p>
              </div>
            </div>

            <div className="info-card">
              <FaBuilding className="info-icon" />
              <div>
                <h3>Department</h3>
                <p>{job.category}</p>
              </div>
            </div>
          </div>

          <div className="job-description">
            <h3>Job Description</h3>
            <div className="description-content">
              {job.description}
            </div>
          </div>

          {user?.role !== "Employer" && (
            <div className="apply-section">
              <Link to={`/application/${job._id}`} className="apply-btn">
                <FaBriefcase />
                Apply for this Position
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default JobDetails;
