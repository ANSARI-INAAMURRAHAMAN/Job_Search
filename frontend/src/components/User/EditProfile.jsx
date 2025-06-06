import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  FaSave, 
  FaPlus, 
  FaTrash, 
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from "react-icons/fa";
import API_BASE_URL from "../../config/api";
import "./EditProfile.css";

const EditProfile = () => {
  const { isAuthorized, user, setUser } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: {
      city: "",
      country: ""
    }
  });
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
      return;
    }

    // Populate form with existing user data
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: {
          city: user.location?.city || "",
          country: user.location?.country || ""
        }
      });
      setSkills(user.skills || []);
      setEducation(user.education || []);
      setExperience(user.experience || []);
      setProjects(user.projects || []);
    }
  }, [isAuthorized, user, navigateTo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Sending update request with data:", {
        ...formData,
        skills,
        education,
        experience,
        projects
      });

      const updateData = {
        ...formData,
        skills,
        education,
        experience,
        projects
      };

      const { data } = await axios.put(
        `${API_BASE_URL}/user/update`,
        updateData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("Update response:", data);
      setUser(data.user);
      toast.success("Profile updated successfully!");
      navigateTo("/profile");
    } catch (error) {
      console.error("Update error:", error);
      console.error("Error response:", error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error("Update endpoint not found. Please check the server.");
      } else {
        toast.error(error.response?.data?.message || "Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  // Skill management
  const addSkill = () => {
    setSkills([...skills, { name: "", level: "Intermediate", category: "Other" }]);
  };

  const updateSkill = (index, field, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index][field] = value;
    setSkills(updatedSkills);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Education management
  const addEducation = () => {
    setEducation([...education, {
      degree: "",
      institution: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      grade: "",
      description: ""
    }]);
  };

  const updateEducation = (index, field, value) => {
    const updatedEducation = [...education];
    updatedEducation[index][field] = value;
    setEducation(updatedEducation);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Experience management
  const addExperience = () => {
    setExperience([...experience, {
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrentJob: false,
      description: "",
      skills: []
    }]);
  };

  const updateExperience = (index, field, value) => {
    const updatedExperience = [...experience];
    updatedExperience[index][field] = value;
    setExperience(updatedExperience);
  };

  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Project management
  const addProject = () => {
    setProjects([...projects, {
      title: "",
      description: "",
      technologies: [],
      startDate: "",
      endDate: "",
      projectUrl: "",
      githubUrl: "",
      status: "Completed"
    }]);
  };

  const updateProject = (index, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="edit-profile-page">
      <div className="container">
        <div className="edit-header">
          <button onClick={() => navigateTo("/profile")} className="back-btn">
            <FaArrowLeft />
            Back to Profile
          </button>
          <h1>Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {/* Basic Information */}
          <div className="section">
            <h2><FaUser /> Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="section">
            <div className="section-header">
              <h2>Skills</h2>
              <button type="button" onClick={addSkill} className="add-btn">
                <FaPlus /> Add Skill
              </button>
            </div>
            {skills.map((skill, index) => (
              <div key={index} className="item-card">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Skill Name</label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      placeholder="e.g., JavaScript, React"
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
                </div>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="remove-btn"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="section">
            <div className="section-header">
              <h2>Education</h2>
              <button type="button" onClick={addEducation} className="add-btn">
                <FaPlus /> Add Education
              </button>
            </div>
            {education.map((edu, index) => (
              <div key={index} className="item-card">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="e.g., Bachelor of Science"
                    />
                  </div>
                  <div className="form-group">
                    <label>Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      placeholder="University/College name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={edu.startDate?.split('T')[0] || ''}
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={edu.endDate?.split('T')[0] || ''}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Grade/GPA</label>
                    <input
                      type="text"
                      value={edu.grade}
                      onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                      placeholder="e.g., 3.8/4.0"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={edu.description}
                      onChange={(e) => updateEducation(index, 'description', e.target.value)}
                      rows="3"
                      placeholder="Relevant coursework, achievements..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="remove-btn"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="section">
            <div className="section-header">
              <h2>Work Experience</h2>
              <button type="button" onClick={addExperience} className="add-btn">
                <FaPlus /> Add Experience
              </button>
            </div>
            {experience.map((exp, index) => (
              <div key={index} className="item-card">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                      placeholder="e.g., Software Developer"
                    />
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={exp.startDate?.split('T')[0] || ''}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={exp.endDate?.split('T')[0] || ''}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      disabled={exp.isCurrentJob}
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exp.isCurrentJob}
                        onChange={(e) => updateExperience(index, 'isCurrentJob', e.target.checked)}
                      />
                      Currently working here
                    </label>
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      rows="3"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="remove-btn"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="section">
            <div className="section-header">
              <h2>Projects</h2>
              <button type="button" onClick={addProject} className="add-btn">
                <FaPlus /> Add Project
              </button>
            </div>
            {projects.map((project, index) => (
              <div key={index} className="item-card">
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
                      value={project.startDate?.split('T')[0] || ''}
                      onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={project.endDate?.split('T')[0] || ''}
                      onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Project URL</label>
                    <input
                      type="url"
                      value={project.projectUrl}
                      onChange={(e) => updateProject(index, 'projectUrl', e.target.value)}
                      placeholder="https://example.com"
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
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      rows="3"
                      placeholder="Describe the project and your role..."
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Technologies (comma-separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(project.technologies) ? project.technologies.join(', ') : ''}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="remove-btn"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;