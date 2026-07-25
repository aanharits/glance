// Svelte 5 Reactive Store for Local Session History
import {
  getHistory,
  saveHistory,
  deleteHistoryItem,
  clearHistory,
} from "../services/history.js";

function createHistoryStore() {
  let historyItems = $state([]);

  return {
    get historyItems() {
      return historyItems;
    },

    async initHistory() {
      historyItems = await getHistory();
    },

    async saveSession(sessionData) {
      historyItems = await saveHistory(sessionData);
    },

    async deleteItem(id) {
      historyItems = await deleteHistoryItem(id);
    },

    async clearAll() {
      historyItems = await clearHistory();
    },
  };
}

export const historyStore = createHistoryStore();
