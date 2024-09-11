import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KnowledgeBase.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const KnowledgeBase = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ content: '', tags: '', model: 'gpt-3.5-turbo' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentResponse, setAgentResponse] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/knowledge`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch knowledge entries');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/knowledge`, {
        ...newEntry,
        tags: newEntry.tags.split(',').map(tag => tag.trim())
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewEntry({ content: '', tags: '', model: 'gpt-3.5-turbo' });
      fetchEntries();
    } catch (err) {
      setError('Failed to create knowledge entry');
    }
  };

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/knowledge/search`, {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data);
    } catch (err) {
      setError('Failed to search knowledge base');
    }
  };

  const handleAgentQuery = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/agent/query`, {
        query: searchQuery
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgentResponse(response.data.response);
    } catch (err) {
      setError('Failed to get agent response');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="knowledge-base">
      <h1>Knowledge Base</h1>
      
      <form onSubmit={handleSubmit} className="knowledge-form">
        <h2>Add New Knowledge Entry</h2>
        <textarea
          name="content"
          value={newEntry.content}
          onChange={handleInputChange}
          placeholder="Knowledge Entry Content"
          required
        />
        <input
          type="text"
          name="tags"
          value={newEntry.tags}
          onChange={handleInputChange}
          placeholder="Tags (comma-separated)"
        />
        <select
          name="model"
          value={newEntry.model}
          onChange={handleInputChange}
          required
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
        </select>
        <button type="submit">Add Entry</button>
      </form>

      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search knowledge base or ask a question"
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleAgentQuery}>Ask AI Agent</button>
      </div>

      {agentResponse && (
        <div className="agent-response">
          <h3>AI Agent Response:</h3>
          <p>{agentResponse}</p>
        </div>
      )}

      <div className="knowledge-list">
        <h2>Knowledge Entries</h2>
        {entries.length === 0 ? (
          <p>No entries found. Add a new entry to get started!</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="knowledge-item">
              <p>{entry.content}</p>
              <div className="tags">
                {entry.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <p className="model">Model: {entry.model}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;