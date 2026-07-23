<script>
  import "./app.css";
  import { onMount, onDestroy, tick } from "svelte";
  import { listen } from "@tauri-apps/api/event";
  import { getClipboardText } from "./clipboard.js";
  import { askGroq } from "./groq.js";
  import { resizeToContent, closePopup, playPopIn } from "./window.js";
  import { setupWindowDrag } from "./drag.js";
  import { saveTheme, loadTheme } from "./theme.js";

  // UI Components
  import PopupHeader from "./components/PopupHeader.svelte";
  import ThemePicker from "./components/ThemePicker.svelte";
  import PopupBody from "./components/PopupBody.svelte";
  import PopupFooter from "./components/PopupFooter.svelte";

  // Component State
  let status = $state("idle");
  let resultText = $state("");
  let errorText = $state("");
  let copied = $state(false);
  let showThemePicker = $state(false);
  let currentThemeId = $state("midnight-purple");
  let customColorHex = $state("#a855f7");

  // DOM References
  let mainEl = $state(null);
  let cardEl = $state(null);
  let headerEl = $state(null);

  /** @type {(() => void) | null} */
  let unlistenSnap = null;
  /** @type {(() => void) | null} */
  let unlistenTheme = null;

  onMount(async () => {
    const loaded = await loadTheme();
    currentThemeId = loaded.themeId;
    if (loaded.customColor) customColorHex = loaded.customColor;

    unlistenSnap = await listen("snap:triggered", handleSnap);
    unlistenTheme = await listen("theme:changed", (e) => e.payload && selectPresetTheme(e.payload));
  });

  onDestroy(() => {
    if (unlistenSnap) unlistenSnap();
    if (unlistenTheme) unlistenTheme();
  });

  // Attach native window drag handle
  $effect(() => {
    if (headerEl && cardEl) return setupWindowDrag(headerEl, cardEl);
  });

  // Auto-resize window based on DOM height changes
  $effect(() => {
    status; resultText; errorText; showThemePicker;
    tick().then(() => resizeToContent(mainEl));
  });

  async function handleSnap() {
    resetState();
    status = "loading";
    // Trigger 120Hz compositor-accelerated Web Animation API pop-in
    playPopIn(cardEl);
    doCapture();
  }

  function resetState() {
    status = "idle";
    resultText = "";
    errorText = "";
    copied = false;
    showThemePicker = false;
  }

  async function handleClose() {
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

  async function copyResult() {
    if (!resultText) return;
    await navigator.clipboard.writeText(resultText);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }

  function handleKeydown(e) {
    if (e.key === "Escape") handleClose();
    if ((e.metaKey || e.ctrlKey) && e.key === "c" && status === "result") copyResult();
  }

  async function doCapture() {
    try {
      const text = await getClipboardText();
      resultText = await askGroq(text);
      status = "result";
    } catch (err) {
      console.error("Glance error:", err);
      errorText = err?.message || "Failed to process. Please try again.";
      status = "error";
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<main bind:this={mainEl}>
  <div class="card" bind:this={cardEl}>
    <PopupHeader
      {status}
      {showThemePicker}
      bind:headerEl
      onToggleTheme={() => (showThemePicker = !showThemePicker)}
      onClose={handleClose}
    />

    {#if showThemePicker}
      <ThemePicker
        {currentThemeId}
        {customColorHex}
        onSelectPreset={selectPresetTheme}
        onCustomColorInput={handleCustomColorInput}
      />
    {/if}

    <PopupBody {status} {resultText} {errorText} />

    {#if status === "result"}
      <PopupFooter {copied} onCopy={copyResult} />
    {/if}
  </div>
</main>

<style>
  main {
    padding: 8px;
  }

  .card {
    background-color: var(--bg-solid, #18181b);
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

  :global(.card.dragging) {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
  }
</style>
