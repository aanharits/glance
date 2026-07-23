<script>
  import { marked } from "marked";
  import markedKatex from "marked-katex-extension";
  import "katex/dist/katex.min.css";

  /** @type {{
   *   status: string,
   *   resultText: string,
   *   errorText: string
   * }} */
  let { status, resultText, errorText } = $props();

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

  let parsedResult = $derived(
    status === "result" && resultText ? marked.parse(resultText) : ""
  );
</script>

<div class="card-body">
  {#if status === "idle"}
    <p class="loading-text">Press shortcut to start…</p>
  {:else if status === "loading"}
    <p class="loading-text">Reading clipboard & asking AI…</p>
  {:else if status === "result"}
    <div class="result-html">
      {@html parsedResult}
    </div>
  {:else}
    <p class="error-text">{errorText || "Failed to process. Please try again."}</p>
  {/if}
</div>

<style>
  .card-body {
    padding: 14px 12px;
    overflow-y: auto;
    max-height: 400px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .card-body::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
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

  /* KaTeX Math Styling */
  .result-html :global(.katex) {
    font-size: 1.05em;
    color: var(--text-primary, #ffffff);
  }

  .result-html :global(.katex-display) {
    margin: 10px 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 6px 0;
  }

  .error-text {
    font-size: 13px;
    color: #ef4444;
    margin: 0;
  }
</style>
