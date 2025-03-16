import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_OKTA_ISSUER, PUBLIC_OKTA_CLIENT_ID, PUBLIC_OKTA_REDIRECT_URI } from '$env/static/public';

/**
 * This endpoint provides debug information about the Okta configuration.
 * It helps diagnose issues with the authentication flow.
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Extract the base URL and app ID from the issuer URL
    const issuerUrlParts = PUBLIC_OKTA_ISSUER.match(/^(https:\/\/[^\/]+)\/oauth2\/([^\/]+)\/v1$/);
    const oktaBaseUrl = issuerUrlParts ? issuerUrlParts[1] : PUBLIC_OKTA_ISSUER;
    const appId = issuerUrlParts ? issuerUrlParts[2] : '';
    
    // Construct the authorization URL that would be used
    const authUrl = `${oktaBaseUrl}/oauth2/${appId}/v1/authorize`;
    const tokenUrl = `${oktaBaseUrl}/oauth2/${appId}/v1/token`;
    
    // Get the current origin
    const origin = url.origin;
    
    // Construct the redirect URI that would be used
    const redirectUri = PUBLIC_OKTA_REDIRECT_URI || `${origin}/login/callback`;
    
    // Construct a sample authorization URL
    const sampleAuthUrl = `${authUrl}?client_id=${PUBLIC_OKTA_CLIENT_ID}&response_type=code&scope=openid+email+profile&redirect_uri=${encodeURIComponent(redirectUri)}&state=sample-state`;
    
    // Return debug information
    return json({
      config: {
        issuer: PUBLIC_OKTA_ISSUER,
        clientId: PUBLIC_OKTA_CLIENT_ID ? PUBLIC_OKTA_CLIENT_ID.substring(0, 5) + '...' : 'Not set',
        redirectUri: redirectUri,
        appOrigin: origin
      },
      parsed: {
        oktaBaseUrl,
        appId,
        authUrl,
        tokenUrl
      },
      sampleUrls: {
        authorizationUrl: sampleAuthUrl
      },
      tips: [
        "The redirect_uri must exactly match what's configured in Okta",
        "Check for any trailing slashes or protocol differences (http vs https)",
        "Ensure the client_id is correct",
        "Verify that the authorization server ID in the issuer URL is correct"
      ]
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return json({
      error: 'Error generating debug information',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 