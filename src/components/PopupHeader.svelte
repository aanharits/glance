<script>
  /** @type {{
   *   status: string,
   *   showThemePicker: boolean,
   *   showHistory?: boolean,
   *   isMinimized?: boolean,
   *   activeMode?: 'explain' | 'summary',
   *   headerEl: HTMLElement | null,
   *   onToggleTheme: () => void,
   *   onToggleHistory: () => void,
   *   onToggleMinimize: () => void,
   *   onNewChat: () => void,
   *   onClose: () => void,
   *   onSelectMode?: (mode: 'explain' | 'summary') => void
   * }} */
  let {
    status,
    showThemePicker,
    showHistory = false,
    isMinimized = false,
    activeMode = "explain",
    headerEl = $bindable(null),
    onToggleTheme,
    onToggleHistory,
    onToggleMinimize,
    onNewChat,
    onClose,
    onSelectMode = () => {},
  } = $props();

  let showModeDropdown = $state(false);

  function toggleModeDropdown(e) {
    e.stopPropagation();
    showModeDropdown = !showModeDropdown;
  }

  function handlePickMode(mode, e) {
    e.stopPropagation();
    showModeDropdown = false;
    onSelectMode(mode);
  }

  function handleOutsideClick() {
    if (showModeDropdown) showModeDropdown = false;
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="card-header" bind:this={headerEl}>
  <!-- Concentric Rings Brand Logo -->
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    class="brand-logo"
    class:pulse={status === "loading"}
  >
    <circle
      cx="12"
      cy="12"
      r="9.5"
      stroke="var(--accent)"
      stroke-width="1.8"
      opacity="0.55"
    />
    <circle
      cx="12"
      cy="12"
      r="5.5"
      stroke="var(--accent)"
      stroke-width="1.8"
      opacity="0.85"
    />
    <circle cx="12" cy="12" r="2.2" fill="var(--accent)" />
  </svg>

  <!-- Title & Mode Dropdown Wrapper -->
  <div class="mode-dropdown-wrapper" data-no-drag>
    <button
      class="mode-dropdown-btn"
      onclick={toggleModeDropdown}
      aria-label="Select Mode"
      title="Click to change mode (Explain / Summary)"
    >
      <span class="header-title">
        {status === "loading" ? "Analyzing…" : "Glance"}
      </span>
      {#if status !== "loading"}
        <span class="mode-separator">-</span>
        <span class="mode-name"
          >{activeMode === "summary" ? "Summary" : "Explain"}</span
        >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          class="chevron-icon"
          class:open={showModeDropdown}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      {/if}
    </button>

    {#if showModeDropdown}
      <div class="mode-menu">
        {#if activeMode === "summary"}
          <button
            class="mode-menu-item"
            onclick={(e) => handlePickMode("explain", e)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div class="mode-info">
              <span class="mode-title">Switch to Explain</span>
              <span class="mode-desc">Detailed ELI5 breakdown</span>
            </div>
          </button>
        {:else}
          <button
            class="mode-menu-item"
            onclick={(e) => handlePickMode("summary", e)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="15" y1="12" x2="3" y2="12" />
              <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
            <div class="mode-info">
              <span class="mode-title">Switch to Summary</span>
              <span class="mode-desc">TL;DR bullet points</span>
            </div>
          </button>
        {/if}
      </div>
    {/if}
  </div>

  <div class="header-spacer"></div>

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

  .header-spacer {
    flex: 1;
  }

  .mode-dropdown-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .mode-dropdown-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    padding: 3px 6px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 150ms ease;
  }

  .mode-dropdown-btn:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .header-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .mode-separator {
    font-size: 13px;
    color: var(--text-secondary);
    opacity: 0.5;
    margin: 0 1px;
  }

  .mode-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
  }

  .chevron-icon {
    transition: transform 200ms ease;
    stroke: var(--text-secondary);
    margin-left: 2px;
  }

  .chevron-icon.open {
    transform: rotate(180deg);
    stroke: var(--accent);
  }

  .mode-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 180px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(16px);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 2px;
    animation: menuFadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes menuFadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .mode-menu-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    text-align: left;
    transition: all 120ms ease;
  }

  .mode-menu-item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
  }

  .mode-menu-item.active {
    background: rgba(168, 85, 247, 0.15);
    color: var(--text-primary);
  }

  .mode-menu-item.active svg {
    stroke: var(--accent);
  }

  .mode-info {
    display: flex;
    flex-direction: column;
  }

  .mode-title {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
  }

  .mode-desc {
    font-size: 9.5px;
    color: var(--text-secondary);
    margin-top: 1px;
  }

  .icon-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    display: flex;
    border-radius: 6px;
    transition:
      background 150ms,
      color 150ms;
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
