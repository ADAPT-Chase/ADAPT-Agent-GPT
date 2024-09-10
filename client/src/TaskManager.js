import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data.tasks);
    } catch (error) {
      setError('Error fetching tasks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) {
      setError('Task cannot be empty');
      return;
    }
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/tasks', 
        { description: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, response.data]);
      setNewTask('');
    } catch (error) {
      setError('Error adding task: ' + error.message);
    }
  };

  const updateTask = async (taskId, completed) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = { ...task, completed };
      await axios.put(`http://localhost:8000/tasks/${taskId}`, 
        updatedTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      setError('Error updating task: ' + error.message);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      setError('Error deleting task: ' + error.message);
    }
  };

  if (loading) {
    return <div className="task-manager-loading">Loading tasks...</div>;
  }

  return (
    <div className="task-manager">
      <h2>Task Manager</h2>
      <div className="new-task-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a new task"
          className="new-task-input"
        />
        <button onClick={addTask} className="add-task-button">Add Task</button>
      </div>
      {error && <p className="error-message">{error}</p>}
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className="task-item">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => updateTask(task.id, e.target.checked)}
              className="task-checkbox"
            />
            <span className={task.completed ? 'task-completed' : ''}>
              {task.description}
            </span>
            <button onClick={() => deleteTask(task.id)} className="delete-task-button">Delete</button>
          </li>
        ))}
      </ul>
      {tasks.length === 0 && <p className="no-tasks-message">No tasks available. Add a new task to get started!</p>}
    </div>
  );
}

export default TaskManager;