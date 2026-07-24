<script>
  /** @type {{
   *   historyItems: Array<import('../services/history.js').HistoryItem>,
   *   onSelectHistoryItem: (item: any) => void,
   *   onDeleteHistoryItem: (id: string) => void,
   *   onClearAllHistory: () => void
   * }} */
  let { historyItems = [], onSelectHistoryItem, onDeleteHistoryItem, onClearAllHistory } = $props();

  function formatTime(isoStr) {
    if (!isoStr) return "";
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }
</script>

<div class="history-panel" data-no-drag>
  <div class="history-header">
    <span class="history-title">Recent History</span>
    {#if historyItems.length > 0}
      <button class="clear-btn" onclick={onClearAllHistory}>Clear All</button>
    {/if}
  </div>

  <div class="history-list">
    {#if historyItems.length === 0}
      <p class="empty-text">No history items yet.</p>
    {:else}
      {#each historyItems as item (item.id)}
        <div class="history-item" onclick={() => onSelectHistoryItem(item)}>
          <p class="item-preview">{item.resultText}</p>
          <div class="item-meta">
            <span class="item-time">{formatTime(item.timestamp)}</span>
          </div>
          <button
            class="delete-item-btn"
            title="Delete"
            onclick={(e) => {
              e.stopPropagation();
              onDeleteHistoryItem(item.id);
            }}
          >
            ✕
          </button>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .history-panel {
    display: flex;
    flex-direction: column;
    height: 360px;
    max-height: 380px;
    background: var(--bg-solid, #121115);
    background-image: var(--theme-tint-bg);
    animation: historyPopIn 220ms cubic-bezier(0.16, 1, 0.3, 1);
    flex-shrink: 0;
    overflow: hidden;
  }

  @keyframes historyPopIn {
    0% {
      opacity: 0;
      transform: translate3d(0, 8px, 0) scale(0.97);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .history-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .clear-btn {
    font-size: 11px;
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: color 150ms, background 150ms;
  }

  .clear-btn:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .history-list {
    overflow-y: auto;
    flex: 1;
    max-height: 320px;
    padding: 8px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .history-list::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  .empty-text {
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
    padding: 24px 0;
    margin: 0;
  }

  .history-item {
    position: relative;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;
    margin-bottom: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
  }

  .history-item:hover {
    border-color: var(--accent);
  }

  .item-preview {
    font-size: 12px;
    color: var(--text-primary);
    margin: 0 0 4px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    padding-right: 14px;
  }

  .item-meta {
    display: flex;
    justify-content: flex-end;
    margin-top: 2px;
  }

  .item-time {
    font-size: 10px;
    color: var(--text-secondary);
    opacity: 0.85;
  }

  .delete-item-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 10px;
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0;
    transition: opacity 150ms, color 150ms;
  }

  .history-item:hover .delete-item-btn {
    opacity: 1;
  }

  .delete-item-btn:hover {
    color: #ef4444;
  }
</style>
