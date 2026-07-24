// Clipboard Service — Active-gated clipboard manager.
// Ensures old clipboard data copied while Glance was closed is NEVER processed.

import { readText } from "@tauri-apps/plugin-clipboard-manager";

let lastProcessedText = "";

/**
 * Syncs current system clipboard as baseline when Glance opens.
 * Any text copied BEFORE opening Glance will be marked as baseline and IGNORED.
 */
export async function syncClipboardBaseline() {
  try {
    const text = await readText();
    if (text && text.trim().length > 0) {
      lastProcessedText = text.trim();
    } else {
      lastProcessedText = "";
    }
  } catch (err) {
    lastProcessedText = "";
  }
}

/**
 * Checks if new text was copied to system clipboard while Glance is open.
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
  } catch (err) {}
  return null;
}

/**
 * Manually sets last processed baseline text.
 * @param {string} text
 */
export function setLastProcessedText(text) {
  lastProcessedText = text ? text.trim() : "";
}
