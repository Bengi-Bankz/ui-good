<script lang="ts">
  import { gameState } from '../stores/gameStore';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function toggleSound() {
    gameState.update(state => {
      const newSoundEnabled = !state.soundEnabled;
      sessionStorage.setItem('soundEnabled', newSoundEnabled ? '1' : '0');
      dispatch('soundToggle', { enabled: newSoundEnabled });
      return { ...state, soundEnabled: newSoundEnabled };
    });
  }
</script>

<div class="game-info-overlay">
  <div class="balance-section">
    <div class="balance-label">Balance</div>
    <div class="balance-amount">${$gameState.balance.toFixed(2)}</div>
  </div>

  <div class="bet-section">
    <div class="bet-label">Bet</div>
    <div class="bet-amount">${$gameState.betAmount.toFixed(2)}</div>
  </div>

  {#if $gameState.lastWin > 0}
    <div class="win-section">
      <div class="win-label">Last Win</div>
      <div class="win-amount">${($gameState.lastWin * $gameState.betAmount).toFixed(2)}</div>
    </div>
  {/if}

  <div class="controls-section">
    <button 
      class="sound-toggle" 
      class:sound-on={$gameState.soundEnabled}
      class:sound-off={!$gameState.soundEnabled}
      on:click={toggleSound}
      title={$gameState.soundEnabled ? 'Sound On' : 'Sound Off'}
    >
      {#if $gameState.soundEnabled}
        🔊
      {:else}
        🔇
      {/if}
    </button>
  </div>
</div>

<style>
  .game-info-overlay {
    position: fixed;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 100;
    pointer-events: none;
  }

  .game-info-overlay > * {
    pointer-events: auto;
  }

  .balance-section,
  .bet-section,
  .win-section {
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 8px 12px;
    color: white;
    font-family: Arial, sans-serif;
    backdrop-filter: blur(4px);
  }

  .balance-label,
  .bet-label,
  .win-label {
    font-size: 12px;
    color: #ccc;
    margin-bottom: 2px;
  }

  .balance-amount {
    font-size: 18px;
    font-weight: bold;
    color: #4CAF50;
  }

  .bet-amount {
    font-size: 16px;
    font-weight: bold;
    color: #2196F3;
  }

  .win-amount {
    font-size: 16px;
    font-weight: bold;
    color: #FFD700;
    animation: winGlow 2s ease-out;
  }

  @keyframes winGlow {
    0% {
      color: #FFD700;
      text-shadow: 0 0 5px #FFD700;
    }
    50% {
      color: #FFF;
      text-shadow: 0 0 15px #FFD700, 0 0 25px #FFD700;
    }
    100% {
      color: #FFD700;
      text-shadow: 0 0 5px #FFD700;
    }
  }

  .controls-section {
    margin-top: 8px;
  }

  .sound-toggle {
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
  }

  .sound-toggle:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }

  .sound-toggle.sound-on {
    border-color: #4CAF50;
  }

  .sound-toggle.sound-off {
    border-color: #f44336;
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .game-info-overlay {
      top: 8px;
      left: 8px;
      gap: 6px;
    }

    .balance-section,
    .bet-section,
    .win-section {
      padding: 6px 8px;
    }

    .balance-amount {
      font-size: 16px;
    }

    .bet-amount,
    .win-amount {
      font-size: 14px;
    }

    .sound-toggle {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }
  }
</style>