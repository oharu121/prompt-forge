import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_OKTA_ISSUER } from '$env/static/public';

// Extract the base URL from the issuer URL
const OKTA_BASE_URL = PUBLIC_OKTA_ISSUER.replace(/\/oauth2\/.*$/, '');

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Construct the target URL for the theme stylesheet
    const targetUrl = new URL('/api/internal/brand/theme/style-sheet', OKTA_BASE_URL);
    
    // Copy query parameters
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });
    
    console.log('Fetching theme stylesheet from:', targetUrl.toString());
    
    // Forward the request to Okta
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'text/css'
      }
    });
    
    if (!response.ok) {
      console.error('Theme stylesheet error:', response.status, response.statusText);
      return new Response('Error fetching theme', {
        status: response.status,
        statusText: response.statusText
      });
    }
    
    // Get the CSS content
    const css = await response.text();
    
    // Return the CSS with proper content type
    return new Response(css, {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error fetching theme stylesheet:', error);
    return new Response('Internal server error', { status: 500 });
  }
}; 