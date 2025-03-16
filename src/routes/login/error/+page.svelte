<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  let errorMessage = 'An error occurred during authentication.';
  
  onMount(() => {
    // Check if there's an error message in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error) {
      errorMessage = `Error: ${error}`;
      if (errorDescription) {
        errorMessage += ` - ${errorDescription}`;
      }
    }
  });
</script>

<div class="flex justify-center items-center min-h-screen">
  <div class="bg-red-50 p-6 rounded-lg shadow-md max-w-md w-full">
    <h1 class="text-2xl font-bold text-red-700 mb-4">Authentication Error</h1>
    <p class="mb-4 text-gray-700">{errorMessage}</p>
    <p class="mb-6 text-gray-600">Please try again or contact your administrator if the problem persists.</p>
    <div class="flex justify-center">
      <button 
        on:click={() => goto('/')}
        class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Return to Home
      </button>
    </div>
  </div>
</div> 