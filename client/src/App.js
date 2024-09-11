import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import Dashboard from './Dashboard';
import AgentInterface from './AgentInterface';
import TaskManager from './TaskManager';
import ProjectManager from './ProjectManager';
import KnowledgeBase from './KnowledgeBase';
import Auth from './Auth';
import NotFound from './NotFound';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <ErrorBoundary>
        <div className="App">
          <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
          <main className="main-content">
            <Routes>
              <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/agent"
                element={
                  <PrivateRoute>
                    <AgentInterface />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <TaskManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <PrivateRoute>
                    <ProjectManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/knowledge"
                element={
                  <PrivateRoute>
                    <KnowledgeBase />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
