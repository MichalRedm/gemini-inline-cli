# Gemini Inline CLI (Daemon Mode)

`gemini-inline` is a CLI tool designed to facilitate seamless collaboration with Google Gemini directly within your source files. It transforms your development environment into a collaborative space by using Gemini CLI's native `AfterAgent` hooks to watch for `@gemini` tags and resolve them in a single, persistent session.

## Features
- **Daemon Mode**: Runs as a single, long-running Gemini session, reducing overhead and avoiding "Unauthorized Intermediation" bans.
- **Real-time Collaboration**: Just add a comment like `// @gemini: refactor this function` and save the file.
- **Automated Setup**: Automatically configures `.gemini/settings.json`, deploys hook scripts, and authorizes them via `gemini trust`.
- **In-place Updates**: Gemini handles the code implementation directly, replacing `@gemini:` with `@resolved:`.
- **Cross-Platform**: Built-in Node.js file watcher works seamlessly on Windows, macOS, and Linux.

## Installation

### Prerequisites
- **Google Gemini CLI**: This tool requires the official Gemini CLI to be available in your PATH.
- **OAuth Authentication**: You MUST be logged in via `gemini auth login`. API Key usage is explicitly disabled for security and quota reasons.
- **Node.js**: Version 20.x or higher.

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
Run the tool in the directory you want to work on (defaults to current directory):
```bash
gemini-inline .
```

The tool will:
1. Create a `.gemini/` folder with the necessary configuration.
2. Force OAuth authentication by stripping API keys from the local environment.
3. Start a persistent Gemini session that waits for you to save file changes.

### Working with TODOs
While the tool is running, add a comment to any supported file:
```typescript
// @gemini: create a function that calculates the fibonacci sequence
```
Upon saving, the `AfterAgent` hook will trigger Gemini to scan the workspace and resolve any `@gemini` tags it finds.

## Limitations and Security

### The "Daemon" Persistence
Since the Gemini session stays open, the history will grow. The tool uses `contextRotation: "auto"` to allow Gemini to summarize/compress old "resolved" history, but very long sessions may still hit token limits.

### Hook Authorization
This tool uses Gemini CLI hooks. To prevent unauthorized code execution, Gemini requires folders with hooks to be **Trusted**. `gemini-inline` attempts to automate this via `gemini trust`, but you may need to run it manually if the tool encounters permission issues.

### File System Latency
The built-in watcher is designed to be lightweight. On some systems, there might be a slight delay between saving a file and the agent triggering.
