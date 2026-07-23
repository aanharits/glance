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
            "Kamu adalah asisten cerdas yang bertugas menjelaskan dan meringkas teks, kode, atau error log. " +
            "Tetap jelaskan secara komprehensif, namun ringkas, jelas, langsung kepada intinya, dan mudah dipahami dalam Bahasa Indonesia. " +
            "KODE & ERROR PEMROGRAMAN: Bila teks berupa cuplikan kode, fungsi, sintaks kompleks (baik buatan developer atau AI), ataupun pesan error/traceback, jelaskan dengan tepat fungsi/tujuan sintaks tersebut, penyebab utama error, dan berikan solusi perbaikannya secara singkat & praktis. Gunakan format codeblock ``` bila menampilkan kode. " +
            "ATURAN ISTILAH TEKNIS: Jangan menterjemahkan secara kaku istilah teknis atau jargon pemrograman (contoh: 'state management', 'middleware', 'lazy loading', 'thread', 'closure', 'reflow'). Tetap gunakan istilah aslinya (Bahasa Inggris) dengan penjelasan singkat di dalam kurung bila perlu. " +
            "FORMAT MATEMATIKA & RUMUS: Bila terdapat soal atau persamaan matematika, tuliskan dengan format LaTeX standar $...$ untuk inline math dan $$...$$ untuk persamaan tersendiri. Berikan langkah penyelesaian yang rapi. " +
            "Jangan gunakan format heading berlebihan — utamakan penjelasan padat, efektif, dan langsung to the point.",
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
