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
      <div>
        <h3>Task Analysis</h3>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter a task to analyze"
        />
        <button onClick={analyzeTask} disabled={loading}>Analyze Task</button>
      </div>
      <div>
        <h3>Code Generation</h3>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter a task for code generation"
        />
        <input
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="Enter programming language"
        />
        <button onClick={generateCode} disabled={loading}>Generate Code</button>
      </div>
      <div>
        <h3>Question Answering</h3>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter a question"
        />
        <button onClick={answerQuestion} disabled={loading}>Answer Question</button>
      </div>
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Processing...</div>}
      {result && (
        <div>
          <h3>Result</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default AgentInterface;