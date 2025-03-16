<script lang="ts">
  import { onMount } from 'svelte';
  
  let loading = true;
  let error: string | null = null;
  let htmlContent: string | null = null;
  let responseStatus: number | null = null;
  let responseHeaders: Record<string, string> = {};
  
  // Function to fetch the error content
  async function fetchErrorContent() {
    try {
      loading = true;
      error = null;
      
      // Make a request to the Okta proxy that we know will fail
      // This will capture the HTML error content
      const response = await fetch('/api/okta-proxy/oauth2/v1/authorize?client_id=test&redirect_uri=test&response_type=code');
      
      // Store the response status
      responseStatus = response.status;
      
      // Store the response headers
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      // Get the HTML content
      htmlContent = await response.text();
      
      loading = false;
    } catch (err) {
      console.error('Error fetching content:', err);
      error = err instanceof Error ? err.message : 'Unknown error';
      loading = false;
    }
  }
  
  onMount(() => {
    fetchErrorContent();
  });
</script>

<div class="p-6 max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">Okta Error Content Viewer</h1>
  
  <div class="mb-6">
    <button 
      on:click={fetchErrorContent}
      class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
    >
      Refresh Error Content
    </button>
  </div>
  
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
      <h2 class="text-xl font-semibold mb-2">Response Information</h2>
      <div class="bg-gray-100 p-4 rounded">
        <p><span class="font-semibold">Status:</span> {responseStatus}</p>
        
        <div class="mt-4">
          <p class="font-semibold mb-2">Headers:</p>
          <pre class="text-sm overflow-auto">{JSON.stringify(responseHeaders, null, 2)}</pre>
        </div>
      </div>
    </div>
    
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">HTML Content</h2>
      <div class="bg-gray-100 p-4 rounded">
        <pre class="text-sm overflow-auto whitespace-pre-wrap">{htmlContent}</pre>
      </div>
    </div>
    
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Rendered Content</h2>
      <div class="bg-white border border-gray-300 p-4 rounded">
        {@html htmlContent}
      </div>
    </div>
    
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Common Error Patterns</h2>
      <div class="bg-gray-100 p-4 rounded">
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Invalid redirect_uri</strong>: The redirect URI doesn't match what's configured in Okta</li>
          <li><strong>Invalid client_id</strong>: The client ID is incorrect or not authorized</li>
          <li><strong>Invalid response_type</strong>: The response type isn't supported by your Okta configuration</li>
          <li><strong>Invalid scope</strong>: One or more of the requested scopes aren't allowed</li>
          <li><strong>Internal server error</strong>: Could indicate a configuration issue with the Okta tenant</li>
        </ul>
      </div>
    </div>
  {/if}
</div> 