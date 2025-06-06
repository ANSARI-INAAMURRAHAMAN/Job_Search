import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import "./EditProfile.css";

const EditProfile = () => {
  const { isAuthorized, user, setUser } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const navigateTo = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: { city: "", country: "" },
    experience: [],
    education: [],
    skills: [],
    projects: []
  });

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
      return;
    }

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || { city: "", country: "" },
        experience: user.experience || [],
        education: user.education || [],
        skills: user.skills || [],
        projects: user.projects || []
      });
    }
  }, [isAuthorized, user, navigateTo]);

  const handleBasicChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  // Experience functions
  const addExperience = () => {
    const newExp = {
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrentJob: false,
      description: "",
      skills: []
    };
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  // Education functions
  const addEducation = () => {
    const newEdu = {
      degree: "",
      institution: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      grade: "",
      description: ""
    };
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Skills functions
  const addSkill = () => {
    const newSkill = {
      name: '',
      level: 'Intermediate',
      category: 'Other'
    };
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const updateSkill = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Projects functions
  const addProject = () => {
    const newProject = {
      title: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      projectUrl: '',
      githubUrl: '',
      status: 'Completed'
    };
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const updateProjectTechnologies = (projectIndex, techString) => {
    const techArray = techString.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    updateProject(projectIndex, 'technologies', techArray);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting form data:", formData);
      
      const { data } = await axios.put(
        "http://localhost:4000/api/v1/user/update-profile",
        formData,
        { withCredentials: true }
      );

      toast.success(data.message);
      setUser(data.user);
      navigateTo("/profile");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="edit-profile-page">
      <div className="container">
        <h1>Edit Profile</h1>
        
        <form onSubmit={handleSubmit} className="profile-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleBasicChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleBasicChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleBasicChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleBasicChange('bio', e.target.value)}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h2>Location</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={formData.location.country}
                  onChange={(e) => handleLocationChange('country', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="form-section">
            <div className="section-header">
              <h2>Work Experience</h2>
              <button type="button" onClick={addExperience} className="add-btn">
                <FaPlus /> Add Experience
              </button>
            </div>
            {formData.experience.map((exp, index) => (
              <div key={index} className="form-item">
                <div className="item-header">
                  <h3>Experience {index + 1}</h3>
                  <button 
                    type="button" 
                    onClick={() => removeExperience(index)}
                    className="remove-btn"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      disabled={exp.isCurrentJob}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={exp.isCurrentJob}
                        onChange={(e) => updateExperience(index, 'isCurrentJob', e.target.checked)}
                      />
                      Currently working here
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="form-section">
            <div className="section-header">
              <h2>Education</h2>
              <button type="button" onClick={addEducation} className="add-btn">
                <FaPlus /> Add Education
              </button>
            </div>
            {formData.education.map((edu, index) => (
              <div key={index} className="form-item">
                <div className="item-header">
                  <h3>Education {index + 1}</h3>
                  <button 
                    type="button" 
                    onClick={() => removeEducation(index)}
                    className="remove-btn"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Grade</label>
                    <input
                      type="text"
                      value={edu.grade}
                      onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="form-section">
            <div className="section-header">
              <h2>Skills</h2>
              <button type="button" onClick={addSkill} className="add-btn">
                <FaPlus /> Add Skill
              </button>
            </div>
            <div className="skills-grid">
              {formData.skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="form-group">
                    <label>Skill Name</label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <select
                      value={skill.level}
                      onChange={(e) => updateSkill(index, 'level', e.target.value)}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={skill.category}
                      onChange={(e) => updateSkill(index, 'category', e.target.value)}
                    >
                      <option value="Programming">Programming</option>
                      <option value="Framework">Framework</option>
                      <option value="Database">Database</option>
                      <option value="Tool">Tool</option>
                      <option value="Soft Skill">Soft Skill</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeSkill(index)}
                    className="remove-btn-small"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="form-section">
            <div className="section-header">
              <h2>Projects</h2>
              <button type="button" onClick={addProject} className="add-btn">
                <FaPlus /> Add Project
              </button>
            </div>
            {formData.projects.map((project, index) => (
              <div key={index} className="form-item">
                <div className="item-header">
                  <h3>Project {index + 1}</h3>
                  <button 
                    type="button" 
                    onClick={() => removeProject(index)}
                    className="remove-btn"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Project Title</label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => updateProject(index, 'title', e.target.value)}
                      placeholder="e.g., E-commerce Website"
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={project.status}
                      onChange={(e) => updateProject(index, 'status', e.target.value)}
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={project.startDate}
                      onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={project.endDate}
                      onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Project URL</label>
                    <input
                      type="url"
                      value={project.projectUrl}
                      onChange={(e) => updateProject(index, 'projectUrl', e.target.value)}
                      placeholder="https://your-project.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>GitHub URL</label>
                    <input
                      type="url"
                      value={project.githubUrl}
                      onChange={(e) => updateProject(index, 'githubUrl', e.target.value)}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Project Description</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    rows="3"
                    placeholder="Describe your project, its features, and your role..."
                  />
                </div>
                <div className="form-group">
                  <label>Technologies Used (comma separated)</label>
                  <input
                    type="text"
                    value={project.technologies ? project.technologies.join(', ') : ''}
                    onChange={(e) => updateProjectTechnologies(index, e.target.value)}
                    placeholder="React, Node.js, MongoDB, Express"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="save-btn">
              <FaSave />
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
