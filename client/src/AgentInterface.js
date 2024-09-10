import React, { useState } from 'react';
import axios from 'axios';

function AgentInterface() {
  const [task, setTask] = useState('');
  const [language, setLanguage] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInput = (input, type) => {
    if (input.trim() === '') {
      setError(`Please enter a ${type}.`);
      return false;
    }
    setError('');
    return true;
  };

  const handleApiCall = async (apiFunction, data) => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const response = await apiFunction(data);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setError(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTask = async () => {
    if (validateInput(task, 'task')) {
      await handleApiCall(() => axios.post('http://localhost:8000/analyze_task', { task }), { task });
    }
  };

  const generateCode = async () => {
    if (validateInput(task, 'task') && validateInput(language, 'programming language')) {
      await handleApiCall(() => axios.post('http://localhost:8000/generate_code', { task, language }), { task, language });
    }
  };

  const answerQuestion = async () => {
    if (validateInput(question, 'question')) {
      await handleApiCall(() => axios.post('http://localhost:8000/answer_question', { question }), { question });
    }
  };

  return (
    <div className="agent-interface">
      <h2>AgentGPT Interface</h2>
      <div className="agent-interface-section">
        <h3>Task Analysis</h3>
        <div className="input-group">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter a task to analyze"
            className="agent-input"
          />
          <button onClick={analyzeTask} disabled={loading} className="agent-button">
            Analyze Task
          </button>
        </div>
      </div>
      <div className="agent-interface-section">
        <h3>Code Generation</h3>
        <div className="input-group">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter a task for code generation"
            className="agent-input"
          />
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Enter programming language"
            className="agent-input"
          />
          <button onClick={generateCode} disabled={loading} className="agent-button">
            Generate Code
          </button>
        </div>
      </div>
      <div className="agent-interface-section">
        <h3>Question Answering</h3>
        <div className="input-group">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter a question"
            className="agent-input"
          />
          <button onClick={answerQuestion} disabled={loading} className="agent-button">
            Answer Question
          </button>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Processing...</div>}
      {result && (
        <div className="result-section">
          <h3>Result</h3>
          <pre className="result-content">{result}</pre>
        </div>
      )}
    </div>
  );
}

export default AgentInterface;