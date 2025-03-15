<script lang="ts">
  import { onDestroy } from 'svelte';

  export let output: string = '';
  export let isLoading: boolean = false;
  export let isStreaming: boolean = false;

  let displayedOutput = '';
  let currentChunkIndex = 0;
  let typingInterval: ReturnType<typeof setInterval>;
  const TYPING_SPEED = 20; // milliseconds per character
  let currentTypingContent = '';

  function formatOutput(text: string) {
    // Convert line breaks to <br> tags and preserve whitespace
    return text.split('\n').map(line => line || '&nbsp;').join('<br>');
  }

  // Start typing animation for new content
  function startTypingAnimation(content: string) {
    // Clear existing interval if any
    if (typingInterval) clearInterval(typingInterval);
    
    // Set up the content to type
    currentTypingContent = content;
    currentChunkIndex = 0;
    
    // Start typing animation
    typingInterval = setInterval(() => {
      if (currentChunkIndex < currentTypingContent.length) {
        displayedOutput += currentTypingContent[currentChunkIndex];
        currentChunkIndex++;
      } else {
        clearInterval(typingInterval);
        currentTypingContent = '';
      }
    }, TYPING_SPEED);
  }

  // Handle output changes
  $: if (isStreaming && output) {
    // If we're streaming, start typing the new content
    startTypingAnimation(output);
  } else if (!isStreaming && output) {
    // When streaming ends, show full content
    displayedOutput = output;
  }

  onDestroy(() => {
    if (typingInterval) {
      clearInterval(typingInterval);
    }
  });
</script>

<div class="bg-white p-6 rounded-lg shadow-md">
  <h3 class="text-xl font-semibold mb-4">Generated Output</h3>
  
  {#if isLoading && !isStreaming}
    <div class="flex justify-center items-center h-48">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if displayedOutput}
    <div class="prose prose-neutral max-w-none whitespace-pre-wrap">
      {@html formatOutput(displayedOutput)}
      {#if isStreaming}
        <span class="inline-block w-2 h-4 bg-blue-600 animate-pulse"></span>
      {/if}
    </div>
  {:else}
    <div class="text-center text-gray-500 py-12">
      Generated content will appear here
    </div>
  {/if}
</div>

<style>
  :global(.prose br) {
    margin-bottom: 1em;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .animate-pulse {
    animation: blink 1s infinite;
  }
</style> 