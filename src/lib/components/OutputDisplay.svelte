<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import { mangle } from "marked-mangle";
  import { markedSmartypants } from "marked-smartypants";
  import { markedXhtml } from "marked-xhtml";
  import { browser } from '$app/environment';

  export let output: string = '';
  export let isLoading: boolean = false;
  export let isStreaming: boolean = false;

  let displayedOutput = '';
  let currentChunkIndex = 0;
  let typingInterval: ReturnType<typeof setInterval>;
  const TYPING_SPEED = 20; // milliseconds per character
  let currentTypingContent = '';
  let sanitizedOutput = '';
  let purify: typeof DOMPurify | null = null;

  onMount(() => {
    // Configure marked options
    marked.use({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
      ...mangle(),
      ...markedSmartypants(),
      ...markedXhtml(),
    });

    // Initialize DOMPurify only in browser environment
    if (browser) {
      purify = DOMPurify;
      // Configure DOMPurify
      purify.setConfig({
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
          'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
          'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span'
        ],
        ALLOWED_ATTR: ['href', 'name', 'target', 'class', 'id']
      });
    }
  });

  // Render markdown to sanitized HTML
  async function renderMarkdown(text: string): Promise<string> {
    try {
      const rawHtml = await marked.parse(text);
      // Only sanitize in browser environment
      if (browser && purify) {
        return purify.sanitize(rawHtml);
      }
      return rawHtml;
    } catch (e) {
      console.error('Error rendering markdown:', e);
      return text; // Fallback to plain text if rendering fails
    }
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

  $: (async () => {
    sanitizedOutput = await renderMarkdown(displayedOutput);
  })();

  
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
    <div class="prose prose-neutral max-w-none">
      {@html sanitizedOutput}
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
  :global(.prose) {
    font-size: 1rem;
    line-height: 1.75;
  }

  :global(.prose pre) {
    background-color: #f3f4f6;
    border-radius: 0.375rem;
    padding: 1rem;
    overflow-x: auto;
  }

  :global(.prose code) {
    background-color: #f3f4f6;
    border-radius: 0.25rem;
    padding: 0.125rem 0.25rem;
    font-size: 0.875em;
  }

  :global(.prose blockquote) {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    font-style: italic;
    color: #6b7280;
  }

  :global(.prose ul, .prose ol) {
    padding-left: 1.5rem;
  }

  :global(.prose table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
  }

  :global(.prose th, .prose td) {
    border: 1px solid #e5e7eb;
    padding: 0.5rem;
  }

  :global(.prose th) {
    background-color: #f9fafb;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .animate-pulse {
    animation: blink 1s infinite;
  }
</style> 