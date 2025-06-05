import React, { useContext, useEffect, useState, memo, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaSearch } from "react-icons/fa";
import "./Jobs.css";

const JobCard = memo(({ job }) => (
  <div className="job-card">
    <div className="job-card-header">
      <h3 className="job-title">{job.title}</h3>
      <span className="job-category">{job.category}</span>
    </div>
    
    <div className="job-card-body">
      <div className="job-info">
        <div className="info-item">
          <FaMapMarkerAlt />
          <span>{job.city}, {job.country}</span>
        </div>
        <div className="info-item">
          <FaDollarSign />
          <span>
            {job.fixedSalary ? `$${job.fixedSalary}` : `$${job.salaryFrom} - $${job.salaryTo}`}
          </span>
        </div>
      </div>
      
      <p className="job-description">
        {job.description?.substring(0, 120)}...
      </p>
    </div>
    
    <div className="job-card-footer">
      <Link to={`/job/${job._id}`} className="view-details-btn">
        View Details
      </Link>
    </div>
  </div>
));

const Jobs = memo(() => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
      return;
    }

    axios
      .get("http://localhost:4000/api/v1/job/getall", { withCredentials: true })
      .then((res) => {
        setJobs(res.data.jobs || []);
        setLoading(false);
      })
      .catch(() => {
        setJobs([]);
        setLoading(false);
      });
  }, [isAuthorized, navigateTo]);

  const filteredJobs = useMemo(() => 
    jobs.filter(job =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.country?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [jobs, searchTerm]
  );

  if (loading) {
    return (
      <div className="jobs-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading available jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <div className="jobs-wrapper">
        <div className="jobs-header">
          <h1 className="page-title">Available Opportunities</h1>
          <p className="page-subtitle">Find your dream job from {jobs.length} available positions</p>
          
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search jobs by title, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaBriefcase className="empty-icon" />
            <h3>No Jobs Found</h3>
            <p>
              {searchTerm 
                ? `No jobs match your search "${searchTerm}"`
                : "No jobs available at the moment"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default Jobs;
