import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch projects');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      setError('Failed to create project');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="project-manager">
      <h1>Project Manager</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={newProject.name}
          onChange={handleInputChange}
          placeholder="Project Name"
          required
        />
        <textarea
          name="description"
          value={newProject.description}
          onChange={handleInputChange}
          placeholder="Project Description"
          required
        />
        <button type="submit">Create Project</button>
      </form>

      <div className="project-list">
        <h2>Your Projects</h2>
        {projects.map(project => (
          <div key={project.id} className="project-item">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            {/* Add more project details and actions here */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManager;