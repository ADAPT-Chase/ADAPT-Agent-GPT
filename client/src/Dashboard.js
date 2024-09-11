import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    knowledgeEntries: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome to ADAPT-Agent-GPT</h1>
      <p>This is your central dashboard for managing and interacting with the ADAPT-Agent-GPT system.</p>
      
      <div className="dashboard-stats">
        <h2>System Statistics</h2>
        <ul>
          <li>Total Projects: {stats.totalProjects}</li>
          <li>Total Tasks: {stats.totalTasks}</li>
          <li>Completed Tasks: {stats.completedTasks}</li>
          <li>Knowledge Base Entries: {stats.knowledgeEntries}</li>
        </ul>
      </div>

      <div className="dashboard-links">
        <Link to="/agent" className="dashboard-link">
          <h2>Agent Interface</h2>
          <p>Interact with the AI agent, ask questions, and get assistance.</p>
        </Link>
        <Link to="/tasks" className="dashboard-link">
          <h2>Task Manager</h2>
          <p>View and manage your ongoing tasks.</p>
        </Link>
        <Link to="/projects" className="dashboard-link">
          <h2>Project Manager</h2>
          <p>Create and manage your projects.</p>
        </Link>
        <Link to="/knowledge" className="dashboard-link">
          <h2>Knowledge Base</h2>
          <p>Access and manage the system's knowledge base.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;