<script>
  import "./app.css";
  import { onMount, onDestroy, tick } from "svelte";
  import { slide } from "svelte/transition";
  import { listen } from "@tauri-apps/api/event";
  import {
    syncClipboardBaseline,
    setLastProcessedText,
  } from "./services/clipboard.js";
  import { resizeToContent, playPopIn } from "./services/window.js";
  import { setupWindowDrag } from "./services/drag.js";

  // Svelte 5 Reactive Stores
  import { chatStore } from "./stores/chat.svelte.js";
  import { historyStore } from "./stores/historyStore.svelte.js";
  import { themeStore } from "./stores/themeStore.svelte.js";
  import { uiStore } from "./stores/uiState.svelte.js";

  // UI Components
  import PopupHeader from "./components/PopupHeader.svelte";
  import ThemePicker from "./components/ThemePicker.svelte";
  import HistoryPanel from "./components/HistoryPanel.svelte";
  import PopupBody from "./components/PopupBody.svelte";
  import FollowUpInput from "./components/FollowUpInput.svelte";

  // DOM References
  let mainEl = $state(null);
  let cardEl = $state(null);
  let headerEl = $state(null);

  /** @type {(() => void) | null} */
  let unlistenSnap = null;
  /** @type {(() => void) | null} */
  let unlistenTheme = null;
  /** @type {(() => void) | null} */
  let unlistenClip = null;
  /** @type {(() => void) | null} */
  let unlistenMin = null;

  onMount(async () => {
    await themeStore.initTheme();
    await historyStore.initHistory();

    unlistenSnap = await listen("snap:triggered", handleSnap);
    unlistenTheme = await listen(
      "theme:changed",
      (e) => e.payload && themeStore.selectPresetTheme(e.payload)
    );
    unlistenMin = await listen("window:toggle_minimize", handleToggleMinimize);

    // Native OS clipboard listener emitted by Rust background thread
    unlistenClip = await listen("clipboard:changed", async (e) => {
      if (!uiStore.isWindowVisible) return;

      const text = e.payload;
      if (text && typeof text === "string" && chatStore.status !== "loading") {
        const trimmed = text.trim();
        if (trimmed && trimmed.length > 0) {
          setLastProcessedText(trimmed);
          await chatStore.doCapture(trimmed, historyStore);
        }
      }
    });
  });

  onDestroy(() => {
    if (unlistenSnap) unlistenSnap();
    if (unlistenTheme) unlistenTheme();
    if (unlistenClip) unlistenClip();
    if (unlistenMin) unlistenMin();
  });

  // Attach native window drag handle
  $effect(() => {
    if (headerEl && cardEl) return setupWindowDrag(headerEl, cardEl);
  });

  // Auto-resize window based on DOM height changes
  $effect(() => {
    chatStore.status;
    chatStore.chatMessages.length;
    chatStore.errorText;
    uiStore.showThemePicker;
    uiStore.showHistory;
    tick().then(() => resizeToContent(mainEl));
  });

  async function handleSnap() {
    uiStore.isWindowVisible = true;
    await syncClipboardBaseline();
    await tick();
    if (cardEl) playPopIn(cardEl);
  }

  function handleToggleMinimize() {
    uiStore.toggleMinimize(
      mainEl,
      chatStore.status,
      chatStore.chatMessages.length
    );
  }

  function handleClose() {
    uiStore.handleClose(cardEl, () => chatStore.resetChatState());
  }

  function handleSelectHistoryItem(item) {
    chatStore.loadFromHistory(item);
    uiStore.showHistory = false;
    uiStore.isMinimized = false;
  }

  function handleKeydown(e) {
    if (e.key === "Escape") {
      handleClose();
    } else if ((e.metaKey || e.ctrlKey) && (e.key === "m" || e.key === "M")) {
      e.preventDefault();
      handleToggleMinimize();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<main bind:this={mainEl}>
  <div class="card" bind:this={cardEl}>
    <PopupHeader
      status={chatStore.status}
      showThemePicker={uiStore.showThemePicker}
      showHistory={uiStore.showHistory}
      isMinimized={uiStore.isMinimized}
      activeMode={chatStore.activeMode}
      bind:headerEl
      onToggleTheme={() => uiStore.toggleTheme()}
      onToggleHistory={() => uiStore.toggleHistory()}
      onToggleMinimize={handleToggleMinimize}
      onNewChat={() => chatStore.resetChatState()}
      onClose={handleClose}
      onSelectMode={(m) => chatStore.selectMode(m)}
    />

    {#if !uiStore.isMinimized}
      <div
        transition:slide={{ duration: 220, axis: "y" }}
        class="card-body-wrapper"
      >
        {#if uiStore.showThemePicker}
          <ThemePicker
            currentThemeId={themeStore.currentThemeId}
            customColorHex={themeStore.customColorHex}
            onSelectPreset={(id) => themeStore.selectPresetTheme(id)}
            onCustomColorInput={(e) => themeStore.handleCustomColorInput(e)}
          />
        {/if}

        {#if uiStore.showHistory}
          <HistoryPanel
            historyItems={historyStore.historyItems}
            onSelectHistoryItem={handleSelectHistoryItem}
            onDeleteHistoryItem={(id) => historyStore.deleteItem(id)}
            onClearAllHistory={() => historyStore.clearAll()}
          />
        {:else}
          <PopupBody
            status={chatStore.status}
            messages={chatStore.chatMessages}
            errorText={chatStore.errorText}
            activeMode={chatStore.activeMode}
            onSelectMode={(m) => chatStore.selectMode(m)}
          />

          {#if chatStore.status === "result" || chatStore.chatMessages.length > 0}
            <FollowUpInput
              disabled={chatStore.status === "loading"}
              onSubmitFollowUp={(prompt) =>
                chatStore.handleFollowUp(prompt, historyStore)}
            />
          {/if}
        {/if}
      </div>
    {/if}

    {#if chatStore.status === "result" || chatStore.chatMessages.length > 0}
      <button
        class="collapse-bar"
        onclick={handleToggleMinimize}
        data-no-drag
        aria-label={uiStore.isMinimized ? "Expand" : "Minimize"}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          {#if uiStore.isMinimized}
            <path d="M5 12h14M12 5l7 7-7 7" />
          {:else}
            <path d="M5 12h14" />
          {/if}
        </svg>
        <span>{uiStore.isMinimized ? "Expand" : "Minimize"}</span>
      </button>
    {/if}
  </div>
</main>

<style>
  main {
    padding: 8px;
  }

  .card {
    position: relative;
    background-color: var(--bg-solid, #121115);
    background: var(--bg);
    background-image: var(--theme-tint-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--glass-shadow);
    max-width: 370px;
    display: flex;
    flex-direction: column;
    will-change: opacity, transform;
    transition:
      box-shadow 200ms ease,
      border-color 200ms ease;
    overflow: hidden;
  }

  .card-body-wrapper {
    overflow: hidden;
  }

  /* Tray Arrow Indicator pointing up to system tray icon */
  .card::before {
    content: "";
    position: absolute;
    top: -7px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background-color: var(--bg-solid, #121115);
    background: var(--bg);
    border-top: 1px solid var(--border);
    border-left: 1px solid var(--border);
    border-top-left-radius: 3px;
    z-index: 10;
  }

  :global(.card.dragging) {
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.18),
      0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
  }

  .collapse-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 100%;
    padding: 7px 12px;
    background-color: var(--bg-solid);
    background-image: var(--theme-tint-bg);
    background-size: 200% 200%;
    opacity: 0.82;
    border: none;
    border-top: 1px solid var(--border);
    border-radius: 0 0 var(--radius) var(--radius);
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition:
      opacity 150ms ease,
      color 150ms ease;
  }

  .collapse-bar:hover {
    opacity: 1;
    color: var(--text-primary);
  }
</style>
