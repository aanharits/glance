// Svelte 5 Reactive Store for UI Toggles & Window Popup Transitions
import { resizeToContent, resizeToHeight, closePopup } from "../services/window.js";

function createUiStore() {
  let showThemePicker = $state(false);
  let showHistory = $state(false);
  let isMinimized = $state(false);
  let savedFullHeight = $state(0);
  let isWindowVisible = $state(false);

  return {
    get showThemePicker() {
      return showThemePicker;
    },
    set showThemePicker(v) {
      showThemePicker = v;
    },

    get showHistory() {
      return showHistory;
    },
    set showHistory(v) {
      showHistory = v;
    },

    get isMinimized() {
      return isMinimized;
    },
    set isMinimized(v) {
      isMinimized = v;
    },

    get isWindowVisible() {
      return isWindowVisible;
    },
    set isWindowVisible(v) {
      isWindowVisible = v;
    },

    toggleTheme() {
      showThemePicker = !showThemePicker;
      if (showThemePicker) showHistory = false;
    },

    toggleHistory() {
      showHistory = !showHistory;
      if (showHistory) showThemePicker = false;
    },

    async toggleMinimize(mainEl, status, chatMessagesCount) {
      if (status !== "result" && chatMessagesCount === 0) return;

      if (!isMinimized) {
        if (mainEl) {
          const rawHeight = Math.max(mainEl.scrollHeight, mainEl.offsetHeight) + 16;
          savedFullHeight = Math.max(100, Math.min(rawHeight, 600));
        }
        isMinimized = true;
        showThemePicker = false;
        showHistory = false;
        setTimeout(() => mainEl && resizeToContent(mainEl), 240);
      } else {
        if (savedFullHeight > 0) {
          await resizeToHeight(savedFullHeight);
        }
        isMinimized = false;
      }
    },

    async handleClose(cardEl, resetChatCallback) {
      isWindowVisible = false;
      await closePopup(cardEl, () => {
        showThemePicker = false;
        showHistory = false;
        isMinimized = false;
        isWindowVisible = false;
        if (resetChatCallback) resetChatCallback();
      });
    },
  };
}

export const uiStore = createUiStore();
