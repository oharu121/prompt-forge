import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_OKTA_ISSUER } from '$env/static/public';

// Extract the base URL and app ID from the issuer URL
const issuerUrlParts = PUBLIC_OKTA_ISSUER.match(/^(https:\/\/[^\/]+)\/oauth2\/([^\/]+)\/v1$/);
const OKTA_BASE_URL = issuerUrlParts ? issuerUrlParts[1] : PUBLIC_OKTA_ISSUER;
const APP_ID = issuerUrlParts ? issuerUrlParts[2] : '';

// For .well-known endpoints, we need the base URL without the v1 segment
const OKTA_OAUTH_BASE_URL = issuerUrlParts 
  ? `${OKTA_BASE_URL}/oauth2/${APP_ID}` 
  : PUBLIC_OKTA_ISSUER.replace(/\/v1$/, '');

export const GET: RequestHandler = async ({ request }) => {
  try {
    console.log('Handling OpenID Configuration request');
    
    // Build the correct URL for the .well-known/openid-configuration endpoint
    const targetUrl = new URL('/.well-known/openid-configuration', OKTA_OAUTH_BASE_URL);
    console.log('OpenID Configuration URL:', targetUrl.toString());
    
    // Get request headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Skip host header to avoid conflicts
      if (key.toLowerCase() !== 'host') {
        headers[key] = value;
      }
    });
    
    // Ensure we have the right accept header
    headers['Accept'] = headers['Accept'] || 'application/json';
    
    console.log('Proxying OpenID Configuration request to:', targetUrl.toString());
    
    // Forward the request to Okta
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      console.error('OpenID Configuration error:', response.status, response.statusText);
      
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
    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error in OpenID Configuration handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 