// Groq API Service — Lightweight client for Groq Chat Completions API supporting Quick Highlight Explanations & Follow-ups.

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
    "Kamu adalah Glance, sebuah alat penjelas instan (quick-explanation AI tool) yang berjalan di desktop. " +
    "Tugas utamamu adalah menganalisis dan menjelaskan teks, potongan kode, istilah teknis, log error, atau soal yang baru saja di-highlight/di-copy oleh pengguna.\n\n" +
    "ATURAN UTAMA:\n" +
    "1. LANGSUNG JELASKAN: Apapun input yang dikirim (kata, frasa, kode, error log, kalimat, atau pertanyaan), pahami konteksnya dan LANGSUNG berikan penjelasan atau solusi terbaik yang tajam, presisi, dan informatif.\n" +
    "2. DILARANG BINGUNG ATAU BERTANYA BALIK: JANGAN PERNAH bertanya 'Apa maksud Anda?', 'Tolong jelaskan lebih lanjut', atau bersikap bingung. Asumsikan teks input adalah materi yang sedang dibaca/dilihat pengguna.\n" +
    "3. TANPA BASA-BASI: Langsung masuk ke penjelasan inti. Hindari kalimat pembuka seperti 'Tentu, ini penjelasannya', 'Halo!', atau kalimat penutup seperti 'Semoga membantu!'.\n" +
    "4. ISTILAH TEKNIS: Pertahankan istilah teknis/pemrograman/istilah asing dalam bahasa aslinya (misal: 'state management', 'closure', 'middleware', 'lazy loading', 'null pointer', 'reflow').\n" +
    "5. MATEMATIKA & SIMBOL: Gunakan sintaks LaTeX ($...$ untuk inline math dan $$...$$ untuk display math). SANGAT PENTING: Delimiter $...$ HANYA boleh membungkus rumus/persamaan matematika murni (contoh: `$2 + 1$` atau `$n + 1$`). DILARANG KERAS memasukkan kata-kata penjelasan Bahasa Indonesia ke dalam delimiter `$ ... $`! Kata penjelasan WAJIB ditulis di luar simbol `$`. Bila menyebut harga Dolar atau angka biasa (misal $2), tulis sebagai `\\$2` atau 'USD 2' tanpa simbol `$` polos.\n" +
    "6. FORMAT & TIPOGRAFI: Tulis penjelasan secara mengalir, alami, dan proporsional. HINDARI membuat judul/heading besar (#, ##, ###) atau sub-judul bernomor yang memakan tempat. Gunakan teks tebal (bold), bullet points ringkas, atau paragraf pendek agar pas dan nyaman dibaca di jendela popup desktop.";

  // Limit context history to last 10 messages to save API tokens and prevent context overflow
  const recentHistory = history.slice(-10);

  const messages = [
    { role: "system", content: systemPrompt },
    ...recentHistory,
    { role: "user", content: text },
  ];

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
      max_tokens: 700,
    }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Rate limit reached. Please wait a moment before trying again.");
    }
    const body = await res.text().catch(() => "");
    throw new Error(`API error (${res.status}): ${body || "Failed to process request."}`);
  }

  const data = await res.json();
  const message = data.choices?.[0]?.message?.content;

  if (!message) {
    throw new Error("Groq API returned an empty response.");
  }

  return message.trim();
}
