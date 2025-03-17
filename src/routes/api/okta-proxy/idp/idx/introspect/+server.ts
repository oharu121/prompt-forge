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
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
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
      const bodyText = await request.text();
      console.log('Request body:', bodyText);
      body = bodyText || '{}';
    } catch (e) {
      console.warn('Could not read request body, using empty object');
    }
    
    console.log('Proxying introspection request to:', targetUrl.toString());
    console.log('With headers:', headers);
    
    // Forward the request to Okta, always using POST
    const response = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers,
      body
    });
    
    console.log('Introspection response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('Introspection error:', response.status, response.statusText);
      
      // Get the response text
      const responseText = await response.text();
      console.error('Error response:', responseText);
      
      // Try to parse as JSON for better error logging
      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', JSON.stringify(errorData));
      } catch (e) {
        // Not JSON, log as text
        console.error('Response is not JSON');
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
    console.log('Response content type:', contentType);
    
    if (contentType.includes('application/json')) {
      // Handle JSON response
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data));
      return json(data);
    } else {
      // Handle other response types
      const text = await response.text();
      console.log('Response text:', text.substring(0, 200) + '...');
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
  console.log('GET request to introspection endpoint');
  return handleIntrospect(request);
};

// Handle POST requests
export const POST: RequestHandler = async ({ request }) => {
  console.log('POST request to introspection endpoint');
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

// Handle OPTIONS requests (for CORS preflight)
export const OPTIONS: RequestHandler = async ({ request }) => {
  console.log('OPTIONS request to introspection endpoint');
  // For OPTIONS, return CORS headers
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      'Access-Control-Max-Age': '86400'
    }
  });
}; 