import openai
from typing import List, Dict
from server.database.database_manager import DatabaseManager
import os
from dotenv import load_dotenv

load_dotenv()

class ADAPTAgent:
    def __init__(self):
        self.db_manager = DatabaseManager(os.getenv("DATABASE_URL"))
        openai.api_key = os.getenv("OPENAI_API_KEY")

    async def process_query(self, query: str, user_id: int) -> Dict[str, str]:
        # Retrieve relevant knowledge
        knowledge = self.db_manager.search_knowledge(query, user_id)
        
        # Prepare context from knowledge
        context = self._prepare_context(knowledge)

        # Generate response using GPT model
        response = await self._generate_response(query, context)

        # Save the interaction as a new knowledge entry
        self._save_interaction(query, response, user_id)

        return {"query": query, "response": response}

    def _prepare_context(self, knowledge: List[Dict]) -> str:
        context = "Here's some relevant information:\n\n"
        for entry in knowledge:
            context += f"- {entry['content']} (Model: {entry['model']})\n"
        return context

    async def _generate_response(self, query: str, context: str) -> str:
        prompt = f"{context}\n\nUser query: {query}\n\nResponse:"
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI assistant for the ADAPT-Agent-GPT system. Use the provided context to answer the user's query."},
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message['content'].strip()

    def _save_interaction(self, query: str, response: str, user_id: int):
        content = f"Query: {query}\nResponse: {response}"
        self.db_manager.create_knowledge_entry(content, "gpt-3.5-turbo", user_id, ["interaction"])

    async def create_task(self, project_id: int, task_description: str) -> Dict[str, str]:
        # Generate task details using GPT model
        prompt = f"Create a task with a title and description based on the following information: {task_description}"
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI assistant for the ADAPT-Agent-GPT system. Generate a task title and description based on the given information."},
                {"role": "user", "content": prompt}
            ]
        )

        task_details = response.choices[0].message['content'].strip().split("\n")
        title = task_details[0].replace("Title: ", "")
        description = "\n".join(task_details[1:]).replace("Description: ", "")

        # Create the task in the database
        task_id = self.db_manager.create_task(title, description, project_id)

        return {"id": task_id, "title": title, "description": description}

    async def analyze_project(self, project_id: int) -> Dict[str, str]:
        # Retrieve project details and tasks
        project = self.db_manager.get_project(project_id)
        tasks = self.db_manager.get_tasks(project_id)

        # Prepare project summary
        project_summary = f"Project: {project.name}\nDescription: {project.description}\n\nTasks:\n"
        for task in tasks:
            project_summary += f"- {task.title} (Status: {task.status})\n"

        # Generate analysis using GPT model
        prompt = f"Analyze the following project and provide insights and recommendations:\n\n{project_summary}"
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI assistant for the ADAPT-Agent-GPT system. Analyze the given project and provide insights and recommendations."},
                {"role": "user", "content": prompt}
            ]
        )

        analysis = response.choices[0].message['content'].strip()

        return {"project_id": project_id, "analysis": analysis}

# Usage
# agent = ADAPTAgent()
# result = await agent.process_query("What is the status of Project X?", user_id)
# task = await agent.create_task(project_id, "Implement user authentication")
# analysis = await agent.analyze_project(project_id)