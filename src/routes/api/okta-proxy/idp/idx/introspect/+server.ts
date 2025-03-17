import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_OKTA_ISSUER } from '$env/static/public';

// Extract the base URL from the issuer URL
const issuerUrlParts = PUBLIC_OKTA_ISSUER.match(/^(https:\/\/[^\/]+)\/oauth2\/([^\/]+)\/v1$/);
const OKTA_BASE_URL = issuerUrlParts ? issuerUrlParts[1] : PUBLIC_OKTA_ISSUER.replace(/\/oauth2\/.*$/, '');

// Handle all HTTP methods for introspection endpoint
async function handleIntrospect(request: Request) {
  try {
    console.log('Handling introspection request');
    
    // Build the target URL
    const targetUrl = new URL('/idp/idx/introspect', OKTA_BASE_URL);
    console.log('Introspection URL:', targetUrl.toString());
    
    // Get request headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Skip host header to avoid conflicts
      if (key.toLowerCase() !== 'host') {
        headers[key] = value;
      }
    });
    
    // Ensure we have the right content type and accept headers
    headers['Accept'] = headers['Accept'] || 'application/json';
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    
    // Get the request body or create an empty one
    let body = '{}';
    try {
      body = await request.text() || '{}';
    } catch (e) {
      console.warn('Could not read request body, using empty object');
    }
    
    console.log('Proxying introspection request to:', targetUrl.toString());
    
    // Forward the request to Okta, always using POST
    const response = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers,
      body
    });
    
    if (!response.ok) {
      console.error('Introspection error:', response.status, response.statusText);
      
      // Get the response text
      const responseText = await response.text();
      
      // Try to parse as JSON for better error logging
      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', JSON.stringify(errorData));
      } catch (e) {
        // Not JSON, log as text
        console.error('Response content:', responseText);
      }
      
      // Return the response as-is, preserving status code and headers
      return new Response(responseText, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json'
        }
      });
    }
    
    // Handle the response
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON response
      const data = await response.json();
      return json(data);
    } else {
      // Handle other response types
      const text = await response.text();
      return new Response(text, {
        status: 200,
        headers: {
          'Content-Type': contentType
        }
      });
    }
  } catch (error) {
    console.error('Error in introspection handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle GET requests (convert to POST)
export const GET: RequestHandler = async ({ request }) => {
  return handleIntrospect(request);
};

// Handle POST requests
export const POST: RequestHandler = async ({ request }) => {
  return handleIntrospect(request);
};

// Handle all other methods (convert to POST)
export const PUT: RequestHandler = async ({ request }) => {
  return handleIntrospect(request);
};

export const DELETE: RequestHandler = async ({ request }) => {
  return handleIntrospect(request);
};

export const PATCH: RequestHandler = async ({ request }) => {
  return handleIntrospect(request);
};

export const OPTIONS: RequestHandler = async ({ request }) => {
  // For OPTIONS, return CORS headers
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}; 