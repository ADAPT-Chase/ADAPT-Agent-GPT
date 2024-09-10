import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Auth from './Auth';
import AgentInterface from './AgentInterface';
import TaskManager from './TaskManager';
import Dashboard from './Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthentication = (status) => {
    setIsAuthenticated(status);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>ADAPT-Agent-GPT</h1>
          {isAuthenticated && (
            <button onClick={handleLogout} className="logout-button">Logout</button>
          )}
        </header>
        <main>
          <Switch>
            <Route exact path="/login">
              {isAuthenticated ? <Redirect to="/dashboard" /> : <Auth onAuth={handleAuthentication} />}
            </Route>
            <PrivateRoute path="/agent" component={AgentInterface} />
            <PrivateRoute path="/tasks" component={TaskManager} />
            <PrivateRoute path="/dashboard" component={Dashboard} />
            <Redirect from="/" to="/dashboard" />
          </Switch>
        </main>
        <footer>
          <p>&copy; 2024 ADAPT-Agent-GPT</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
