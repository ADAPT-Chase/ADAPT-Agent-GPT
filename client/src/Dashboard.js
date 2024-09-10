import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [taskSummary, setTaskSummary] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const tasksResponse = await axios.get('/api/v1/tasks');
      const tasks = tasksResponse.data;

      // Calculate task summary
      const summary = tasks.reduce((acc, task) => {
        acc.total++;
        acc[task.status]++;
        return acc;
      }, { total: 0, pending: 0, in_progress: 0, completed: 0 });

      setTaskSummary(summary);

      // Get 5 most recent tasks
      const sortedTasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentTasks(sortedTasks.slice(0, 5));
    } catch (err) {
      setError('Error fetching dashboard data');
      console.error(err);
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="task-summary">
        <h3>Task Summary</h3>
        <div className="summary-items">
          <div className="summary-item">
            <span className="label">Total Tasks:</span>
            <span className="value">{taskSummary.total}</span>
          </div>
          <div className="summary-item">
            <span className="label">Pending:</span>
            <span className="value">{taskSummary.pending}</span>
          </div>
          <div className="summary-item">
            <span className="label">In Progress:</span>
            <span className="value">{taskSummary.in_progress}</span>
          </div>
          <div className="summary-item">
            <span className="label">Completed:</span>
            <span className="value">{taskSummary.completed}</span>
          </div>
        </div>
      </div>
      <div className="recent-tasks">
        <h3>Recent Tasks</h3>
        <ul>
          {recentTasks.map(task => (
            <li key={task.id} className={`task-item ${task.status}`}>
              <span className="task-title">{task.title}</span>
              <span className="task-status">{task.status}</span>
            </li>
          ))}
        </ul>
        <Link to="/tasks" className="view-all-tasks">View All Tasks</Link>
      </div>
    </div>
  );
}

export default Dashboard;