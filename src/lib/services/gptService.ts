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
      let buffer = '';

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            onStream?.({ content: fullContent, done: true });
            break;
          }

          // Decode the chunk and add it to the buffer
          const chunk = decoder.decode(value);
          buffer += chunk;
          
          // Process complete events in the buffer
          const lines = buffer.split('\n\n');
          // Keep the last potentially incomplete event in the buffer
          buffer = lines.pop() || '';
          
          for (const eventBlock of lines) {
            const eventLines = eventBlock.split('\n');
            let eventType = '';
            let eventData = '';
            
            // Extract event type and data
            for (const line of eventLines) {
              if (line.startsWith('event: ')) {
                eventType = line.substring(7).trim();
              } else if (line.startsWith('data: ')) {
                eventData = line.substring(6).trim();
              }
            }
            
            // Skip metadata and end events
            if (eventType === 'metadata' || eventType === 'end') {
              continue;
            }
            
            // Process data events
            if (eventType === 'data' && eventData) {
              try {
                const parsedData = JSON.parse(eventData);
                
                // Process array of messages
                if (Array.isArray(parsedData)) {
                  for (const message of parsedData) {
                    // Only process AI messages
                    if (message.type === 'ai' && message.content) {
                      fullContent += message.content;
                      onStream?.({ content: fullContent });
                    }
                  }
                }
              } catch (e) {
                console.error('Error parsing event data:', e);
              }
            }
          }
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