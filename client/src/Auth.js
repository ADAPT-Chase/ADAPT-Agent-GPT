import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/token' : '/users';
      const response = await axios.post(`${API_URL}${endpoint}`, {
        username,
        email: isLogin ? undefined : email,
        password
      });

      if (response.data.access_token) {
        onLogin(response.data.access_token);
        navigate('/');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <div className="auth-toggle">
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Auth;