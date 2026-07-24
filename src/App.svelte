<script>
  import "./app.css";
  import { onMount, onDestroy, tick } from "svelte";
  import { listen } from "@tauri-apps/api/event";
  import { syncClipboardBaseline, checkNewCopy } from "./services/clipboard.js";
  import { askGroq } from "./services/groq.js";
  import { resizeToContent, closePopup, playPopIn } from "./services/window.js";
  import { setupWindowDrag } from "./services/drag.js";
  import { saveTheme, loadTheme } from "./services/theme.js";
  import { getHistory, saveHistory, deleteHistoryItem, clearHistory } from "./services/history.js";

  // UI Components
  import PopupHeader from "./components/PopupHeader.svelte";
  import ThemePicker from "./components/ThemePicker.svelte";
  import HistoryPanel from "./components/HistoryPanel.svelte";
  import PopupBody from "./components/PopupBody.svelte";
  import FollowUpInput from "./components/FollowUpInput.svelte";

  // Component State
  let status = $state("idle");
  let chatMessages = $state([]);
  let errorText = $state("");
  let showThemePicker = $state(false);
  let showHistory = $state(false);
  let isMinimized = $state(false);
  let currentText = $state("");
  let historyItems = $state([]);
  let currentThemeId = $state("midnight-purple");
  let customColorHex = $state("#a855f7");
  let isWindowVisible = $state(false);

  // DOM References
  let mainEl = $state(null);
  let cardEl = $state(null);
  let headerEl = $state(null);

  /** @type {(() => void) | null} */
  let unlistenSnap = null;
  /** @type {(() => void) | null} */
  let unlistenTheme = null;
  /** @type {any} */
  let clipboardInterval = null;

  onMount(async () => {
    const loaded = await loadTheme();
    currentThemeId = loaded.themeId;
    if (loaded.customColor) customColorHex = loaded.customColor;

    historyItems = await getHistory();

    unlistenSnap = await listen("snap:triggered", handleSnap);
    unlistenTheme = await listen("theme:changed", (e) => e.payload && selectPresetTheme(e.payload));

    // Monitor clipboard for new copy events ONLY when window is visible
    clipboardInterval = setInterval(async () => {
      if (!isWindowVisible) return;

      const newText = await checkNewCopy();
      if (newText) {
        doCapture(newText);
      }
    }, 400);
  });

  onDestroy(() => {
    if (unlistenSnap) unlistenSnap();
    if (unlistenTheme) unlistenTheme();
    if (clipboardInterval) clearInterval(clipboardInterval);
  });

  // Attach native window drag handle
  $effect(() => {
    if (headerEl && cardEl) return setupWindowDrag(headerEl, cardEl);
  });

  // Auto-resize window based on DOM height changes
  $effect(() => {
    status; chatMessages.length; errorText; showThemePicker; showHistory; isMinimized;
    tick().then(() => resizeToContent(mainEl));
  });

  async function handleSnap() {
    isWindowVisible = true;
    // Sync current clipboard as baseline so old text copied while closed is IGNORED
    await syncClipboardBaseline();

    await tick();
    if (cardEl) playPopIn(cardEl);
  }

  function resetState() {
    status = "idle";
    chatMessages = [];
    errorText = "";
    showThemePicker = false;
    showHistory = false;
    isMinimized = false;
    isWindowVisible = false;
  }

  function handleToggleMinimize() {
    // Only allow minimize when there's content to show
    if (status !== "result" && chatMessages.length === 0) return;
    isMinimized = !isMinimized;
    // Close panels when minimizing
    if (isMinimized) {
      showThemePicker = false;
      showHistory = false;
    }
  }

  async function handleClose() {
    isWindowVisible = false;
    await closePopup(cardEl, resetState);
  }

  function selectPresetTheme(id) {
    currentThemeId = id;
    saveTheme(id);
  }

  function handleCustomColorInput(e) {
    const color = e.target.value;
    customColorHex = color;
    currentThemeId = "custom";
    saveTheme("custom", color);
  }

  function handleKeydown(e) {
    if (e.key === "Escape") handleClose();
  }

  async function doCapture(text) {
    if (!text) return;
    try {
      currentText = text;
      status = "loading";

      const res = await askGroq(text);
      chatMessages = [{ role: "assistant", content: res }];
      status = "result";

      historyItems = await saveHistory({
        inputText: text,
        resultText: res,
      });
    } catch (err) {
      console.error("Glance error:", err);
      errorText = err?.message || "Failed to process. Please try again.";
      status = "error";
    }
  }

  async function handleFollowUp(prompt) {
    if (chatMessages.length === 0) return;
    try {
      const previousHistory = [...chatMessages];
      chatMessages = [...chatMessages, { role: "user", content: prompt }];
      status = "loading";

      const res = await askGroq(prompt, previousHistory);
      chatMessages = [...chatMessages, { role: "assistant", content: res }];
      status = "result";

      historyItems = await saveHistory({
        inputText: prompt,
        resultText: res,
      });
    } catch (err) {
      console.error("Follow-up error:", err);
      errorText = err?.message || "Failed to process follow-up.";
      status = "error";
    }
  }

  async function handleSelectHistoryItem(item) {
    chatMessages = [{ role: "assistant", content: item.resultText }];
    currentText = item.inputText || "";
    status = "result";
    showHistory = false;
  }

  async function handleDeleteHistoryItem(id) {
    historyItems = await deleteHistoryItem(id);
  }

  async function handleClearAllHistory() {
    historyItems = await clearHistory();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<main bind:this={mainEl}>
  <div class="card" bind:this={cardEl}>
    <PopupHeader
      {status}
      {showThemePicker}
      {showHistory}
      {isMinimized}
      bind:headerEl
      onToggleTheme={() => {
        showThemePicker = !showThemePicker;
        if (showThemePicker) showHistory = false;
      }}
      onToggleHistory={() => {
        showHistory = !showHistory;
        if (showHistory) showThemePicker = false;
      }}
      onToggleMinimize={handleToggleMinimize}
      onClose={handleClose}
    />

    {#if !isMinimized}
      {#if showThemePicker}
        <ThemePicker
          {currentThemeId}
          {customColorHex}
          onSelectPreset={selectPresetTheme}
          onCustomColorInput={handleCustomColorInput}
        />
      {/if}

      {#if showHistory}
        <HistoryPanel
          {historyItems}
          onSelectHistoryItem={handleSelectHistoryItem}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          onClearAllHistory={handleClearAllHistory}
        />
      {:else}
        <PopupBody {status} messages={chatMessages} {errorText} />

        {#if status === "result" || chatMessages.length > 0}
          <FollowUpInput
            disabled={status === "loading"}
            onSubmitFollowUp={handleFollowUp}
          />
        {/if}
      {/if}
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
    max-width: 360px;
    display: flex;
    flex-direction: column;
    will-change: opacity, transform;
    transition: box-shadow 200ms ease, border-color 200ms ease;
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
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
  }
</style>
