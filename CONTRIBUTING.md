# Contributing to ADAPT Agent GPT

We welcome contributions to the ADAPT Agent GPT project! This document provides guidelines for contributing to the project. By participating in this project, you agree to abide by its terms.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to foster an open and welcoming environment.

## How Can I Contribute?

### Reporting Bugs

- Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/your-repo/adapt-agent-gpt/issues).
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/your-repo/adapt-agent-gpt/issues/new). Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- Open a new issue with a clear title and detailed description of the suggested enhancement.
- Provide any relevant examples or mock-ups that can help explain your suggestion.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### Python Styleguide

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/).
- Use 4 spaces for indentation.
- Use docstrings for functions and classes.

### JavaScript Styleguide

- Use 2 spaces for indentation.
- Use semicolons.
- Prefer `const` over `let`. Only use `var` if absolutely necessary.
- Place `else` on the same line as your `if` block's closing brace.

### Documentation Styleguide

- Use [Markdown](https://daringfireball.net/projects/markdown) for documentation.
- Reference methods and classes in markdown with the custom `{}` notation:
    - Class: `{ClassName}`
    - Method: `{ClassName::methodName}`

## Setting Up Your Development Environment

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/adapt-agent-gpt.git
   cd adapt-agent-gpt
   ```

2. Set up a virtual environment and install dependencies:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. Set up environment variables as described in the README.md file.

4. Initialize the databases:
   ```
   python server/database_setup.py
   ```

5. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

6. In a new terminal, set up and start the frontend:
   ```
   cd client
   npm install
   npm start
   ```

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests.

* `bug` - Issues for bugs in the code
* `enhancement` - Issues for new features or improvements
* `documentation` - Issues related to documentation
* `help-wanted` - Issues where we need help from the community

Thank you for contributing to ADAPT Agent GPT!