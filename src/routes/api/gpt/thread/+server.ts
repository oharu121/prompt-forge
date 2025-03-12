import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const GPT_API_BASE_URL = 'www.my-company-gpt/threads';

interface ThreadCreateRequest {
  assistant_id: string;
  name: string;
}

export const PUT: RequestHandler = async ({ request, params }) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    throw error(401, 'Access token not provided');
  }

  try {
    const body = await request.json() as ThreadCreateRequest;
    
    // Validate required fields
    if (!body.assistant_id) {
      throw error(400, { message: 'assistant_id is required' });
    }
    if (!body.name) {
      throw error(400, { message: 'name is required' });
    }

    // Generate UUID for the thread
    const threadId = crypto.randomUUID();
    
    const response = await fetch(`${GPT_API_BASE_URL}/${threadId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistant_id: body.assistant_id,
        name: body.name
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw error(response.status, {
        message: errorData.message || 'Failed to create thread'
      });
    }

    const data = await response.json();
    return json(data);
  } catch (e: unknown) {
    console.error('Error creating thread:', e);
    
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