import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>ADAPT Unified Platform</h4>
          <p>Empowering AI-driven solutions for your projects</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/agent">Agent Interface</Link></li>
            <li><Link to="/projects">Projects</Link></li>
            <li><Link to="/knowledge">Knowledge Base</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: support@adapt-platform.com</p>
          <p>Phone: (123) 456-7890</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ADAPT Unified Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;