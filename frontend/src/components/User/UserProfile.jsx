import React, { useContext, useEffect } from "react";
import { Context } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaCode, FaTools } from "react-icons/fa";
import "./UserProfile.css";

const UserProfile = () => {
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
      return;
    }
  }, [isAuthorized, navigateTo]);

  if (!isAuthorized || !user) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  console.log("User in profile component:", user);

  return (
    <div className="user-profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="role">{user.role}</p>
            <p className="member-since">Member since {formatDate(user.createdAt)}</p>
          </div>
          <div className="profile-actions">
            <Link to="/edit-profile" className="edit-btn">
              <FaEdit />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Basic Information */}
          <div className="section">
            <h2>Contact Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <FaEnvelope className="icon" />
                <div>
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="info-item">
                <FaPhone className="icon" />
                <div>
                  <label>Phone</label>
                  <p>{user.phone}</p>
                </div>
              </div>
              {user.location && (user.location.city || user.location.country) && (
                <div className="info-item">
                  <FaMapMarkerAlt className="icon" />
                  <div>
                    <label>Location</label>
                    <p>{user.location.city}{user.location.city && user.location.country && ", "}{user.location.country}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {user.bio && (
            <div className="section">
              <h2>About</h2>
              <p className="bio">{user.bio}</p>
            </div>
          )}

          {/* Work Experience */}
          <div className="section">
            <h2><FaBriefcase /> Work Experience</h2>
            {user.experience && user.experience.length > 0 ? (
              <div className="experience-list">
                {user.experience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <h3>{exp.jobTitle}</h3>
                    <p className="company">{exp.company} • {exp.location}</p>
                    <p className="duration">
                      {formatDate(exp.startDate)} - {exp.isCurrentJob ? "Present" : formatDate(exp.endDate)}
                    </p>
                    {exp.description && <p className="description">{exp.description}</p>}
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
                <p>No work experience added yet.</p>
                <Link to="/edit-profile" className="add-btn">Add Experience</Link>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="section">
            <h2><FaGraduationCap /> Education</h2>
            {user.education && user.education.length > 0 ? (
              <div className="education-list">
                {user.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <h3>{edu.degree}</h3>
                    <p className="institution">{edu.institution}</p>
                    {edu.fieldOfStudy && <p className="field">Field: {edu.fieldOfStudy}</p>}
                    <p className="duration">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                    {edu.grade && <p className="grade">Grade: {edu.grade}</p>}
                    {edu.description && <p className="description">{edu.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section">
                <p>No education details added yet.</p>
                <Link to="/edit-profile" className="add-btn">Add Education</Link>
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="section">
            <h2><FaCode /> Projects</h2>
            {user.projects && user.projects.length > 0 ? (
              <div className="projects-grid">
                {user.projects.map((project, index) => (
                  <div key={index} className="project-card">
                    <h3>{project.title}</h3>
                    {project.description && <p className="description">{project.description}</p>}
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
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section">
                <p>No projects added yet.</p>
                <Link to="/edit-profile" className="add-btn">Add Projects</Link>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="section">
            <h2><FaTools /> Skills</h2>
            {user.skills && user.skills.length > 0 ? (
              <div className="skills-grid">
                {user.skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <span className="skill-name">{skill.name}</span>
                    <span className={`skill-level ${skill.level?.toLowerCase()}`}>
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-section">
                <p>No skills added yet.</p>
                <Link to="/edit-profile" className="add-btn">Add Skills</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
