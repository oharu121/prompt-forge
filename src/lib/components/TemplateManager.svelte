<script lang="ts">
  import type { Template } from '$lib/types/Template';
  import { onMount, createEventDispatcher } from 'svelte';
  import * as Card from "$lib/components/ui/card";
  import * as ScrollArea from "$lib/components/ui/scroll-area";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";

  const dispatch = createEventDispatcher<{
    select: Template;
  }>();

  let templates: Template[] = [];
  let selectedTemplate: Template | null = null;
  let error: string | null = null;

  onMount(async () => {
    try {
      const templateModules = import.meta.glob<{ default: Template }>('../templates/*.json', { eager: true });
      templates = Object.values(templateModules).map(module => module.default);
    } catch (e) {
      error = 'Failed to load templates';
      console.error('Error loading templates:', e);
    }
  });

  function selectTemplate(template: Template) {
    selectedTemplate = template;
    dispatch('select', template);
  }

  function handleKeydown(event: KeyboardEvent, template: Template) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectTemplate(template);
    }
  }

  $: selectedTemplateParams = selectedTemplate?.parameters || {};
</script>

<Card.Root class="w-full">
  <Card.Header>
    <Card.Title id="templates-heading">Prompt Templates</Card.Title>
    {#if error}
      <Card.Description class="text-red-600" role="alert">{error}</Card.Description>
    {/if}
  </Card.Header>
  <Card.Content>
    <ScrollArea.Root class="h-[500px]">
      <div class="space-y-4" role="listbox" aria-labelledby="templates-heading">
        {#each templates as template (template.id)}
          <button
            type="button"
            role="option"
            aria-selected={selectedTemplate?.id === template.id}
            class="w-full text-left"
            on:click={() => selectTemplate(template)}
            on:keydown={(e: KeyboardEvent) => handleKeydown(e, template)}
          >
            <div 
              class="rounded-lg overflow-hidden transition-all duration-200 border-2"
              class:border-transparent={selectedTemplate?.id !== template.id}
              class:border-blue-500={selectedTemplate?.id === template.id}
              class:bg-blue-50={selectedTemplate?.id === template.id}
              class:shadow-lg={selectedTemplate?.id === template.id}
            >
              <Card.Root class="bg-transparent">
                <Card.Header>
                  <div class:text-blue-700={selectedTemplate?.id === template.id}>
                    <Card.Title>{template.name}</Card.Title>
                  </div>
                  <Card.Description>{template.description}</Card.Description>
                </Card.Header>
                {#if selectedTemplate?.id === template.id}
                  <Card.Content>
                    <div class="mt-4 bg-white/80 p-3 rounded border border-blue-200">
                      <h5 class="text-sm font-medium mb-2 text-blue-900">Parameters:</h5>
                      <div class="space-y-2">
                        {#each Object.entries(template.parameters) as [name, param]}
                          <div class="flex items-center gap-2">
                            <span class="font-medium text-blue-800">{name}</span>
                            <span class="text-sm text-gray-600">{param.description}</span>
                            {#if param.required}
                              <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded" aria-label="required">required</span>
                            {/if}
                          </div>
                        {/each}
                      </div>
                    </div>
                  </Card.Content>
                {/if}
              </Card.Root>
            </div>
          </button>
        {/each}
      </div>
    </ScrollArea.Root>
  </Card.Content>
</Card.Root> 