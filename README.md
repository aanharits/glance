<div align="center">

  <img src="src-tauri/icons/icon.png" alt="Glance Logo" width="110" height="110" />

# Glance

**Understand any complex paragraph, code snippet, error log, or whatever the hell else you don't understand with tiny popup window.**

_Just hit `Cmd+Shift+S` > highlight something > copy > get an instant ELI5 explanation or TL;DR summary right from your menu bar._

[![macOS](https://img.shields.io/badge/macOS-Supported-brightgreen?logo=apple)](https://apple.com)
[![Windows](https://img.shields.io/badge/Windows-Coming_Soon-lightgrey?logo=windows)](#)
[![Linux](https://img.shields.io/badge/Linux-Coming_Soon-lightgrey?logo=linux)](#)
[![Tauri](https://img.shields.io/badge/Tauri-v2-blue?logo=tauri)](https://tauri.app)
[![Svelte](https://img.shields.io/badge/Svelte-v5-ff3e00?logo=svelte)](https://svelte.dev)
[![Rust](https://img.shields.io/badge/Rust-Backend-000000?logo=rust)](https://www.rust-lang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

**Glance** is a hyper-lightweight native desktop quick explanation tool, built with **Tauri + Rust + Svelte**. It sits silently in your macOS menu bar until you hit `Cmd+Shift+S`. Once opened, simply copy (`Cmd+C`) any text on your screen, and Glance will instantly analyze it using ultra-fast LLMs (Groq / Llama 3.1) and pop up a crisp, clutter-free explanation or summary anchored under your menu bar icon.

No context switching. No opening ChatGPT tabs. No $20/month subscription traps.

---

### What Glance is (and isn't)

- **What it is**: A 1-second contextual brain on your desktop. Open Glance, copy any confusing sentence, online novel dialogue snippet, exam/homework question you don't get, math formula, code snippet, or compiler error log. and then get an instant ELI5 answer or TL;DR summary, ask follow-up questions, and keep moving.
- **What it isn't**: An all-in-one heavy AI workspace. It does not parse full PDF/DOCX files, generate AI images or videos, or automatically scan your entire browser tab context (like Chrome's built-in Gemini sidebar).

> _If you want a 10-paragraph essay, AI image generator, full file reader, or something heavy. open your ChatGPT._

---

## Demo

<div align="center">
  <video src="https://github.com/user-attachments/assets/4e149ceb-9cfd-4a60-8e3c-54c800329e82" controls width="100%">
    <source src="assets/glance-demo.mp4" type="video/mp4" />
  </video>
</div>

---

## OS Platform Availability

Glance is currently focused on delivering a native experience on **macOS**. Cross-platform support for Windows and Linux is currently under active development.

| Operating System                  | Support Status  | Details                                                                          |
| :-------------------------------- | :-------------- | :------------------------------------------------------------------------------- |
| **macOS** (Apple Silicon / Intel) | **Supported**   | Native menu bar tray anchoring, macOS vibrancy, global shortcut (`Cmd+Shift+S`). |
| **Windows**                       | **Coming Soon** | Taskbar system tray anchoring in development.                                    |
| **Linux**                         | **Coming Soon** | Desktop environment tray integration in development.                             |

---

## First-Time Launch (macOS Gatekeeper Note)

> [!NOTE]
> **Unverified Developer Notice**: Because Glance is an open-source tool without a $99/year Apple Developer Certificate, macOS Gatekeeper may show a warning saying _"Apple could not verify Glance is free of malware"_. This is standard for community-built open-source macOS software.

### How to Bypass Gatekeeper (System Settings)

1. Open **System Settings** -> **Privacy & Security**.
2. Scroll down to **Security** section.
3. Click **"Open Anyway"** next to Glance.
4. Confirm by clicking **Open** in the dialog window. macOS will permanently save this approval.

---

## Use Cases

Why waste mental bandwidth decoding dense text or complex code? **Glance** handles:

- **Confusing Paragraphs & Online Novel Dialogues**: Highlight dense text, foreign online novel dialogue snippets, obscure prose, or ambiguous paragraphs to get an instant, clear explanation.
- **Exam & Homework Questions**: Highlight tough exam questions, science problems, or study material you don't understand for instant step-by-step guidance.
- **Code & Syntax Breakdown**: Highlight complex functions, minified code, regex patterns, or AI snippets to understand what they actually do.
- **Error Logs & Stack Traces**: Highlight compiler errors, build failures, or stack traces for an instant root-cause explanation and fix.
- **Math & Science Calculations**: Solves complex math equations step-by-step accurately with LaTeX rendering (`$...$` and `$$...$$`).
- **Academic & Whitepapers**: Translate complex formulas, dense abstracts, or IEEE math into plain English.
- **Long Articles & Docs Summarization**: Switch to **Summary Mode** for an instant TL;DR of wordy paragraphs or documentation.
- **Legal Fine Print & Terms**: Decode sneaky clauses in Privacy Policies or SaaS contracts without reading 15 pages.

---

## Features

- **Dual AI Modes (`Explain` & `Summary`)**: Seamlessly switch AI focus from the header title dropdown menu (`Glance - Explain` / `Glance - Summary`):
  - **Explain Mode (Default)**: Optimized for unpacking complex code snippets, math formulas, compiler errors, technical jargon, or any confusing paragraph and unclear context that you do not understand. Delivers a clear, easy-to-digest ELI5 explanation of _why_ and _how_ something works.
  - **Summary Mode**: Optimized for long paragraphs, dense whitepapers, wordy articles, or heavy documentation. Delivers a sharp **TL;DR** section followed by 3 to 5 scannable **Key Takeaways** with bold keywords, stripping away filler words.
- **Active-Window Gated Copy**: Clipboard changes are ONLY processed when Glance is actively open. Copying text while Glance is closed does zero background processing and costs zero API tokens.
- **Near-Zero Footprint**: Native Rust app using minimal RAM. The webview is destroyed when closed—zero background memory drain.
- **Tray-Anchored Popup**: Appears seamlessly under your macOS menu bar tray icon.
- **Rich Markdown & LaTeX Rendering**: Full support for bold/italic typography, inline code blocks, formatted lists, and LaTeX math formulas (`$...$` and `$$...$$` rendered via KaTeX).
- **Multi-Turn Roomchat Session**: Ask follow-up questions or paste multiple snippets into the same roomchat without creating duplicate history entries.
- **Keyboard Shortcuts**: Press `Cmd+Shift+S` to open/toggle-close Glance, `Cmd+Shift+M` to minimize/expand window height, and `Esc` to close when focused.

---

## How to Use

### 1. Clipboard Mode (Text, Modes & Follow-up)

1. **Open Glance (`Cmd+Shift+S`)**: Press `Cmd+Shift+S` or click the Glance tray icon. The Glance popup window will open cleanly without sending old clipboard data to AI.
2. **Select Mode (Optional)**: Click **`Glance - Explain`** in the header to open the dropdown menu and switch to **`Summary Mode`** if you are reading long text.
3. **Highlight & Copy (`Cmd+C`)**: Select any confusing text, code snippet, math formula, or error message anywhere on your screen (Browser, IDE, PDF, Terminal, Slack) and press **`Cmd+C`**.
4. **Auto AI Analysis & Follow-Up**: Glance automatically detects the new copy event while open, streams a clear ELI5 explanation or TL;DR summary, and lets you type follow-up questions in the input box at the bottom.
5. **New Chat (`+`)**: Click the **`+` (Plus)** button in the header to start a fresh roomchat at any time.
6. **Dismiss (`Cmd+Shift+S` or `Esc`)**: Press **`Cmd+Shift+S`** anywhere to toggle-close Glance, or press **`Esc`** (when Glance window is focused).

### 2. Vision Mode (Drag & Select Screenshot) — _In Development_

1. Press **`Cmd+Shift+S`**.
2. **Drag & Select**: Drag a box around any chart, diagram, code block, or untranslatable image on your screen.
3. **Instant Analysis**: Gemini Vision analyzes the selected region and gives you an immediate breakdown.

---

## Behind the Scenes & Performance Proof

Glance is engineered to be invisible to system resources. Here is the exact breakdown of how data and memory are handled:

### Where is Chat History Stored?

Glance is 100% local-first and privacy-respecting. All session histories are stored in a clean JSON format via `@tauri-apps/plugin-store` in your OS application data folder:

| Operating System | Storage Path                                           | Status      |
| :--------------- | :----------------------------------------------------- | :---------- |
| **macOS**        | `~/Library/Application Support/id.glance/history.json` | Active      |
| **Windows**      | `%APPDATA%\id.glance\history.json`                     | Coming Soon |
| **Linux**        | `~/.config/id.glance/history.json`                     | Coming Soon |

### Smart Memory & Token Safeguards

Glance is built with proactive safeguards to keep system usage lightweight and efficient:

- **Disk Protection (~100 KB Cap)**: Automatically caps stored history to 20 sessions, keeping total disk storage under 0.1 MB.
- **RAM Optimization (~0.2 MB Text Heap)**: Minimal memory footprint (~30–50 MB total app process), 1,000x lighter than keeping a browser tab open.
- **Token Overflow Prevention (Sliding Window)**: Automatically caps API context to the 10 most recent messages, preventing token waste and context length errors during long conversations.

---

## Architecture & Tech Stack

```
 ┌───────────────────────────────────────────────────────────┐
 │               Global Shortcut / System Tray               │
 └─────────────────────────────┬─────────────────────────────┘
                               │ (Cmd + Shift + S)
                               ▼
 ┌───────────────────────────────────────────────────────────┐
 │                     Tauri Rust Core                       │
 │  • System Tray Anchored Position                          │
 │  • Gated Clipboard Listener                               │
 │  • Native macOS Window Lifecycle                          │
 └─────────────────────────────┬─────────────────────────────┘
                               │ (IPC Bridge)
                               ▼
 ┌───────────────────────────────────────────────────────────┐
 │                 Minimalist Svelte 5 UI                    │
 │  • 120Hz Smooth Spring Animations                         │
 │  • Dual Mode Switcher (Explain / Summary)                 │
 │  • Marked.js Markdown + KaTeX Math Rendering              │
 │  • Local Storage Store (history.json)                     │
 └─────────────────────────────┬─────────────────────────────┘
                               │ (HTTPS API)
                               ▼
 ┌───────────────────────────────────────────────────────────┐
 │                    Cloud AI Providers                     │
 │  • Groq (Llama 3.1 8B Instant Text Analysis)             │
 │  • Gemini 1.5 Flash (Vision & Screenshot OCR)             │
 └─────────────────────────────┬─────────────────────────────┘
```

| Layer                 | Technologies & Purpose                                                                             |
| :-------------------- | :------------------------------------------------------------------------------------------------- |
| **Frontend UI**       | **Svelte 5 + Vite** — Reactive UI state, custom HSL design tokens, native spring transitions.      |
| **Backend Core**      | **Rust + Tauri v2** — Cross-platform system integration, macOS Private API vibrancy & tray anchor. |
| **Typography & Math** | **Marked.js + KaTeX** — GitHub-flavored markdown parsing + LaTeX mathematical rendering.           |
| **Local Storage**     | **`@tauri-apps/plugin-store`** — Single-file JSON session history (`history.json`).                |
| **AI Inference**      | **Groq API** (Llama 3.1 8B) for ultra-fast text, **Google Gemini 1.5** for vision.                 |

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

[MIT](LICENSE) (c) Farhan
