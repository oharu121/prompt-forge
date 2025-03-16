<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_OKTA_CLIENT_ID, PUBLIC_OKTA_ISSUER } from '$env/static/public';
  
  let loading = false;
  let error: string | null = null;
  let success: string | null = null;
  
  // Extract the base URL and app ID from the issuer URL
  let oktaBaseUrl = '';
  let appId = '';
  let authUrl = '';
  
  // Form fields
  let redirectUri = '';
  let responseType = 'code';
  let scope = 'openid email profile';
  let state = 'test-state';
  let useProxy = true;
  
  onMount(() => {
    try {
      // Parse the Okta issuer URL
      const issuerUrlParts = PUBLIC_OKTA_ISSUER.match(/^(https:\/\/[^\/]+)\/oauth2\/([^\/]+)\/v1$/);
      oktaBaseUrl = issuerUrlParts ? issuerUrlParts[1] : PUBLIC_OKTA_ISSUER;
      appId = issuerUrlParts ? issuerUrlParts[2] : '';
      
      // Construct the authorization URL
      authUrl = `${oktaBaseUrl}/oauth2/${appId}/v1/authorize`;
      
      // Set default redirect URI to current origin
      redirectUri = window.location.origin + '/login/callback';
    } catch (err) {
      console.error('Error parsing Okta configuration:', err);
      error = err instanceof Error ? err.message : 'Unknown error';
    }
  });
  
  // Function to test the redirect URI
  function testRedirect() {
    try {
      loading = true;
      error = null;
      success = null;
      
      // Construct the authorization URL
      const targetUrl = useProxy 
        ? `/api/okta-proxy/oauth2/${appId}/v1/authorize` 
        : authUrl;
      
      // Construct the query parameters
      const params = new URLSearchParams({
        client_id: PUBLIC_OKTA_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope: scope,
        state: state
      });
      
      // Construct the full URL
      const fullUrl = `${targetUrl}?${params.toString()}`;
      
      // Log the URL
      console.log('Testing authorization URL:', fullUrl);
      success = `Opening authorization URL: ${fullUrl}`;
      
      // Open the URL in a new tab
      window.open(fullUrl, '_blank');
      
      loading = false;
    } catch (err) {
      console.error('Error testing redirect:', err);
      error = err instanceof Error ? err.message : 'Unknown error';
      loading = false;
    }
  }
  
  // Common redirect URIs to try
  const commonRedirectUris = [
    { name: 'Current Origin + /login/callback', value: window.location.origin + '/login/callback' },
    { name: 'Current Origin + /callback', value: window.location.origin + '/callback' },
    { name: 'Current Origin + /api/auth-handler', value: window.location.origin + '/api/auth-handler' },
    { name: 'Current Origin Root', value: window.location.origin + '/' },
    { name: 'Company GPT Service', value: 'https://www.my-company-gpt.com/login/callback' }
  ];
  
  function setRedirectUri(uri: string) {
    redirectUri = uri;
  }
</script>

<div class="p-6 max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">Okta Redirect URI Tester</h1>
  
  {#if error}
    <div class="bg-red-50 p-4 rounded mb-6">
      <h2 class="text-red-700 font-semibold mb-2">Error</h2>
      <p>{error}</p>
    </div>
  {/if}
  
  {#if success}
    <div class="bg-green-50 p-4 rounded mb-6">
      <h2 class="text-green-700 font-semibold mb-2">Success</h2>
      <p>{success}</p>
    </div>
  {/if}
  
  <div class="bg-gray-100 p-4 rounded mb-6">
    <h2 class="text-xl font-semibold mb-4">Test Configuration</h2>
    
    <div class="mb-4">
      <label class="block text-gray-700 mb-2" for="redirect-uri">
        Redirect URI
      </label>
      <input 
        id="redirect-uri"
        type="text" 
        bind:value={redirectUri}
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="https://example.com/callback"
      />
    </div>
    
    <div class="mb-4">
      <label class="block text-gray-700 mb-2">
        Common Redirect URIs to Try
      </label>
      <div class="space-y-2">
        {#each commonRedirectUris as uri}
          <button 
            on:click={() => setRedirectUri(uri.value)}
            class="block w-full text-left px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            {uri.name}
            <span class="block text-xs text-gray-500 mt-1">{uri.value}</span>
          </button>
        {/each}
      </div>
    </div>
    
    <div class="mb-4">
      <label class="block text-gray-700 mb-2" for="response-type">
        Response Type
      </label>
      <select 
        id="response-type"
        bind:value={responseType}
        class="w-full px-3 py-2 border border-gray-300 rounded"
      >
        <option value="code">code</option>
        <option value="token">token</option>
        <option value="id_token">id_token</option>
        <option value="code token">code token</option>
        <option value="code id_token">code id_token</option>
        <option value="token id_token">token id_token</option>
        <option value="code token id_token">code token id_token</option>
      </select>
    </div>
    
    <div class="mb-4">
      <label class="block text-gray-700 mb-2" for="scope">
        Scope
      </label>
      <input 
        id="scope"
        type="text" 
        bind:value={scope}
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="openid email profile"
      />
    </div>
    
    <div class="mb-4">
      <label class="block text-gray-700 mb-2" for="state">
        State
      </label>
      <input 
        id="state"
        type="text" 
        bind:value={state}
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="test-state"
      />
    </div>
    
    <div class="mb-4">
      <label class="flex items-center">
        <input type="checkbox" bind:checked={useProxy} class="mr-2">
        Use Proxy (recommended for CORS issues)
      </label>
    </div>
    
    <button 
      on:click={testRedirect}
      disabled={loading}
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      {#if loading}
        <span class="inline-block mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        Testing...
      {:else}
        Test Redirect URI
      {/if}
    </button>
  </div>
  
  <div class="bg-gray-100 p-4 rounded mb-6">
    <h2 class="text-xl font-semibold mb-2">Okta Configuration</h2>
    <div class="space-y-2">
      <p><span class="font-semibold">Issuer:</span> {PUBLIC_OKTA_ISSUER}</p>
      <p><span class="font-semibold">Client ID:</span> {PUBLIC_OKTA_CLIENT_ID ? PUBLIC_OKTA_CLIENT_ID.substring(0, 5) + '...' : 'Not set'}</p>
      <p><span class="font-semibold">Base URL:</span> {oktaBaseUrl}</p>
      <p><span class="font-semibold">App ID:</span> {appId}</p>
      <p><span class="font-semibold">Auth URL:</span> {authUrl}</p>
    </div>
  </div>
  
  <div class="bg-gray-100 p-4 rounded">
    <h2 class="text-xl font-semibold mb-2">Troubleshooting Tips</h2>
    <ul class="list-disc pl-5 space-y-2">
      <li>The redirect URI must <strong>exactly</strong> match what's configured in Okta, including protocol (http vs https), trailing slashes, and case sensitivity.</li>
      <li>If you're getting "invalid redirect_uri" errors, try different variations of your URI.</li>
      <li>Check with your Okta administrator to confirm which redirect URIs are allowed for your application.</li>
      <li>For testing, you can temporarily add a redirect URI to your Okta application settings (if you have access).</li>
      <li>If you're using the proxy, make sure it's correctly forwarding the request to Okta.</li>
    </ul>
  </div>
</div> 