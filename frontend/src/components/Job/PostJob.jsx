import React, { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaCalendarAlt, FaTools } from "react-icons/fa";
import API_BASE_URL from "../../config/api";
import "./PostJob.css";

const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [salaryType, setSalaryType] = useState("default");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([""]);
  const [jobRole, setJobRole] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  const handleAddSkill = () => {
    setRequiredSkills([...requiredSkills, ""]);
  };

  const handleRemoveSkill = (index) => {
    if (requiredSkills.length > 1) {
      setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
    }
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...requiredSkills];
    updatedSkills[index] = value;
    setRequiredSkills(updatedSkills);
  };

  const handleJobSubmission = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !category || !country || !city || !location || !jobRole || !applicationDeadline) {
      toast.error("Please fill all required fields");
      return;
    }

    const validSkills = requiredSkills.filter(skill => skill.trim() !== "");
    if (validSkills.length === 0) {
      toast.error("Please add at least one required skill");
      return;
    }

    if (salaryType === "Fixed Salary" && !fixedSalary) {
      toast.error("Please provide fixed salary");
      return;
    }

    if (salaryType === "Ranged Salary" && (!salaryFrom || !salaryTo)) {
      toast.error("Please provide salary range");
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        title,
        description,
        category,
        country,
        city,
        location,
        requiredSkills: validSkills,
        jobRole,
        isRemote,
        applicationDeadline
      };

      if (salaryType === "Fixed Salary") {
        jobData.fixedSalary = fixedSalary;
      } else {
        jobData.salaryFrom = salaryFrom;
        jobData.salaryTo = salaryTo;
      }

      const res = await axios.post(
        `${API_BASE_URL}/job/post`,
        jobData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(res.data.message);
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setCountry("");
      setCity("");
      setLocation("");
      setSalaryType("default");
      setFixedSalary("");
      setSalaryFrom("");
      setSalaryTo("");
      setRequiredSkills([""]);
      setJobRole("");
      setIsRemote(false);
      setApplicationDeadline("");
      
      navigateTo("/job/me");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
    return null;
  }

  return (
    <div className="job_post page">
      <div className="container">
        <div className="page-header">
          <h3>Create Job Opportunity</h3>
          <p className="page-subtitle">
            Fill out the details to post your job opening
          </p>
        </div>

        <form onSubmit={handleJobSubmission}>
          {/* Basic Job Information */}
          <div className="form-section">
            <h4 className="section-title">
              <FaBriefcase className="label-icon" />
              Job Information
            </h4>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  required
                >
                  <option value="">Select Category</option>
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
            </div>

            <div className="special-row">
              <div className="form-group">
                <label className="form-label">Job Type *</label>
                <select 
                  value={jobRole} 
                  onChange={(e) => setJobRole(e.target.value)} 
                  required
                >
                  <option value="">Select Job Type</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              
              <div className="remote-toggle">
                <input
                  type="checkbox"
                  id="remote"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                />
                <label htmlFor="remote">Remote Work Available</label>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="form-section">
            <h4 className="section-title">
              <FaMapMarkerAlt className="label-icon" />
              Location Details
            </h4>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Address *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 123 Main Street, Downtown"
                required
              />
            </div>
          </div>

          {/* Salary Information */}
          <div className="form-section salary-section">
            <h4 className="section-title">
              <FaDollarSign className="label-icon" />
              Salary Information
            </h4>
            
            <select
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value)}
            >
              <option value="default">Select Salary Type</option>
              <option value="Fixed Salary">Fixed Salary</option>
              <option value="Ranged Salary">Ranged Salary</option>
            </select>
            
            {salaryType === "Fixed Salary" && (
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Enter Fixed Salary Amount"
                  value={fixedSalary}
                  onChange={(e) => setFixedSalary(e.target.value)}
                />
              </div>
            )}
            
            {salaryType === "Ranged Salary" && (
              <div className="salary-row">
                <div className="form-group">
                  <input
                    type="number"
                    placeholder="Minimum Salary"
                    value={salaryFrom}
                    onChange={(e) => setSalaryFrom(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    placeholder="Maximum Salary"
                    value={salaryTo}
                    onChange={(e) => setSalaryTo(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Required Skills */}
          <div className="form-section skills-section">
            <h4 className="section-title">
              <FaTools className="label-icon" />
              Required Skills
            </h4>
            
            <div className="skills-container">
              {requiredSkills.map((skill, index) => (
                <div key={index} className="skill-input-row">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder={`Skill ${index + 1} (e.g. React, Node.js)`}
                    required
                  />
                  {requiredSkills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="skill-btn remove-skill-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSkill}
                className="skill-btn add-skill-btn"
              >
                + Add Another Skill
              </button>
            </div>
          </div>

          {/* Application Deadline */}
          <div className="form-section">
            <h4 className="section-title">
              <FaCalendarAlt className="label-icon" />
              Application Deadline
            </h4>
            
            <div className="form-group">
              <label className="form-label">Last Date to Apply *</label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="form-section description-section">
            <h4 className="section-title">Job Description & Requirements *</h4>
            <textarea
              rows="6"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the job role, responsibilities, qualifications, and any other requirements..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading && <span className="loading-spinner"></span>}
              {loading ? "Creating Job..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;