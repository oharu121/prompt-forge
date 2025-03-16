<script lang="ts">
  import { onMount } from 'svelte';
  import { getAccessToken, authState } from '$lib/services/authService';
  import * as Card from "$lib/components/ui/card";
  
  let accessToken: string | null = null;
  let tokenInfo: any = null;
  let error: string | null = null;
  
  // Function to parse JWT token
  function parseJwt(token: string): any {
    try {
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
      error = e instanceof Error ? e.message : 'Error parsing token';
      return null;
    }
  }
  
  async function checkToken() {
    try {
      accessToken = await getAccessToken();
      
      if (accessToken) {
        tokenInfo = parseJwt(accessToken);
      } else {
        error = 'No access token found';
      }
    } catch (e) {
      console.error('Error checking token:', e);
      error = e instanceof Error ? e.message : 'Error checking token';
    }
  }
  
  onMount(() => {
    checkToken();
  });
</script>

<main class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-6">Bookmarklet Test Page</h1>
  
  <Card.Root class="mb-8">
    <Card.Header>
      <Card.Title>Authentication Status</Card.Title>
      <Card.Description>
        This page tests if the token from the bookmarklet was successfully imported.
      </Card.Description>
    </Card.Header>
    <Card.Content>
      {#if $authState.isLoading}
        <p>Loading authentication status...</p>
      {:else if $authState.isAuthenticated}
        <div class="p-4 bg-green-50 rounded mb-4">
          <p class="text-green-700 font-bold">Authentication Successful!</p>
          <p>You are authenticated and your token has been successfully imported.</p>
        </div>
        
        <div class="mt-4">
          <h3 class="text-lg font-semibold mb-2">Token Information</h3>
          {#if tokenInfo}
            <div class="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              <pre class="whitespace-pre-wrap break-all">{JSON.stringify(tokenInfo, null, 2)}</pre>
            </div>
            
            <div class="mt-4">
              <h4 class="font-medium mb-2">Token Details</h4>
              <ul class="list-disc pl-5 space-y-1">
                <li><strong>Subject:</strong> {tokenInfo.sub || 'N/A'}</li>
                <li><strong>Issuer:</strong> {tokenInfo.iss || 'N/A'}</li>
                <li><strong>Audience:</strong> {tokenInfo.aud || 'N/A'}</li>
                <li><strong>Expires:</strong> {tokenInfo.exp ? new Date(tokenInfo.exp * 1000).toLocaleString() : 'N/A'}</li>
                <li><strong>Issued At:</strong> {tokenInfo.iat ? new Date(tokenInfo.iat * 1000).toLocaleString() : 'N/A'}</li>
              </ul>
            </div>
          {:else}
            <p class="text-yellow-600">Could not parse token information.</p>
          {/if}
        </div>
        
        <div class="mt-6">
          <h3 class="text-lg font-semibold mb-2">Token Preview</h3>
          {#if accessToken}
            <div class="bg-gray-100 p-4 rounded overflow-auto">
              <p class="break-all font-mono text-sm">{accessToken}</p>
            </div>
          {:else}
            <p class="text-yellow-600">No access token available.</p>
          {/if}
        </div>
      {:else}
        <div class="p-4 bg-yellow-50 rounded mb-4">
          <p class="text-yellow-700 font-bold">Not Authenticated</p>
          <p>You are not authenticated. Please use the bookmarklet to import your token.</p>
        </div>
        
        <a 
          href="/bookmarklet" 
          class="inline-block mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Get Bookmarklet
        </a>
        
        {#if error}
          <div class="mt-4 p-4 bg-red-50 rounded">
            <p class="text-red-700 font-bold">Error</p>
            <p>{error}</p>
          </div>
        {/if}
      {/if}
    </Card.Content>
  </Card.Root>
  
  <Card.Root>
    <Card.Header>
      <Card.Title>Next Steps</Card.Title>
    </Card.Header>
    <Card.Content>
      <ul class="list-disc pl-5 space-y-2">
        <li>
          <a href="/" class="text-blue-600 hover:underline">Return to the main application</a> to use your imported token.
        </li>
        <li>
          <a href="/bookmarklet" class="text-blue-600 hover:underline">Get the bookmarklet</a> if you haven't already.
        </li>
      </ul>
    </Card.Content>
  </Card.Root>
</main>

<style lang="postcss">
  @reference "tailwindcss";
  
  :global(body) {
    @apply bg-gray-50;
  }
  
  main {
    @apply max-w-3xl;
  }
</style> 