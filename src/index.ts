#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn } from 'child_process';
import { HOOK_SCRIPT } from './hook-template';

const program = new Command();

async function setup(targetDir: string) {
  const geminiDir = path.join(targetDir, '.gemini');
  const hooksDir = path.join(geminiDir, 'hooks');
  const settingsPath = path.join(geminiDir, 'settings.json');
  const watcherPath = path.join(hooksDir, 'watcher.js');

  console.log(`[System] Bootstrapping Gemini Daemon in: ${targetDir}`);

  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  // Write settings.json
  const settings = {
    approvalMode: "yolo",
    contextRotation: "auto",
    hooks: {
      AfterAgent: [
        {
          matcher: "*",
          hooks: [
            {
              type: "command",
              command: "node .gemini/hooks/watcher.js"
            }
          ]
        }
      ]
    }
  };
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  // Write hook script
  fs.writeFileSync(watcherPath, HOOK_SCRIPT);

  try {
    console.log(`[System] Authorizing hooks via 'gemini trust'...`);
    // Use shell: true for Windows compatibility
    execSync('gemini trust', { cwd: targetDir, stdio: 'inherit' });
  } catch (e) {
    console.warn(`[System] Warning: 'gemini trust' failed. You may need to run it manually.`);
  }
}

program
  .name('gemini-inline')
  .description('Collaborate with Gemini via inline comments (Daemon Mode)')
  .version('2.0.0')
  .argument('[dir]', 'directory to watch', '.')
  .action(async (dir: string) => {
    const targetDir = path.resolve(dir);
    
    await setup(targetDir);

    console.log(`[System] Starting persistent Gemini session...`);
    console.log(`[System] The agent will now monitor your files and resolve @gemini tags automatically.`);
    
    const daemonPrompt = `You are a helpful coding assistant running in daemon mode. 
Your job is to scan the project files for comments starting with "@gemini: [task]".
When you find such a comment, perform the requested task and replace the comment with "@resolved: [task]".
The user will trigger your scan by saving files. 
Always aim for high-quality, production-ready code.`;

    const child = spawn('gemini', ['ask', daemonPrompt], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, GEMINI_CLI_TRUST_WORKSPACE: 'true' }
    });

    child.on('exit', (code) => {
      console.log(`[System] Gemini session exited with code ${code}`);
    });
  });

program.parse(process.argv);