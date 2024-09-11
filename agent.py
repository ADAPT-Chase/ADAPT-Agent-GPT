import os
import openai
from dotenv import load_dotenv

load_dotenv()

class AgentGPT:
    def __init__(self, api_key):
        openai.api_key = api_key

    def get_completion(self, prompt, model="gpt-3.5-turbo"):
        messages = [{"role": "user", "content": prompt}]
        response = openai.ChatCompletion.create(
            model=model,
            messages=messages,
            temperature=0,
        )
        return response.choices[0].message["content"]

    def get_embedding(self, text, model="text-embedding-ada-002"):
        text = text.replace("\n", " ")
        return openai.Embedding.create(input=[text], model=model)['data'][0]['embedding']

    def process_task(self, task):
        prompt = f"Process the following task: {task}"
        return self.get_completion(prompt)

    def answer_question(self, question):
        prompt = f"Answer the following question: {question}"
        return self.get_completion(prompt)

    def generate_code(self, description):
        prompt = f"Generate code for the following description: {description}"
        return self.get_completion(prompt)

    def analyze_data(self, data):
        prompt = f"Analyze the following data: {data}"
        return self.get_completion(prompt)

    def summarize_text(self, text):
        prompt = f"Summarize the following text: {text}"
        return self.get_completion(prompt)

    def generate_ideas(self, topic):
        prompt = f"Generate ideas related to the following topic: {topic}"
        return self.get_completion(prompt)

    def explain_concept(self, concept):
        prompt = f"Explain the following concept in simple terms: {concept}"
        return self.get_completion(prompt)

# Initialize the agent
agent = AgentGPT(api_key=os.getenv("OPENAI_API_KEY"))