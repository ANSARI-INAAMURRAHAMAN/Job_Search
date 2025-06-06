import React, { useContext, useState, useCallback, memo } from "react";
import { Context } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";
import { FaSignOutAlt, FaUser, FaComments } from "react-icons/fa";
import API_BASE_URL from "../../config/api";
import "./Navbar.css";

const Navbar = memo(() => {
  const [show, setShow] = useState(false);
  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      console.log("Logging out user...");

      // Call logout endpoint
      await axios.get(`${API_BASE_URL}/user/logout`, {
        withCredentials: true
      });

      // Clear local storage
      localStorage.removeItem("authToken");

      // Clear any cookies
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.onrender.com;";
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Update state
      setIsAuthorized(false);
      setUser({});

      toast.success("Logged out successfully");
      navigateTo("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout request fails, clear local state
      localStorage.removeItem("authToken");
      setIsAuthorized(false);
      setUser({});
      toast.success("Logged out successfully");
      navigateTo("/");
    }
  }, [setIsAuthorized, setUser, navigateTo]);

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
    { to: "/messages", label: "Messages", icon: <FaComments /> },
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