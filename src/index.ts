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
    security: {
      auth: {
        selectedType: "oauth-personal"
      }
    },
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


}

program
  .name('gemini-inline')
  .description('Collaborate with Gemini via inline comments (Daemon Mode)')
  .version('2.0.0')
  .argument('[dir]', 'directory to watch', '.')
  .action(async (dir: string) => {
    const targetDir = path.resolve(dir);
    
    await setup(targetDir);

    // Purge ALL API key variations to force OAuth
    const cleanEnv = { ...process.env };
    delete cleanEnv.GEMINI_API_KEY;
    delete cleanEnv.GOOGLE_API_KEY;
    delete cleanEnv.API_KEY;
    Object.keys(cleanEnv).forEach(key => {
      if (key.toUpperCase() === 'GEMINI_API_KEY' || 
          key.toUpperCase() === 'GOOGLE_API_KEY' || 
          key.toUpperCase() === 'API_KEY') {
        delete cleanEnv[key];
      }
    });



    console.log(`[System] Starting persistent Gemini session...`);
    console.log(`[System] The agent will now monitor your files and resolve @gemini tags automatically.`);
    
    const daemonPrompt = "Enter daemon mode. Whenever a TODO @gemini appears, resolve it immediately. Use the AfterAgent hook to wait for my next edit.";

    const child = spawn('npx', ['-y', '@google/gemini-cli@0.39.1', '--yolo', '-p', `"${daemonPrompt.replace(/"/g, '\\"')}"`], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
      env: { ...cleanEnv, GEMINI_CLI_TRUST_WORKSPACE: 'true' }
    });

    child.on('exit', (code) => {
      console.log(`[System] Gemini session exited with code ${code}`);
    });
  });

program.parse(process.argv);