import React, { useContext, useEffect, useState, memo, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import API_BASE_URL from "../../config/api";
import "./Jobs.css";

const Jobs = memo(() => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedJobRole, setSelectedJobRole] = useState("");
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
      return;
    }

    fetchJobs();
  }, [isAuthorized, navigateTo]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/job/getall`, {
        withCredentials: true,
      });
      setJobs(res.data.jobs || []);
      setFilteredJobs(res.data.jobs || []);
    } catch (error) {
      console.log(error);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on search term, category, and job role
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.requiredSkills && job.requiredSkills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    if (selectedJobRole) {
      filtered = filtered.filter(job => job.jobRole === selectedJobRole);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedCategory, selectedJobRole, jobs]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const categories = [...new Set(jobs.map(job => job.category))];
  const jobRoles = [...new Set(jobs.map(job => job.jobRole).filter(Boolean))];

  const JobCard = ({ element }) => (
    <div className="job-card">
      <div className="job-header">
        <h3 className="job-title">{element.title}</h3>
        <div className="job-badges">
          {element.jobRole && (
            <span className={`badge ${element.jobRole.toLowerCase().replace(' ', '-')}`}>
              {element.jobRole}
            </span>
          )}
          {element.isRemote && <span className="badge remote">Remote</span>}
        </div>
      </div>
      
      <p className="job-company">{element.category}</p>
      <p className="job-location">{element.city}, {element.country}</p>
      
      <p className="job-description">{element.description}</p>
      
      {element.requiredSkills && element.requiredSkills.length > 0 && (
        <div className="skills-section">
          <h4>Required Skills</h4>
          <div className="skills-list">
            {element.requiredSkills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}
      
      <div className="job-meta">
        <div className="meta-item">
          <span className="meta-label">Posted</span>
          <span className="meta-value">
            {element.jobPostedOn ? formatDate(element.jobPostedOn) : 'Date not available'}
          </span>
        </div>
        {element.applicationDeadline && (
          <div className="meta-item">
            <span className="meta-label">Deadline</span>
            <span className={`meta-value ${isDeadlineNear(element.applicationDeadline) ? 'deadline-warning' : ''}`}>
              {formatDate(element.applicationDeadline)}
            </span>
          </div>
        )}
      </div>
      
      <div className="salary">
        {element.fixedSalary ? (
          `$${element.fixedSalary.toLocaleString()}`
        ) : (
          `$${element.salaryFrom?.toLocaleString()} - $${element.salaryTo?.toLocaleString()}`
        )}
      </div>
      
      <div className="job-actions">
        <Link to={`/job/${element._id}`} className="primary-btn">
          <span>View Details</span>
          <span>→</span>
        </Link>
        <button className="secondary-btn" title="Save Job">
          ♡
        </button>
      </div>
    </div>
  );

  if (!isAuthorized) {
    return null;
  }

  return (
    <section className="jobs page">
      <div className="container">
        <div className="jobs-header">
          <h1>Find Your Dream Job</h1>
          <p className="jobs-subtitle">
            Discover thousands of job opportunities from top companies worldwide
          </p>
          
          {/* Search and Filter Section */}
          <div className="search-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search jobs by title, skills, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={selectedJobRole}
                onChange={(e) => setSelectedJobRole(e.target.value)}
                className="filter-select"
              >
                <option value="">All Job Types</option>
                {jobRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedJobRole("");
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <div className="jobs-stats">
            <div className="stat-item">
              <span>{filteredJobs.length} Jobs Available</span>
            </div>
            <div className="stat-item">
              <span>500+ Companies</span>
            </div>
            <div className="stat-item">
              <span>Remote Friendly</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : filteredJobs && filteredJobs.length > 0 ? (
          <div className="banner">
            {filteredJobs.map((element) => (
              <JobCard key={element._id} element={element} />
            ))}
          </div>
        ) : (
          <div className="no-jobs">
            <h2>No Jobs Found</h2>
            <p>
              {searchTerm || selectedCategory || selectedJobRole
                ? "Try adjusting your search criteria or filters."
                : "Check back later for new opportunities."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

export default Jobs;