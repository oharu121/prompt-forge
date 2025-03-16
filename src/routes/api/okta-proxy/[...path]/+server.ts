import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_OKTA_ISSUER } from '$env/static/public';

// Extract the base URL and app ID from the issuer URL
const issuerUrlParts = PUBLIC_OKTA_ISSUER.match(/^(https:\/\/[^\/]+)\/oauth2\/([^\/]+)\/v1$/);
const OKTA_BASE_URL = issuerUrlParts ? issuerUrlParts[1] : PUBLIC_OKTA_ISSUER;
const APP_ID = issuerUrlParts ? issuerUrlParts[2] : '';

export const GET: RequestHandler = async ({ params, request, url }) => {
  try {
    // Get the path from the URL
    const path = params.path || '';
    
    // Build the target URL
    // If the path already contains oauth2/<appId>/v1, use it directly
    // Otherwise, construct the URL based on the base URL
    let targetUrl: URL;
    
    if (path.startsWith('oauth2/')) {
      // Path already contains oauth2/, use the base URL
      targetUrl = new URL(path, OKTA_BASE_URL);
      console.log('Direct path:', targetUrl.toString());
    } else {
      // Path doesn't contain oauth2/, use the full issuer URL as base
      targetUrl = new URL(path, PUBLIC_OKTA_ISSUER);
      console.log('Constructed path:', targetUrl.toString());
    }
    
    // Copy query parameters
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });
    
    console.log('Proxying GET request to:', targetUrl.toString());
    
    // Forward the request to Okta
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Okta proxy error:', response.status, response.statusText);
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
    // If the path already contains oauth2/<appId>/v1, use it directly
    // Otherwise, construct the URL based on the base URL
    let targetUrl: URL;
    
    if (path.startsWith('oauth2/')) {
      // Path already contains oauth2/, use the base URL
      targetUrl = new URL(path, OKTA_BASE_URL);
      console.log('Direct path:', targetUrl.toString());
    } else {
      // Path doesn't contain oauth2/, use the full issuer URL as base
      targetUrl = new URL(path, PUBLIC_OKTA_ISSUER);
      console.log('Constructed path:', targetUrl.toString());
    }
    
    // Get the request body
    const body = await request.text();
    
    console.log('Proxying POST request to:', targetUrl.toString());
    
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
      console.error('Okta proxy error:', response.status, response.statusText);
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