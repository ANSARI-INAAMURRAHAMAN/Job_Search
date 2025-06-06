import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaGraduationCap, 
  FaCode, 
  FaTools, 
  FaFileAlt,
  FaGlobe,
  FaGithub,
  FaComments
} from "react-icons/fa";
import API_BASE_URL from "../../config/api";
import "./ApplicantProfile.css";

const ApplicantProfile = () => {
  const { applicationId } = useParams();
  const { isAuthorized, user } = useContext(Context);
  const [application, setApplication] = useState(null);
  const [applicantProfile, setApplicantProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        console.log("Fetching application with ID:", applicationId);
        
        const { data } = await axios.get(
          `${API_BASE_URL}/application/${applicationId}`,
          { withCredentials: true }
        );
        
        console.log("Application response:", data);
        console.log("Applicant from application:", data.application?.applicantID);
        
        setApplication(data.application);
        
        // The applicant data should already include full profile from population
        if (data.application && data.application.applicantID) {
          setApplicantProfile(data.application.applicantID);
          
          // Log to check if education, experience, projects are there
          console.log("Education data:", data.application.applicantID.education);
          console.log("Experience data:", data.application.applicantID.experience);
          console.log("Projects data:", data.application.applicantID.projects);
          console.log("Skills data:", data.application.applicantID.skills);
        }
      } catch (error) {
        console.error("Error fetching application:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        
        if (error.response?.status === 404) {
          toast.error("Application not found");
        } else if (error.response?.status === 403) {
          toast.error("Not authorized to view this application");
        } else {
          toast.error("Failed to fetch application details");
        }
        
        navigateTo("/applications/me");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized && user?.role === "Employer") {
      fetchApplicationDetails();
    } else {
      navigateTo("/login");
    }
  }, [applicationId, isAuthorized, user, navigateTo]);

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const updateApplicationStatus = async (status) => {
    try {
      console.log("Updating application status to:", status);
      console.log("Application ID:", applicationId);
      
      const { data } = await axios.put(
        `${API_BASE_URL}/application/update/${applicationId}`,
        { status },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log("Status update response:", data);
      setApplication(prev => ({ ...prev, status }));
      toast.success(`Application ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error updating status:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Better job title extraction with null checks
  const getJobTitle = () => {
    if (!application) return "Job Title Not Available";
    
    // Check direct properties first
    if (application.jobTitle) return application.jobTitle;
    if (application.title) return application.title;
    
    // Check nested jobInfo
    if (application.jobInfo) {
      if (application.jobInfo.jobTitle) return application.jobInfo.jobTitle;
      if (application.jobInfo.title) return application.jobInfo.title;
    }
    
    return "Job Title Not Available";
  };

  const getCompanyName = () => {
    if (!application) return "Company Not Available";
    
    // Check direct properties first
    if (application.companyName) return application.companyName;
    
    // Check nested jobInfo
    if (application.jobInfo) {
      if (application.jobInfo.companyName) return application.jobInfo.companyName;
      if (application.jobInfo.company) return application.jobInfo.company;
    }
    
    // Check employerID if populated
    if (application.employerID && typeof application.employerID === 'object') {
      if (application.employerID.companyName) return application.employerID.companyName;
      if (application.employerID.company) return application.employerID.company;
    }
    
    return "Company Not Available";
  };

  if (loading) {
    return <div className="loading">Loading applicant profile...</div>;
  }

  if (!application || !applicantProfile) {
    return <div className="error">Application or applicant profile not found</div>;
  }

  const jobTitle = getJobTitle();
  const companyName = getCompanyName();
  const applicationDate = application?.dateOfApplication || application?.createdAt;

  console.log("Extracted job title:", jobTitle);
  console.log("Extracted company name:", companyName);
  console.log("Applicant profile data:", applicantProfile);

  return (
    <section className="applicant-profile">
      <div className="container">
        <div className="profile-header">
          <div className="applicant-info">
            <h1>{applicantProfile?.name || "Applicant Name"}</h1>
            <p className="role">{applicantProfile?.role || "Job Seeker"}</p>
            <div className="contact-info">
              <span><FaEnvelope /> {applicantProfile?.email || "Email not provided"}</span>
              <span><FaPhone /> {applicantProfile?.phone || "Phone not provided"}</span>
              {applicantProfile?.location && (applicantProfile.location.city || applicantProfile.location.country) && (
                <span><FaMapMarkerAlt /> {applicantProfile.location.city}{applicantProfile.location.city && applicantProfile.location.country && ", "}{applicantProfile.location.country}</span>
              )}
            </div>
          </div>
          <div className="application-status">
            <span className={`status ${application?.status?.toLowerCase() || 'pending'}`}>
              {application?.status || "Pending"}
            </span>
          </div>
        </div>

        <div className="profile-content">
          {/* Application Details */}
          <div className="section">
            <h2>Application Information</h2>
            <div className="application-details">
              <div className="detail-item">
                <label>Applied For:</label>
                <span>{jobTitle}</span>
              </div>
              <div className="detail-item">
                <label>Company:</label>
                <span>{companyName}</span>
              </div>
              <div className="detail-item">
                <label>Application Date:</label>
                <span>{applicationDate ? new Date(applicationDate).toLocaleString() : "Date not available"}</span>
              </div>
              <div className="detail-item">
                <label>Current Status:</label>
                <span className={`status ${application?.status?.toLowerCase() || 'pending'}`}>
                  {application?.status || "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          {application?.coverLetter && (
            <div className="section">
              <h2>Cover Letter</h2>
              <div className="cover-letter">
                <p>{application.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Resume */}
          {application?.resume && (
            <div className="section">
              <h2>Resume</h2>
              <div className="resume-section">
                <a 
                  href={application.resume.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resume-link"
                >
                  <FaFileAlt />
                  View Full Resume
                </a>
              </div>
            </div>
          )}

          {/* Bio Section */}
          {applicantProfile?.bio && (
            <div className="section">
              <h2>About</h2>
              <p className="bio">{applicantProfile.bio}</p>
            </div>
          )}

          {/* Work Experience */}
          <div className="section">
            <h2><FaBriefcase /> Work Experience</h2>
            {applicantProfile?.experience && applicantProfile.experience.length > 0 ? (
              <div className="experience-list">
                {applicantProfile.experience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-header">
                      <h3>{exp?.jobTitle || "Job Title"}</h3>
                      <span className="duration">
                        {formatDate(exp?.startDate)} - {exp?.isCurrentJob ? "Present" : formatDate(exp?.endDate)}
                      </span>
                    </div>
                    <p className="company">{exp?.company || "Company"}{exp?.location && ` • ${exp.location}`}</p>
                    {exp?.description && <p className="description">{exp.description}</p>}
                    {exp?.skills && exp.skills.length > 0 && (
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
              <p className="no-data">No work experience provided</p>
            )}
          </div>

          {/* Education */}
          <div className="section">
            <h2><FaGraduationCap /> Education</h2>
            {applicantProfile?.education && applicantProfile.education.length > 0 ? (
              <div className="education-list">
                {applicantProfile.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="education-header">
                      <h3>{edu?.degree || "Degree"}</h3>
                      <span className="duration">
                        {formatDate(edu?.startDate)} - {formatDate(edu?.endDate)}
                      </span>
                    </div>
                    <p className="institution">{edu?.institution || "Institution"}</p>
                    {edu?.fieldOfStudy && <p className="field">Field: {edu.fieldOfStudy}</p>}
                    {edu?.grade && <p className="grade">Grade: {edu.grade}</p>}
                    {edu?.description && <p className="description">{edu.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No education details provided</p>
            )}
          </div>

          {/* Projects */}
          <div className="section">
            <h2><FaCode /> Projects</h2>
            {applicantProfile?.projects && applicantProfile.projects.length > 0 ? (
              <div className="projects-grid">
                {applicantProfile.projects.map((project, index) => (
                  <div key={index} className="project-card">
                    <div className="project-header">
                      <h3>{project?.title || "Project Title"}</h3>
                      {project?.status && (
                        <span className={`project-status ${project.status?.toLowerCase().replace(' ', '-')}`}>
                          {project.status}
                        </span>
                      )}
                    </div>
                    {project?.description && <p className="description">{project.description}</p>}
                    {(project?.startDate || project?.endDate) && (
                      <div className="project-duration">
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </div>
                    )}
                    {project?.technologies && project.technologies.length > 0 && (
                      <div className="tech-tags">
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                    <div className="project-links">
                      {project?.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                          <FaGlobe /> Live Demo
                        </a>
                      )}
                      {project?.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <FaGithub /> Source Code
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No projects provided</p>
            )}
          </div>

          {/* Skills */}
          <div className="section">
            <h2><FaTools /> Skills</h2>
            {applicantProfile?.skills && applicantProfile.skills.length > 0 ? (
              <div className="skills-grid">
                {applicantProfile.skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <span className="skill-name">{skill?.name || "Skill"}</span>
                    <span className={`skill-level ${skill?.level?.toLowerCase() || 'intermediate'}`}>
                      {skill?.level || "Intermediate"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No skills provided</p>
            )}
          </div>

          {/* Application Actions */}
          <div className="section">
            <h2>Application Actions</h2>
            <div className="action-buttons">
              <button 
                onClick={() => navigateTo(`/chat/${applicationId}`)}
                className="chat-btn"
              >
                <FaComments />
                Chat with Employer
              </button>
              <button 
                onClick={() => updateApplicationStatus('Accepted')}
                className="accept-btn"
                disabled={application?.status === 'Accepted'}
              >
                Accept Application
              </button>
              <button 
                onClick={() => updateApplicationStatus('Rejected')}
                className="reject-btn"
                disabled={application?.status === 'Rejected'}
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplicantProfile;