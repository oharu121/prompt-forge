import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const GPT_API_URL = 'www.my-company-gpt/stream';
export const POST: RequestHandler = async ({ request }) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    throw error(401, 'Access token not provided');
  }

  try {
    const { prompt } = await request.json();
    
    const response = await fetch(GPT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    // Create a new ReadableStream that will forward the events
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            controller.enqueue(value);
          }
        } catch (e) {
          controller.error(e);
        } finally {
          reader.releaseLock();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (e: unknown) {
    console.error('Error proxying to GPT API:', e);
    
    let errorMessage = 'Unknown error occurred';
    if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === 'string') {
      errorMessage = e;
    } else if (e && typeof e === 'object' && 'message' in e) {
      errorMessage = String(e.message);
    }
    
    throw error(500, { message: errorMessage });
  }
}; 