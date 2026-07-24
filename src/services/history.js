// History Service — Manages local history of recent snaps using tauri-plugin-store.

import { LazyStore } from "@tauri-apps/plugin-store";

const store = new LazyStore("history.json");
const MAX_HISTORY = 20;

/**
 * @typedef {Object} HistoryItem
 * @property {string} id
 * @property {string} timestamp
 * @property {string} mode
 * @property {string} inputText
 * @property {string} resultText
 */

/**
 * Loads recent history list from store.
 * @returns {Promise<HistoryItem[]>}
 */
export async function getHistory() {
  try {
    const list = await store.get("items");
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.warn("Failed to load history from store:", err);
    return [];
  }
}

/**
 * Saves a new snap result to history.
 * @param {object} item
 * @param {string} item.mode
 * @param {string} item.inputText
 * @param {string} item.resultText
 * @returns {Promise<HistoryItem[]>}
 */
export async function saveHistory({ mode, inputText, resultText }) {
  if (!resultText) return [];

  const existing = await getHistory();
  const newItem = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    mode: mode || "explain",
    inputText: inputText || "",
    resultText,
  };

  const updated = [newItem, ...existing.filter((i) => i.resultText !== resultText)].slice(0, MAX_HISTORY);

  try {
    await store.set("items", updated);
    await store.save();
  } catch (err) {
    console.warn("Failed to save history to store:", err);
  }

  return updated;
}

/**
 * Deletes a single item from history by ID.
 * @param {string} id
 * @returns {Promise<HistoryItem[]>}
 */
export async function deleteHistoryItem(id) {
  const existing = await getHistory();
  const updated = existing.filter((i) => i.id !== id);

  try {
    await store.set("items", updated);
    await store.save();
  } catch (err) {
    console.warn("Failed to delete history item:", err);
  }

  return updated;
}

/**
 * Clears all history items.
 * @returns {Promise<[]>}
 */
export async function clearHistory() {
  try {
    await store.set("items", []);
    await store.save();
  } catch (err) {
    console.warn("Failed to clear history store:", err);
  }
  return [];
}
