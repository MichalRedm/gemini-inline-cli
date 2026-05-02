#!/usr/bin/env node
import { Command } from 'commander';
import { startWatching } from './watcher';
import * as path from 'path';
import * as fs from 'fs';

const program = new Command();

program
  .name('gemini-inline')
  .description('Collaborate with Google Gemini via inline file comments (@gemini: task)')
  .version('1.0.0')
  .argument('<filepath>', 'path to the file to watch')
  .action((filepath: string) => {
    const absolutePath = path.resolve(filepath);
      
    if (!fs.existsSync(absolutePath)) {
      console.error(`[System] Error: File not found at ${absolutePath}`);
      process.exit(1);
    }

    console.log(`[System] Initializing Gemini Agent on: ${absolutePath}`);
    console.log(`[System] Add comments like "// @gemini: implement this" to trigger the agent.`);
      
    startWatching(absolutePath);
  });

program.parse(process.argv);
