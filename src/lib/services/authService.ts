import { OktaAuth, type UserClaims } from '@okta/okta-auth-js';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_OKTA_CLIENT_ID, PUBLIC_OKTA_ISSUER, PUBLIC_OKTA_REDIRECT_URI } from '$env/static/public';

// Define the auth state interface
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  user: UserClaims | null;
  accessToken: string | null;
  idToken: string | null;
  userInfo: UserClaims | null;
}

// Create a store for authentication state
export const authState = writable<AuthState>({
  isAuthenticated: false,
  isLoading: true,
  error: null,
  user: null,
  accessToken: null,
  idToken: null,
  userInfo: null
});

// Initialize Okta Auth only in browser environment
let oktaAuth: OktaAuth | null = null;

// Only initialize in browser environment
if (browser) {
  // Use our server-side proxy to avoid CORS issues
  const useProxy = true; // Set to false to use direct Okta communication
  
  // Fix for the duplicated oauth2 path issue
  // The Okta Auth SDK automatically appends oauth2/v1/authorize to the issuer URL
  // So we need to provide the base URL without the oauth2/<appId>/v1 part
  
  // Extract the base URL and app ID from the issuer URL
  const issuerUrlParts = PUBLIC_OKTA_ISSUER.match(/^(https:\/\/[^\/]+)\/oauth2\/([^\/]+)\/v1$/);
  const oktaBaseUrl = issuerUrlParts ? issuerUrlParts[1] : PUBLIC_OKTA_ISSUER;
  const appId = issuerUrlParts ? issuerUrlParts[2] : '';
  
  const issuerUrl = useProxy 
    ? window.location.origin + '/api/okta-proxy' 
    : oktaBaseUrl;
  
  // For debugging
  console.log('Okta Base URL:', oktaBaseUrl);
  console.log('App ID:', appId);
  console.log('Issuer URL:', issuerUrl);
  
  // Store our actual redirect URI to use after authentication
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('actual_redirect_uri', window.location.origin + '/login/callback');
  }
  
  oktaAuth = new OktaAuth({
    issuer: issuerUrl,
    clientId: PUBLIC_OKTA_CLIENT_ID,
    redirectUri: PUBLIC_OKTA_REDIRECT_URI, // Use the registered redirect URI
    scopes: ['openid', 'email', 'profile'],
    pkce: true,
    // If using the proxy, we need to specify the authorization server ID
    // to construct the correct URLs
    authorizeUrl: useProxy ? `/api/okta-proxy/oauth2/${appId}/v1/authorize` : undefined,
    tokenUrl: useProxy ? `/api/okta-proxy/oauth2/${appId}/v1/token` : undefined,
    userinfoUrl: useProxy ? `/api/okta-proxy/oauth2/${appId}/v1/userinfo` : undefined,
    // Add custom URLs for other endpoints
    logoutUrl: useProxy ? `/api/okta-proxy/oauth2/${appId}/v1/logout` : undefined,
    revokeUrl: useProxy ? `/api/okta-proxy/oauth2/${appId}/v1/revoke` : undefined,
    // Add Identity Engine endpoints
    idx: {
      useGenericRemediator: true
    },
    // Add HTTP request interceptors to handle introspection requests
    httpRequestInterceptors: [
      (request) => {
        const originalUrl = request.url;
        
        // Check if this is an introspection request
        if (originalUrl && originalUrl.includes('/idp/idx/introspect')) {
          console.log('[Interceptor] Caught introspection request:', originalUrl);
          
          // Redirect to our proxy
          const proxyUrl = `${window.location.origin}/api/okta-proxy/idp/idx/introspect`;
          console.log('[Interceptor] Redirecting to:', proxyUrl);
          
          // Modify the request
          request.url = proxyUrl;
          request.method = 'POST';
        }
        
        return request;
      }
    ],
    // Add a custom HTTP request client to route all requests through our proxy
    httpRequestClient: async (requestInfo: any) => {
      try {
        const originalUrl = requestInfo.url as string;
        let method = requestInfo.method as string;
        
        console.log(`[httpRequestClient] Original request: ${method} ${originalUrl}`);
        console.log(`[httpRequestClient] Headers:`, requestInfo.headers);
        console.log(`[httpRequestClient] Args:`, requestInfo.args);
        
        let proxyUrl = '';
        
        // Special handling for introspection endpoint
        if (originalUrl.includes('/idp/idx/introspect')) {
          console.log('[httpRequestClient] Detected introspection request');
          proxyUrl = '/api/okta-proxy/idp/idx/introspect';
          // Force POST method for introspection
          if (method !== 'POST') {
            console.log(`[httpRequestClient] Changing method from ${method} to POST for introspection`);
            method = 'POST';
          }
        }
        // Special handling for theme stylesheet
        else if (originalUrl.includes('/api/internal/brand/theme/style-sheet')) {
          console.log('[httpRequestClient] Detected theme stylesheet request');
          proxyUrl = '/api/okta-proxy/api/internal/brand/theme/style-sheet';
        }
        // Special handling for .well-known endpoints
        else if (originalUrl.includes('/.well-known/')) {
          console.log('[httpRequestClient] Detected .well-known request');
          const wellKnownPath = originalUrl.split('/.well-known/')[1];
          proxyUrl = `/api/okta-proxy/.well-known/${wellKnownPath}`;
        }
        // Handle other Identity Engine endpoints
        else if (originalUrl.includes('/idp/idx/')) {
          console.log('[httpRequestClient] Detected Identity Engine request');
          const idxPath = originalUrl.split('/idp/idx/')[1];
          proxyUrl = `/api/okta-proxy/idp/idx/${idxPath}`;
        }
        // Handle other endpoints
        else {
          console.log('[httpRequestClient] Using default proxy handling');
          // Extract path from the original URL
          const urlObj = new URL(originalUrl);
          const path = urlObj.pathname;
          proxyUrl = `/api/okta-proxy${path}`;
        }
        
        console.log(`[httpRequestClient] Proxying to: ${proxyUrl}`);
        
        // Prepare headers
        const headers = { ...requestInfo.headers } as Record<string, string>;
        
        // Make the request through our proxy
        const response = await fetch(proxyUrl, {
          method,
          headers,
          body: requestInfo.args?.body
        });
        
        console.log(`[httpRequestClient] Response status: ${response.status}`);
        
        if (!response.ok) {
          console.error(`[httpRequestClient] Error response: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error(`[httpRequestClient] Error details: ${errorText}`);
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        
        // Process the response
        const contentType = response.headers.get('Content-Type') || '';
        let responseData;
        
        if (contentType.includes('application/json')) {
          responseData = await response.json();
          console.log('[httpRequestClient] JSON response:', responseData);
        } else {
          responseData = await response.text();
          console.log('[httpRequestClient] Text response length:', responseData.length);
        }
        
        return {
          status: response.status,
          responseText: typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
          responseType: contentType.includes('application/json') ? 'json' : 'text',
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (error) {
        console.error('[httpRequestClient] Request error:', error);
        throw error;
      }
    },
    tokenManager: {
      storage: 'localStorage',
      storageKey: 'ota-token-storage' // Match the key used by GPT service
    },
    // Add a response type to ensure we get tokens
    responseType: ['token', 'id_token']
  });
  
  // Monkey-patch the introspect function to use our proxy
  if (useProxy && oktaAuth.idx) {
    // Store the original introspect function
    const originalIntrospect = oktaAuth.idx.introspect;
    
    // Override the introspect function
    oktaAuth.idx.introspect = async function(options = {}) {
      console.log('[Monkey Patch] Intercepted introspect call with options:', options);
      
      try {
        // Make a direct request to our proxy instead
        const proxyUrl = `${window.location.origin}/api/okta-proxy/idp/idx/introspect`;
        console.log('[Monkey Patch] Making request to proxy:', proxyUrl);
        
        // Prepare the request body
        const body = options.stateHandle ? 
          JSON.stringify({ stateToken: options.stateHandle }) : 
          JSON.stringify({ interactionHandle: options.interactionHandle });
        
        // Make the request
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body
        });
        
        if (!response.ok) {
          console.error('[Monkey Patch] Introspection failed:', response.status);
          throw new Error(`Introspection failed: ${response.status}`);
        }
        
        // Parse the response
        const data = await response.json();
        console.log('[Monkey Patch] Introspection successful:', data);
        
        // Return the response in the format expected by the SDK
        return data;
      } catch (error) {
        console.error('[Monkey Patch] Error in introspect:', error);
        // Fall back to the original function if our proxy fails
        return originalIntrospect.call(this, options);
      }
    };
    
    console.log('[Monkey Patch] Successfully patched introspect function');
  }
  
  // Add a global fetch interceptor to catch introspection requests
  if (useProxy) {
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Check if this is an introspection request
      if (url.includes('/idp/idx/introspect')) {
        console.log('[Fetch Interceptor] Caught introspection request:', url);
        
        // Redirect to our proxy
        const proxyUrl = window.location.origin + '/api/okta-proxy/idp/idx/introspect';
        console.log('[Fetch Interceptor] Redirecting to:', proxyUrl);
        
        // Always use POST for introspection
        const newInit = {
          ...init,
          method: 'POST'
        };
        
        return originalFetch(proxyUrl, newInit);
      }
      
      // For all other requests, proceed normally
      return originalFetch(input, init);
    };
  }
}

// Helper function to extract token values safely
function getTokenValue(token: any): string | null {
  if (!token) return null;
  
  // Different token formats might have different properties
  if (typeof token === 'string') return token;
  if (token.accessToken) return token.accessToken;
  if (token.idToken) return token.idToken;
  if (token.value) return token.value;
  
  return null;
}

// Helper function to extract claims safely
function getClaims(token: any): UserClaims | null {
  if (!token) return null;
  
  if (token.claims) return token.claims;
  if (token.idToken && token.idToken.claims) return token.idToken.claims;
  
  return null;
}

// Initialize auth state
export async function initAuth() {
  // Skip if not in browser or Okta Auth is not initialized
  if (!browser || !oktaAuth) {
    authState.set({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
      accessToken: null,
      idToken: null,
      userInfo: null
    });
    return;
  }

  try {
    // Check for tokens in the URL (after redirect)
    const { tokens } = await oktaAuth.token.parseFromUrl();
    if (tokens && tokens.accessToken) {
      // Extract token values and claims
      const accessTokenValue = getTokenValue(tokens.accessToken);
      const idTokenValue = getTokenValue(tokens.idToken);
      const userInfo = getClaims(tokens.idToken);
      
      authState.set({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: userInfo,
        accessToken: accessTokenValue,
        idToken: idTokenValue,
        userInfo
      });
      return;
    }
    
    // Check if we have tokens in the token manager
    const accessToken = await oktaAuth.tokenManager.get('accessToken');
    const idToken = await oktaAuth.tokenManager.get('idToken');
    
    if (accessToken && !oktaAuth.tokenManager.hasExpired(accessToken)) {
      // Extract token values and claims
      const accessTokenValue = getTokenValue(accessToken);
      const idTokenValue = getTokenValue(idToken);
      const userInfo = getClaims(idToken);
      
      authState.set({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: userInfo,
        accessToken: accessTokenValue,
        idToken: idTokenValue,
        userInfo
      });
      return;
    }
    
    // Check if there's an active Okta session
    const session = await oktaAuth.session.exists();
    if (session) {
      await oktaAuth.session.get();
      const tokenResponse = await oktaAuth.token.getWithoutPrompt();
      
      // Extract token values and claims from token response
      const tokens = tokenResponse.tokens || tokenResponse;
      const accessTokenValue = getTokenValue(tokens.accessToken);
      const idTokenValue = getTokenValue(tokens.idToken);
      const userInfo = getClaims(tokens.idToken);
      
      authState.set({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: userInfo,
        accessToken: accessTokenValue,
        idToken: idTokenValue,
        userInfo
      });
      return;
    }
    
    // No authentication found
    authState.set({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
      accessToken: null,
      idToken: null,
      userInfo: null
    });
  } catch (error) {
    console.error('Error initializing auth:', error);
    authState.set({
      isAuthenticated: false,
      isLoading: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
      user: null,
      accessToken: null,
      idToken: null,
      userInfo: null
    });
  }
}

// Token refresh logic
export async function refreshToken() {
  if (!browser || !oktaAuth) {
    throw new Error('Authentication is only available in browser environment');
  }

  try {
    // Use Okta's built-in token refresh
    const accessToken = await oktaAuth.tokenManager.renew('accessToken');
    const idToken = await oktaAuth.tokenManager.get('idToken');
    
    if (!accessToken) {
      throw new Error('Failed to refresh token');
    }
    
    // Extract token values and claims
    const accessTokenValue = getTokenValue(accessToken);
    const idTokenValue = getTokenValue(idToken);
    const userInfo = getClaims(idToken);
    
    if (!accessTokenValue) {
      throw new Error('Failed to extract access token value');
    }
    
    authState.set({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: userInfo,
      accessToken: accessTokenValue,
      idToken: idTokenValue,
      userInfo
    });
    
    return accessTokenValue;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // If refresh fails, clear auth state and redirect to login
    logout();
    throw error;
  }
}

// Login function
export function login() {
  if (!browser || !oktaAuth) {
    throw new Error('Authentication is only available in browser environment');
  }

  // Store the current URL to redirect back after authentication
  sessionStorage.setItem('auth_redirect_url', window.location.href);

  // Add a custom state parameter to track our app's state
  const customState = btoa(JSON.stringify({
    appRedirect: window.location.origin + '/login/callback'
  }));

  oktaAuth.token.getWithRedirect({
    scopes: ['openid', 'email', 'profile'],
    state: customState
  });
}

// Logout function
export function logout() {
  if (!browser || !oktaAuth) {
    return;
  }

  // Clear tokens from storage
  oktaAuth.tokenManager.clear();
  
  // Sign out from Okta
  oktaAuth.signOut();
  
  // Update auth state
  authState.set({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    user: null,
    accessToken: null,
    idToken: null,
    userInfo: null
  });
}

// Get access token with auto-refresh if expired
export async function getAccessToken() {
  if (!browser || !oktaAuth) {
    return null;
  }

  try {
    // Try to get token from Okta token manager
    const accessToken = await oktaAuth.tokenManager.get('accessToken');
    
    if (accessToken && !oktaAuth.tokenManager.hasExpired(accessToken)) {
      return getTokenValue(accessToken);
    }
    
    // If token is expired, try to refresh
    return await refreshToken();
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

// Get user info
export function getUserInfo() {
  let info = null;
  authState.subscribe(state => {
    info = state.userInfo;
  })();
  return info;
}