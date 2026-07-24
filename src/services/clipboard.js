// Clipboard Service — Tracks clipboard changes to prevent auto-processing old clipboard data.

import { readText } from "@tauri-apps/plugin-clipboard-manager";

let lastProcessedText = "";

/**
 * Initializes clipboard tracking baseline with current text.
 */
export async function syncClipboardBaseline() {
  try {
    const text = await readText();
    if (text) {
      lastProcessedText = text.trim();
    }
  } catch (err) {}
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
  } catch (err) {}
  return null;
}

/**
 * Manually updates last processed text string.
 * @param {string} text
 */
export function setLastProcessedText(text) {
  if (text) lastProcessedText = text.trim();
}

/** Specific error for empty clipboard */
export class ClipboardEmptyError extends Error {
  constructor() {
    super("Clipboard is empty — please copy text first.");
    this.name = "ClipboardEmptyError";
  }
}
