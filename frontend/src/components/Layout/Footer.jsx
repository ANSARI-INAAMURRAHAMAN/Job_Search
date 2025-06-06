import React, { useContext, memo } from 'react'
import { Context } from "../../main"
import { Link } from "react-router-dom"
import { FaGithub, FaLinkedin, FaHeart } from "react-icons/fa"
import { SiLeetcode } from "react-icons/si"
import { RiInstagramFill } from "react-icons/ri"
import "./Footer.css"

const Footer = memo(() => {
  const { isAuthorized } = useContext(Context)
  
  if (!isAuthorized) return null

  const socialLinks = [
    { href: 'https://github.com/ANSARI-INAAMURRAHAMAN', icon: FaGithub, label: 'GitHub' },
    { href: 'https://leetcode.com/u/2NAS3kgcle/', icon: SiLeetcode, label: 'LeetCode' },
    { href: 'https://www.linkedin.com/in/inaamurrahaman-ansari-aba512283/', icon: FaLinkedin, label: 'LinkedIn' },
    { href: 'https://www.instagram.com/inaam_ansari201/', icon: RiInstagramFill, label: 'Instagram' }
  ]

  return (
    <footer className="modern-footer">
      <div className="footer-content">
        <div className="footer-text">
          <span>Made with</span>
          <FaHeart className="heart-icon" />
          <span>by Inaam Ansari© 2024</span>
        </div>
        
        <div className="social-links">
          {socialLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              to={href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title={label}
            >
              <Icon />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
})

export default Footer