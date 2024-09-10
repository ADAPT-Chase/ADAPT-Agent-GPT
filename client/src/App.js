import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import Dashboard from './Dashboard';
import TaskManager from './TaskManager';
import Auth from './Auth';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('/api/v1/users/me');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    }
  };

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['x-auth-token'] = token;
    fetchUserProfile();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} user={user} />
        <Switch>
          <Route exact path="/" render={() => isAuthenticated ? <Redirect to="/dashboard" /> : <Auth onLogin={handleLogin} />} />
          <ProtectedRoute path="/dashboard" component={Dashboard} isAuthenticated={isAuthenticated} />
          <ProtectedRoute path="/tasks" component={TaskManager} isAuthenticated={isAuthenticated} />
          <ProtectedRoute path="/profile" component={UserProfile} isAuthenticated={isAuthenticated} user={user} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
