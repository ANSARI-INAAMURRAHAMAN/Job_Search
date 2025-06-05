import React, { memo } from "react";
import { FaMicrosoft, FaApple } from "react-icons/fa";
import { SiTesla } from "react-icons/si";
import "./PopularCompanies.css";

const CompanyCard = memo(({ title, location, openPositions, icon, index }) => (
  <div className="company-card" style={{ animationDelay: `${index * 0.1}s` }}>
    <div className="company-header">
      <div className="company-icon">{icon}</div>
      <div className="company-info">
        <h3>{title}</h3>
        <p>{location}</p>
      </div>
    </div>
    <div className="company-footer">
      <span className="positions-count">{openPositions}</span>
      <span className="positions-text">Open Positions</span>
    </div>
  </div>
));

const PopularCompanies = memo(() => {
  const companies = [
    {
      title: "Microsoft",
      location: "Millennium City Centre, Gurugram",
      openPositions: 10,
      icon: <FaMicrosoft />,
    },
    {
      title: "Tesla",
      location: "Millennium City Centre, Gurugram",
      openPositions: 5,
      icon: <SiTesla />,
    },
    {
      title: "Apple",
      location: "Millennium City Centre, Gurugram",
      openPositions: 20,
      icon: <FaApple />,
    },
  ];

  return (
    <section className="companies-section">
      <div className="section-container">
        <h2 className="section-title">Top Companies</h2>
        <div className="companies-grid">
          {companies.map((company, index) => (
            <CompanyCard key={company.title} {...company} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default PopularCompanies;
