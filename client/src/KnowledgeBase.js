import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const KnowledgeBase = () => {
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ content: '', tags: '', model: 'gpt-3.5-turbo' });
  const [searchQuery, setSearchQuery] = useState('');

  const availableModels = [
    'gpt-3.5-turbo',
    'gpt-4',
    'claude-v1',
    'llama-2-70b',
    'falcon-40b',
    'palm-2',
  ];

  useEffect(() => {
    fetchKnowledgeEntries();
  }, []);

  const fetchKnowledgeEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/knowledge`);
      setKnowledgeEntries(response.data);
    } catch (error) {
      console.error('Error fetching knowledge entries:', error);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = newEntry.tags.split(',').map(tag => tag.trim());
      await axios.post(`${API_URL}/api/knowledge`, { ...newEntry, tags: tagsArray });
      setNewEntry({ content: '', tags: '', model: 'gpt-3.5-turbo' });
      fetchKnowledgeEntries();
    } catch (error) {
      console.error('Error creating knowledge entry:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/knowledge/search?query=${searchQuery}`);
      setKnowledgeEntries(response.data);
    } catch (error) {
      console.error('Error searching knowledge base:', error);
    }
  };

  return (
    <div className="knowledge-base">
      <h2>Knowledge Base</h2>
      <form onSubmit={handleCreateEntry}>
        <textarea
          placeholder="Knowledge Content"
          value={newEntry.content}
          onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
          required
        ></textarea>
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={newEntry.tags}
          onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
        />
        <select
          value={newEntry.model}
          onChange={(e) => setNewEntry({ ...newEntry, model: e.target.value })}
        >
          {availableModels.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
        <button type="submit">Add Knowledge</button>
      </form>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search Knowledge Base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="knowledge-list">
        <h3>Knowledge Entries</h3>
        {knowledgeEntries.map((entry) => (
          <div key={entry.id} className="knowledge-item">
            <p>{entry.content}</p>
            <p>Tags: {entry.tags.join(', ')}</p>
            <p>Model: {entry.model}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;