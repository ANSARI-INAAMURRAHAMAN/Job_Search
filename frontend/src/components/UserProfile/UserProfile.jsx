import React, { useState, useContext, useEffect } from "react";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaGraduationCap, FaFileAlt, FaEdit, FaDownload } from "react-icons/fa";
import { Context } from "../../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./UserProfile.css";

const UserProfile = () => {
  const { isAuthorized, user, setUser } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // If not authorized, redirect to login
  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  // Fetch latest user data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/getuser`
        );
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [setUser]);

  const handleEditProfile = () => {
    setEditMode(!editMode);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser size={80} />
        </div>
        <div className="profile-basic-info">
          <h1 className="profile-name">{user.name || 'User Name'}</h1>
          <p className="profile-role">{user.role || 'Role'}</p>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            <FaEdit /> {editMode ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Contact Information</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>{user.email || 'Email not provided'}</span>
            </div>
            <div className="contact-item">
              <span>📞</span>
              <span>{user.phone || 'Phone not provided'}</span>
            </div>
            {user.location && (
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>{user.location.city || 'Location'}, {user.location.country || ''}</span>
              </div>
            )}
          </div>
        </div>

        {user.education && user.education.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title">Education</h2>
            <div className="education-info">
              {user.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <FaGraduationCap className="education-icon" />
                  <div>
                    <h3>{edu.degree || 'Degree'}</h3>
                    <p>{edu.institution || 'Institution'}</p>
                    {edu.fieldOfStudy && <p>Field: {edu.fieldOfStudy}</p>}
                    {edu.endDate && (
                      <span className="graduation-year">
                        Graduated: {new Date(edu.endDate).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {user.skills && user.skills.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title">Skills</h2>
            <div className="skills-container">
              {user.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill.name || skill} 
                  {skill.level && <small> ({skill.level})</small>}
                </span>
              ))}
            </div>
          </div>
        )}

        {user.experience && user.experience.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title">Experience</h2>
            <div className="experience-container">
              {user.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <h3>{exp.jobTitle || exp.position || 'Position'}</h3>
                  <h4>{exp.company || 'Company'}</h4>
                  {exp.startDate && exp.endDate && (
                    <span className="experience-duration">
                      {new Date(exp.startDate).toLocaleDateString()} - 
                      {exp.isCurrentJob ? ' Present' : new Date(exp.endDate).toLocaleDateString()}
                    </span>
                  )}
                  {exp.description && <p>{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {user.projects && user.projects.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title">Projects</h2>
            <div className="projects-container">
              {user.projects.map((project, index) => (
                <div key={index} className="project-item">
                  <h3>{project.title || 'Project Title'}</h3>
                  {project.description && <p>{project.description}</p>}
                  {project.technologies && (
                    <div className="project-tech">
                      <strong>Technologies: </strong>
                      {Array.isArray(project.technologies) 
                        ? project.technologies.join(', ')
                        : project.technologies
                      }
                    </div>
                  )}
                  {(project.projectUrl || project.githubUrl) && (
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
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
