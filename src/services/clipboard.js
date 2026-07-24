// Clipboard Service — Tracks clipboard changes to handle instant copy analysis.

import { readText } from "@tauri-apps/plugin-clipboard-manager";

let lastProcessedText = "";

/**
 * Gets the last processed clipboard text string.
 * @returns {string}
 */
export function getLastProcessedText() {
  return lastProcessedText;
}

/**
 * Manually updates last processed text string.
 * @param {string} text
 */
export function setLastProcessedText(text) {
  if (text) lastProcessedText = text.trim();
}

/**
 * Reads current text from clipboard directly.
 * @returns {Promise<string|null>}
 */
export async function getClipboardText() {
  try {
    const text = await readText();
    if (text && text.trim().length > 0) {
      return text.trim();
    }
  } catch (err) {
    console.warn("Failed to read clipboard:", err);
  }
  return null;
}

/**
 * Checks if new text was copied to system clipboard.
 * Returns new text string if copied, or null if unchanged.
 * @returns {Promise<string|null>}
 */
export async function checkNewCopy() {
  try {
    const text = await readText();
    if (text && text.trim().length > 0) {
      const trimmed = text.trim();
      if (trimmed !== lastProcessedText) {
        lastProcessedText = trimmed;
        return trimmed;
      }
    }
  } catch (err) {
    console.warn("Failed to check clipboard copy:", err);
  }
  return null;
}
