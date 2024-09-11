import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    knowledgeEntries: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentKnowledge, setRecentKnowledge] = useState([]);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, projectsRes, tasksRes, knowledgeRes] = await Promise.all([
        axios.get(`${API_URL}/api/stats`, { headers }),
        axios.get(`${API_URL}/api/projects`, { headers }),
        axios.get(`${API_URL}/api/tasks/recent`, { headers }),
        axios.get(`${API_URL}/api/knowledge/recent`, { headers })
      ]);

      setStats(statsRes.data);
      setRecentProjects(projectsRes.data.slice(0, 5));
      setRecentTasks(tasksRes.data);
      setRecentKnowledge(knowledgeRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  const handleAiQuery = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/agent/query`, {
        query: aiQuery
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiResponse(response.data.response);
    } catch (err) {
      setError('Failed to process AI query');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h1>Welcome to ADAPT-Agent-GPT</h1>
      <p>Here's an overview of your recent activity:</p>

      <div className="dashboard-stats">
        <h2>System Statistics</h2>
        <ul>
          <li>Total Projects: {stats.totalProjects}</li>
          <li>Total Tasks: {stats.totalTasks}</li>
          <li>Completed Tasks: {stats.completedTasks}</li>
          <li>Knowledge Base Entries: {stats.knowledgeEntries}</li>
        </ul>
      </div>

      <div className="dashboard-section">
        <h2>Recent Projects</h2>
        {recentProjects.length > 0 ? (
          <ul>
            {recentProjects.map(project => (
              <li key={project.id}>
                <Link to={`/projects/${project.id}`}>{project.name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No projects yet. <Link to="/projects">Create a new project</Link></p>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Recent Tasks</h2>
        {recentTasks.length > 0 ? (
          <ul>
            {recentTasks.map(task => (
              <li key={task.id}>
                {task.title} - {task.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks yet. <Link to="/projects">Create a new task</Link></p>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Recent Knowledge Entries</h2>
        {recentKnowledge.length > 0 ? (
          <ul>
            {recentKnowledge.map(entry => (
              <li key={entry.id}>
                {entry.content.substring(0, 50)}... (Model: {entry.model})
              </li>
            ))}
          </ul>
        ) : (
          <p>No knowledge entries yet. <Link to="/knowledge">Add new knowledge</Link></p>
        )}
      </div>

      <div className="dashboard-ai">
        <h2>Ask AI Assistant</h2>
        <textarea
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          placeholder="Ask a question or request assistance"
        />
        <button onClick={handleAiQuery}>Submit Query</button>
        {aiResponse && (
          <div className="ai-response">
            <h3>AI Response:</h3>
            <p>{aiResponse}</p>
          </div>
        )}
      </div>

      <div className="dashboard-actions">
        <Link to="/agent" className="dashboard-button">Interact with Agent</Link>
        <Link to="/projects" className="dashboard-button">Manage Projects</Link>
        <Link to="/knowledge" className="dashboard-button">Knowledge Base</Link>
      </div>
    </div>
  );
};

export default Dashboard;