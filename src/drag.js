// Window Drag Handler — Connects native Tauri window dragging with active elevation shadow.

import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Binds native window drag handler to header element.
 * @param {HTMLElement} headerEl - Handle element
 * @param {HTMLElement} cardEl - Card element for visual dragging state feedback
 * @returns {() => void} Cleanup function
 */
export function setupWindowDrag(headerEl, cardEl) {
  if (!headerEl || !cardEl) return () => {};

  function onPointerDown(e) {
    if (e.target.closest("button, a, input, [data-no-drag]")) return;

    cardEl.classList.add("dragging");

    try {
      getCurrentWindow().startDragging();
    } catch (err) {
      console.warn("startDragging error:", err);
    }

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  function onPointerUp() {
    cardEl.classList.remove("dragging");
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  }

  headerEl.addEventListener("pointerdown", onPointerDown);

  return () => {
    headerEl.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  };
}
