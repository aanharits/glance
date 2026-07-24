<script>
  /** @type {{
   *   status: string,
   *   showThemePicker: boolean,
   *   showHistory?: boolean,
   *   isMinimized?: boolean,
   *   headerEl: HTMLElement | null,
   *   onToggleTheme: () => void,
   *   onToggleHistory: () => void,
   *   onToggleMinimize: () => void,
   *   onClose: () => void
   * }} */
  let {
    status,
    showThemePicker,
    showHistory = false,
    isMinimized = false,
    headerEl = $bindable(null),
    onToggleTheme,
    onToggleHistory,
    onToggleMinimize,
    onNewChat,
    onClose,
  } = $props();
</script>

<div class="card-header" bind:this={headerEl}>
  <!-- Concentric Rings Brand Logo -->
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="brand-logo" class:pulse={status === "loading"}>
    <circle cx="12" cy="12" r="9.5" stroke="var(--accent)" stroke-width="1.8" opacity="0.55" />
    <circle cx="12" cy="12" r="5.5" stroke="var(--accent)" stroke-width="1.8" opacity="0.85" />
    <circle cx="12" cy="12" r="2.2" fill="var(--accent)" />
  </svg>

  <span class="label">
    {status === "loading" ? "Analyzing…" : "Glance"}
  </span>

  <div class="header-actions" class:hidden={isMinimized}>
    <!-- New Chat Button -->
    <button
      class="icon-btn"
      onclick={onNewChat}
      aria-label="New Chat"
      title="New Chat"
      data-no-drag
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    <!-- History Toggle Button -->
    <button
      class="icon-btn"
      class:active={showHistory}
      onclick={onToggleHistory}
      aria-label="History"
      title="Recent History"
      data-no-drag
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    </button>

    <!-- Theme Palette Toggle -->
    <button
      class="icon-btn"
      class:active={showThemePicker}
      onclick={onToggleTheme}
      aria-label="Select Theme"
      title="Change Theme Color"
      data-no-drag
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.72 1.7-1.65 0-.43-.17-.83-.46-1.13-.29-.3-.46-.7-.46-1.13 0-.92.78-1.7 1.7-1.7h2.52c2.76 0 5.02-2.26 5.02-5.02C22 6.5 17.5 2 12 2z"
        />
      </svg>
    </button>
  </div>

  <!-- Close Button -->
  <button class="icon-btn" onclick={onClose} aria-label="Close" data-no-drag>
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  </button>
</div>

<style>
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    cursor: grab;
    user-select: none;
    touch-action: none;
    flex-shrink: 0;
  }

  .card-header:active {
    cursor: grabbing;
  }

  .brand-logo {
    flex-shrink: 0;
    transition: transform 200ms ease;
  }

  .brand-logo.pulse {
    animation: pulse 1.2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.92);
    }
  }

  .label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    flex: 1;
    pointer-events: none;
  }

  .icon-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    display: flex;
    border-radius: 6px;
    transition: background 150ms, color 150ms;
  }

  .icon-btn:hover,
  .icon-btn.active {
    background: var(--surface);
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    transition: opacity 150ms ease;
  }

  .header-actions.hidden {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }
</style>
