<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState } from '../stores/gameStore';
  import AutoControl from './AutoControl.svelte';
  import GameInfoOverlay from './GameInfoOverlay.svelte';

  export let pixiApp: any;
  // Note: pixiApp is passed in but not currently used in this component
  export let onAutoPlay: (config: any) => void;
  export let onStopAutoPlay: () => void;
  export let onSoundToggle: (enabled: boolean) => void;
  export let onUpdateGameState: (state: any) => void;

  onMount(() => {
    // Initialize sound state from session storage
    const soundEnabled = sessionStorage.getItem('soundEnabled') === '1';
    gameState.update(state => ({ ...state, soundEnabled }));
  });

  function handleAutoPlayStart(event: CustomEvent) {
    onAutoPlay(event.detail);
  }

  function handleAutoPlayStop() {
    onStopAutoPlay();
  }

  function handleSoundToggle(event: CustomEvent) {
    onSoundToggle(event.detail.enabled);
  }
</script>

<!-- Game Info Overlay (top-left) -->
<GameInfoOverlay on:soundToggle={handleSoundToggle} />

<!-- Auto Control (bottom-right) -->
<div class="auto-control-container">
  <AutoControl 
    on:startAutoPlay={handleAutoPlayStart}
    on:stopAutoPlay={handleAutoPlayStop}
  />
</div>

<!-- Debug info (only in development) -->
{#if import.meta.env.DEV}
  <div class="debug-info">
    <details>
      <summary>Debug Info</summary>
      <pre>{JSON.stringify({
        gameState: $gameState
      }, null, 2)}</pre>
    </details>
  </div>
{/if}

<style>
  .auto-control-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
  }

  .debug-info {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1001;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 10px;
    max-width: 300px;
  }

  .debug-info summary {
    cursor: pointer;
    color: #4CAF50;
  }

  .debug-info pre {
    margin: 8px 0 0 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .auto-control-container {
      bottom: 16px;
      right: 16px;
    }

    .debug-info {
      top: 16px;
      right: 16px;
      max-width: 200px;
      font-size: 8px;
    }
  }
</style>