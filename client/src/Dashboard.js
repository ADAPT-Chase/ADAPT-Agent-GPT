import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    analysisRequests: 0,
    codeGenerationRequests: 0,
    questionAnsweringRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to fetch dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard statistics...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Tasks Overview</h3>
          <div className="stat-item">
            <span className="stat-label">Total Tasks:</span>
            <span className="stat-value">{stats.totalTasks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed Tasks:</span>
            <span className="stat-value">{stats.completedTasks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending Tasks:</span>
            <span className="stat-value">{stats.pendingTasks}</span>
          </div>
        </div>
        <div className="stat-card">
          <h3>AgentGPT Requests</h3>
          <div className="stat-item">
            <span className="stat-label">Analysis:</span>
            <span className="stat-value">{stats.analysisRequests}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Code Generation:</span>
            <span className="stat-value">{stats.codeGenerationRequests}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Question Answering:</span>
            <span className="stat-value">{stats.questionAnsweringRequests}</span>
          </div>
        </div>
      </div>
      <button className="refresh-button" onClick={fetchDashboardStats}>Refresh Stats</button>
    </div>
  );
}

export default Dashboard;