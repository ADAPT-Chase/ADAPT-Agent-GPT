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
    return <div>Loading dashboard statistics...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Tasks</h3>
          <p>Total: {stats.totalTasks}</p>
          <p>Completed: {stats.completedTasks}</p>
          <p>Pending: {stats.pendingTasks}</p>
        </div>
        <div className="stat-card">
          <h3>AgentGPT Requests</h3>
          <p>Analysis: {stats.analysisRequests}</p>
          <p>Code Generation: {stats.codeGenerationRequests}</p>
          <p>Question Answering: {stats.questionAnsweringRequests}</p>
        </div>
      </div>
      <button onClick={fetchDashboardStats}>Refresh Stats</button>
    </div>
  );
}

export default Dashboard;