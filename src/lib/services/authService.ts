import { OktaAuth, type UserClaims, type HttpRequestClient, type AccessToken, type IDToken, type Tokens } from '@okta/okta-auth-js';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
// Import environment variables but don't use them for now
import { PUBLIC_OKTA_CLIENT_ID, PUBLIC_OKTA_ISSUER, PUBLIC_OKTA_REDIRECT_URI } from '$env/static/public';

// Define interfaces for Okta request handling
interface OktaRequestInfo {
  url: string;
  method: string;
  headers: Record<string, string>;
  args?: {
    body?: string;
  };
}

interface OktaResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseText: string;
}

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

if (browser) {
  oktaAuth = new OktaAuth({
    issuer: PUBLIC_OKTA_ISSUER,
    clientId: PUBLIC_OKTA_CLIENT_ID,
    redirectUri: PUBLIC_OKTA_REDIRECT_URI,
    tokenManager: {
      autoRenew: true,
      autoRemove: true,
      storage: 'localStorage'
    },
    httpRequestClient: (async (method: string, url: string, args?: any) => {
      // Determine if this is an internal Okta request
      const urlObj = new URL(url);
      const isInternalRequest = urlObj.pathname.startsWith('/api/internal/');
      
      // Construct the proxy URL
      const proxyUrl = new URL('/api/okta-proxy' + (isInternalRequest ? urlObj.pathname : urlObj.pathname.replace(PUBLIC_OKTA_ISSUER, '')), window.location.origin);
      
      // Copy query parameters
      urlObj.searchParams.forEach((value, key) => {
        proxyUrl.searchParams.set(key, value);
      });

      // Make the request through our proxy
      const response = await fetch(proxyUrl.toString(), {
        method,
        headers: {
          ...(args?.headers || {}),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: args?.data
      });

      const responseData = await response.json().catch(() => null);

      return {
        responseText: await response.text().catch(() => ''),
        status: response.status,
        responseType: 'json',
        responseJSON: responseData,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      };
    }) as HttpRequestClient
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

// Helper function to parse JWT token and extract claims
function parseJwt(token: string): any {
  try {
    // Split the token and get the payload part
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// Initialize auth state
export async function initAuth() {
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
    // Check for existing tokens
    const accessToken = await oktaAuth.tokenManager.get('accessToken') as AccessToken;
    const idToken = await oktaAuth.tokenManager.get('idToken') as IDToken;
    
    if (accessToken && idToken) {
      const userInfo = await oktaAuth.token.getUserInfo();
      
      authState.set({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: userInfo,
        accessToken: accessToken.accessToken,
        idToken: idToken.idToken,
        userInfo
      });
      return;
    }

    // Check for tokens in URL
    const { tokens } = await oktaAuth.token.parseFromUrl();
    
    if (tokens) {
      // Store tokens
      const { accessToken, idToken } = tokens as Tokens;
      if (accessToken) await oktaAuth.tokenManager.add('accessToken', accessToken);
      if (idToken) await oktaAuth.tokenManager.add('idToken', idToken);
      
      const userInfo = await oktaAuth.token.getUserInfo();
      
      authState.set({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user: userInfo,
        accessToken: accessToken?.accessToken || null,
        idToken: idToken?.idToken || null,
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
      error: error instanceof Error ? error : new Error(String(error)),
      user: null,
      accessToken: null,
      idToken: null,
      userInfo: null
    });
  }
}

// Token refresh
export async function refreshToken() {
  if (!browser || !oktaAuth) {
    return null;
  }

  try {
    const { tokens } = await oktaAuth.token.getWithoutPrompt();
    return tokens.accessToken?.accessToken || null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

// Login function
export function login() {
  if (browser && oktaAuth) {
    oktaAuth.signInWithRedirect();
  }
}

// Logout function
export async function logout() {
  if (!browser || !oktaAuth) {
    return;
  }

  try {
    await oktaAuth.signOut();
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
    console.error('Error during logout:', error);
  }
}

// Get access token
export async function getAccessToken() {
  if (!browser || !oktaAuth) {
    return null;
  }

  try {
    const token = await oktaAuth.tokenManager.get('accessToken') as AccessToken;
    return token?.accessToken || null;
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