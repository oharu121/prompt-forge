<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { initAuth, authState } from '$lib/services/authService';
  
  let error: string | null = null;
  let isProcessing = true;
  
  onMount(async () => {
    try {
      console.log("Processing Okta callback...");
      
      // Check if we have a state parameter that contains our custom state
      const urlParams = new URLSearchParams(window.location.search);
      const stateParam = urlParams.get('state');
      
      if (stateParam) {
        try {
          // Try to decode the state parameter
          const decodedState = JSON.parse(atob(stateParam));
          console.log("Decoded state:", decodedState);
          
          // If we have a custom appRedirect, store it
          if (decodedState.appRedirect) {
            sessionStorage.setItem('actual_redirect_uri', decodedState.appRedirect);
          }
        } catch (e) {
          console.warn("Could not decode state parameter:", e);
        }
      }
      
      // Initialize auth and process the tokens
      await initAuth();
      
      // Check if authentication was successful
      let authenticated = false;
      const unsubscribe = authState.subscribe(state => {
        authenticated = state.isAuthenticated;
      });
      unsubscribe();
      
      if (authenticated) {
        console.log("Authentication successful");
        
        // Get the redirect URL from session storage
        const redirectUrl = sessionStorage.getItem('auth_redirect_url') || '/';
        sessionStorage.removeItem('auth_redirect_url'); // Clean up
        
        isProcessing = false;
        goto(redirectUrl);
      } else {
        console.error("Authentication failed");
        isProcessing = false;
        error = "Authentication failed. Please try again.";
      }
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