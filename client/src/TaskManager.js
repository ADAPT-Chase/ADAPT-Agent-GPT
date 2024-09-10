import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data.tasks);
    } catch (error) {
      setError('Error fetching tasks: ' + error.message);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) {
      setError('Task cannot be empty');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/tasks', 
        { description: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, response.data]);
      setNewTask('');
      setError('');
    } catch (error) {
      setError('Error adding task: ' + error.message);
    }
  };

  const updateTask = async (taskId, completed) => {
    try {
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
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      setError('Error deleting task: ' + error.message);
    }
  };

  return (
    <div className="task-manager">
      <h2>Task Manager</h2>
      <div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a new task"
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      {error && <p className="error">{error}</p>}
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => updateTask(task.id, e.target.checked)}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.description}
            </span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskManager;