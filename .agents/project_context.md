# Project Context - Gemini Inline CLI

## Current Goal
Bootstrap a Node.js CLI tool written in TypeScript that intercepts comments matching `@gemini: [instruction]`, invokes the Gemini CLI, and updates the file.

## Implementation Details
- **Architecture**: Node.js CLI, TypeScript, Chokidar for file watching.
- **Key Technologies**: TypeScript, Chokidar, Commander, Google Gemini CLI.

## Repository Status
- [x] Initialized setup.
- [x] Git repository initialized.
- [x] Agent directory initialized.
- [ ] Implement core source files.
- [ ] Configure CI/CD.
- [ ] Publish to GitHub.

## Critical Requirements
- `@google/gemini-cli` must be installed globally.
- Node.js 20+ and TypeScript.
