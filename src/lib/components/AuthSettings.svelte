<script lang="ts">
  import { onMount } from 'svelte';
  import { authState, logout, initAuth } from '$lib/services/authService';
  import * as Card from "$lib/components/ui/card";
  import { goto } from '$app/navigation';
  
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
  
  function navigateToBookmarklet() {
    goto('/bookmarklet');
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="flex items-center gap-2">
      Authentication Settings
      {#if $authState.isAuthenticated}
        <span class="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-700 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
          </svg>
        </span>
      {/if}
    </Card.Title>
    <Card.Description>Manage your authentication with the company's GPT service</Card.Description>
  </Card.Header>
  <Card.Content>
    <div class="space-y-4">
      {#if $authState.isLoading}
        <div class="p-4 bg-gray-50 rounded flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading authentication status...</p>
        </div>
      {:else if $authState.isAuthenticated}
        <div class="p-4 bg-green-50 rounded">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-green-600">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-green-700 font-medium">You are authenticated as {($authState.user as UserInfo | null)?.name || ($authState.user as UserInfo | null)?.email || 'User'}</p>
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
          </div>
        </div>
        <button
          on:click={logout}
          class="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      {:else}
        <div class="p-4 bg-yellow-50 rounded">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-600">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-yellow-700">You are not authenticated. Please use the bookmarklet to import your authentication from Company GPT.</p>
            </div>
          </div>
        </div>
        
        <button
          on:click={navigateToBookmarklet}
          class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors mt-4"
        >
          Get Authentication Bookmarklet
        </button>
        <p class="text-sm text-gray-600 text-center mt-2">
          Already logged into Company GPT? Use our bookmarklet to quickly import your authentication.
        </p>
        
        {#if $authState.error}
          <div class="p-4 bg-red-50 rounded mt-4">
            <div class="flex items-start">
              <div class="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-red-600">
                  <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-red-700 font-bold">Error</p>
                <p class="text-red-600">{($authState.error as Error)?.message || 'Unknown error'}</p>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </Card.Content>
</Card.Root> 