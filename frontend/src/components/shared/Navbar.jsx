import React, { useState } from "react";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaGraduationCap, FaFileAlt, FaEdit, FaDownload } from "react-icons/fa";
import { Link } from "react-router-dom";
import ResumeModal from "../Application/ResumeModal";
import "./UserProfile.css";

const UserProfile = () => {
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  // Mock user data - replace with actual user data from context/API
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, City, State 12345",
    college: "University of Technology",
    degree: "Bachelor of Computer Science",
    graduationYear: "2023",
    skills: ["C++", "Python", "JavaScript", "DSA", "Operating Systems", "DBMS", "React", "Node.js"],
    resumeUrl: "/path/to/resume.pdf",
    resumeImageUrl: "/path/to/resume-preview.jpg",
    bio: "Passionate software developer with experience in full-stack development and problem-solving.",
    experience: [
      {
        company: "Tech Corp",
        position: "Software Developer Intern",
        duration: "June 2023 - Aug 2023",
        description: "Developed web applications using React and Node.js"
      }
    ]
  };

  const handleResumeView = () => {
    setShowResumeModal(true);
  };

  const handleResumeDownload = () => {
    // Implement resume download logic
    const link = document.createElement('a');
    link.href = userData.resumeUrl;
    link.download = `${userData.name}_Resume.pdf`;
    link.click();
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
          <Link to="/edit-profile" className="edit-profile-btn">
            <FaEdit /> Edit Profile
          </Link>
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
          <h2 className="section-title">Skills</h2>
          <div className="skills-container">
            {userData.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Resume</h2>
          <div className="resume-section">
            <div className="resume-actions">
              <button className="resume-btn view-btn" onClick={handleResumeView}>
                <FaFileAlt /> View Resume
              </button>
              <button className="resume-btn download-btn" onClick={handleResumeDownload}>
                <FaDownload /> Download Resume
              </button>
            </div>
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

      {showResumeModal && (
        <ResumeModal
          imageUrl={userData.resumeImageUrl}
          onClose={() => setShowResumeModal(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;