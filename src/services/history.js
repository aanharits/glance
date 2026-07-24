// History Service — Manages local history of recent snap chat sessions using tauri-plugin-store.

import { LazyStore } from "@tauri-apps/plugin-store";

const store = new LazyStore("history.json");
const MAX_HISTORY = 20;

/**
 * @typedef {Object} HistoryMessage
 * @property {string} role - 'user' | 'assistant'
 * @property {string} content
 */

/**
 * @typedef {Object} HistoryItem
 * @property {string} id
 * @property {string} timestamp
 * @property {string} mode
 * @property {string} inputText
 * @property {string} resultText
 * @property {HistoryMessage[]} [messages]
 */

/**
 * Loads recent history list from store.
 * @returns {Promise<HistoryItem[]>}
 */
export async function getHistory() {
  try {
    const list = await store.get("items");
    if (!Array.isArray(list)) return [];
    return list.map((item) => ({
      ...item,
      messages: item.messages || [{ role: "assistant", content: item.resultText }],
    }));
  } catch (err) {
    console.warn("Failed to load history from store:", err);
    return [];
  }
}

/**
 * Saves or updates a session in history.
 * @param {object} param
 * @param {string} param.id - Session ID
 * @param {string} [param.mode]
 * @param {string} [param.inputText]
 * @param {string} [param.resultText]
 * @param {HistoryMessage[]} [param.messages]
 * @returns {Promise<HistoryItem[]>}
 */
export async function saveHistory({ id, mode, inputText, resultText, messages }) {
  if (!resultText && (!messages || messages.length === 0)) return await getHistory();

  const sessionId = id || Date.now().toString();
  const existing = await getHistory();
  const index = existing.findIndex((i) => i.id === sessionId);

  const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : resultText;
  const firstUserMsg = messages?.find((m) => m.role === "user")?.content || inputText || "";

  const updatedItem = {
    id: sessionId,
    timestamp: new Date().toISOString(),
    mode: mode || "explain",
    inputText: firstUserMsg,
    resultText: lastMessage || resultText || "",
    messages: messages || [
      ...(inputText ? [{ role: "user", content: inputText }] : []),
      ...(resultText ? [{ role: "assistant", content: resultText }] : []),
    ],
  };

  let updatedList;
  if (index !== -1) {
    // Update existing session item and move to top
    updatedList = [updatedItem, ...existing.filter((i) => i.id !== sessionId)];
  } else {
    // Create new session item
    updatedList = [updatedItem, ...existing];
  }

  updatedList = updatedList.slice(0, MAX_HISTORY);

  try {
    await store.set("items", updatedList);
    await store.save();
  } catch (err) {
    console.warn("Failed to save history to store:", err);
  }

  return updatedList;
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
