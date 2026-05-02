import * as chokidar from 'chokidar';
import * as fs from 'fs/promises';
import { executeAgent } from './agent';

// Global state machine lock  
let isProcessing = false;

export function startWatching(filepath: string): void {  
  // Initialize Chokidar with a slight delay to handle IDE "safe writes"  
  const watcher = chokidar.watch(filepath, {  
    persistent: true,  
    awaitWriteFinish: {  
      stabilityThreshold: 500,  
      pollInterval: 100  
    }  
  });

  watcher.on('change', async (path) => {  
    if (isProcessing) {  
      return; // Ignore file changes triggered by the agent itself  
    }

    try {  
      const content = await fs.readFile(path, 'utf-8');  
        
      // Look for our specific protocol trigger  
      const triggerRegex = /@gemini:\s*(.+)/;  
      const match = content.match(triggerRegex);

      if (match) {  
        const instruction = match[1];  
        console.log(`\n[Watcher] Detected trigger: "${instruction}"`);  
        await handleTrigger(path, content, instruction);  
      }  
    } catch (error) {  
      console.error(`[Watcher] Error reading file:`, error);  
    }  
  });  
}

async function handleTrigger(filepath: string, currentContent: string, instruction: string): Promise<void> {  
  isProcessing = true;  
  console.log(`[Agent] Processing request...`);

  try {  
    const updatedCode = await executeAgent(currentContent, instruction, filepath);  
      
    if (updatedCode) {  
      await fs.writeFile(filepath, updatedCode, 'utf-8');  
      console.log(`[System] File successfully updated by Gemini.`);  
    } else {  
      console.log(`[System] Agent failed to generate valid code.`);  
    }  
  } catch (error) {  
    console.error(`[System] Fatal execution error:`, error);  
  } finally {  
    // Cooldown phase: wait 1.5 seconds before releasing the lock   
    // to ensure the OS has finished emitting write events  
    setTimeout(() => {  
      isProcessing = false;  
      console.log(`[System] Resuming observation...`);  
    }, 1500);  
  }  
}
