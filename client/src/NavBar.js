import React from 'react';
import { Link } from 'react-router-dom';

function NavBar({ isAuthenticated, onLogout }) {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/agent">Agent Interface</Link></li>
        <li><Link to="/tasks">Task Manager</Link></li>
        {isAuthenticated ? (
          <li><button onClick={onLogout}>Logout</button></li>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;