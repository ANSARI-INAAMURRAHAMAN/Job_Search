import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import "./PostJob.css";

const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("default");
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthorized, user } = useContext(Context);

  const handleJobPost = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (salaryType === "Fixed Salary") {
      setSalaryFrom("");
      setSalaryTo("");
    } else if (salaryType === "Ranged Salary") {
      setFixedSalary("");
    } else {
      setSalaryFrom("");
      setSalaryTo("");
      setFixedSalary("");
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/job/post",
        fixedSalary.length >= 4
          ? {
              title,
              description,
              category,
              country,
              city,
              location,
              fixedSalary,
            }
          : {
              title,
              description,
              category,
              country,
              city,
              location,
              salaryFrom,
              salaryTo,
            },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(response.data.message);
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setCountry("");
      setCity("");
      setLocation("");
      setSalaryFrom("");
      setSalaryTo("");
      setFixedSalary("");
      setSalaryType("default");
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = useNavigate();
  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
  }

  return (
    <div className="post-job-container">
      <div className="post-job-wrapper">
        <div className="post-job-header">
          <h1 className="post-job-title">Create New Job Posting</h1>
          <p className="post-job-subtitle">Find the perfect candidate for your team</p>
        </div>
        
        <form onSubmit={handleJobPost} className="post-job-form">
          <div className="form-section">
            <h3 className="section-title">Job Details</h3>
            
            <div className="form-group">
              <label htmlFor="title" className="form-label">Job Title *</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter job title"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">Category *</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Choose a category</option>
                <option value="Graphics & Design">Graphics & Design</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Frontend Web Development">Frontend Web Development</option>
                <option value="Business Development Executive">Business Development Executive</option>
                <option value="Account & Finance">Account & Finance</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Video Animation">Video Animation</option>
                <option value="MEAN Stack Development">MEAN Stack Development</option>
                <option value="MERN Stack Development">MERN Stack Development</option>
                <option value="Data Entry Operator">Data Entry Operator</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Job Description *</label>
              <textarea
                id="description"
                rows="6"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, and requirements..."
                className="form-textarea"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Location</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country" className="form-label">Country *</label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter country"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="city" className="form-label">City *</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">Specific Location</label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter specific address or area"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Compensation</h3>
            
            <div className="form-group">
              <label htmlFor="salaryType" className="form-label">Salary Type *</label>
              <select
                id="salaryType"
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value)}
                className="form-select"
                required
              >
                <option value="default">Choose salary structure</option>
                <option value="Fixed Salary">Fixed Salary</option>
                <option value="Ranged Salary">Salary Range</option>
              </select>
            </div>

            <div className="salary-input-section">
              {salaryType === "default" && (
                <div className="salary-prompt">
                  <p className="prompt-text">Please select a salary type to continue</p>
                </div>
              )}
              
              {salaryType === "Fixed Salary" && (
                <div className="form-group">
                  <label htmlFor="fixedSalary" className="form-label">Fixed Salary Amount *</label>
                  <input
                    id="fixedSalary"
                    type="number"
                    placeholder="Enter salary amount"
                    value={fixedSalary}
                    onChange={(e) => setFixedSalary(e.target.value)}
                    className="form-input salary-input"
                    required
                  />
                </div>
              )}
              
              {salaryType === "Ranged Salary" && (
                <div className="salary-range-group">
                  <div className="form-group">
                    <label htmlFor="salaryFrom" className="form-label">Minimum Salary *</label>
                    <input
                      id="salaryFrom"
                      type="number"
                      placeholder="From"
                      value={salaryFrom}
                      onChange={(e) => setSalaryFrom(e.target.value)}
                      className="form-input salary-input"
                      required
                    />
                  </div>
                  <div className="salary-separator">
                    <span>to</span>
                  </div>
                  <div className="form-group">
                    <label htmlFor="salaryTo" className="form-label">Maximum Salary *</label>
                    <input
                      id="salaryTo"
                      type="number"
                      placeholder="To"
                      value={salaryTo}
                      onChange={(e) => setSalaryTo(e.target.value)}
                      className="form-input salary-input"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className={`submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating Job...
                </>
              ) : (
                'Create Job Posting'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
