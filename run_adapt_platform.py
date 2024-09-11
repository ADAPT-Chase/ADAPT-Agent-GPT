import subprocess
import os
import json
import sys

def load_shared_config():
    with open('shared_config.json', 'r') as f:
        return json.load(f)

def start_server(config):
    os.chdir(config['ADAPT_AGENT_GPT_SERVER_PATH'])
    subprocess.Popen(['npm', 'start'])
    os.chdir(config['ADAPT_AGENT_GPT_CLIENT_PATH'])
    subprocess.Popen(['npm', 'start'])
    os.chdir('/home/x/ADAPT/Projects/ADAPT-Agent-GPT')  # Return to the root directory

def start_adapt_agent_system(config):
    sys.path.append(config['ADAPT_AGENT_SYSTEM_PATH'])
    from run_adapt_system import main as run_adapt_system
    run_adapt_system()

def main():
    print("Starting ADAPT Platform...")
    
    # Load shared configuration
    config = load_shared_config()
    
    # Set environment variables from shared config
    for key, value in config.items():
        os.environ[key] = str(value)
    
    # Start ADAPT-Agent-GPT server and client
    print("Starting ADAPT-Agent-GPT server and client...")
    start_server(config)
    
    # Start ADAPT-Agent-System
    print("Starting ADAPT-Agent-System...")
    start_adapt_agent_system(config)
    
    print("ADAPT Platform is now running.")
    print("Press Ctrl+C to stop all components.")
    
    try:
        # Keep the script running
        while True:
            pass
    except KeyboardInterrupt:
        print("\nStopping ADAPT Platform...")
        # Add any cleanup code here if necessary

if __name__ == "__main__":
    main()