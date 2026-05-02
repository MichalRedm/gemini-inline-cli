# Gemini Inline CLI

`gemini-inline` is a CLI tool designed to facilitate seamless collaboration with Google Gemini directly within your source files. It watches a target file for special comments, executes the instructions using Gemini, and updates the file in-place.

## Features
- **Real-time Collaboration**: Just add a comment like `// @gemini: refactor this function` and watch the magic happen.
- **In-place Updates**: The tool automatically overwrites the file with the updated code, resolving the prompt into `@resolved:`.
- **TypeScript Powered**: Robust implementation using TypeScript and `chokidar` for reliable file watching.

## Installation

### Prerequisites
- **Google Gemini CLI**: This tool requires the official Gemini CLI to be installed and configured on your system.
  ```bash
  # Ensure it is installed globally
  npm install -g @google/gemini-cli
  ```
  *(Note: If `@google/gemini-cli` is not available on npm, ensure you have the `gemini` command available in your PATH.)*

### Setup
1. Clone the repository and navigate to the project directory.
2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
3. Link the CLI globally:
   ```bash
   npm link
   ```

## Usage
Run the tool by pointing it to a file you want to work on:
```bash
gemini-inline path/to/your/file.ts
```

While the tool is running, add a comment to the file:
```typescript
// @gemini: create a function that calculates the fibonacci sequence
```
The tool will detect the comment, send the file context to Gemini, and replace the comment with the generated code.

## Limitations and Security

### The "Blind Replace" Vulnerability
Overwriting an entire file synchronously relies entirely on the LLM's attention span. If the file is too large, the LLM may silently truncate or hallucinate code, leading to destructive context loss. Always keep backups or use version control.

### OS Race Conditions
The state machine relies on arbitrary timeouts (`setTimeout(..., 1500)`) to debounce file system write events. This may fail on slower disk I/O operations or during high system load, potentially triggering API loops or double-processing.

### Context Limits
Passing whole files via shell arguments may exceed system limitations on string length (like Windows' 8191-character limit). This tool is best suited for small to medium-sized files.
