<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { initAuth } from '$lib/services/authService';
  
  let error: string | null = null;
  let isProcessing = true;
  
  onMount(async () => {
    try {
      console.log("Processing Okta callback...");
      await initAuth();
      isProcessing = false;
      goto('/');
    } catch (err) {
      console.error("Error processing Okta callback:", err);
      isProcessing = false;
      error = err instanceof Error ? err.message : 'Unknown error occurred';
    }
  });
</script>

<div class="flex justify-center items-center min-h-screen">
  {#if isProcessing}
    <div class="text-center">
      <h2 class="text-xl mb-2">Processing Login</h2>
      <p>Please wait while we complete your authentication...</p>
      <div class="mt-4 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 p-4 rounded shadow">
      <h2 class="text-red-700 text-xl mb-2">Authentication Error</h2>
      <p>{error}</p>
      <button 
        on:click={() => goto('/')}
        class="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Return to Home
      </button>
    </div>
  {:else}
    <div class="text-center">
      <h2 class="text-xl mb-2">Authentication Successful</h2>
      <p>Redirecting you back to the application...</p>
    </div>
  {/if}
</div> 