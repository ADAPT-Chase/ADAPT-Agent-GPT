import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavBar({ onLogout }) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">ADAPT-Agent-GPT</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/agent" className={location.pathname === '/agent' ? 'active' : ''}>
          Agent Interface
        </Link>
        <Link to="/tasks" className={location.pathname === '/tasks' ? 'active' : ''}>
          Task Manager
        </Link>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
}

export default NavBar;