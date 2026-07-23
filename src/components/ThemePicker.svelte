<script>
  import { PRESET_THEMES } from "../theme.js";

  /** @type {{
   *   currentThemeId: string,
   *   customColorHex: string,
   *   onSelectPreset: (id: string) => void,
   *   onCustomColorInput: (e: Event) => void
   * }} */
  let { currentThemeId, customColorHex, onSelectPreset, onCustomColorInput } = $props();
</script>

<div class="theme-panel" data-no-drag>
  <span class="theme-panel-label">Theme:</span>
  <div class="swatches">
    {#each PRESET_THEMES as t}
      <button
        class="swatch"
        class:selected={currentThemeId === t.id}
        style="--swatch-color: {t.color}"
        title={t.name}
        onclick={() => onSelectPreset(t.id)}
        aria-label={t.name}
      ></button>
    {/each}

    <!-- Native Custom Color Picker -->
    <label class="swatch custom-picker" class:selected={currentThemeId === "custom"} title="Custom Color">
      <input
        type="color"
        value={customColorHex}
        oninput={onCustomColorInput}
        aria-label="Select Custom Color"
      />
      <span class="custom-dot" style="background: {customColorHex}"></span>
    </label>
  </div>
</div>

<style>
  .theme-panel {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    animation: pop-in 150ms ease-out;
    flex-shrink: 0;
  }

  .theme-panel-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .swatches {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .swatch {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--swatch-color);
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    transition: transform 150ms ease, border-color 150ms ease;
  }

  .swatch:hover {
    transform: scale(1.15);
  }

  .swatch.selected {
    border-color: var(--text-primary);
    transform: scale(1.15);
  }

  .custom-picker {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custom-picker input[type="color"] {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .custom-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    pointer-events: none;
  }

  @keyframes pop-in {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
