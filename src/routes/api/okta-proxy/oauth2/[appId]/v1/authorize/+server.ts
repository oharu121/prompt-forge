import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_OKTA_ISSUER } from '$env/static/public';

// Extract the base URL from the issuer URL
const issuerUrlParts = PUBLIC_OKTA_ISSUER.match(/^(https:\/\/[^\/]+)\/oauth2\/([^\/]+)\/v1$/);
const OKTA_BASE_URL = issuerUrlParts ? issuerUrlParts[1] : PUBLIC_OKTA_ISSUER.replace(/\/oauth2\/.*$/, '');
const APP_ID = issuerUrlParts ? issuerUrlParts[2] : '';

export const GET: RequestHandler = async ({ url, request }) => {
  try {
    console.log('Handling authorize request');
    
    // Build the target URL
    const targetUrl = new URL(`/oauth2/${APP_ID}/v1/authorize`, OKTA_BASE_URL);
    
    // Copy all query parameters
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });
    
    console.log('Proxying authorize request to:', targetUrl.toString());
    
    // Forward the request to Okta
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'User-Agent': request.headers.get('User-Agent') || 'SvelteKit'
      }
    });
    
    if (!response.ok) {
      console.error('Authorize error:', response.status, response.statusText);
      return new Response(await response.text(), {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/html'
        }
      });
    }
    
    // Get the HTML response
    const html = await response.text();
    
    // Extract the stateToken from the HTML
    const stateTokenMatch = html.match(/var\s+stateToken\s*=\s*["']([^"']*)["']/);
    const stateToken = stateTokenMatch ? stateTokenMatch[1] : null;
    
    console.log('Extracted stateToken:', stateToken);
    
    if (stateToken) {
      // Make an introspection request with the stateToken
      console.log('Making introspection request with stateToken');
      
      try {
        const introspectUrl = new URL('/idp/idx/introspect', OKTA_BASE_URL);
        const introspectResponse = await fetch(introspectUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ stateToken })
        });
        
        console.log('Introspection response status:', introspectResponse.status);
        
        if (introspectResponse.ok) {
          console.log('Introspection successful');
          // We don't need to do anything with the response, just making sure it works
        } else {
          console.error('Introspection failed:', introspectResponse.status);
          console.error('Error response:', await introspectResponse.text());
        }
      } catch (error) {
        console.error('Error making introspection request:', error);
      }
    }
    
    // Return the original HTML response
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      }
    });
  } catch (error) {
    console.error('Error in authorize handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 