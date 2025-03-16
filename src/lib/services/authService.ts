import { OktaAuth, type UserClaims } from '@okta/okta-auth-js';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_OKTA_CLIENT_ID, PUBLIC_OKTA_ISSUER } from '$env/static/public';

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
  oktaAuth = new OktaAuth({
    issuer: PUBLIC_OKTA_ISSUER,
    clientId: PUBLIC_OKTA_CLIENT_ID,
    redirectUri: '/login/callback',
    scopes: ['openid', 'email', 'profile'],
    pkce: true,
    tokenManager: {
      storage: 'localStorage',
      storageKey: 'ota-token-storage' // Match the key used by GPT service
    }
  });
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

  oktaAuth.token.getWithRedirect({
    scopes: ['openid', 'email', 'profile']
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