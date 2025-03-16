import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * This endpoint handles authentication callbacks from Okta.
 * It can process various authentication scenarios and redirect to the appropriate page.
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Get all query parameters from the URL
    const queryParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      queryParams.set(key, value);
    });
    
    // Log the received parameters for debugging
    console.log('Auth handler received parameters:', Object.fromEntries(queryParams.entries()));
    
    // Check if there's an error
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    if (error) {
      // Redirect to error page with error details
      return redirect(302, `/login/error?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`);
    }
    
    // Check for authorization code or tokens
    const code = url.searchParams.get('code');
    const accessToken = url.searchParams.get('access_token');
    const idToken = url.searchParams.get('id_token');
    
    if (code || accessToken || idToken) {
      // We have authentication data, redirect to the callback page
      return redirect(302, `/login/callback?${queryParams.toString()}`);
    }
    
    // If we don't have authentication data or an error, redirect to the login page
    return redirect(302, '/login');
  } catch (error) {
    console.error('Error in auth handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 