import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * This endpoint handles redirects from Okta to our application.
 * It preserves the authentication tokens in the URL and redirects to our actual callback page.
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Get all query parameters from the URL
    const queryParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      queryParams.set(key, value);
    });
    
    // Construct the redirect URL to our actual callback page
    const redirectUrl = `/login/callback?${queryParams.toString()}`;
    
    console.log('Redirecting from Okta to:', redirectUrl);
    
    // Redirect to our actual callback page with all query parameters
    throw redirect(302, redirectUrl);
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    
    console.error('Error in auth redirect:', error);
    throw redirect(302, '/login/error');
  }
}; 