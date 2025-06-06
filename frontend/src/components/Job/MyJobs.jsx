import axios from "axios";
import React, { useContext, useEffect, useState, useCallback, memo } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaEdit, FaTrash, FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaClock } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
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
  const [editData, setEditData] = useState({});
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

  const handleEditClick = (job) => {
    setEditingMode(job._id);
    setEditData({
      title: job.title,
      description: job.description,
      category: job.category,
      country: job.country,
      city: job.city,
      location: job.location,
      fixedSalary: job.fixedSalary || "",
      salaryFrom: job.salaryFrom || "",
      salaryTo: job.salaryTo || "",
      requiredSkills: job.requiredSkills || [""],
      jobRole: job.jobRole || "",
      isRemote: job.isRemote || false,
      applicationDeadline: job.applicationDeadline ? 
        new Date(job.applicationDeadline).toISOString().split('T')[0] : ""
    });
  };

  const handleAddSkill = () => {
    setEditData(prev => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, ""]
    }));
  };

  const handleRemoveSkill = (index) => {
    if (editData.requiredSkills.length > 1) {
      setEditData(prev => ({
        ...prev,
        requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSkillChange = (index, value) => {
    setEditData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.map((skill, i) => 
        i === index ? value : skill
      )
    }));
  };

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/job/getmyjobs`,
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

  const handleUpdateJob = async (jobId) => {
    try {
      const validSkills = editData.requiredSkills.filter(skill => skill.trim() !== "");
      
      if (validSkills.length === 0) {
        toast.error("Please add at least one required skill");
        return;
      }

      const updateData = {
        title: editData.title,
        description: editData.description,
        category: editData.category,
        country: editData.country,
        city: editData.city,
        location: editData.location,
        requiredSkills: validSkills,
        jobRole: editData.jobRole,
        isRemote: editData.isRemote,
        applicationDeadline: editData.applicationDeadline
      };

      // Add salary fields based on what's available
      if (editData.fixedSalary) {
        updateData.fixedSalary = editData.fixedSalary;
      } else {
        updateData.salaryFrom = editData.salaryFrom;
        updateData.salaryTo = editData.salaryTo;
      }

      console.log("Updating job with data:", updateData);

      const res = await axios.put(
        `${API_BASE_URL}/job/update/${jobId}`,
        updateData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success(res.data.message);
      setEditingMode(null);
      fetchJobs();
    } catch (error) {
      console.error("Update job error:", error);
      const errorMessage = error.response?.data?.message || "Failed to update job";
      toast.error(errorMessage);
    }
  };

  const handleDeleteJob = useCallback(async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    setDeleting(jobId);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/job/delete/${jobId}`, 
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
    <div className="myJobs page">
      <div className="container">
        <h1>Your Posted Jobs</h1>
        {myJobs.length > 0 ? (
          <div className="banner">
            {myJobs.map((element) => (
              <div className="card" key={element._id}>
                <div className="content">
                  <div className="short_fields">
                    <div>
                      <span>Title:</span>
                      <input
                        type="text"
                        disabled={editingMode !== element._id}
                        value={
                          editingMode === element._id
                            ? editData.title
                            : element.title
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <span>Country:</span>
                      <input
                        type="text"
                        disabled={editingMode !== element._id}
                        value={
                          editingMode === element._id
                            ? editData.country
                            : element.country
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, country: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <span>City:</span>
                      <input
                        type="text"
                        disabled={editingMode !== element._id}
                        value={
                          editingMode === element._id ? editData.city : element.city
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, city: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <span>Category:</span>
                      <select
                        value={
                          editingMode === element._id
                            ? editData.category
                            : element.category
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, category: e.target.value })
                        }
                        disabled={editingMode !== element._id}
                      >
                        <option value="Graphics & Design">Graphics & Design</option>
                        <option value="Mobile App Development">Mobile App Development</option>
                        <option value="Frontend Web Development">Frontend Web Development</option>
                        <option value="MERN Stack Development">MERN STACK Development</option>
                        <option value="Account & Finance">Account & Finance</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Video Animation">Video Animation</option>
                        <option value="MEAN Stack Development">MEAN STACK Development</option>
                        <option value="MEVN Stack Development">MEVN STACK Development</option>
                        <option value="Data Entry Operator">Data Entry Operator</option>
                      </select>
                    </div>
                    <div>
                      <span>Job Role:</span>
                      <select
                        value={
                          editingMode === element._id
                            ? editData.jobRole
                            : element.jobRole || ""
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, jobRole: e.target.value })
                        }
                        disabled={editingMode !== element._id}
                      >
                        <option value="">Select Job Role</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                    <div>
                      <span>Remote Work:</span>
                      <label className="remote-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            editingMode === element._id
                              ? editData.isRemote
                              : element.isRemote || false
                          }
                          onChange={(e) =>
                            setEditData({ ...editData, isRemote: e.target.checked })
                          }
                          disabled={editingMode !== element._id}
                        />
                        Available
                      </label>
                    </div>
                    <div>
                      <span>Application Deadline:</span>
                      <input
                        type="date"
                        disabled={editingMode !== element._id}
                        value={
                          editingMode === element._id
                            ? editData.applicationDeadline
                            : element.applicationDeadline ? 
                                new Date(element.applicationDeadline).toISOString().split('T')[0] : ""
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, applicationDeadline: e.target.value })
                        }
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    {/* Salary Section */}
                    {element.fixedSalary ? (
                      <div>
                        <span>Salary:</span>
                        <input
                          type="number"
                          disabled={editingMode !== element._id}
                          value={
                            editingMode === element._id
                              ? editData.fixedSalary
                              : element.fixedSalary
                          }
                          onChange={(e) =>
                            setEditData({ ...editData, fixedSalary: e.target.value })
                          }
                        />
                      </div>
                    ) : (
                      <div className="ranged_salary">
                        <div>
                          <span>Salary From:</span>
                          <input
                            type="number"
                            disabled={editingMode !== element._id}
                            value={
                              editingMode === element._id
                                ? editData.salaryFrom
                                : element.salaryFrom
                            }
                            onChange={(e) =>
                              setEditData({ ...editData, salaryFrom: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <span>Salary To:</span>
                          <input
                            type="number"
                            disabled={editingMode !== element._id}
                            value={
                              editingMode === element._id
                                ? editData.salaryTo
                                : element.salaryTo
                            }
                            onChange={(e) =>
                              setEditData({ ...editData, salaryTo: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills Section */}
                  <div className="skills_section">
                    <span>Required Skills:</span>
                    {editingMode === element._id ? (
                      <div className="skills_edit">
                        {editData.requiredSkills.map((skill, index) => (
                          <div key={index} className="skill_input">
                            <input
                              type="text"
                              value={skill}
                              onChange={(e) => handleSkillChange(index, e.target.value)}
                              placeholder={`Skill ${index + 1}`}
                            />
                            {editData.requiredSkills.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(index)}
                                className="remove_skill_btn"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="add_skill_btn"
                        >
                          Add Skill
                        </button>
                      </div>
                    ) : (
                      <div className="skills_display">
                        {element.requiredSkills && element.requiredSkills.length > 0 ? 
                          element.requiredSkills.map((skill, index) => (
                            <span key={index} className="skill_tag">{skill}</span>
                          )) : 
                          <span>No skills specified</span>
                        }
                      </div>
                    )}
                  </div>

                  <div className="long_field">
                    <div>
                      <span>Description:</span>
                      <textarea
                        rows={5}
                        value={
                          editingMode === element._id
                            ? editData.description
                            : element.description
                        }
                        disabled={editingMode !== element._id}
                        onChange={(e) =>
                          setEditData({ ...editData, description: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <span>Location:</span>
                      <textarea
                        value={
                          editingMode === element._id
                            ? editData.location
                            : element.location
                        }
                        rows={5}
                        disabled={editingMode !== element._id}
                        onChange={(e) =>
                          setEditData({ ...editData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="button_wrapper">
                  <div className="edit_btn_wrapper">
                    {editingMode === element._id ? (
                      <>
                        <button
                          onClick={() => handleUpdateJob(element._id)}
                          className="check_btn"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setEditingMode(null)}
                          className="cross_btn"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEditClick(element)}
                        className="edit_btn"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteJob(element._id)}
                    className="delete_btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You've not posted any job or may be you deleted all of your jobs!</p>
        )}
      </div>
    </div>
  );
};

export default MyJobs;