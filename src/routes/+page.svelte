<!-- Main content page -->
<script lang="ts">
  import ApiKeySettings from '$lib/components/ApiKeySettings.svelte';
  import AuthSettings from '$lib/components/AuthSettings.svelte';
  import TemplateManager from '$lib/components/TemplateManager.svelte';
  import OutputDisplay from '$lib/components/OutputDisplay.svelte';
  import type { Template } from '$lib/types/Template';
  import * as Card from "$lib/components/ui/card";
  import { GptService } from '$lib/services/gptService';

  let userInput = '';
  let output = '';
  let isLoading = false;
  let isStreaming = false;
  let selectedTemplate: Template | null = null;
  let error: string | null = null;

  function handleTemplateSelect(event: CustomEvent<Template>) {
    selectedTemplate = event.detail;
    userInput = ''; // Clear input when template changes
    error = null;
  }

  async function generateOutput() {
    if (!userInput || !selectedTemplate) return;
    
    isLoading = true;
    isStreaming = false;
    error = null;
    output = '';

    try {
      // Process the template with user input
      const processedPrompt = selectedTemplate.prompt.replace(
        `{${Object.keys(selectedTemplate.parameters)[0]}}`,
        userInput
      );
      
      // Call the GPT service with streaming callback
      isStreaming = true;
      await GptService.generateResponse(processedPrompt, (response) => {
        if (response.error) {
          error = response.error;
          output = '';
          isStreaming = false;
        } else if (response.isIncremental) {
          // For incremental updates, pass the chunk directly to OutputDisplay
          output = response.content;
        } else {
          // For non-incremental updates (like the final one)
          output = response.content;
          if (response.done) {
            isStreaming = false;
          }
        }
      });
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unexpected error occurred';
      console.error('Error generating output:', e);
      output = '';
    } finally {
      isLoading = false;
    }
  }

  $: currentParameter = selectedTemplate 
    ? Object.entries(selectedTemplate.parameters)[0] 
    : null;
</script>

<main class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-6">Prompt Forge</h1>
  
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left Column: Settings and Templates -->
    <div class="lg:col-span-1 space-y-6">
      <div class="space-y-6">
        <AuthSettings />
        <!-- Keeping ApiKeySettings as a fallback option -->
        <details class="mt-4">
          <summary class="cursor-pointer text-sm text-gray-500">Alternative: API Key Authentication</summary>
          <div class="mt-2">
            <ApiKeySettings />
          </div>
        </details>
      </div>
      <TemplateManager on:select={handleTemplateSelect} />
    </div>

    <!-- Right Column: Input and Output -->
    <div class="lg:col-span-2 space-y-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>
            {#if selectedTemplate}
              {selectedTemplate.name}
            {:else}
              Select a Template
            {/if}
          </Card.Title>
          {#if currentParameter}
            <Card.Description class="mt-2">
              <div class="flex items-center gap-2">
                <span class="font-medium">{currentParameter[0]}</span>
                <span class="text-sm text-gray-600">{currentParameter[1].description}</span>
                {#if currentParameter[1].required}
                  <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded" aria-label="required">required</span>
                {/if}
              </div>
            </Card.Description>
          {/if}
        </Card.Header>
        <Card.Content>
          <textarea
            bind:value={userInput}
            class="w-full p-4 border rounded-lg h-48 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono whitespace-pre"
            placeholder={currentParameter 
              ? `Enter ${currentParameter[0]} here...`
              : "Select a template first..."
            }
            disabled={!selectedTemplate}
          ></textarea>
          {#if error}
            <div class="text-red-600 text-sm mb-4">{error}</div>
          {/if}
          <button
            on:click={generateOutput}
            disabled={isLoading || !selectedTemplate || !userInput}
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {#if isLoading}
              Generating...
            {:else if !selectedTemplate}
              Select a Template
            {:else if !userInput}
              Enter Input
            {:else}
              Generate Output
            {/if}
          </button>
        </Card.Content>
      </Card.Root>

      <OutputDisplay {output} {isLoading} {isStreaming} />
    </div>
  </div>
</main>

<style lang="postcss">
    @reference "tailwindcss";
    
  :global(.prose) {
    @apply text-gray-900;
  }
  :global(.prose h1) {
    @apply text-2xl font-bold mb-4;
  }
  :global(.prose h2) {
    @apply text-xl font-semibold mb-3;
  }
  :global(.prose ul, .prose ol) {
    @apply my-2;
  }
  :global(.prose li) {
    @apply mb-1;
  }
</style>
