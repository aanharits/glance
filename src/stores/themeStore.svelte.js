// Svelte 5 Reactive Store for Theme Selection & Custom Colors
import { loadTheme, saveTheme } from "../services/theme.js";

function createThemeStore() {
  let currentThemeId = $state("midnight-purple");
  let customColorHex = $state("#a855f7");

  return {
    get currentThemeId() {
      return currentThemeId;
    },

    get customColorHex() {
      return customColorHex;
    },

    async initTheme() {
      const loaded = await loadTheme();
      currentThemeId = loaded.themeId;
      if (loaded.customColor) customColorHex = loaded.customColor;
    },

    selectPresetTheme(id) {
      currentThemeId = id;
      saveTheme(id);
    },

    handleCustomColorInput(e) {
      const color = e.target.value;
      customColorHex = color;
      currentThemeId = "custom";
      saveTheme("custom", color);
    },
  };
}

export const themeStore = createThemeStore();
