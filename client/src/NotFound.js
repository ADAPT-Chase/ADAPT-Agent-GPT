import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <img src="/404-image.png" alt="404 Error" className="not-found-image" />
      <p>Here are some helpful links:</p>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/projects">Projects</Link></li>
        <li><Link to="/knowledge">Knowledge Base</Link></li>
      </ul>
    </div>
  );
};

export default NotFound;