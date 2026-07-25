// Theme Manager — Controls color themes, root CSS variables, and persistent store settings.

import { LazyStore } from "@tauri-apps/plugin-store";

const store = new LazyStore("settings.json");

/** Curated theme preset definitions covering vibrant accents & clean monochrome/grayscale shades */
export const PRESET_THEMES = [
  {
    id: "midnight-purple",
    name: "Midnight Purple",
    color: "#a855f7",
    accent: "#a855f7",
    accentSoft: "rgba(168, 85, 247, 0.18)",
    accentBright: "#c084fc",
    accentLight: "#e9d5ff",
    userBubbleText: "#ffffff",
    tintBg: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(168, 85, 247, 0.16) 0%, transparent 85%)",
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    color: "#14b8a6",
    accent: "#14b8a6",
    accentSoft: "rgba(20, 184, 166, 0.18)",
    accentBright: "#2dd4bf",
    accentLight: "#99f6e4",
    userBubbleText: "#ffffff",
    tintBg: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(20, 184, 166, 0.16) 0%, transparent 85%)",
  },
  {
    id: "sunset-coral",
    name: "Sunset Coral",
    color: "#f97316",
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.18)",
    accentBright: "#fb923c",
    accentLight: "#fed7aa",
    userBubbleText: "#ffffff",
    tintBg: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(249, 115, 22, 0.16) 0%, transparent 85%)",
  },
  {
    id: "electric-blue",
    name: "Electric Blue",
    color: "#3b82f6",
    accent: "#3b82f6",
    accentSoft: "rgba(59, 130, 246, 0.18)",
    accentBright: "#60a5fa",
    accentLight: "#bfdbfe",
    userBubbleText: "#ffffff",
    tintBg: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(59, 130, 246, 0.16) 0%, transparent 85%)",
  },
  {
    id: "emerald-green",
    name: "Emerald Green",
    color: "#10b981",
    accent: "#10b981",
    accentSoft: "rgba(16, 185, 129, 0.18)",
    accentBright: "#34d399",
    accentLight: "#a7f3d0",
    userBubbleText: "#ffffff",
    tintBg: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(16, 185, 129, 0.16) 0%, transparent 85%)",
  },
  {
    id: "pure-white",
    name: "Pure White",
    color: "#ffffff",
    accent: "#ffffff",
    accentSoft: "rgba(255, 255, 255, 0.16)",
    accentBright: "#ffffff",
    accentLight: "#f8fafc",
    userBubbleText: "#09090b", // Dark text for pure white background bubble!
    tintBg: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(255, 255, 255, 0.14) 0%, transparent 85%)",
  },
  {
    id: "light-gray",
    name: "Light Gray",
    color: "#cbd5e1",
    accent: "#cbd5e1",
    accentSoft: "rgba(203, 213, 225, 0.16)",
    accentBright: "#e2e8f0",
    accentLight: "#f1f5f9",
    userBubbleText: "#09090b", // Dark text for light gray background bubble!
    tintBg: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(203, 213, 225, 0.14) 0%, transparent 85%)",
  },
  {
    id: "slate-gray",
    name: "Slate Gray",
    color: "#94a3b8",
    accent: "#94a3b8",
    accentSoft: "rgba(148, 163, 184, 0.16)",
    accentBright: "#cbd5e1",
    accentLight: "#e2e8f0",
    userBubbleText: "#09090b",
    tintBg: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(148, 163, 184, 0.14) 0%, transparent 85%)",
  },
  {
    id: "dark-gray",
    name: "Dark Gray",
    color: "#475569",
    accent: "#475569",
    accentSoft: "rgba(255, 255, 255, 0.14)",
    accentBright: "#cbd5e1",
    accentLight: "#e2e8f0",
    userBubbleText: "#ffffff",
    tintBg: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(255, 255, 255, 0.1) 0%, transparent 85%)",
  },
  {
    id: "obsidian-black",
    name: "Obsidian Black",
    color: "#18181b",
    accent: "#27272a",
    accentSoft: "rgba(255, 255, 255, 0.14)",
    accentBright: "#f4f4f5",
    accentLight: "#e4e4e7",
    userBubbleText: "#ffffff",
    tintBg: "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(255, 255, 255, 0.1) 0%, transparent 85%)",
  },
];

let activeThemeId = "midnight-purple";
let customHexColor = null;

/**
 * Calculates high-contrast, guaranteed-visible accent variants for any hex color.
 * Protects against dark custom colors (like black #000000) AND light custom colors (like white #ffffff).
 * @param {string} hex - Input hex color
 */
export function calculateAccentVariants(hex) {
  if (!hex)
    return {
      accent: "#a855f7",
      accentSoft: "rgba(168, 85, 247, 0.18)",
      accentBright: "#c084fc",
      accentLight: "#e9d5ff",
      userBubbleText: "#ffffff",
    };

  let c = hex.replace("#", "").trim();
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  if (c.length !== 6) c = "a855f7";

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Determine user bubble text color based on accent lightness (L > 0.55 means light background)
  const userBubbleText = l > 0.55 ? "#09090b" : "#ffffff";

  // Grayscale / dark custom colors (like black #000000 or dark grey)
  if (s < 0.15 || l < 0.25) {
    return {
      accent: `#${c}`,
      accentSoft: "rgba(255, 255, 255, 0.14)",
      accentBright: "#f4f4f5", // Pure crisp white for logo & header text
      accentLight: "#e4e4e7", // Pure crisp light grey for code text
      userBubbleText,
    };
  }

  const brightL = Math.max(l, 0.65);
  const lightL = Math.max(l, 0.78);

  const hslToHex = (h, s, l) => {
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h * 12) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  return {
    accent: `#${c}`,
    accentSoft: `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, 0.18)`,
    accentBright: hslToHex(h, s, brightL),
    accentLight: hslToHex(h, s, lightL),
    userBubbleText,
  };
}

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
    const variants = calculateAccentVariants(customColor);

    root.style.setProperty("--accent", variants.accent);
    root.style.setProperty("--accent-soft", variants.accentSoft);
    root.style.setProperty("--accent-bright", variants.accentBright);
    root.style.setProperty("--accent-light", variants.accentLight);
    root.style.setProperty("--user-bubble-text", variants.userBubbleText);
    root.style.setProperty(
      "--theme-tint-bg",
      `radial-gradient(ellipse 90% 60% at 50% -10%, ${variants.accentBright}26 0%, transparent 85%)`
    );
    return;
  }

  const preset = PRESET_THEMES.find((t) => t.id === themeId) || PRESET_THEMES[0];

  if (preset.id === "midnight-purple") {
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-soft");
    root.style.removeProperty("--accent-bright");
    root.style.removeProperty("--accent-light");
    root.style.removeProperty("--user-bubble-text");
    root.style.removeProperty("--theme-tint-bg");
  } else {
    root.style.setProperty("--accent", preset.accent);
    root.style.setProperty("--accent-soft", preset.accentSoft);
    root.style.setProperty("--accent-bright", preset.accentBright);
    root.style.setProperty("--accent-light", preset.accentLight);
    root.style.setProperty(
      "--user-bubble-text",
      preset.userBubbleText || "#ffffff"
    );
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
