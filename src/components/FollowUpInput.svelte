<script>
  /** @type {{
   *   disabled?: boolean,
   *   onSubmitFollowUp: (prompt: string) => void
   * }} */
  let { disabled = false, onSubmitFollowUp } = $props();

  let query = $state("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim() || disabled) return;
    const text = query.trim();
    query = "";
    onSubmitFollowUp(text);
  }
</script>

<form class="followup-container" onsubmit={handleSubmit} data-no-drag>
  <input
    type="text"
    class="followup-input"
    placeholder="Ask follow-up question…"
    bind:value={query}
    {disabled}
  />
  <button type="submit" class="send-btn" disabled={disabled || !query.trim()} aria-label="Send">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  </button>
</form>

<style>
  .followup-container {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-top: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .followup-input {
    flex: 1;
    font-size: 12px;
    color: var(--text-primary);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 10px;
    outline: none;
    transition: border-color 150ms ease;
  }

  .followup-input:focus {
    border-color: var(--accent);
  }

  .followup-input::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--accent);
    color: #ffffff;
    border: none;
    cursor: pointer;
    transition: opacity 150ms ease, transform 150ms ease;
  }

  .send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .send-btn:not(:disabled):hover {
    opacity: 0.9;
    transform: scale(1.04);
  }
</style>
