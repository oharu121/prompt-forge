<script lang="ts">
  import { onMount } from 'svelte';
  import { login } from '$lib/services/authService';
  
  let isRedirecting = true;
  
  onMount(() => {
    // Redirect to Okta login
    login();
  });
</script>

<div class="flex justify-center items-center min-h-screen">
  <div class="text-center">
    <h2 class="text-xl mb-2">Redirecting to Login</h2>
    <p>Please wait while we redirect you to the login page...</p>
    <div class="mt-4 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
  </div>
</div> 