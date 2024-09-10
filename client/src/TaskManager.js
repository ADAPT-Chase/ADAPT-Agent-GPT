import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskManager.css';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'pending' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/v1/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Error fetching tasks');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/tasks', newTask);
      setTasks([...tasks, response.data]);
      setNewTask({ title: '', description: '', status: 'pending' });
    } catch (err) {
      setError('Error creating task');
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.put(`/api/v1/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(task => task.id === taskId ? response.data : task));
    } catch (err) {
      setError('Error updating task');
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`/api/v1/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError('Error deleting task');
      console.error(err);
    }
  };

  return (
    <div className="task-manager">
      <h2>Task Manager</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={newTask.title}
          onChange={handleInputChange}
          placeholder="Task title"
          required
        />
        <textarea
          name="description"
          value={newTask.description}
          onChange={handleInputChange}
          placeholder="Task description"
        />
        <select name="status" value={newTask.status} onChange={handleInputChange}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit">Add Task</button>
      </form>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={`task-item ${task.status}`}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <div className="task-actions">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button onClick={() => handleDelete(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskManager;