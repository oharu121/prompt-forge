/**
 * Okta Auth JS local wrapper
 * This file exports OktaAuth and necessary types from the prebuilt library
 */

// Import the UMD module 
// @ts-ignore - Ignore type checking for the import
import OktaAuthDefault from './umd/default.js';

// Export the OktaAuth class
export const OktaAuth = OktaAuthDefault;

// Export OktaAuthOptions interface
export interface OktaAuthOptions {
  issuer: string;
  clientId: string;
  redirectUri?: string;
  postLogoutRedirectUri?: string;
  scopes?: string[];
  pkce?: boolean;
  authorizeUrl?: string;
  tokenUrl?: string;
  userinfoUrl?: string;
  logoutUrl?: string;
  revokeUrl?: string;
  introspectUrl?: string;
  idx?: {
    useGenericRemediator?: boolean;
    [key: string]: any;
  };
  tokenManager?: {
    storage?: string;
    storageKey?: string;
    autoRenew?: boolean;
    [key: string]: any;
  };
  responseType?: string[];
  [key: string]: any;
}

// Export UserClaims interface
export interface UserClaims {
  sub?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  ver?: number;
  iss?: string;
  aud?: string;
  iat?: number;
  exp?: number;
  jti?: string;
  amr?: string[];
  idp?: string;
  nonce?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  zoneinfo?: string;
  updated_at?: number;
  auth_time?: number;
  at_hash?: string;
  [key: string]: any;
} 