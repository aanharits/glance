// Clipboard Service — Reads text from system clipboard.

import { readText } from "@tauri-apps/plugin-clipboard-manager";

/**
 * Reads plain text from system clipboard.
 * Throws error if clipboard is empty.
 * @returns {Promise<string>} Trimmed clipboard content
 */
export async function getClipboardText() {
  const content = await readText();

  if (!content || content.trim().length === 0) {
    throw new ClipboardEmptyError();
  }

  return content.trim();
}

/** Specific error for empty clipboard */
export class ClipboardEmptyError extends Error {
  constructor() {
    super("Clipboard is empty — please copy text first, then press shortcut again.");
    this.name = "ClipboardEmptyError";
  }
}
