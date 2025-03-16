import { OktaAuth, type UserClaims } from '@okta/okta-auth-js';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
// Import environment variables but don't use them for now
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

// Initialize Okta Auth only in browser environment - DISABLED FOR NOW
let oktaAuth: OktaAuth | null = null;

// Disable Okta initialization - we're only using bookmarklet approach
// if (browser) {
//   // Okta initialization code...
// }

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
  // Skip if not in browser
  if (!browser) {
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
    // Check if we have tokens directly in localStorage (from bookmarklet)
    if (window.localStorage) {
      try {
        const tokenStorage = localStorage.getItem('prompt-forge-token-storage');
        if (tokenStorage) {
          const parsedStorage = JSON.parse(tokenStorage);
          const accessTokenValue = parsedStorage?.accessToken?.value;
          const idTokenValue = parsedStorage?.idToken?.value;
          
          if (accessTokenValue) {
            // Parse the JWT to get user info
            const userInfo = idTokenValue 
              ? parseJwt(idTokenValue) 
              : parseJwt(accessTokenValue);
            
            // Set the auth state with the imported tokens
            authState.set({
              isAuthenticated: true,
              isLoading: false,
              error: null,
              user: userInfo,
              accessToken: accessTokenValue,
              idToken: idTokenValue,
              userInfo
            });
            
            console.log('Using imported tokens for authentication');
            return;
          }
        }
      } catch (e) {
        console.error('Error checking localStorage for tokens:', e);
      }
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
    // Don't show the error to the user, just log it and set unauthenticated state
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
}

// Token refresh logic - DISABLED FOR NOW
export async function refreshToken() {
  // Since we're not using Okta, just return null
  console.log('Token refresh is disabled when using bookmarklet authentication');
  return null;
}

// Login function - DISABLED FOR NOW
export function login() {
  console.log('Direct login is disabled. Please use the bookmarklet to authenticate.');
}

// Logout function
export function logout() {
  if (!browser) {
    return;
  }

  // Clear tokens from localStorage
  try {
    localStorage.removeItem('prompt-forge-token-storage');
  } catch (e) {
    console.error('Error removing tokens from localStorage:', e);
  }
  
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

// Get access token
export async function getAccessToken() {
  if (!browser) {
    return null;
  }

  try {
    // First check if we have a token in the auth state
    let currentToken = null;
    authState.subscribe(state => {
      currentToken = state.accessToken;
    })();
    
    if (currentToken) {
      return currentToken;
    }
    
    // If no token in auth state, check localStorage directly
    if (window.localStorage) {
      try {
        const tokenStorage = localStorage.getItem('prompt-forge-token-storage');
        if (tokenStorage) {
          const parsedStorage = JSON.parse(tokenStorage);
          const accessTokenValue = parsedStorage?.accessToken?.value;
          
          if (accessTokenValue) {
            return accessTokenValue;
          }
        }
      } catch (e) {
        console.error('Error checking localStorage for tokens:', e);
      }
    }
    
    return null;
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