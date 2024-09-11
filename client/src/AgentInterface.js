import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AgentInterface = () => {
  const [task, setTask] = useState('');
  const [question, setQuestion] = useState('');
  const [codeTask, setCodeTask] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [knowledgeQuery, setKnowledgeQuery] = useState('');
  const [knowledgeContent, setKnowledgeContent] = useState('');
  const [knowledgeTags, setKnowledgeTags] = useState('');

  useEffect(() => {
    fetchConversationHistory();
    fetchProjects();
  }, []);

  const fetchConversationHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/conversation_history`);
      setConversationHistory(response.data.history);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (endpoint, data) => {
    try {
      const response = await axios.post(`${API_URL}${endpoint}`, data);
      setResult(JSON.stringify(response.data, null, 2));
      fetchConversationHistory();
    } catch (error) {
      console.error('Error:', error);
      setResult('An error occurred. Please try again.');
    }
  };

  const clearConversation = async () => {
    try {
      await axios.post(`${API_URL}/clear_conversation`);
      setConversationHistory([]);
      setResult('Conversation history cleared.');
    } catch (error) {
      console.error('Error clearing conversation:', error);
      setResult('An error occurred while clearing the conversation.');
    }
  };

  const createProject = async () => {
    const name = prompt("Enter project name:");
    const description = prompt("Enter project description:");
    if (!name || !description) return;

    try {
      const response = await axios.post(`${API_URL}/api/projects`, { name, description });
      fetchProjects();
      setResult(`Project created with ID: ${response.data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      setResult('An error occurred while creating the project.');
    }
  };

  const createTask = async () => {
    if (!selectedProject || !newTask) return;
    try {
      const response = await axios.post(`${API_URL}/api/tasks`, {
        project_id: selectedProject,
        title: newTask,
        description: newTask
      });
      setNewTask('');
      setResult(`Task created with ID: ${response.data.id}`);
    } catch (error) {
      console.error('Error creating task:', error);
      setResult('An error occurred while creating the task.');
    }
  };

  const searchKnowledge = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/knowledge/search`, {
        params: { query: knowledgeQuery }
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error searching knowledge:', error);
      setResult('An error occurred while searching the knowledge base.');
    }
  };

  const addKnowledge = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/knowledge`, {
        content: knowledgeContent,
        tags: knowledgeTags.split(',').map(tag => tag.trim())
      });
      setResult(`Knowledge added with ID: ${response.data.id}`);
      setKnowledgeContent('');
      setKnowledgeTags('');
    } catch (error) {
      console.error('Error adding knowledge:', error);
      setResult('An error occurred while adding to the knowledge base.');
    }
  };

  return (
    <div className="agent-interface">
      <h1>ADAPT-Agent-GPT Interface</h1>
      
      <div>
        <h2>Analyze Task</h2>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter a task to analyze"
        />
        <button onClick={() => handleSubmit('/analyze_task', { task })}>
          Analyze Task
        </button>
      </div>

      <div>
        <h2>Answer Question</h2>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question"
        />
        <button onClick={() => handleSubmit('/answer_question', { question })}>
          Get Answer
        </button>
      </div>

      <div>
        <h2>Generate Code</h2>
        <input
          type="text"
          value={codeTask}
          onChange={(e) => setCodeTask(e.target.value)}
          placeholder="Describe the code you want to generate"
        />
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <button
          onClick={() =>
            handleSubmit('/generate_code', { task: codeTask, language })
          }
        >
          Generate Code
        </button>
      </div>

      <div>
        <h2>Projects</h2>
        <select onChange={(e) => setSelectedProject(e.target.value)}>
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <button onClick={createProject}>Create New Project</button>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task title"
        />
        <button onClick={createTask}>Create Task</button>
      </div>

      <div>
        <h2>Knowledge Base</h2>
        <input
          type="text"
          value={knowledgeQuery}
          onChange={(e) => setKnowledgeQuery(e.target.value)}
          placeholder="Search knowledge base"
        />
        <button onClick={searchKnowledge}>Search</button>
        <textarea
          value={knowledgeContent}
          onChange={(e) => setKnowledgeContent(e.target.value)}
          placeholder="Add new knowledge"
        />
        <input
          type="text"
          value={knowledgeTags}
          onChange={(e) => setKnowledgeTags(e.target.value)}
          placeholder="Tags (comma-separated)"
        />
        <button onClick={addKnowledge}>Add Knowledge</button>
      </div>

      <div>
        <h2>Conversation History</h2>
        <button onClick={clearConversation}>Clear Conversation</button>
        <ul>
          {conversationHistory.map((message, index) => (
            <li key={index}>
              <strong>{message.role}:</strong> {message.content}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Result</h2>
        <pre>{result}</pre>
      </div>
    </div>
  );
};

export default AgentInterface;