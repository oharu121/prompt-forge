import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_OKTA_ISSUER } from '$env/static/public';

// Extract the base URL from the issuer URL
const issuerUrlParts = PUBLIC_OKTA_ISSUER.match(/^(https:\/\/[^\/]+)\/oauth2\/([^\/]+)\/v1$/);
const OKTA_BASE_URL = issuerUrlParts ? issuerUrlParts[1] : PUBLIC_OKTA_ISSUER.replace(/\/oauth2\/.*$/, '');
const APP_ID = issuerUrlParts ? issuerUrlParts[2] : '';

// For .well-known endpoints, we need the base URL without the v1 segment
const OKTA_OAUTH_BASE_URL = issuerUrlParts 
  ? `${OKTA_BASE_URL}/oauth2/${APP_ID}` 
  : PUBLIC_OKTA_ISSUER.replace(/\/v1$/, '');

// Helper function to handle requests
async function handleRequest(method: string, params: any, request: Request, url: URL) {
  try {
    // Get the path from the URL
    const path = params.path || '';
    
    console.log(`Handling ${method} request for path: ${path}`);
    
    // Build the target URL based on the path
    let targetUrl: URL;
    let actualMethod = method; // We might need to override the method
    
    if (path.includes('.well-known/')) {
      // For .well-known endpoints, use the OAuth base URL without v1
      targetUrl = new URL(path, OKTA_OAUTH_BASE_URL);
      console.log('Well-known path:', targetUrl.toString());
    } else if (path.startsWith('oauth2/')) {
      // Path already contains oauth2/, use the base URL
      targetUrl = new URL(path, OKTA_BASE_URL);
      console.log('OAuth path:', targetUrl.toString());
    } else if (path.startsWith('api/internal/')) {
      // For internal API endpoints, use the base URL
      targetUrl = new URL(path, OKTA_BASE_URL);
      console.log('Internal API path:', targetUrl.toString());
    } else if (path.startsWith('idp/idx/')) {
      // For Identity Engine endpoints, use the base URL
      targetUrl = new URL(path, OKTA_BASE_URL);
      console.log('Identity Engine path:', targetUrl.toString());
      
      // Special handling for introspection endpoint
      if (path.includes('introspect')) {
        console.log('Introspection endpoint detected');
        // Force POST method for introspection
        if (method !== 'POST') {
          console.log(`Converting ${method} to POST for introspection endpoint`);
          actualMethod = 'POST';
        }
      }
    } else {
      // For other paths, use the full issuer URL as base
      targetUrl = new URL(path, PUBLIC_OKTA_ISSUER);
      console.log('Standard path:', targetUrl.toString());
    }
    
    // Copy query parameters
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });
    
    console.log(`Proxying ${method} request to:`, targetUrl.toString());
    
    // Get request headers and body
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Skip host header to avoid conflicts
      if (key.toLowerCase() !== 'host') {
        headers[key] = value;
      }
    });
    
    // Ensure we have the right content type and accept headers
    headers['Accept'] = headers['Accept'] || 'application/json, text/html, */*';
    if (!headers['Content-Type'] && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      headers['Content-Type'] = 'application/json';
    }
    
    // Get the request body for non-GET requests
    let body = undefined;
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS' && request.body) {
      body = await request.text();
    }
    
    // Forward the request to Okta
    const response = await fetch(targetUrl.toString(), {
      method: actualMethod,
      headers,
      body
    });
    
    if (!response.ok) {
      console.error(`Okta proxy error (${method}):`, response.status, response.statusText);
      
      // Get the response text
      const responseText = await response.text();
      
      // Try to parse as JSON for better error logging
      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', JSON.stringify(errorData));
      } catch (e) {
        // Not JSON, log as text
        console.error('Response content (first 500 chars):', responseText.substring(0, 500));
      }
      
      // Return the response as-is, preserving status code and headers
      return new Response(responseText, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json'
        }
      });
    }
    
    // Check content type to determine how to handle the response
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON response
      const data = await response.json();
      return json(data);
    } else if (contentType.includes('text/html')) {
      // Handle HTML response
      const html = await response.text();
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html'
        }
      });
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
    console.error(`Error in Okta proxy (${method}):`, error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle GET requests
export const GET: RequestHandler = async ({ params, request, url }) => {
  return handleRequest('GET', params, request, url);
};

// Handle POST requests
export const POST: RequestHandler = async ({ params, request, url }) => {
  return handleRequest('POST', params, request, url);
};

// Handle PUT requests
export const PUT: RequestHandler = async ({ params, request, url }) => {
  return handleRequest('PUT', params, request, url);
};

// Handle DELETE requests
export const DELETE: RequestHandler = async ({ params, request, url }) => {
  return handleRequest('DELETE', params, request, url);
};

// Handle PATCH requests
export const PATCH: RequestHandler = async ({ params, request, url }) => {
  return handleRequest('PATCH', params, request, url);
};

// Handle HEAD requests
export const HEAD: RequestHandler = async ({ params, request, url }) => {
  return handleRequest('HEAD', params, request, url);
};

// Handle OPTIONS requests (for CORS preflight)
export const OPTIONS: RequestHandler = async ({ params, request, url }) => {
  return handleRequest('OPTIONS', params, request, url);
}; 