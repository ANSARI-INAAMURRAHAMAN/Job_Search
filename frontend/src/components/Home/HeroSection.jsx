import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaSuitcase, FaUsers, FaUserPlus } from "react-icons/fa";
import "./HeroSection.css";

const StatCard = memo(({ title, subTitle, icon, index }) => (
  <div className="stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p>{subTitle}</p>
    </div>
  </div>
));

const HeroSection = memo(() => {
  const navigate = useNavigate();

  const stats = [
    { title: "1,23,441", subTitle: "Live Jobs", icon: <FaSuitcase /> },
    { title: "91,220", subTitle: "Companies", icon: <FaBuilding /> },
    { title: "2,34,200", subTitle: "Job Seekers", icon: <FaUsers /> },
    { title: "1,03,761", subTitle: "Employers", icon: <FaUserPlus /> },
  ];

  const handleStartJourney = () => {
    navigate("/job/getall");
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Find a job that suits your
              <span className="highlight"> interests and skills</span>
            </h1>
            <p className="hero-description">
              Discover job opportunities that match your skills and passions.
              Connect with employers seeking talent like yours for rewarding careers.
            </p>
            <button className="cta-button" onClick={handleStartJourney}>
              Start Your Journey
            </button>
          </div>
          <div className="hero-image">
            <img src="/heroS.jpg" alt="Career opportunities" />
          </div>
        </div>

        <div className="stats-section">
          {stats.map((stat, index) => (
            <StatCard key={stat.subTitle} {...stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default HeroSection;