interface GptResponse {
  content: string;
  error?: string;
  done?: boolean;
}

interface ThreadCreateResponse {
  id: string;
  name: string;
  assistant_id: string;
  created_at: string;
}

type StreamCallback = (response: GptResponse) => void;

export class GptService {
  private static accessToken: string | null = null;

  static setAccessToken(token: string) {
    this.accessToken = token;
  }

  static async createThread(assistantId: string, name: string): Promise<ThreadCreateResponse> {
    if (!this.accessToken) {
      throw new Error('Access token not set');
    }

    try {
      const response = await fetch('/api/gpt/thread', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistant_id: assistantId,
          name: name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create thread');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  static async generateResponse(prompt: string, onStream?: StreamCallback): Promise<GptResponse> {
    if (!this.accessToken) {
      throw new Error('Access token not set');
    }

    try {
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({prompt})
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate response');
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            onStream?.({ content: fullContent, done: true });
            break;
          }

          const chunk = decoder.decode(value);
          fullContent += chunk;
          onStream?.({ content: fullContent });
        }

        return { content: fullContent };
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error calling GPT API:', error);
      const errorResponse = {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      onStream?.(errorResponse);
      return errorResponse;
    }
  }
} 