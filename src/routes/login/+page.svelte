<script lang="ts">
  import { onMount } from 'svelte';
  import { login } from '$lib/services/authService';
  
  let isLoading = false;
  let error: string | null = null;
  
  function handleLogin() {
    try {
      isLoading = true;
      error = null;
      login();
    } catch (err) {
      isLoading = false;
      error = err instanceof Error ? err.message : 'An error occurred during login';
      console.error('Login error:', err);
    }
  }
  
  onMount(() => {
    // Check if there's an error in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (errorParam) {
      error = `Error: ${errorParam}`;
      if (errorDescription) {
        error += ` - ${errorDescription}`;
      }
    }
  });
</script>

<div class="flex justify-center items-center min-h-screen bg-gray-50">
  <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
    <h1 class="text-2xl font-bold text-center mb-6">Sign In</h1>
    
    {#if error}
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}
    
    <button 
      on:click={handleLogin}
      disabled={isLoading}
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#if isLoading}
        <span class="inline-block mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        Signing in...
      {:else}
        Sign in with Okta
      {/if}
    </button>
    
    <div class="mt-4 text-center text-sm text-gray-600">
      <p>This will redirect you to your company's Okta login page.</p>
    </div>
  </div>
</div> 