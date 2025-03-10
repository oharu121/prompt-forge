<script lang="ts">
  export let output: string = '';
  export let isLoading: boolean = false;

  function formatOutput(text: string) {
    // Convert line breaks to <br> tags and preserve whitespace
    return text.split('\n').map(line => line || '&nbsp;').join('<br>');
  }
</script>

<div class="bg-white p-6 rounded-lg shadow-md">
  <h3 class="text-xl font-semibold mb-4">Generated Output</h3>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-48">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if output}
    <div class="prose prose-neutral max-w-none whitespace-pre-wrap">
      {@html formatOutput(output)}
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
</style> 