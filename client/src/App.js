import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Auth from './Auth';
import AgentInterface from './AgentInterface';
import TaskManager from './TaskManager';
import Dashboard from './Dashboard';
import NavBar from './NavBar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // In a real app, you would verify the token with your backend here
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleAuthentication = (status) => {
    setIsAuthenticated(status);
    if (status) {
      localStorage.setItem('token', 'dummy_token'); // In a real app, store the actual token
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <NavBar onLogout={handleLogout} />}
        <main className="App-main">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth onAuth={handleAuthentication} />
            } />
            <Route
              path="/dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/agent"
              element={isAuthenticated ? <AgentInterface /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/tasks"
              element={isAuthenticated ? <TaskManager /> : <Navigate to="/login" replace />}
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={
              <div className="not-found">
                <h2>404 - Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
              </div>
            } />
          </Routes>
        </main>
        <footer className="App-footer">
          <p>&copy; 2024 ADAPT-Agent-GPT</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
