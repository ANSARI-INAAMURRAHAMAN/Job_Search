import React, { memo } from "react";
import { FaUserPlus } from "react-icons/fa";
import { MdFindInPage } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import "./HowItWorks.css";

const StepCard = memo(({ icon, title, description, step, index }) => (
  <div className="step-card" style={{ animationDelay: `${index * 0.2}s` }}>
    <div className="step-number">{step}</div>
    <div className="step-icon">{icon}</div>
    <h3 className="step-title">{title}</h3>
    <p className="step-description">{description}</p>
  </div>
));

const HowItWorks = memo(() => {
  const steps = [
    {
      icon: <FaUserPlus />,
      title: "Create Account",
      description:
        "Sign up in minutes and build your professional profile to get started on your career journey.",
    },
    {
      icon: <MdFindInPage />,
      title: "Find or Post Jobs",
      description:
        "Browse thousands of opportunities or post your job requirements to find the perfect match.",
    },
    {
      icon: <IoMdSend />,
      title: "Apply & Connect",
      description:
        "Apply to jobs with one click or connect with suitable candidates for your business needs.",
    },
  ];

  return (
    <section className="how-it-works-section">
      <div className="section-container">
        <h2 className="section-title">How CareerConnect Works</h2>
        <div className="steps-container">
          {steps.map((step, index) => (
            <StepCard
              key={step.title}
              {...step}
              step={index + 1}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

export default HowItWorks;
