import openai
from typing import List, Dict, Optional
import time
import json
import requests

class AgentGPT:
    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo", agent_system_url: str = "http://localhost:8000"):
        openai.api_key = api_key
        self.model = model
        self.conversation_history = []
        self.max_retries = 3
        self.retry_delay = 1
        self.agent_system_url = agent_system_url

    def _call_openai_api(self, messages: List[Dict[str, str]]) -> str:
        for attempt in range(self.max_retries):
            try:
                response = openai.ChatCompletion.create(
                    model=self.model,
                    messages=messages
                )
                return response.choices[0].message['content'].strip()
            except Exception as e:
                if attempt == self.max_retries - 1:
                    raise e
                time.sleep(self.retry_delay)

    def generate_response(self, prompt: str, system_message: Optional[str] = None) -> str:
        messages = self.conversation_history.copy()
        if system_message:
            messages.insert(0, {"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})

        response = self._call_openai_api(messages)
        self.conversation_history.append({"role": "user", "content": prompt})
        self.conversation_history.append({"role": "assistant", "content": response})
        return response

    def analyze_task(self, task: str) -> Dict[str, List[str]]:
        system_message = "You are a task analysis expert. Break down the given task into clear, actionable steps."
        prompt = f"Analyze the following task and provide a list of steps to complete it:\n\nTask: {task}\n\nSteps:"
        response = self.generate_response(prompt, system_message)
        steps = [step.strip() for step in response.split("\n") if step.strip()]
        return {"steps": steps}

    def generate_code(self, task: str, language: str) -> str:
        system_message = f"You are an expert {language} programmer. Generate clean, efficient, and well-commented code."
        prompt = f"Generate {language} code to accomplish the following task:\n\nTask: {task}\n\nCode:"
        return self.generate_response(prompt, system_message)

    def answer_question(self, question: str) -> str:
        system_message = "You are a knowledgeable assistant. Provide accurate and helpful answers to the user's questions."
        prompt = f"Please answer the following question:\n\nQuestion: {question}\n\nAnswer:"
        return self.generate_response(prompt, system_message)

    def clear_conversation_history(self):
        self.conversation_history = []

    def save_conversation(self, filename: str):
        with open(filename, 'w') as f:
            json.dump(self.conversation_history, f)

    def load_conversation(self, filename: str):
        with open(filename, 'r') as f:
            self.conversation_history = json.load(f)

    # ADAPT-Agent-System integration methods

    def create_project(self, name: str, description: str) -> Dict:
        url = f"{self.agent_system_url}/api/projects"
        data = {
            "name": name,
            "description": description
        }
        response = requests.post(url, json=data)
        return response.json()

    def get_project(self, project_id: int) -> Dict:
        url = f"{self.agent_system_url}/api/projects/{project_id}"
        response = requests.get(url)
        return response.json()

    def create_task(self, project_id: int, title: str, description: str) -> Dict:
        url = f"{self.agent_system_url}/api/tasks"
        data = {
            "project_id": project_id,
            "title": title,
            "description": description
        }
        response = requests.post(url, json=data)
        return response.json()

    def get_task(self, task_id: int) -> Dict:
        url = f"{self.agent_system_url}/api/tasks/{task_id}"
        response = requests.get(url)
        return response.json()

    def update_task(self, task_id: int, status: str, completed: bool) -> Dict:
        url = f"{self.agent_system_url}/api/tasks/{task_id}"
        data = {
            "status": status,
            "completed": completed
        }
        response = requests.put(url, json=data)
        return response.json()

    def add_knowledge(self, content: str, tags: List[str]) -> Dict:
        url = f"{self.agent_system_url}/api/knowledge"
        data = {
            "content": content,
            "tags": tags
        }
        response = requests.post(url, json=data)
        return response.json()

    def search_knowledge(self, query: str) -> List[Dict]:
        url = f"{self.agent_system_url}/api/knowledge/search"
        params = {"query": query}
        response = requests.get(url, params=params)
        return response.json()

# Usage example:
# agent = AgentGPT("your-api-key-here")
# task_analysis = agent.analyze_task("Create a function to calculate the fibonacci sequence")
# print(task_analysis)
# 
# code = agent.generate_code("Create a function to calculate the fibonacci sequence", "Python")
# print(code)
# 
# answer = agent.answer_question("What is the capital of France?")
# print(answer)
#
# # Interacting with ADAPT-Agent-System
# project = agent.create_project("My Project", "A sample project")
# task = agent.create_task(project["id"], "Sample Task", "This is a sample task")
# agent.update_task(task["id"], "In Progress", False)
# agent.add_knowledge("The capital of France is Paris", ["geography", "France"])
# search_results = agent.search_knowledge("capital of France")
# print(search_results)