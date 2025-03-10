interface GptResponse {
  content: string;
  error?: string;
}

export class GptService {
  private static BASE_URL = 'www.my-company-gpt/threads';
  private static accessToken: string | null = null;

  static setAccessToken(token: string) {
    this.accessToken = token;
  }

  static async generateResponse(prompt: string): Promise<GptResponse> {
    if (!this.accessToken) {
      throw new Error('Access token not set');
    }

    try {
      // Simulated API call for now
      // In production, this would be:
      // const response = await fetch(`${this.BASE_URL}`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.accessToken}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ prompt })
      // });
      // const data = await response.json();

      // Simulated response
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        content: `# Generated Response\n\n${prompt}\n\n## Analysis\nThis is a simulated response from the company GPT API. In production, this would be the actual API response.`
      };
    } catch (error) {
      console.error('Error calling GPT API:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 