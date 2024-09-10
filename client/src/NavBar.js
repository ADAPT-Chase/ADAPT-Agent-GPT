import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar({ isAuthenticated, onLogout, user }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">ADAPT-Agent-GPT</div>
      <ul className="navbar-nav">
        {isAuthenticated ? (
          <>
            <li className="nav-item">
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link to="/tasks">Tasks</Link>
            </li>
            <li className="nav-item">
              <Link to="/profile">Profile</Link>
            </li>
            <li className="nav-item">
              <span className="user-info">Welcome, {user?.username}</span>
            </li>
            <li className="nav-item">
              <button onClick={onLogout} className="logout-button">Logout</button>
            </li>
          </>
        ) : (
          <li className="nav-item">
            <Link to="/">Login / Register</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;