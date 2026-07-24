// Window Manager — Handles Tauri popup window resize, hide, and 120Hz Web Animations API transitions.

import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

const MAX_HEIGHT = 600;
const MIN_HEIGHT = 100;
const WINDOW_WIDTH = 420;
const PADDING = 16; // padding <main> (8px * 2)

/**
 * Dynamically resizes Tauri window based on DOM content height.
 * @param {HTMLElement} container - Root element to measure height from
 */
export async function resizeToContent(container) {
  if (!container) return;

  const rawHeight = Math.max(container.scrollHeight, container.offsetHeight) + PADDING;
  const contentHeight = Math.max(MIN_HEIGHT, Math.min(rawHeight, MAX_HEIGHT));

  try {
    const win = getCurrentWindow();
    await win.setSize(new LogicalSize(WINDOW_WIDTH, contentHeight));
  } catch (err) {
    console.warn("Failed to resize window:", err);
  }
}

/**
 * Plays 120Hz compositor-accelerated pop-in animation on card element.
 * @param {HTMLElement} cardEl - Card DOM element
 */
export function playPopIn(cardEl) {
  if (!cardEl) return;
  // Clear any stale fill:forwards animations
  cardEl.getAnimations().forEach((a) => a.cancel());
  cardEl.animate(
    [
      { opacity: 0, transform: "scale(0.91) translateY(8px)" },
      { opacity: 1, transform: "scale(1) translateY(0)" },
    ],
    {
      duration: 240,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards",
    }
  );
}

/**
 * Plays compositor-accelerated pop-out animation and hides Tauri window cleanly.
 * @param {HTMLElement} cardEl - Card DOM element
 * @param {() => void} [onReset] - Reset state callback
 */
export async function closePopup(cardEl, onReset) {
  if (cardEl) {
    try {
      cardEl.getAnimations().forEach((a) => a.cancel());
      const anim = cardEl.animate(
        [
          { opacity: 1, transform: "scale(1) translateY(0)" },
          { opacity: 0, transform: "scale(0.91) translateY(8px)" },
        ],
        {
          duration: 180,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        }
      );
      await anim.finished;
      cardEl.getAnimations().forEach((a) => a.cancel());
    } catch (err) {
      // Fallback if animation fails
    }
  }

  if (onReset) onReset();

  try {
    const win = getCurrentWindow();
    await win.hide();
  } catch (err) {
    console.warn("Failed to hide window:", err);
  }
}
