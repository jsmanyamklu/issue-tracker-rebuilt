/**
 * LLM Client - Simple wrapper for making LLM API calls
 * Supports OpenAI and compatible APIs
 */

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  content: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export class LLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.model = process.env.AI_MODEL || 'gpt-4-turbo-preview';
  }

  /**
   * Check if AI is enabled
   */
  isEnabled(): boolean {
    return !!this.apiKey;
  }

  /**
   * Make a completion request to the LLM
   */
  async complete(messages: LLMMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }): Promise<LLMResponse> {
    if (!this.isEnabled()) {
      throw new Error('AI is not enabled. Please set OPENAI_API_KEY environment variable.');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
        response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      tokens: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
    };
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isEnabled()) {
      throw new Error('AI is not enabled. Please set OPENAI_API_KEY environment variable.');
    }

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Embeddings API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Simple prompt helper
   */
  async prompt(systemPrompt: string, userPrompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }): Promise<string> {
    const response = await this.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], options);

    return response.content;
  }
}

// Export singleton instance
export const llmClient = new LLMClient();
