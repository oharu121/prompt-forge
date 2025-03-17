<script lang="ts">
  import { onMount } from 'svelte';
  import { authState, logout, initAuth, login } from '$lib/services/authService';
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
        {#if $authState.error}
          <div class="p-4 bg-red-50 rounded">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Authentication Error</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{$authState.error.message}</p>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <div class="space-y-4">
          <div class="p-4 bg-gray-50 rounded">
            <h3 class="font-medium mb-2">Option 1: Sign in with Okta</h3>
            <p class="text-sm text-gray-600 mb-3">Use your company Okta credentials to sign in directly.</p>
            <button
              on:click={login}
              class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Sign in with Okta
            </button>
          </div>

          <div class="relative py-3">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-2 bg-white text-sm text-gray-500">OR</span>
            </div>
          </div>

          <div class="p-4 bg-gray-50 rounded">
            <h3 class="font-medium mb-2">Option 2: Use Bookmarklet</h3>
            <p class="text-sm text-gray-600 mb-3">Already logged into Company GPT? Import your authentication using the bookmarklet.</p>
            <button
              on:click={navigateToBookmarklet}
              class="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 transition-colors"
            >
              Get Authentication Bookmarklet
            </button>
          </div>
        </div>
      {/if}
    </div>
  </Card.Content>
</Card.Root> 