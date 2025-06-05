import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaSave, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
    education: [],
    skills: [],
    experience: [],
    projects: []
  });

  const [newEducation, setNewEducation] = useState({
    degree: "",
    college: "",
    graduationYear: "",
    fieldOfStudy: "",
    percentage: ""
  });

  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
    isCurrentJob: false
  });

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: "",
    liveUrl: "",
    githubUrl: "",
    startDate: "",
    endDate: ""
  });

  const [newSkill, setNewSkill] = useState({
    name: "",
    proficiency: "Intermediate"
  });

  const [showAddEducation, setShowAddEducation] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/user-profile", {
        withCredentials: true
      });
      if (res.data.success) {
        const profile = res.data.profile;
        setProfileData({
          bio: profile.bio || "",
          phone: profile.phone || "",
          address: profile.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: ""
          },
          education: profile.education || [],
          skills: profile.skills || [],
          experience: profile.experience || [],
          projects: profile.projects || []
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to fetch profile data");
    }
  };

  const handleBasicInfoChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const addEducation = () => {
    if (!newEducation.degree || !newEducation.college) {
      alert("Please fill in degree and college fields");
      return;
    }
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, { ...newEducation, id: Date.now() }]
    }));
    setNewEducation({
      degree: "",
      college: "",
      graduationYear: "",
      fieldOfStudy: "",
      percentage: ""
    });
    setShowAddEducation(false);
  };

  const removeEducation = (index) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    if (!newExperience.company || !newExperience.position) {
      alert("Please fill in company and position fields");
      return;
    }
    setProfileData(prev => ({
      ...prev,
      experience: [...prev.experience, { ...newExperience, id: Date.now() }]
    }));
    setNewExperience({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
      isCurrentJob: false
    });
    setShowAddExperience(false);
  };

  const removeExperience = (index) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addProject = () => {
    if (!newProject.title || !newProject.description) {
      alert("Please fill in title and description fields");
      return;
    }
    setProfileData(prev => ({
      ...prev,
      projects: [...prev.projects, { ...newProject, id: Date.now() }]
    }));
    setNewProject({
      title: "",
      description: "",
      technologies: "",
      liveUrl: "",
      githubUrl: "",
      startDate: "",
      endDate: ""
    });
    setShowAddProject(false);
  };

  const removeProject = (index) => {
    setProfileData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (!newSkill.name) {
      alert("Please enter a skill name");
      return;
    }
    const skillExists = profileData.skills.some(
      skill => skill.name.toLowerCase() === newSkill.name.toLowerCase()
    );
    if (skillExists) {
      alert("Skill already exists");
      return;
    }
    setProfileData(prev => ({
      ...prev,
      skills: [...prev.skills, { ...newSkill, id: Date.now() }]
    }));
    setNewSkill({
      name: "",
      proficiency: "Intermediate"
    });
    setShowAddSkill(false);
  };

  const removeSkill = (index) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const saveProfile = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const profileDataToSend = {
        bio: profileData.bio || "",
        phone: profileData.phone || "",
        address: profileData.address || {},
        education: profileData.education || [],
        skills: profileData.skills || [],
        experience: profileData.experience || [],
        projects: profileData.projects || []
      };

      const response = await axios.put(
        "http://localhost:4000/api/v1/user-profile/update",
        profileDataToSend,
        {
          withCredentials: true,
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Profile updated successfully");
        navigate("/profile");
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      let errorMessage = "Failed to update profile";
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <Link to="/profile" className="back-btn">
          <FaArrowLeft /> Back to Profile
        </Link>
        <h1>Edit Profile</h1>
        <button onClick={saveProfile} className="save-btn" disabled={loading}>
          <FaSave /> {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="edit-profile-content">
        {/* Basic Information */}
        <div className="edit-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleBasicInfoChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleBasicInfoChange("phone", e.target.value)}
                placeholder="Your phone number"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="edit-section">
          <h2>Address</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                value={profileData.address.street}
                onChange={(e) => handleAddressChange("street", e.target.value)}
                placeholder="Street address"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={profileData.address.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={profileData.address.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                placeholder="State"
              />
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                value={profileData.address.zipCode}
                onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                placeholder="Zip code"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={profileData.address.country}
                onChange={(e) => handleAddressChange("country", e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="edit-section">
          <div className="section-header">
            <h2>Education</h2>
            <button
              className="add-btn"
              onClick={() => setShowAddEducation(!showAddEducation)}
            >
              <FaPlus /> Add Education
            </button>
          </div>

          {showAddEducation && (
            <div className="add-form">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Degree"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="College/University"
                  value={newEducation.college}
                  onChange={(e) => setNewEducation({...newEducation, college: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={newEducation.fieldOfStudy}
                  onChange={(e) => setNewEducation({...newEducation, fieldOfStudy: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Graduation Year"
                  value={newEducation.graduationYear}
                  onChange={(e) => setNewEducation({...newEducation, graduationYear: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Percentage/CGPA"
                  value={newEducation.percentage}
                  onChange={(e) => setNewEducation({...newEducation, percentage: e.target.value})}
                />
              </div>
              <button onClick={addEducation} className="save-item-btn">Add Education</button>
            </div>
          )}

          <div className="items-list">
            {profileData.education.map((edu, index) => (
              <div key={index} className="item-card">
                <div className="item-content">
                  <h3>{edu.degree}</h3>
                  <p>{edu.college}</p>
                  <p>{edu.fieldOfStudy} • {edu.graduationYear}</p>
                  {edu.percentage && <p>Grade: {edu.percentage}</p>}
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeEducation(index)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div className="edit-section">
          <div className="section-header">
            <h2>Work Experience</h2>
            <button
              className="add-btn"
              onClick={() => setShowAddExperience(!showAddExperience)}
            >
              <FaPlus /> Add Experience
            </button>
          </div>

          {showAddExperience && (
            <div className="add-form">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Company"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={newExperience.position}
                  onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                />
                <input
                  type="date"
                  placeholder="Start Date"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={newExperience.endDate}
                  onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                  disabled={newExperience.isCurrentJob}
                />
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="currentJob"
                    checked={newExperience.isCurrentJob}
                    onChange={(e) => setNewExperience({...newExperience, isCurrentJob: e.target.checked})}
                  />
                  <label htmlFor="currentJob">Currently working here</label>
                </div>
                <textarea
                  placeholder="Job description"
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                  rows={3}
                  className="full-width"
                />
              </div>
              <button onClick={addExperience} className="save-item-btn">Add Experience</button>
            </div>
          )}

          <div className="items-list">
            {profileData.experience.map((exp, index) => (
              <div key={index} className="item-card">
                <div className="item-content">
                  <h3>{exp.position}</h3>
                  <p>{exp.company}</p>
                  <p>{exp.startDate} - {exp.isCurrentJob ? "Present" : exp.endDate}</p>
                  <p>{exp.description}</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeExperience(index)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="edit-section">
          <div className="section-header">
            <h2>Projects</h2>
            <button
              className="add-btn"
              onClick={() => setShowAddProject(!showAddProject)}
            >
              <FaPlus /> Add Project
            </button>
          </div>

          {showAddProject && (
            <div className="add-form">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Technologies Used"
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                />
                <input
                  type="url"
                  placeholder="Live URL (optional)"
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})}
                />
                <input
                  type="url"
                  placeholder="GitHub URL (optional)"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({...newProject, githubUrl: e.target.value})}
                />
                <input
                  type="date"
                  placeholder="Start Date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                />
                <textarea
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  rows={3}
                  className="full-width"
                />
              </div>
              <button onClick={addProject} className="save-item-btn">Add Project</button>
            </div>
          )}

          <div className="items-list">
            {profileData.projects.map((project, index) => (
              <div key={index} className="item-card">
                <div className="item-content">
                  <h3>{project.title}</h3>
                  <p>Technologies: {project.technologies}</p>
                  <p>{project.description}</p>
                  {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>}
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeProject(index)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="edit-section">
          <div className="section-header">
            <h2>Skills</h2>
            <button
              className="add-btn"
              onClick={() => setShowAddSkill(!showAddSkill)}
            >
              <FaPlus /> Add Skill
            </button>
          </div>

          {showAddSkill && (
            <div className="add-form">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Skill name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                />
                <select
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill({...newSkill, proficiency: e.target.value})}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <button onClick={addSkill} className="save-item-btn">Add Skill</button>
            </div>
          )}

          <div className="skills-list">
            {profileData.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill.name} - {skill.proficiency}
                <button
                  className="remove-skill-btn"
                  onClick={() => removeSkill(index)}
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditProfile;
