<script lang="ts">
  import { onMount } from 'svelte';
  import * as Card from "$lib/components/ui/card";
  
  let bookmarkletCode = '';
  let appUrl = '';
  
  onMount(() => {
    if (typeof window !== 'undefined') {
      // Get the current origin for the app URL
      appUrl = window.location.origin;
      
      // Generate the bookmarklet code
      generateBookmarkletCode();
    }
  });
  
  function generateBookmarkletCode() {
    // The JavaScript code that will be executed when the bookmarklet is clicked
    const jsCode = `
      (function() {
        // Function to extract token from localStorage
        function extractToken() {
          try {
            // Try to get the token from localStorage
            const tokenStorage = localStorage.getItem('company-gpt-token-storage');
            if (!tokenStorage) {
              alert('No token found in localStorage. Are you logged into the Company GPT app?');
              return null;
            }
            
            // Parse the token storage
            const parsedStorage = JSON.parse(tokenStorage);
            const accessToken = parsedStorage?.accessToken?.value;
            const idToken = parsedStorage?.idToken?.value;
            
            if (!accessToken) {
              alert('Access token not found in storage. Please log in to the Company GPT app first.');
              return null;
            }
            
            return { accessToken, idToken };
          } catch (e) {
            console.error('Error extracting token:', e);
            alert('Error extracting token: ' + e.message);
            return null;
          }
        }
        
        // Extract the token
        const tokens = extractToken();
        if (!tokens) return;
        
        // Redirect to our app with the tokens
        const redirectUrl = new URL('${appUrl}/api/token-receiver');
        redirectUrl.searchParams.append('access_token', tokens.accessToken);
        if (tokens.idToken) {
          redirectUrl.searchParams.append('id_token', tokens.idToken);
        }
        
        // Navigate to our app
        window.location.href = redirectUrl.toString();
      })();
    `;
    
    // Convert the JavaScript code to a bookmarklet format
    bookmarkletCode = `javascript:${encodeURIComponent(jsCode.replace(/\s+/g, ' '))}`;
  }
</script>

<main class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-6">Prompt Forge Bookmarklet</h1>
  
  <Card.Root class="mb-8">
    <Card.Header>
      <Card.Title>How to Use the Bookmarklet</Card.Title>
      <Card.Description>
        This bookmarklet allows you to quickly import your authentication token from the Company GPT app to Prompt Forge.
      </Card.Description>
    </Card.Header>
    <Card.Content>
      <ol class="list-decimal pl-5 space-y-4">
        <li>
          <strong>Drag this button to your bookmarks bar:</strong>
          <div class="my-4 flex justify-center">
            <a 
              href={bookmarkletCode} 
              class="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-move"
              draggable="true"
              on:dragstart={(e) => e.dataTransfer?.setData('text/plain', bookmarkletCode)}
            >
              Prompt Forge
            </a>
          </div>
        </li>
        <li>
          <strong>Log in to the Company GPT app</strong> to ensure you have a valid authentication token.
        </li>
        <li>
          <strong>Click the bookmarklet</strong> in your bookmarks bar while on the Company GPT app.
        </li>
        <li>
          The bookmarklet will extract your authentication token and redirect you to Prompt Forge.
        </li>
        <li>
          You can now use Prompt Forge with your Company GPT authentication!
        </li>
      </ol>
    </Card.Content>
  </Card.Root>
  
  <Card.Root>
    <Card.Header>
      <Card.Title>Technical Details</Card.Title>
    </Card.Header>
    <Card.Content>
      <p class="mb-4">
        This bookmarklet works by extracting your authentication token from the Company GPT app's localStorage and securely transferring it to Prompt Forge.
      </p>
      <p class="mb-4">
        <strong>Privacy Note:</strong> Your token is transferred directly to Prompt Forge without being sent to any third-party servers.
      </p>
      <p>
        <strong>Security Note:</strong> The token is only stored in your browser's localStorage and is not accessible to other websites.
      </p>
    </Card.Content>
  </Card.Root>
</main>

<style lang="postcss">
  @reference "tailwindcss";
  
  :global(body) {
    @apply bg-gray-50;
  }
  
  main {
    @apply max-w-3xl;
  }
</style> 