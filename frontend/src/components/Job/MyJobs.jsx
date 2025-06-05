import axios from "axios";
import React, { useContext, useEffect, useState, useCallback, memo } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaEdit, FaTrash, FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaClock } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";
import "./MyJobs.css";

// Memoized Job Card Component for better performance
const JobCard = memo(({ job, editingMode, onEnableEdit, onDisableEdit, onUpdateJob, onDeleteJob, onInputChange }) => {
  const isEditing = editingMode === job._id;

  return (
    <div className={`job-card ${isEditing ? 'editing' : ''}`}>
      <div className="job-card-header">
        <div className="job-status">
          <span className={`status-badge ${job.expired ? 'expired' : 'active'}`}>
            {job.expired ? 'Expired' : 'Active'}
          </span>
        </div>
        <div className="job-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button
                onClick={() => onUpdateJob(job._id)}
                className="action-btn save-btn"
                title="Save changes"
              >
                <FaCheck />
              </button>
              <button
                onClick={onDisableEdit}
                className="action-btn cancel-btn"
                title="Cancel editing"
              >
                <RxCross2 />
              </button>
            </div>
          ) : (
            <div className="default-actions">
              <button
                onClick={() => onEnableEdit(job._id)}
                className="action-btn edit-btn"
                title="Edit job"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onDeleteJob(job._id)}
                className="action-btn delete-btn"
                title="Delete job"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="job-card-content">
        <div className="job-main-info">
          <div className="form-group">
            <label className="form-label">
              <FaBriefcase className="label-icon" />
              Job Title
            </label>
            <input
              type="text"
              className={`form-input ${isEditing ? 'editable' : 'readonly'}`}
              disabled={!isEditing}
              value={job.title}
              onChange={(e) => onInputChange(job._id, "title", e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <FaMapMarkerAlt className="label-icon" />
                Country
              </label>
              <input
                type="text"
                className={`form-input ${isEditing ? 'editable' : 'readonly'}`}
                disabled={!isEditing}
                value={job.country}
                onChange={(e) => onInputChange(job._id, "country", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className={`form-input ${isEditing ? 'editable' : 'readonly'}`}
                disabled={!isEditing}
                value={job.city}
                onChange={(e) => onInputChange(job._id, "city", e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className={`form-select ${isEditing ? 'editable' : 'readonly'}`}
                value={job.category}
                onChange={(e) => onInputChange(job._id, "category", e.target.value)}
                disabled={!isEditing}
              >
                <option value="Graphics & Design">Graphics & Design</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Frontend Web Development">Frontend Web Development</option>
                <option value="MERN Stack Development">MERN Stack Development</option>
                <option value="Account & Finance">Account & Finance</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Video Animation">Video Animation</option>
                <option value="MEAN Stack Development">MEAN Stack Development</option>
                <option value="MEVN Stack Development">MEVN Stack Development</option>
                <option value="Data Entry Operator">Data Entry Operator</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                <FaClock className="label-icon" />
                Status
              </label>
              <select
                className={`form-select ${isEditing ? 'editable' : 'readonly'}`}
                value={job.expired}
                onChange={(e) => onInputChange(job._id, "expired", e.target.value === 'true')}
                disabled={!isEditing}
              >
                <option value={false}>Active</option>
                <option value={true}>Expired</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FaDollarSign className="label-icon" />
              Salary
            </label>
            {job.fixedSalary ? (
              <input
                type="number"
                className={`form-input salary-input ${isEditing ? 'editable' : 'readonly'}`}
                disabled={!isEditing}
                value={job.fixedSalary}
                onChange={(e) => onInputChange(job._id, "fixedSalary", e.target.value)}
                placeholder="Fixed salary amount"
              />
            ) : (
              <div className="salary-range">
                <input
                  type="number"
                  className={`form-input salary-input ${isEditing ? 'editable' : 'readonly'}`}
                  disabled={!isEditing}
                  value={job.salaryFrom}
                  onChange={(e) => onInputChange(job._id, "salaryFrom", e.target.value)}
                  placeholder="From"
                />
                <span className="salary-separator">to</span>
                <input
                  type="number"
                  className={`form-input salary-input ${isEditing ? 'editable' : 'readonly'}`}
                  disabled={!isEditing}
                  value={job.salaryTo}
                  onChange={(e) => onInputChange(job._id, "salaryTo", e.target.value)}
                  placeholder="To"
                />
              </div>
            )}
          </div>
        </div>

        <div className="job-details">
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className={`form-textarea ${isEditing ? 'editable' : 'readonly'}`}
              rows={4}
              value={job.description}
              disabled={!isEditing}
              onChange={(e) => onInputChange(job._id, "description", e.target.value)}
              placeholder="Job description..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location Details</label>
            <textarea
              className={`form-textarea ${isEditing ? 'editable' : 'readonly'}`}
              value={job.location}
              rows={3}
              disabled={!isEditing}
              onChange={(e) => onInputChange(job._id, "location", e.target.value)}
              placeholder="Specific location details..."
            />
          </div>
        </div>
      </div>
    </div>
  );
});

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [editingMode, setEditingMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  // Memoized functions for better performance
  const handleEnableEdit = useCallback((jobId) => {
    setEditingMode(jobId);
  }, []);

  const handleDisableEdit = useCallback(() => {
    setEditingMode(null);
  }, []);

  const handleUpdateJob = useCallback(async (jobId) => {
    setUpdating(jobId);
    const updatedJob = myJobs.find((job) => job._id === jobId);
    try {
      const response = await axios.put(
        `http://localhost:4000/api/v1/job/update/${jobId}`, 
        updatedJob, 
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setEditingMode(null);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setUpdating(null);
    }
  }, [myJobs]);

  const handleDeleteJob = useCallback(async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    setDeleting(jobId);
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/v1/job/delete/${jobId}`, 
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setMyJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setDeleting(null);
    }
  }, []);

  const handleInputChange = useCallback((jobId, field, value) => {
    setMyJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === jobId ? { ...job, [field]: value } : job
      )
    );
  }, []);

  // Fetching all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/job/getmyjobs",
          { withCredentials: true }
        );
        setMyJobs(data.myJobs);
      } catch (error) {
        toast.error(error.response.data.message);
        setMyJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
  }

  if (loading) {
    return (
      <div className="my-jobs-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-jobs-container">
      <div className="my-jobs-wrapper">
        <div className="my-jobs-header">
          <h1 className="page-title">My Job Postings</h1>
          <p className="page-subtitle">
            Manage and edit your job listings
          </p>
          <div className="jobs-stats">
            <div className="stat-item">
              <span className="stat-number">{myJobs.length}</span>
              <span className="stat-label">Total Jobs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{myJobs.filter(job => !job.expired).length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{myJobs.filter(job => job.expired).length}</span>
              <span className="stat-label">Expired</span>
            </div>
          </div>
        </div>

        {myJobs.length > 0 ? (
          <div className="jobs-grid">
            {myJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                editingMode={editingMode}
                onEnableEdit={handleEnableEdit}
                onDisableEdit={handleDisableEdit}
                onUpdateJob={handleUpdateJob}
                onDeleteJob={handleDeleteJob}
                onInputChange={handleInputChange}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <FaBriefcase />
            </div>
            <h3>No Jobs Posted Yet</h3>
            <p>You haven't posted any jobs yet. Start by creating your first job posting!</p>
            <button 
              className="create-job-btn"
              onClick={() => navigateTo('/job/post')}
            >
              Post Your First Job
            </button>
          </div>
        )}
      </div>

      {(updating || deleting) && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>{updating ? 'Updating job...' : 'Deleting job...'}</p>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
