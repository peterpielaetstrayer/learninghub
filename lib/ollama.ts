interface OllamaResponse<T> {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface OllamaError {
  error: string;
}

export async function callOllama<T>(
  prompt: string,
  model: string = 'llama3.2:latest',
  options: {
    temperature?: number;
    maxRetries?: number;
  } = {}
): Promise<T> {
  const { temperature = 0.7, maxRetries = 1 } = options;
  
  const requestBody = {
    model,
    prompt,
    stream: false,
    options: {
      temperature,
    },
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as OllamaResponse<string>;
      
      if (!data.done) {
        throw new Error('Ollama response incomplete');
      }

      // Try to parse the response as JSON
      try {
        const parsed = JSON.parse(data.response) as T;
        return parsed;
      } catch (parseError) {
        if (attempt === maxRetries) {
          throw new Error(`Failed to parse JSON response after ${maxRetries + 1} attempts: ${parseError}`);
        }
        console.warn(`JSON parse attempt ${attempt + 1} failed, retrying...`);
        continue;
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Ollama API call failed after ${maxRetries + 1} attempts: ${error}`);
      }
      console.warn(`Ollama API attempt ${attempt + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
    }
  }

  throw new Error('This should never be reached');
}

// Specific prompt templates
export const prompts = {
  processing: (content: string) => `You are a concise learning companion for a neurodivergent learner. Prefer short, concrete output. Avoid long paragraphs. Use JSON when asked.

Given CONTENT:
---
${content}
---
1) Write a 3-bullet summary (<= 40 words total).
2) Suggest 3 to 6 topical tags from: Math, History, Science, Programming, Design, Language, Health, Other.
3) Create 2 to 5 atomic Anki cards with clear fronts and backs.

Return strict JSON: { "summary": string, "tags": string[], "cards": [{"front": string, "back": string}] }`,

  learningMode: (content: string) => `You are a concise learning companion for a neurodivergent learner. Prefer short, concrete output. Avoid long paragraphs. Use JSON when asked.

Given CONTENT:
---
${content}
---
Return strict JSON:
{
  "summary": "one or two sentences",
  "question": "one Socratic question",
  "next_step": "one concrete action the learner can take now"
}`,
};

// Type definitions for expected responses
export interface ProcessingResponse {
  summary: string;
  tags: string[];
  cards: Array<{
    front: string;
    back: string;
  }>;
}

export interface LearningModeResponse {
  summary: string;
  question: string;
  next_step: string;
}
