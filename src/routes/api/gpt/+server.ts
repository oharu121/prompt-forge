import { error } from '@sveltejs/kit';
import https from 'https';
import fetch from 'node-fetch';
import type { RequestHandler } from '@sveltejs/kit';
import { DEFAULT_ASSISTANT_ID, GPT_BASE_URL } from '$env/static/private';

const agent = new https.Agent(
  {
    rejectUnauthorized: false
  }
);

export const POST: RequestHandler = async ({ request }) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    throw error(401, 'Access token not provided');
  }

  try {
    const { prompt } = await request.json();
    
    // First, create a new thread
    const threadId = crypto.randomUUID();
    const threadResponse = await fetch(`${GPT_BASE_URL}/threads/${threadId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistant_id: DEFAULT_ASSISTANT_ID,
        name: `Thread-${new Date().toISOString()}`
      }),
      agent: agent
    });

    if (!threadResponse.ok) {
      const errorData = await threadResponse.json() as { message?: string };
      throw error(threadResponse.status, {
        message: errorData.message || 'Failed to create thread'
      });
    }

    // Now use the new thread ID for the GPT request
    const response = await fetch(`${GPT_BASE_URL}/runs/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: [
          {
            additional_kwargs: {
            },
            type: 'human',
            example: false,
            content: prompt,
            filename: null,
            imagepath: null,
            web_search_enabled: true
          }
        ],
        assistant_id: DEFAULT_ASSISTANT_ID
        ,
        thread_id: threadId,
       }),
       agent: agent
    });

    return new Response(response.body as unknown as ReadableStream, {
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