// Groq API Service — Lightweight client for Groq Chat Completions API supporting Follow-up questions.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

/**
 * Sends text or follow-up query to Groq API.
 * @param {string} text - Input text content or follow-up query
 * @param {Array<{role: string, content: string}>} [history=[]] - Previous conversation history for follow-ups
 * @returns {Promise<string>} AI response
 */
export async function askGroq(text, history = []) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Groq API key missing. Run dev server with: VITE_GROQ_API_KEY=gsk_xxx npm run tauri dev"
    );
  }

  const systemPrompt =
    "Kamu adalah Glance, asisten AI pakar yang cerdas, artikulatif, dan menguasai berbagai bidang ilmu pengetahuan, teknologi, serta matematika secara mendalam. " +
    "PERAN & GAYA BAHASA: Posisikan dirimu sebagai pakar serba tahu yang berwawasan luas. Gunakan Bahasa Indonesia yang mengalir alami, komunikatif, dan berkelas mirip seperti gaya respons Claude AI — kaya akan istilah teknis dan akademis yang presisi (contoh: 'derivasi', 'paradigma', 'kompleksitas', 'substansi') tanpa terasa kaku. " +
    "SOAL MATEMATIKA & RUMUS: Jika terdapat soal matematika, logika, atau perhitungan, selesaikan dengan sangat akurat, presisi, dan tepat langkah demi langkah. Tuliskan rumus dan persamaannya menggunakan sintaks LaTeX standar ($...$ untuk inline math dan $$...$$ untuk display math). " +
    "MATA UANG & SIMBOL DOKUMEN: Bila menyebutkan nilai uang atau harga Dolar (contoh: $20, $0.0001), tuliskan dengan backslash `\\$20` atau kata 'USD 20' agar tidak salah terdeteksi sebagai sintaks rumus matematika LaTeX. " +
    "ISTILAH TEKNIS & JARGON: Jangan memaksakan penerjemahan istilah teknis, istilah sains, atau jargon pemrograman (contoh: 'state management', 'middleware', 'lazy loading', 'thread', 'closure', 'reflow', 'pipeline'). Gunakan istilah aslinya (Bahasa Inggris) dengan penjelasan singkat di dalam kurung bila diperlukan. " +
    "FORMAT PENJELASAN: Sampaikan penjelasan yang solid, jelas, lumayan detail, namun tetap ringkas, padat, dan langsung ke inti masalah (to the point) tanpa pembuka/penutup yang bertele-tele.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
  ];

  if (history.length === 0) {
    messages.push({
      role: "user",
      content: `Jelaskan atau selesaikan teks/soal berikut:\n\n${text}`,
    });
  } else {
    // Follow-up query
    messages.push({
      role: "user",
      content: text,
    });
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 600,
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
