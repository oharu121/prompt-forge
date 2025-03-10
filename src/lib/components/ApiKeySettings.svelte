<script lang="ts">
  import { GptService } from '$lib/services/gptService';
  import * as Card from "$lib/components/ui/card";

  let accessToken = '';
  let isSaved = false;
  let isVisible = false;

  function saveToken() {
    // Store token and update service
    localStorage.setItem('gpt_access_token', accessToken);
    GptService.setAccessToken(accessToken);
    isSaved = true;
    setTimeout(() => {
      isSaved = false;
    }, 3000);
  }

  function toggleVisibility() {
    isVisible = !isVisible;
  }

  // Load saved token on mount
  import { onMount } from 'svelte';
  onMount(() => {
    const savedToken = localStorage.getItem('gpt_access_token');
    if (savedToken) {
      accessToken = savedToken;
      GptService.setAccessToken(savedToken);
    }
  });
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Authentication Settings</Card.Title>
    <Card.Description>Enter your access token to use the company's GPT service</Card.Description>
  </Card.Header>
  <Card.Content>
    <div class="space-y-4">
      <div class="relative">
        <label for="accessToken" class="block text-sm font-medium text-gray-700 mb-1">
          Access Token
        </label>
        <div class="flex">
          <input
            type={isVisible ? "text" : "password"}
            id="accessToken"
            bind:value={accessToken}
            placeholder="Enter your access token"
            class="flex-1 p-2 border rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            on:click={toggleVisibility}
            class="px-3 py-2 bg-gray-100 border border-l-0 rounded-r hover:bg-gray-200"
            type="button"
          >
            {isVisible ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
      <button
        on:click={saveToken}
        class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Save Token
      </button>
      {#if isSaved}
        <p class="text-green-600 text-sm">Access token saved successfully!</p>
      {/if}
    </div>
  </Card.Content>
</Card.Root> 