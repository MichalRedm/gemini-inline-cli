import { exec } from 'child_process';
import { promisify } from 'util';
import { cleanLlmOutput } from './parser';

const execPromise = promisify(exec);

export async function executeAgent(fileContent: string, instruction: string, filepath: string): Promise<string | null> {
  // Construct a strict prompt enforcing the protocol
  const prompt = `
You are an autonomous coding agent.
I will provide you with the contents of a file.
Your task is: ${instruction}

CRITICAL INSTRUCTIONS:
1. Implement the requested changes in the code.
2. You MUST change the string "@gemini:" to "@resolved:" to prevent infinite loops.
3. Output ONLY the raw, updated code. Do not include markdown code blocks (\`\`\`).
4. Do not include any conversational text, explanations, or greetings.

FILE CONTENT:
${fileContent}
  `;

  // We use the --yolo flag for auto-approval and --output-format json for predictable parsing
  const command = `gemini --yolo --output-format json -p "${prompt.replace(/"/g, '\\"')}"`;

  try {
    const { stdout, stderr } = await execPromise(command);
      
    if (stderr) {
      console.warn(`[Agent Diagnostics]: ${stderr}`);
    }

    const responseData = JSON.parse(stdout);
    let rawOutput = responseData.response || responseData.text || "";

    return cleanLlmOutput(rawOutput);

  } catch (error: any) {
    console.error(`[Agent] Subprocess failed:`, error.message);
    return null;
  }
}
