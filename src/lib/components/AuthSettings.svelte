<script lang="ts">
  import { onMount } from 'svelte';
  import { authState, login, logout, initAuth } from '$lib/services/authService';
  import * as Card from "$lib/components/ui/card";
  
  // Define interfaces for user and userInfo
  interface UserInfo {
    name?: string;
    email?: string;
    department?: string;
    title?: string;
    [key: string]: any; // Allow other properties
  }
  
  onMount(() => {
    // Initialize auth state
    initAuth();
  });
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Authentication Settings</Card.Title>
    <Card.Description>Manage your authentication with the company's GPT service</Card.Description>
  </Card.Header>
  <Card.Content>
    <div class="space-y-4">
      {#if $authState.isLoading}
        <p>Loading authentication status...</p>
      {:else if $authState.isAuthenticated}
        <div class="p-4 bg-green-50 rounded">
          <p class="text-green-700">You are authenticated as {($authState.user as UserInfo | null)?.name || ($authState.user as UserInfo | null)?.email || 'User'}</p>
          {#if $authState.userInfo}
            <div class="mt-2 text-sm">
              <p><strong>Name:</strong> {($authState.userInfo as UserInfo).name || 'N/A'}</p>
              <p><strong>Email:</strong> {($authState.userInfo as UserInfo).email || 'N/A'}</p>
              {#if ($authState.userInfo as UserInfo).department}
                <p><strong>Department:</strong> {($authState.userInfo as UserInfo).department}</p>
              {/if}
              {#if ($authState.userInfo as UserInfo).title}
                <p><strong>Title:</strong> {($authState.userInfo as UserInfo).title}</p>
              {/if}
            </div>
          {/if}
        </div>
        <button
          on:click={logout}
          class="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      {:else}
        <div class="p-4 bg-yellow-50 rounded">
          <p class="text-yellow-700">You are not authenticated. Please sign in to use the GPT service.</p>
        </div>
        <button
          on:click={login}
          class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Sign In with Okta
        </button>
        {#if $authState.error}
          <p class="text-red-600 text-sm">Error: {($authState.error as Error)?.message || 'Unknown error'}</p>
        {/if}
      {/if}
    </div>
  </Card.Content>
</Card.Root> 