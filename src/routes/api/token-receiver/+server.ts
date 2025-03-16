import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * This endpoint receives tokens from the bookmarklet and redirects to the main app.
 * It doesn't store the tokens server-side but passes them to the client via URL fragment.
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Get tokens from query parameters
    const accessToken = url.searchParams.get('access_token');
    const idToken = url.searchParams.get('id_token');
    
    // Validate access token (basic format check)
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Access token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Basic JWT format validation (header.payload.signature)
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    if (!jwtRegex.test(accessToken)) {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Construct redirect URL with tokens in the fragment
    let redirectUrl = '/';
    const fragment = new URLSearchParams();
    fragment.append('access_token', accessToken);
    if (idToken) {
      fragment.append('id_token', idToken);
    }
    
    // Redirect to main app with tokens in fragment
    // This way, tokens are not sent to the server but are accessible by client-side JavaScript
    return redirect(302, `${redirectUrl}#${fragment.toString()}`);
  } catch (err) {
    console.error('Error in token receiver:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 