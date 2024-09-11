import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectManager.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch projects');
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/tasks/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedProject) {
      setNewTask({ ...newTask, [name]: value });
    } else {
      setNewProject({ ...newProject, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedProject) {
        await axios.post(`${API_URL}/api/tasks`, { ...newTask, project_id: selectedProject.id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNewTask({ title: '', description: '' });
        fetchTasks(selectedProject.id);
      } else {
        await axios.post(`${API_URL}/api/projects`, newProject, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNewProject({ name: '', description: '' });
        fetchProjects();
      }
    } catch (err) {
      setError(selectedProject ? 'Failed to create task' : 'Failed to create project');
    }
  };

  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    await fetchTasks(project.id);
  };

  const handleCreateAITask = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/agent/create_task`, 
        { project_id: selectedProject.id, description: "Create a new task for this project" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks(selectedProject.id);
    } catch (err) {
      setError('Failed to create AI-generated task');
    }
  };

  const handleAnalyzeProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/agent/analyze_project/${selectedProject.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.analysis);
    } catch (err) {
      setError('Failed to analyze project');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="project-manager">
      <h1>{selectedProject ? `Project: ${selectedProject.name}` : 'Project Manager'}</h1>
      
      {!selectedProject && (
        <form onSubmit={handleSubmit} className="project-form">
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
          />
          <button type="submit">Create Project</button>
        </form>
      )}

      {selectedProject && (
        <>
          <form onSubmit={handleSubmit} className="task-form">
            <input
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              placeholder="Task Title"
              required
            />
            <textarea
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              placeholder="Task Description"
            />
            <button type="submit">Create Task</button>
          </form>
          <button onClick={handleCreateAITask} className="ai-button">Create AI Task</button>
          <button onClick={handleAnalyzeProject} className="ai-button">Analyze Project</button>
          <h2>Tasks</h2>
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Status: {task.status}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="project-list">
        <h2>Your Projects</h2>
        {projects.length > 0 ? (
          projects.map(project => (
            <div key={project.id} className="project-item">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <button onClick={() => handleProjectSelect(project)}>
                View Details
              </button>
            </div>
          ))
        ) : (
          <p>No projects yet. Create your first project above!</p>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;