import React, { memo, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./ResumeModal.css";

const ResumeModal = memo(({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="resume-modal-overlay" onClick={onClose}>
      <div className="resume-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="resume-image-container">
          <img src={imageUrl} alt="Resume" className="resume-image" />
        </div>
      </div>
    </div>
  );
});

export default ResumeModal;
