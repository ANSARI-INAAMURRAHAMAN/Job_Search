import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaGraduationCap, FaFileAlt, FaEdit, FaDownload, FaPlus, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserProfile.css";

const UserProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState({ name: "", proficiency: "Intermediate" });
  const [showAddSkill, setShowAddSkill] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/user-profile", {
        withCredentials: true
      });
      if (res.data.success) {
        setProfileData(res.data.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Create a default profile structure if API fails
      setProfileData({
        userId: { name: "User", email: "" },
        bio: "",
        phone: "",
        address: null,
        education: [],
        skills: [],
        experience: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) {
      alert("Please enter a skill name");
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/api/v1/user-profile/skills", newSkill, {
        withCredentials: true
      });
      if (res.data.success) {
        setProfileData(prev => ({
          ...prev,
          skills: res.data.skills
        }));
        setNewSkill({ name: "", proficiency: "Intermediate" });
        setShowAddSkill(false);
        alert("Skill added successfully");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const res = await axios.delete(`http://localhost:4000/api/v1/user-profile/skills/${skillId}`, {
        withCredentials: true
      });
      if (res.data.success) {
        setProfileData(prev => ({
          ...prev,
          skills: res.data.skills
        }));
        alert("Skill removed successfully");
      }
    } catch (error) {
      alert("Failed to remove skill");
    }
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!profileData) {
    return <div className="error-message">Failed to load profile</div>;
  }

  const userData = {
    name: profileData.userId?.name || profileData.userId?.fullname || "User",
    email: profileData.userId?.email || "",
    phone: profileData.phone || "Not provided",
    address: profileData.address ? 
      `${profileData.address.street || ""}, ${profileData.address.city || ""}, ${profileData.address.state || ""} ${profileData.address.zipCode || ""}`.trim() 
      : "Not provided",
    college: profileData.education?.[0]?.college || "Not provided",
    degree: profileData.education?.[0]?.degree || "Not provided",
    graduationYear: profileData.education?.[0]?.graduationYear || "Not provided",
    skills: profileData.skills || [],
    bio: profileData.bio || "No bio available",
    experience: profileData.experience || [],
    projects: profileData.projects || []
  };

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser size={80} />
        </div>
        <div className="profile-basic-info">
          <h1 className="profile-name">{userData.name}</h1>
          <p className="profile-bio">{userData.bio}</p>
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Contact Information</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>{userData.email}</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>{userData.address}</span>
            </div>
            <div className="contact-item">
              <span>📞</span>
              <span>{userData.phone}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Education</h2>
          <div className="education-info">
            <div className="education-item">
              <FaGraduationCap className="education-icon" />
              <div>
                <h3>{userData.degree}</h3>
                <p>{userData.college}</p>
                <span className="graduation-year">Graduated: {userData.graduationYear}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">
            Skills
            <button 
              className="add-skill-btn"
              onClick={() => setShowAddSkill(!showAddSkill)}
            >
              <FaPlus />
            </button>
          </h2>
          
          {showAddSkill && (
            <div className="add-skill-form">
              <input
                type="text"
                placeholder="Enter skill name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                className="skill-input"
              />
              <select
                value={newSkill.proficiency}
                onChange={(e) => setNewSkill({...newSkill, proficiency: e.target.value})}
                className="proficiency-select"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button onClick={handleAddSkill} className="save-skill-btn">Add</button>
            </div>
          )}
          
          <div className="skills-container">
            {userData.skills.map((skill, index) => (
              <span key={skill._id || index} className="skill-tag">
                {skill.name || skill}
                {skill._id && (
                  <button
                    className="remove-skill-btn"
                    onClick={() => handleRemoveSkill(skill._id)}
                  >
                    <FaTimes size={12} />
                  </button>
                )}
                {skill.proficiency && (
                  <span className="skill-proficiency">{skill.proficiency}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Projects</h2>
          <div className="projects-container">
            {userData.projects.map((project, index) => (
              <div key={index} className="project-item">
                <h3>{project.title}</h3>
                <p className="project-tech">Technologies: {project.technologies}</p>
                <p className="project-desc">{project.description}</p>
                <div className="project-links">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                </div>
                {project.startDate && (
                  <span className="project-duration">
                    {project.startDate} - {project.endDate || "Present"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Experience</h2>
          <div className="experience-container">
            {userData.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <h3>{exp.position}</h3>
                <h4>{exp.company}</h4>
                <span className="experience-duration">{exp.duration}</span>
                <p>{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
