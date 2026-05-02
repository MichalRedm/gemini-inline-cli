export function cleanLlmOutput(rawText: string): string {
  let cleaned = rawText.trim();
    
  // LLMs stubbornly wrap code in markdown blocks even when told not to.
  // This regex detects ```language ... ``` and extracts the inner content.
  const markdownRegex = /^```[a-z]*\n([\s\S]*?)\n```$/i;
  const match = cleaned.match(markdownRegex);
    
  if (match) {
    cleaned = match[1].trim();
  }
    
  return cleaned;
}
