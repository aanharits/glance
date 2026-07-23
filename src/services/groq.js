// Groq API Service — Lightweight client for Groq Chat Completions API.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

/**
 * Sends text to Groq API for explanation/summarization in Indonesian.
 * @param {string} text - Clipboard text content
 * @returns {Promise<string>} AI response summary in Indonesian
 */
export async function askGroq(text) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Groq API key missing. Run dev server with: VITE_GROQ_API_KEY=gsk_xxx npm run tauri dev"
    );
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten cerdas yang bertugas menjelaskan dan meringkas teks. " +
            "Tetap jelaskan secara komprehensif, namun ringkas, jelas, langsung kepada intinya, dan mudah dipahami dalam Bahasa Indonesia. " +
            "ATURAN PENTING ISTILAH TEKNIS: Jangan menterjemahkan secara mentah/kaku istilah teknis, konsep, nama fitur, atau jargon pemrograman (contoh: 'state management', 'middleware', 'lazy loading', 'event listener', 'thread', 'reflow'). " +
            "Tetap gunakan istilah aslinya (Bahasa Inggris) dan tambahkan penjelasan singkat di dalam kurung bila perlu. " +
            "Jangan gunakan format heading berlebihan — utamakan penjelasan padat dan efektif.",
        },
        {
          role: "user",
          content: `Jelaskan atau ringkas teks berikut:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  const message = data.choices?.[0]?.message?.content;

  if (!message) {
    throw new Error("Groq API returned an empty response.");
  }

  return message.trim();
}
