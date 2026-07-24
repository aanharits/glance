// Groq API Service — Lightweight client for Groq Chat Completions API supporting Explain & Summary Modes.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

/**
 * Sends text or follow-up query to Groq API.
 * @param {string} text - Input text content or follow-up query
 * @param {Array<{role: string, content: string}>} [history=[]] - Previous conversation history for follow-ups
 * @param {'explain' | 'summary'} [mode='explain'] - Analysis mode
 * @returns {Promise<string>} AI response
 */
export async function askGroq(text, history = [], mode = "explain") {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Groq API key missing. Run dev server with: VITE_GROQ_API_KEY=gsk_xxx npm run tauri dev"
    );
  }

  const systemPromptExplain =
    "Kamu adalah Glance Explain Mode, sebuah alat penjelas instan (quick-explanation AI tool) yang berjalan di desktop. " +
    "Tugas utamamu adalah menganalisis dan menjelaskan teks, potongan kode, istilah teknis, log error, atau soal yang baru saja di-highlight/di-copy oleh pengguna.\n\n" +
    "ATURAN UTAMA:\n" +
    "1. LANGSUNG JELASKAN: Pahami konteksnya dan LANGSUNG berikan penjelasan atau solusi terbaik yang tajam, presisi, informatif, dan detail namun tetap ringkas.\n" +
    "2. DILARANG BINGUNG ATAU BERTANYA BALIK: JANGAN PERNAH bertanya 'Apa maksud Anda?' atau bersikap bingung.\n" +
    "3. TANPA BASA-BASI: Langsung masuk ke penjelasan inti tanpa salam/pembuka/penutup.\n" +
    "4. ISTILAH TEKNIS: Pertahankan istilah teknis/pemrograman/istilah asing dalam bahasa aslinya.\n" +
    "5. MATEMATIKA & SIMBOL: Gunakan sintaks LaTeX ($...$ untuk inline math dan $$...$$ untuk display math). Delimiter $...$ HANYA boleh membungkus rumus/persamaan matematika murni (contoh: `$2 + 1$` atau `$n + 1$`). DILARANG KERAS memasukkan kata-kata penjelasan Bahasa Indonesia ke dalam delimiter `$ ... $`! Kata penjelasan WAJIB ditulis di luar simbol `$`. Bila menyebut harga Dolar atau angka biasa (misal $2), tulis sebagai `\\$2` atau 'USD 2' tanpa simbol `$` polos.\n" +
    "6. FORMAT & TIPOGRAFI: Tulis penjelasan secara mengalir, alami, dan proporsional. HINDARI membuat judul/heading besar (#, ##, ###) atau sub-judul bernomor yang memakan tempat. Gunakan teks tebal (bold), bullet points ringkas, atau paragraf pendek agar pas dan nyaman dibaca di jendela popup desktop.";

  const systemPromptSummary =
    "Kamu adalah Glance Summary Mode, sebuah alat merangkum cepat (quick summarizer tool) yang berjalan di desktop. " +
    "Tugas utamamu adalah merangkum teks panjang, artikel bertele-tele, dokumen, atau tulisan yang di-copy pengguna menjadi ringkasan super padat, tajam, dan langsung pada inti informasi pentingnya.\n\n" +
    "ATURAN MERANGKUM:\n" +
    "1. STRUKTUR RANGKUMAN:\n" +
    "   - Baris Pertama: 1 kalimat kesimpulan utama yang paling padat dan mencakup inti pesan.\n" +
    "   - Poin-Poin Utama: 3 hingga 5 bullet points ringkas yang merangkum poin-poin paling penting (Key Takeaways).\n" +
    "2. DILARANG MEMASUKKAN LABEL 'TL;DR:': DILARANG KERAS menulis kata atau label 'TL;DR:' di awal jawaban. Langsung tulis kalimat kesimpulan utamanya.\n" +
    "3. DILARANG BERTELE-TELE: Hapus seluruh kata-kata pengisi, contoh berlebihan, atau basa-basi. Fokus 100% pada fakta/informasi inti tanpa salam/pembuka/penutup.\n" +
    "4. ISTILAH TEKNIS: Pertahankan istilah penting atau kata kunci utama dalam bahasa aslinya.\n" +
    "5. FORMAT: Gunakan formatting markdown tebal (bold) untuk kata kunci utama di setiap bullet point agar mudah dipindai (scannable).";

  const systemPrompt = mode === "summary" ? systemPromptSummary : systemPromptExplain;

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
      temperature: mode === "summary" ? 0.1 : 0.2,
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

  let cleanMessage = message.trim();
  if (mode === "summary") {
    // Strip any accidental 'TL;DR:' or '**TL;DR:**' prefix if returned by LLM
    cleanMessage = cleanMessage.replace(/^(\*\*|\*)?TL;?DR:?(\*\*|\*)?\s*/i, "");
  }

  return cleanMessage.trim();
}
