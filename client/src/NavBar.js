import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">ADAPT-Agent-GPT</Link>
        <ul className="nav-menu">
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/agent" className="nav-link">Agent Interface</Link>
              </li>
              <li className="nav-item">
                <Link to="/tasks" className="nav-link">Task Manager</Link>
              </li>
              <li className="nav-item">
                <Link to="/projects" className="nav-link">Project Manager</Link>
              </li>
              <li className="nav-item">
                <Link to="/knowledge" className="nav-link">Knowledge Base</Link>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/auth" className="nav-link">Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;