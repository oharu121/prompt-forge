import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_OKTA_ISSUER } from '$env/static/public';

export const GET: RequestHandler = async ({ params, request, url }) => {
  try {
    // Get the path from the URL
    const path = params.path || '';
    
    // Build the target URL
    const targetUrl = new URL(path, PUBLIC_OKTA_ISSUER);
    
    // Copy query parameters
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });
    
    // Forward the request to Okta
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return new Response(await response.text(), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error in Okta proxy:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: RequestHandler = async ({ params, request }) => {
  try {
    // Get the path from the URL
    const path = params.path || '';
    
    // Build the target URL
    const targetUrl = new URL(path, PUBLIC_OKTA_ISSUER);
    
    // Get the request body
    const body = await request.text();
    
    // Forward the request to Okta
    const response = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body
    });
    
    if (!response.ok) {
      return new Response(await response.text(), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error in Okta proxy:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 