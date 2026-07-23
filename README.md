<div align="center">

  <img src="src-tauri/icons/icon.png" alt="Glance Logo" width="110" height="110" />

# Glance (MVP)

**Understand any complex paragraph, weird code snippet, or error message before your coffee gets cold.**

_Highlight obscure jargon, AI code, or error logs, press `Cmd+Shift+S`, and get an instant ELI5 explanation right from your system tray._

[![Tauri](https://img.shields.io/badge/Tauri-v2-blue?logo=tauri)](https://tauri.app)
[![Svelte](https://img.shields.io/badge/Svelte-v5-ff3e00?logo=svelte)](https://svelte.dev)
[![Rust](https://img.shields.io/badge/Rust-Backend-000000?logo=rust)](https://www.rust-lang.org)
[![Markdown](https://img.shields.io/badge/Markdown-marked-000000)](https://marked.js.org)
[![Math](https://img.shields.io/badge/LaTeX-KaTeX-00b894)](https://katex.org)
[![BYOK](https://img.shields.io/badge/API-BYOK-green)](#setup-your-api-keys-byok)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

### _"The best code explanation is the one you never had to leave your IDE or browser to read."_

**Glance** is a hyper-lightweight native desktop tool built with **Tauri + Rust + Svelte**. It sits silently in your system tray until you hit `Cmd+Shift+S` (or `Ctrl+Shift+S`). It instantly reads your highlighted text or captured screenshot area, sends it to ultra-fast LLMs (Groq / Gemini Vision), and pops up a crisp, clutter-free explanation anchored neatly under your system tray icon (top-right menu bar on macOS, bottom-right taskbar on Windows).

No context switching. No opening ChatGPT tabs. No $20/month subscription traps.

---

### What Glance is (and isn't)

- **What it is**: A 1-second contextual brain. Highlight 1 confusing sentence, a math formula, AI-generated code, or an error log, hit `Cmd+Shift+S`, get a clear ELI5 answer and fix, and keep working.
- **What it isn't**: A 20-page essay generator, a multi-turn chatbot, or a heavy research suite.

> _If you want a 10-paragraph thesis, open ChatGPT. If you want to understand 1 confusing paragraph or error in 2 seconds without breaking your flow, use Glance._

---

## Demo

<div align="center">
  <!-- Replace link with your uploaded MP4 video or GIF -->
  <img src="docs/demo.gif" alt="Glance Demo" width="100%" />
</div>

---

## How to Use

### 1. Clipboard Mode (Text)

1. **Highlight Text**: Select any confusing paragraph, whitepaper math, jargon, AI-generated code, or error traceback in any app (Browser, IDE, PDF, Notion, Slack, Terminal).
2. **Copy (`Cmd+C`)**: Copy the highlighted text to your clipboard.
3. **Trigger Glance (`Cmd+Shift+S`)**: Press `Cmd+Shift+S` (or `Ctrl+Shift+S` on Windows/Linux).
4. **Read & Copy**: A sleek popup opens directly from your tray icon (menu bar on macOS / taskbar on Windows) with a clear, zero-fluff explanation.
   - Press **`Cmd+C`** inside the popup to copy the summary.
   - Press **`Esc`** (or click away) to dismiss.

### 2. Vision Mode (Drag & Select Screenshot) — _In Development_

1. Press **`Cmd+Shift+S`**.
2. **Drag & Select**: Drag a box around any chart, diagram, code block, or untranslatable image on your screen.
3. **Instant Analysis**: Gemini Vision analyzes the selected region and gives you an immediate breakdown.

---

## Use Cases

Why waste mental bandwidth decoding dense text or complex code? **Glance** handles:

- **Code & Syntax Breakdown**: Highlight complex functions, minified code, regex patterns, or AI snippets to understand what they actually do.
- **Error Logs & Stack Traces**: Highlight compiler errors, build failures, or stack traces for an instant root-cause explanation and fix.
- **Academic & Whitepapers**: Translate complex formulas, dense abstracts, or IEEE math into plain English.
- **Legal Fine Print & Terms**: Decode sneaky clauses in Privacy Policies or SaaS contracts without reading 15 pages.
- **Foreign Languages & Jargon**: Understand untranslatable web pages or technical abbreviations.
- **Financial & Business Reports**: Demystify wall-street jargon, balance sheets, and tax policy blocks in a single glance.

---

## Features

- **Near-Zero Footprint**: Native Rust app using less than 31 MB RAM (core process). The webview is destroyed when closed—zero background memory drain.
- **Tray-Anchored Popup**: Appears seamlessly under your system tray icon (top-right menu bar on macOS, bottom-right taskbar on Windows). Auto-hides on focus loss.
- **Rich Markdown & LaTeX Rendering**: Full support for bold/italic typography, inline code blocks, formatted lists, and LaTeX math formulas (`$...$` and `$$...$$` rendered via KaTeX).
- **Bring Your Own Key (BYOK)**: Connect your free Groq or Gemini API keys. Pay `$0.0001` per month instead of `$20` SaaS fees.
- **Dual Mode (Text & Vision)**:
  - **Clipboard Mode**: Instant sub-second text analysis powered by Groq (Llama 3 / Mixtral).
  - **Vision Mode** _(In Development)_: Drag-select region screenshots analyzed by Gemini 1.5 Flash Vision.
- **Keyboard-First Design**: Press `Esc` to close, `Cmd+C` to copy the explanation.

---

## Development & Installation

> **Note**: Glance is currently under active development. Pre-built binary installers (`.dmg` / `.exe`) will be made available under GitHub Releases once v1.0 is ready.

### Build from Source

```bash
# 1. Clone the repository
git clone https://github.com/your-username/glance.git
cd glance

# 2. Install dependencies
npm install

# 3. Run in local dev mode (Hot-reload)
npm run tauri dev

# 4. Build standalone installer executable for your OS
npm run tauri build
```

---

## Setup Your API Keys (BYOK)

Glance supports free-tier API keys:

1. Get a free API Key from [Groq Console](https://console.groq.com/) (for sub-second text explanations).
2. Get a free API Key from [Google AI Studio](https://aistudio.google.com/) (for vision / screenshot analysis).
3. Save your keys in the app settings.

---

## Architecture & Tech Stack

```
           [ Tray Icon / Global Shortcut ]
                          │ (Cmd+Shift+S)
                          ▼
                  [ Tauri Rust Core ]
              ├── System Tray Anchored Positioning
              ├── System Clipboard / Screenshot
              └── Lightweight Popup Lifecycle
                          │
                          ▼
             [ Minimalist Svelte 5 UI ] ──( Fetch API )──► Groq / Gemini
```

- **Frontend**: Svelte 5 + Vite (Vanilla CSS, custom design tokens, dark/light auto-theme).
- **Markdown & Math**: `marked` (GitHub-Flavored Markdown parser) + `KaTeX` (LaTeX math rendering engine).
- **Backend**: Rust + Tauri v2 (macOS Private API enabled for native blur/vibrancy effects).
- **AI Models**: Groq (Llama 3.1 8B / 70B) & Gemini 1.5 Flash Vision.

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

[MIT](LICENSE)
