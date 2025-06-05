import React, { useContext, useState, useCallback, memo } from "react";
import { Context } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import "./Navbar.css";

const Navbar = memo(() => {
  const [show, setShow] = useState(false);
  const { isAuthorized, setIsAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/user/logout",
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setIsAuthorized(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  }, [setIsAuthorized, navigateTo]);

  const toggleMenu = useCallback(() => setShow(prev => !prev), []);
  const closeMenu = useCallback(() => setShow(false), []);

  if (!isAuthorized) return null;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/job/getall", label: "Jobs" },
    {
      to: "/applications/me",
      label: user?.role === "Employer" ? "Applications" : "My Applications"
    },
    { to: "/profile", label: "Profile", icon: <FaUser /> },
    ...(user?.role === "Employer" ? [
      { to: "/job/post", label: "Post Job" },
      { to: "/job/me", label: "My Jobs" }
    ] : [])
  ];

  return (
    <nav className="modern-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <img src="/careerconnect-white.png" alt="CareerConnect" />
        </Link>

        <ul className={`nav-menu ${show ? "active" : ""}`}>
          {navLinks.map(({ to, label, icon }) => (
            <li key={to} className="nav-item">
              <Link to={to} className="nav-link" onClick={closeMenu}>
                {icon && <span className="nav-icon">{icon}</span>}
                {label}
              </Link>
            </li>
          ))}
          <li className="nav-item">
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </li>
        </ul>

        <button className="nav-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {show ? <AiOutlineClose /> : <GiHamburgerMenu />}
        </button>
      </div>
    </nav>
  );
});

export default Navbar;
