<script lang="ts">
  import { gameState, autoPlayState, canAutoPlay, uiVisible } from '../stores/gameStore';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  
  let autoRounds = 10;
  let stopOnWin = false;
  let stopOnLoss = false;

  function startAutoPlay() {
    autoPlayState.update(state => ({
      ...state,
      isRunning: true,
      remainingRounds: autoRounds,
      totalRounds: autoRounds,
      stopOnWin,
      stopOnLoss
    }));
    
    gameState.update(state => ({
      ...state,
      isAutoPlay: true,
      autoPlayRounds: autoRounds
    }));

    dispatch('startAutoPlay', {
      rounds: autoRounds,
      stopOnWin,
      stopOnLoss
    });
    
    uiVisible.update(ui => ({ ...ui, autoPanel: false }));
  }

  function stopAutoPlay() {
    autoPlayState.update(state => ({
      ...state,
      isRunning: false,
      remainingRounds: 0
    }));
    
    gameState.update(state => ({
      ...state,
      isAutoPlay: false
    }));

    dispatch('stopAutoPlay');
  }

  function toggleAutoPanel() {
    uiVisible.update(ui => ({ ...ui, autoPanel: !ui.autoPanel }));
  }
</script>

<div class="auto-control">
  {#if $autoPlayState.isRunning}
    <div class="auto-running">
      <div class="auto-info">
        <span class="auto-label">AUTO</span>
        <span class="rounds-remaining">{$autoPlayState.remainingRounds}</span>
      </div>
      <button class="stop-button" on:click={stopAutoPlay}>
        STOP
      </button>
    </div>
  {:else}
    <button 
      class="auto-button" 
      class:disabled={!$canAutoPlay}
      on:click={toggleAutoPanel}
      disabled={!$canAutoPlay}
    >
      AUTO
    </button>
  {/if}

  {#if $uiVisible.autoPanel && !$autoPlayState.isRunning}
    <div class="auto-panel">
      <div class="panel-header">
        <h3>Auto Play Settings</h3>
        <button class="close-btn" on:click={() => uiVisible.update(ui => ({ ...ui, autoPanel: false }))}>
          ×
        </button>
      </div>
      
      <div class="setting-group">
        <label for="rounds">Number of Rounds:</label>
        <input 
          id="rounds"
          type="number" 
          bind:value={autoRounds} 
          min="1" 
          max="1000"
          class="rounds-input"
        />
      </div>

      <div class="setting-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={stopOnWin} />
          Stop on Win
        </label>
      </div>

      <div class="setting-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={stopOnLoss} />
          Stop on Loss
        </label>
      </div>

      <div class="panel-actions">
        <button class="start-auto-btn" on:click={startAutoPlay}>
          Start Auto Play
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .auto-control {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .auto-button {
    background: linear-gradient(145deg, #4CAF50, #45a049);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .auto-button:hover:not(.disabled) {
    background: linear-gradient(145deg, #45a049, #4CAF50);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }

  .auto-button.disabled {
    background: #666;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .auto-running {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: rgba(76, 175, 80, 0.2);
    border: 2px solid #4CAF50;
    border-radius: 6px;
  }

  .auto-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    color: #4CAF50;
    font-weight: bold;
  }

  .auto-label {
    font-size: 10px;
  }

  .rounds-remaining {
    font-size: 14px;
  }

  .stop-button {
    background: linear-gradient(145deg, #f44336, #d32f2f);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .stop-button:hover {
    background: linear-gradient(145deg, #d32f2f, #f44336);
    transform: translateY(-1px);
  }

  .auto-panel {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.95);
    border: 2px solid #4CAF50;
    border-radius: 8px;
    padding: 16px;
    min-width: 250px;
    color: white;
    box-shadow: 0 8px 16px rgba(0,0,0,0.5);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .panel-header h3 {
    margin: 0;
    color: #4CAF50;
    font-size: 16px;
  }

  .close-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    color: #f44336;
  }

  .setting-group {
    margin-bottom: 12px;
  }

  .setting-group label {
    display: block;
    margin-bottom: 4px;
    font-size: 14px;
    color: #ccc;
  }

  .rounds-input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #666;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 14px;
  }

  .rounds-input:focus {
    outline: none;
    border-color: #4CAF50;
  }

  .checkbox-label {
    display: flex !important;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    margin: 0;
  }

  .panel-actions {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #666;
  }

  .start-auto-btn {
    width: 100%;
    background: linear-gradient(145deg, #4CAF50, #45a049);
    color: white;
    border: none;
    padding: 10px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .start-auto-btn:hover {
    background: linear-gradient(145deg, #45a049, #4CAF50);
    transform: translateY(-1px);
  }
</style>