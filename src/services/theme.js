// Theme Manager — Controls color themes, root CSS variables, and persistent store settings.

import { LazyStore } from "@tauri-apps/plugin-store";

const store = new LazyStore("settings.json");

/** Curated theme preset definitions */
export const PRESET_THEMES = [
  {
    id: "midnight-purple",
    name: "Midnight Purple",
    color: "#a855f7",
    accent: "#a855f7",
    accentSoft: "rgba(168, 85, 247, 0.12)",
    tintBg: "radial-gradient(ellipse at 0% 100%, rgba(100, 40, 160, 0.28) 0%, transparent 65%)",
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    color: "#14b8a6",
    accent: "#14b8a6",
    accentSoft: "rgba(20, 184, 166, 0.12)",
    tintBg: "radial-gradient(ellipse at 0% 100%, rgba(13, 100, 92, 0.28) 0%, transparent 65%)",
  },
  {
    id: "sunset-coral",
    name: "Sunset Coral",
    color: "#f97316",
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.12)",
    tintBg: "radial-gradient(ellipse at 0% 100%, rgba(160, 60, 10, 0.28) 0%, transparent 65%)",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    color: "#a1a1aa",
    accent: "#a1a1aa",
    accentSoft: "rgba(161, 161, 170, 0.12)",
    tintBg: "radial-gradient(ellipse at 0% 100%, rgba(60, 60, 70, 0.28) 0%, transparent 65%)",
  },
];

let activeThemeId = "midnight-purple";
let customHexColor = null;

/**
 * Applies a theme by setting root CSS variables.
 * @param {string} themeId - Theme preset ID or "custom"
 * @param {string} [customColor] - Hex color code for custom theme
 */
export function applyTheme(themeId, customColor = null) {
  activeThemeId = themeId;
  const root = document.documentElement;

  if (themeId === "custom" && customColor) {
    customHexColor = customColor;
    root.style.setProperty("--accent", customColor);
    root.style.setProperty("--accent-soft", `${customColor}1e`);
    root.style.setProperty(
      "--theme-tint-bg",
      `radial-gradient(ellipse at 0% 100%, ${customColor}47 0%, transparent 65%)`
    );
    return;
  }

  const preset = PRESET_THEMES.find((t) => t.id === themeId) || PRESET_THEMES[0];

  if (preset.id === "midnight-purple") {
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-soft");
    root.style.removeProperty("--theme-tint-bg");
  } else {
    root.style.setProperty("--accent", preset.accent);
    root.style.setProperty("--accent-soft", preset.accentSoft);
    root.style.setProperty("--theme-tint-bg", preset.tintBg);
  }
}

/**
 * Saves theme settings to local store.
 * @param {string} themeId
 * @param {string} [customColor]
 */
export async function saveTheme(themeId, customColor = null) {
  applyTheme(themeId, customColor);

  try {
    await store.set("theme", themeId);
    if (customColor) {
      await store.set("customColor", customColor);
    }
    await store.save();
  } catch (err) {
    console.warn("Failed to save theme settings to store:", err);
  }
}

/**
 * Loads saved theme preference from local store.
 */
export async function loadTheme() {
  try {
    const savedTheme = await store.get("theme");
    const savedCustomColor = await store.get("customColor");

    if (savedTheme) {
      applyTheme(savedTheme, savedCustomColor);
      return { themeId: savedTheme, customColor: savedCustomColor };
    }
  } catch (err) {
    console.warn("Failed to load theme settings from store:", err);
  }

  applyTheme("midnight-purple");
  return { themeId: "midnight-purple", customColor: null };
}

export function getActiveTheme() {
  return { activeThemeId, customHexColor };
}
