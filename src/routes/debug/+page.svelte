<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { PUBLIC_OKTA_ISSUER, PUBLIC_OKTA_CLIENT_ID, PUBLIC_OKTA_REDIRECT_URI } from '$env/static/public';
  
  let debugInfo: any = null;
  let loading = true;
  let error: string | null = null;
  let currentUrl = '';
  let urlParams: Record<string, string> = {};
  
  onMount(async () => {
    try {
      // Get the current URL
      currentUrl = window.location.href;
      
      // Parse URL parameters
      const params = new URLSearchParams(window.location.search);
      params.forEach((value, key) => {
        urlParams[key] = value;
      });
      
      // Fetch debug info
      const response = await fetch('/api/debug-auth');
      if (!response.ok) {
        throw new Error(`Failed to fetch debug info: ${response.status} ${response.statusText}`);
      }
      
      debugInfo = await response.json();
      loading = false;
    } catch (err) {
      console.error('Error loading debug info:', err);
      error = err instanceof Error ? err.message : 'Unknown error';
      loading = false;
    }
  });
  
  function formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
</script>

<div class="p-6 max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">Okta Authentication Debug</h1>
  
  {#if loading}
    <div class="flex justify-center my-8">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 p-4 rounded mb-6">
      <h2 class="text-red-700 font-semibold mb-2">Error</h2>
      <p>{error}</p>
    </div>
  {:else}
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Current Environment</h2>
      <div class="bg-gray-100 p-4 rounded">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="font-semibold">Okta Issuer:</p>
            <p class="text-sm break-all">{debugInfo.config.issuer}</p>
          </div>
          <div>
            <p class="font-semibold">Client ID:</p>
            <p class="text-sm">{debugInfo.config.clientId}</p>
          </div>
          <div>
            <p class="font-semibold">Redirect URI:</p>
            <p class="text-sm break-all">{debugInfo.config.redirectUri}</p>
          </div>
          <div>
            <p class="font-semibold">App Origin:</p>
            <p class="text-sm break-all">{debugInfo.config.appOrigin}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Parsed Configuration</h2>
      <div class="bg-gray-100 p-4 rounded">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="font-semibold">Okta Base URL:</p>
            <p class="text-sm break-all">{debugInfo.parsed.oktaBaseUrl}</p>
          </div>
          <div>
            <p class="font-semibold">App ID:</p>
            <p class="text-sm">{debugInfo.parsed.appId}</p>
          </div>
          <div>
            <p class="font-semibold">Auth URL:</p>
            <p class="text-sm break-all">{debugInfo.parsed.authUrl}</p>
          </div>
          <div>
            <p class="font-semibold">Token URL:</p>
            <p class="text-sm break-all">{debugInfo.parsed.tokenUrl}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Sample Authorization URL</h2>
      <div class="bg-gray-100 p-4 rounded">
        <p class="text-sm break-all mb-2">{debugInfo.sampleUrls.authorizationUrl}</p>
        <a 
          href={debugInfo.sampleUrls.authorizationUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          class="inline-block mt-2 bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Test Authorization URL
        </a>
      </div>
    </div>
    
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Current URL Parameters</h2>
      <div class="bg-gray-100 p-4 rounded">
        <p class="font-semibold mb-2">URL:</p>
        <p class="text-sm break-all mb-4">{currentUrl}</p>
        
        {#if Object.keys(urlParams).length > 0}
          <p class="font-semibold mb-2">Parameters:</p>
          <pre class="text-sm overflow-auto">{formatJson(urlParams)}</pre>
        {:else}
          <p class="text-sm text-gray-600">No URL parameters found</p>
        {/if}
      </div>
    </div>
    
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Troubleshooting Tips</h2>
      <div class="bg-gray-100 p-4 rounded">
        <ul class="list-disc pl-5 space-y-2">
          {#each debugInfo.tips as tip}
            <li>{tip}</li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}
</div> 