import React, { memo } from "react";
import {
  MdOutlineDesignServices,
  MdOutlineWebhook,
  MdAccountBalance,
  MdOutlineAnimation,
} from "react-icons/md";
import { TbAppsFilled } from "react-icons/tb";
import { FaReact } from "react-icons/fa";
import { GiArtificialIntelligence } from "react-icons/gi";
import { IoGameController } from "react-icons/io5";
import "./PopularCategories.css";

const CategoryCard = memo(({ title, subTitle, icon, index }) => (
  <div className="category-card" style={{ animationDelay: `${index * 0.1}s` }}>
    <div className="category-icon">{icon}</div>
    <div className="category-content">
      <h3>{title}</h3>
      <p>{subTitle}</p>
    </div>
  </div>
));

const PopularCategories = memo(() => {
  const categories = [
    {
      title: "Graphics & Design",
      subTitle: "305 Open Positions",
      icon: <MdOutlineDesignServices />,
    },
    {
      title: "Mobile App Development",
      subTitle: "500 Open Positions",
      icon: <TbAppsFilled />,
    },
    {
      title: "Frontend Web Development",
      subTitle: "200 Open Positions",
      icon: <MdOutlineWebhook />,
    },
    {
      title: "MERN Stack Development",
      subTitle: "1000+ Open Positions",
      icon: <FaReact />,
    },
    {
      title: "Account & Finance",
      subTitle: "150 Open Positions",
      icon: <MdAccountBalance />,
    },
    {
      title: "Artificial Intelligence",
      subTitle: "867 Open Positions",
      icon: <GiArtificialIntelligence />,
    },
    {
      title: "Video Animation",
      subTitle: "50 Open Positions",
      icon: <MdOutlineAnimation />,
    },
    {
      title: "Game Development",
      subTitle: "80 Open Positions",
      icon: <IoGameController />,
    },
  ];

  return (
    <section className="categories-section">
      <div className="section-container">
        <h2 className="section-title">Popular Categories</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <CategoryCard key={category.title} {...category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default PopularCategories;
