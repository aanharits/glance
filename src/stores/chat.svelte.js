// Svelte 5 Reactive Store for AI Chat Sessions (Explain & Summary Modes)
import { askGroq } from "../services/groq.js";

function createChatStore() {
  let status = $state("idle");
  let chatMessages = $state([]);
  let currentSessionId = $state(null);
  let activeMode = $state("explain");
  let errorText = $state("");
  let currentText = $state("");

  return {
    get status() {
      return status;
    },
    set status(v) {
      status = v;
    },

    get chatMessages() {
      return chatMessages;
    },
    set chatMessages(v) {
      chatMessages = v;
    },

    get currentSessionId() {
      return currentSessionId;
    },
    set currentSessionId(v) {
      currentSessionId = v;
    },

    get activeMode() {
      return activeMode;
    },
    set activeMode(v) {
      activeMode = v;
    },

    get errorText() {
      return errorText;
    },
    set errorText(v) {
      errorText = v;
    },

    get currentText() {
      return currentText;
    },

    resetChatState() {
      status = "idle";
      chatMessages = [];
      currentSessionId = null;
      errorText = "";
    },

    selectMode(mode) {
      if (activeMode === mode) return;
      activeMode = mode;
    },

    loadFromHistory(item) {
      currentSessionId = item.id;
      activeMode = item.mode || "explain";
      chatMessages =
        item.messages && item.messages.length > 0
          ? item.messages
          : [{ role: "assistant", content: item.resultText }];
      currentText = item.inputText || "";
      status = "result";
    },

    async doCapture(text, historyStore) {
      if (!text) return;
      try {
        currentText = text;

        if (!currentSessionId || status === "idle" || chatMessages.length === 0) {
          currentSessionId = Date.now().toString();
          status = "loading";
          const res = await askGroq(text, [], activeMode);
          chatMessages = [
            { role: "user", content: text },
            { role: "assistant", content: res },
          ];
          status = "result";

          if (historyStore) {
            await historyStore.saveSession({
              id: currentSessionId,
              mode: activeMode,
              inputText: text,
              resultText: res,
              messages: chatMessages,
            });
          }
        } else {
          const previousHistory = [...chatMessages];
          chatMessages = [...chatMessages, { role: "user", content: text }];
          status = "loading";

          const res = await askGroq(text, previousHistory, activeMode);
          chatMessages = [...chatMessages, { role: "assistant", content: res }];
          status = "result";

          if (historyStore) {
            await historyStore.saveSession({
              id: currentSessionId,
              mode: activeMode,
              inputText: text,
              resultText: res,
              messages: chatMessages,
            });
          }
        }
      } catch (err) {
        console.error("Glance chat error:", err);
        errorText =
          typeof err === "string"
            ? err
            : err?.message || "Failed to process. Please try again.";
        status = "error";
      }
    },

    async handleFollowUp(prompt, historyStore) {
      if (chatMessages.length === 0) return;
      try {
        if (!currentSessionId) {
          currentSessionId = Date.now().toString();
        }
        const previousHistory = [...chatMessages];
        chatMessages = [...chatMessages, { role: "user", content: prompt }];
        status = "loading";

        const res = await askGroq(prompt, previousHistory, activeMode);
        chatMessages = [...chatMessages, { role: "assistant", content: res }];
        status = "result";

        if (historyStore) {
          await historyStore.saveSession({
            id: currentSessionId,
            mode: activeMode,
            inputText: prompt,
            resultText: res,
            messages: chatMessages,
          });
        }
      } catch (err) {
        console.error("Follow-up error:", err);
        errorText =
          typeof err === "string"
            ? err
            : err?.message || "Failed to process follow-up.";
        status = "error";
      }
    },
  };
}

export const chatStore = createChatStore();
