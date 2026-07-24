<script>
  import { marked } from "marked";
  import markedKatex from "marked-katex-extension";
  import "katex/dist/katex.min.css";
  import { tick } from "svelte";

  /** @type {{
   *   status: string,
   *   messages: Array<{ role: 'user' | 'assistant', content: string }>,
   *   errorText: string
   * }} */
  let { status, messages = [], errorText } = $props();

  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  marked.use(
    markedKatex({
      throwOnError: false,
      nonStandard: true,
    })
  );

  let bodyEl = $state(null);

  // Auto-scroll chat body to bottom when messages update
  $effect(() => {
    messages; status;
    tick().then(() => {
      if (bodyEl) {
        bodyEl.scrollTop = bodyEl.scrollHeight;
      }
    });
  });

  function parseMarkdown(text) {
    if (!text) return "";
    // Preprocess standalone currency dollar signs (e.g. $20, $0.0001) so KaTeX does not misinterpret them as LaTeX math delimiters
    const sanitized = text.replace(/(^|[^\\$])\$([0-9]+(?:[.,][0-9]+)?)\b/g, "$1\\$$2");
    return marked.parse(sanitized);
  }
</script>

<div class="card-body" bind:this={bodyEl}>
  {#if status === "idle" && messages.length === 0}
    <p class="loading-text">Copy any text (Cmd+C / Ctrl+C) to analyze…</p>
  {:else if messages.length === 0 && status === "loading"}
    <p class="loading-text">Reading clipboard & asking AI…</p>
  {:else}
    <div class="chat-thread">
      {#each messages as msg, i (i)}
        <div class="bubble-row" class:user-row={msg.role === "user"}>
          <div class="chat-bubble" class:user-bubble={msg.role === "user"} class:ai-bubble={msg.role === "assistant"}>
            {#if msg.role === "user"}
              <span class="user-text">{msg.content}</span>
            {:else}
              <div class="result-html">
                {@html parseMarkdown(msg.content)}
              </div>
            {/if}
          </div>
        </div>
      {/each}

      {#if status === "loading" && messages.length > 0}
        <div class="bubble-row">
          <div class="chat-bubble ai-bubble loading-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if status === "error"}
    <p class="error-text">{errorText || "Failed to process. Please try again."}</p>
  {/if}
</div>

<style>
  .card-body {
    padding: 12px;
    overflow-y: auto;
    max-height: 400px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    display: flex;
    flex-direction: column;
  }

  .card-body::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  .chat-thread {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .bubble-row {
    display: flex;
    width: 100%;
    justify-content: flex-start;
  }

  .bubble-row.user-row {
    justify-content: flex-end;
  }

  .chat-bubble {
    max-width: 88%;
    word-break: break-word;
    font-size: 13px;
    line-height: 1.5;
  }

  .user-bubble {
    background: var(--accent);
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 16px 16px 4px 16px;
    transform-origin: bottom right;
    animation: userBubbleIn 280ms cubic-bezier(0.34, 1.45, 0.64, 1) forwards;
    box-shadow: 0 4px 14px rgba(168, 85, 247, 0.28);
  }

  .user-text {
    white-space: pre-wrap;
  }

  .ai-bubble {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 10px 12px;
    border-radius: 16px 16px 16px 4px;
    transform-origin: bottom left;
    animation: aiBubbleIn 300ms cubic-bezier(0.34, 1.45, 0.64, 1) forwards;
  }

  .loading-bubble {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 14px;
  }

  .typing-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--text-secondary);
    animation: typing 1.2s ease-in-out infinite;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
  }

  @keyframes userBubbleIn {
    0% {
      opacity: 0;
      transform: translate3d(14px, 12px, 0) scale(0.82);
    }
    70% {
      opacity: 1;
      transform: translate3d(-2px, -2px, 0) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes aiBubbleIn {
    0% {
      opacity: 0;
      transform: translate3d(-14px, 12px, 0) scale(0.82);
    }
    70% {
      opacity: 1;
      transform: translate3d(2px, -2px, 0) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  .loading-text {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
  }

  .result-html {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--text-primary);
    word-break: break-word;
  }

  .result-html :global(h1) {
    font-size: 15px;
    font-weight: 700;
    margin: 10px 0 6px 0;
    color: var(--text-primary);
    line-height: 1.35;
  }

  .result-html :global(h2) {
    font-size: 14px;
    font-weight: 650;
    margin: 8px 0 4px 0;
    color: var(--text-primary);
    line-height: 1.35;
  }

  .result-html :global(h3),
  .result-html :global(h4),
  .result-html :global(h5),
  .result-html :global(h6) {
    font-size: 13.5px;
    font-weight: 600;
    margin: 8px 0 4px 0;
    color: var(--text-primary);
    line-height: 1.35;
  }

  .result-html :global(p) {
    margin: 0 0 10px 0;
  }

  .result-html :global(p:last-child) {
    margin-bottom: 0;
  }

  .result-html :global(strong) {
    font-weight: 600;
    color: var(--text-primary, #ffffff);
  }

  .result-html :global(em) {
    font-style: italic;
    opacity: 0.95;
  }

  .result-html :global(code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.88em;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: var(--accent, #a855f7);
  }

  .result-html :global(pre) {
    background: rgba(0, 0, 0, 0.35);
    padding: 10px 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .result-html :global(pre code) {
    background: transparent;
    padding: 0;
    border: none;
    color: var(--text-primary);
  }

  .result-html :global(ul),
  .result-html :global(ol) {
    margin: 6px 0 10px 0;
    padding-left: 20px;
  }

  .result-html :global(li) {
    margin-bottom: 4px;
  }

  .result-html :global(a) {
    color: var(--accent, #a855f7);
    text-decoration: underline;
  }

  .result-html :global(.katex) {
    font-size: 1.02em;
    color: var(--text-primary, #ffffff);
    line-height: 1.2;
  }

  .result-html :global(.katex-display) {
    margin: 10px 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 6px 0;
  }

  /* Markdown Table Styling */
  .result-html :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 12.5px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: rgba(0, 0, 0, 0.25);
  }

  .result-html :global(th) {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    font-weight: 600;
    text-align: left;
    padding: 7px 10px;
    border-bottom: 1px solid var(--border);
    border-right: 1px solid var(--border);
  }

  .result-html :global(th:last-child) {
    border-right: none;
  }

  .result-html :global(td) {
    padding: 6px 10px;
    color: var(--text-primary);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    word-break: break-word;
  }

  .result-html :global(td:last-child) {
    border-right: none;
  }

  .result-html :global(tr:last-child td) {
    border-bottom: none;
  }

  .result-html :global(tr:nth-child(even)) {
    background: rgba(255, 255, 255, 0.03);
  }

  .error-text {
    font-size: 13px;
    color: #ef4444;
    margin: 8px 0 0 0;
  }
</style>
