import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  FaEdit, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaGraduationCap, 
  FaCode, 
  FaTools, 
  FaPlus,
  FaCalendarAlt,
  FaBuilding,
  FaGlobe,
  FaGithub
} from "react-icons/fa";
import API_BASE_URL from "../../config/api";
import "./UserProfile.css";

const UserProfile = () => {
  const { isAuthorized, user, setUser } = useContext(Context);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
      return;
    }

    fetchProfile();
  }, [isAuthorized, navigateTo]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/user/getuser`,
        { withCredentials: true }
      );
      console.log("Profile data fetched:", data.user);
      setProfile(data.user);
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getMemberSince = () => {
    if (!profile?.createdAt) return "Recently";
    return new Date(profile.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <h2>Profile not found</h2>
        <button onClick={() => navigateTo("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-info">
            <h1>{profile.name || "User Name"}</h1>
            <p className="role">{profile.role || "User"}</p>
            <p className="member-since">Member since {getMemberSince()}</p>
          </div>
          <button 
            onClick={() => navigateTo("/profile/edit")} 
            className="edit-btn"
          >
            <FaEdit />
            Edit Profile
          </button>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Basic Information */}
          <div className="section">
            <h2><FaEnvelope /> Contact Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <div className="icon">
                  <FaEnvelope />
                </div>
                <div>
                  <label>Email</label>
                  <p>{profile.email || "Not provided"}</p>
                </div>
              </div>
              <div className="info-item">
                <div className="icon">
                  <FaPhone />
                </div>
                <div>
                  <label>Phone</label>
                  <p>{profile.phone || "Not provided"}</p>
                </div>
              </div>
              {profile.location && (profile.location.city || profile.location.country) && (
                <div className="info-item">
                  <div className="icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <label>Location</label>
                    <p>
                      {profile.location.city}
                      {profile.location.city && profile.location.country && ", "}
                      {profile.location.country}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="section">
              <h2>About</h2>
              <div className="bio">
                {profile.bio}
              </div>
            </div>
          )}

          {/* Work Experience */}
          <div className="section">
            <h2><FaBriefcase /> Work Experience</h2>
            {profile.experience && profile.experience.length > 0 ? (
              <div className="experience-list">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-header">
                      <h3>{exp.jobTitle || "Job Title"}</h3>
                      <span className="duration">
                        <FaCalendarAlt />
                        {formatDate(exp.startDate)} - {exp.isCurrentJob ? "Present" : formatDate(exp.endDate)}
                      </span>
                    </div>
                    <p className="company">
                      <FaBuilding />
                      {exp.company || "Company"}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                    {exp.description && (
                      <p className="description">{exp.description}</p>
                    )}
                    {exp.skills && exp.skills.length > 0 && (
                      <div className="skills-tags">
                        {exp.skills.map((skill, skillIndex) => (
                          <span key={skillIndex} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section">
                <FaBriefcase size={40} />
                <p>No work experience added yet</p>
                <button onClick={() => navigateTo("/profile/edit")} className="add-btn">
                  <FaPlus /> Add Experience
                </button>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="section">
            <h2><FaGraduationCap /> Education</h2>
            {profile.education && profile.education.length > 0 ? (
              <div className="education-list">
                {profile.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="education-header">
                      <h3>{edu.degree || "Degree"}</h3>
                      <span className="duration">
                        <FaCalendarAlt />
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </span>
                    </div>
                    <p className="institution">
                      <FaBuilding />
                      {edu.institution || "Institution"}
                    </p>
                    {edu.fieldOfStudy && (
                      <p className="field">Field: {edu.fieldOfStudy}</p>
                    )}
                    {edu.grade && (
                      <p className="grade">Grade: {edu.grade}</p>
                    )}
                    {edu.description && (
                      <p className="description">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section">
                <FaGraduationCap size={40} />
                <p>No education details added yet</p>
                <button onClick={() => navigateTo("/profile/edit")} className="add-btn">
                  <FaPlus /> Add Education
                </button>
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="section">
            <h2><FaCode /> Projects</h2>
            {profile.projects && profile.projects.length > 0 ? (
              <div className="projects-grid">
                {profile.projects.map((project, index) => (
                  <div key={index} className="project-card">
                    <div className="project-header">
                      <h3>{project.title || "Project Title"}</h3>
                      {project.status && (
                        <span className={`project-status ${project.status.toLowerCase().replace(' ', '-')}`}>
                          {project.status}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="description">{project.description}</p>
                    )}
                    {(project.startDate || project.endDate) && (
                      <div className="project-duration">
                        <FaCalendarAlt />
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </div>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="tech-tags">
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                    <div className="project-links">
                      {project.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                          <FaGlobe /> Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <FaGithub /> Source Code
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section">
                <FaCode size={40} />
                <p>No projects added yet</p>
                <button onClick={() => navigateTo("/profile/edit")} className="add-btn">
                  <FaPlus /> Add Project
                </button>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="section">
            <h2><FaTools /> Skills</h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="skills-grid">
                {profile.skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <span className="skill-name">{skill.name || "Skill"}</span>
                    <span className={`skill-level ${skill.level?.toLowerCase()}`}>
                      {skill.level || "Intermediate"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section">
                <FaTools size={40} />
                <p>No skills added yet</p>
                <button onClick={() => navigateTo("/profile/edit")} className="add-btn">
                  <FaPlus /> Add Skills
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;