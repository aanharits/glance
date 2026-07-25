// Clipboard Service — Active-gated clipboard manager.
// Ensures old clipboard data copied while Glance was closed is NEVER processed.

import { readText } from "@tauri-apps/plugin-clipboard-manager";

let lastProcessedText = "";

/**
 * Helper to safely read clipboard text with automatic retry for OS clipboard lock.
 * @returns {Promise<string|null>}
 */
async function safeReadClipboard() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await readText();
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err) {
      // If OS clipboard was temporarily locked during copy, wait 40ms and retry
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 40));
      }
    }
  }
  return null;
}

/**
 * Syncs current system clipboard as baseline when Glance opens.
 * Any text copied BEFORE opening Glance will be marked as baseline and IGNORED.
 */
export async function syncClipboardBaseline() {
  const text = await safeReadClipboard();
  lastProcessedText = text || "";
}

/**
 * Manually sets last processed baseline text.
 * @param {string} text
 */
export function setLastProcessedText(text) {
  lastProcessedText = text ? text.trim() : "";
}
