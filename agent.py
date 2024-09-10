import openai
from typing import List, Dict

class AgentGPT:
    def __init__(self, api_key: str):
        openai.api_key = api_key

    def generate_response(self, prompt: str) -> str:
        try:
            response = openai.Completion.create(
                engine="text-davinci-002",
                prompt=prompt,
                max_tokens=150,
                n=1,
                stop=None,
                temperature=0.7,
            )
            return response.choices[0].text.strip()
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm sorry, but I encountered an error while processing your request."

    def analyze_task(self, task: str) -> Dict[str, List[str]]:
        prompt = f"Analyze the following task and provide a list of steps to complete it:\n\nTask: {task}\n\nSteps:"
        response = self.generate_response(prompt)
        steps = [step.strip() for step in response.split("\n") if step.strip()]
        return {"steps": steps}

    def generate_code(self, task: str, language: str) -> str:
        prompt = f"Generate {language} code to accomplish the following task:\n\nTask: {task}\n\nCode:"
        return self.generate_response(prompt)

    def answer_question(self, question: str) -> str:
        prompt = f"Please answer the following question:\n\nQuestion: {question}\n\nAnswer:"
        return self.generate_response(prompt)

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