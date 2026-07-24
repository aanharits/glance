<script>
  /** @type {{
   *   disabled?: boolean,
   *   onSubmitFollowUp: (prompt: string) => void
   * }} */
  let { disabled = false, onSubmitFollowUp } = $props();

  let query = $state("");

  let hasText = $derived(query.trim().length > 0);

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim() || disabled) return;
    const text = query.trim();
    query = "";
    onSubmitFollowUp(text);
  }
</script>

<form class="followup-container" onsubmit={handleSubmit} data-no-drag>
  <div class="input-wrapper">
    <input
      type="text"
      class="followup-input"
      placeholder="Ask a follow-up question…"
      bind:value={query}
      {disabled}
    />
    <button
      type="submit"
      class="send-btn"
      class:visible={hasText}
      disabled={disabled || !hasText}
      aria-label="Send"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 20v-9.17l3.88 3.88 1.41-1.42L12 6.83l-6.29 6.46 1.41 1.42L11 10.83V20h2z"/>
      </svg>
    </button>
  </div>
</form>

<style>
  .followup-container {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  .input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    padding: 3px 4px 3px 12px;
    transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
  }

  .input-wrapper:focus-within {
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.07);
    box-shadow: 0 0 0 1px var(--accent-soft);
  }

  .followup-input {
    flex: 1;
    font-size: 12.5px;
    color: var(--text-primary);
    background: transparent;
    border: none;
    padding: 5px 0;
    outline: none;
    font-family: var(--font-sans);
  }

  .followup-input::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0;
    height: 28px;
    margin-left: 0;
    border-radius: 8px;
    background: var(--accent);
    color: #ffffff;
    border: none;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
    flex-shrink: 0;
    overflow: hidden;

    /* Hidden & collapsed by default */
    opacity: 0;
    transform: scale(0.5);
    pointer-events: none;
    transition:
      width 220ms cubic-bezier(0.34, 1.56, 0.64, 1),
      margin-left 220ms cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 220ms cubic-bezier(0.34, 1.56, 0.64, 1),
      transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .send-btn.visible {
    width: 28px;
    margin-left: 6px;
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  .send-btn:not(:disabled):hover {
    opacity: 0.9;
    transform: scale(1.06);
  }

  .send-btn:not(:disabled):active {
    transform: scale(0.92);
  }
</style>
