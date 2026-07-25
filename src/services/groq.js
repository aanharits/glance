// Groq API Service — Client bridge invoking secure Rust backend execution.
import { invoke } from "@tauri-apps/api/core";

/**
 * Sends text or follow-up query to Groq API via compiled Rust backend handler.
 * Keeps system prompt, model specifications, and API logic 100% hidden inside native binary.
 * @param {string} text - Input text content or follow-up query
 * @param {Array<{role: string, content: string}>} [history=[]] - Previous conversation history
 * @param {'explain' | 'summary'} [mode='explain'] - Analysis mode
 * @returns {Promise<string>} AI response
 */
export async function askGroq(text, history = [], mode = "explain") {
  return await invoke("ask_groq", { text, history, mode });
}
