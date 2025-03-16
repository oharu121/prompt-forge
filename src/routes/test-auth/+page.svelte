<script lang="ts">
  import { onMount } from 'svelte';
  import { authState, login, logout, getAccessToken } from '$lib/services/authService';
  
  let isAuthenticated = false;
  let isLoading = true;
  let accessToken: string | null = null;
  let userInfo: any = null;
  
  // Subscribe to auth state changes
  onMount(() => {
    const unsubscribe = authState.subscribe(state => {
      isAuthenticated = state.isAuthenticated;
      isLoading = state.isLoading;
      userInfo = state.userInfo;
    });
    
    return unsubscribe;
  });
  
  async function handleGetToken() {
    accessToken = await getAccessToken();
  }
  
  function handleLogin() {
    login();
  }
  
  function handleLogout() {
    logout();
    accessToken = null;
  }
</script>

<div class="p-6 max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">Authentication Test Page</h1>
  
  <div class="mb-6 p-4 bg-gray-100 rounded">
    <h2 class="text-xl font-semibold mb-2">Authentication Status</h2>
    {#if isLoading}
      <p>Loading authentication state...</p>
    {:else if isAuthenticated}
      <p class="text-green-600 font-semibold">✅ Authenticated</p>
    {:else}
      <p class="text-red-600 font-semibold">❌ Not authenticated</p>
    {/if}
  </div>
  
  <div class="flex gap-4 mb-6">
    {#if isAuthenticated}
      <button 
        on:click={handleLogout}
        class="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
      >
        Sign Out
      </button>
      <button 
        on:click={handleGetToken}
        class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Get Access Token
      </button>
    {:else}
      <button 
        on:click={handleLogin}
        class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Sign In with Okta
      </button>
    {/if}
  </div>
  
  {#if userInfo}
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">User Info</h2>
      <pre class="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(userInfo, null, 2)}</pre>
    </div>
  {/if}
  
  {#if accessToken}
    <div>
      <h2 class="text-xl font-semibold mb-2">Access Token</h2>
      <div class="bg-gray-100 p-4 rounded">
        <p class="mb-2 font-semibold">Token:</p>
        <div class="overflow-auto max-h-40">
          <code class="text-sm break-all">{accessToken}</code>
        </div>
      </div>
    </div>
  {/if}
</div> 