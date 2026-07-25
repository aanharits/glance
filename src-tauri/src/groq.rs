use serde::{Deserialize, Serialize};
use std::sync::OnceLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize)]
struct GroqPayload {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: u32,
}

#[derive(Debug, Deserialize)]
struct GroqChoice {
    message: ChatMessage,
}

#[derive(Debug, Deserialize)]
struct GroqResponse {
    choices: Vec<GroqChoice>,
}

const GROQ_API_URL: &str = "https://api.groq.com/openai/v1/chat/completions";
const MODEL: &str = "llama-3.1-8b-instant";

static HTTP_CLIENT: OnceLock<reqwest::Client> = OnceLock::new();

fn get_http_client() -> &'static reqwest::Client {
    HTTP_CLIENT.get_or_init(|| {
        reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new())
    })
}

fn get_groq_api_key() -> Result<String, String> {
    // 1. Check OS process environment variable
    if let Ok(key) = std::env::var("VITE_GROQ_API_KEY") {
        let trimmed = key.trim().to_string();
        if !trimmed.is_empty() {
            return Ok(trimmed);
        }
    }

    // 2. Check compile-time environment variable (baked in release build)
    if let Some(key) = option_env!("VITE_GROQ_API_KEY") {
        let trimmed = key.trim().to_string();
        if !trimmed.is_empty() {
            return Ok(trimmed);
        }
    }

    // 3. Fallback: parse .env file directly from project root directory in dev/local mode
    let env_paths = [".env", "../.env", "../../.env"];
    for path in &env_paths {
        if let Ok(contents) = std::fs::read_to_string(path) {
            for line in contents.lines() {
                let line = line.trim();
                if line.starts_with("VITE_GROQ_API_KEY=") {
                    let key = line.trim_start_matches("VITE_GROQ_API_KEY=").trim();
                    let key = key.trim_matches('"').trim_matches('\'');
                    if !key.is_empty() {
                        return Ok(key.to_string());
                    }
                }
            }
        }
    }

    Err("Groq API key is missing. Please ensure VITE_GROQ_API_KEY is configured.".to_string())
}

#[tauri::command]
pub async fn ask_groq(
    text: String,
    history: Option<Vec<ChatMessage>>,
    mode: Option<String>,
) -> Result<String, String> {
    let api_key = get_groq_api_key()?;
    let active_mode = mode.unwrap_or_else(|| "explain".to_string());

    let system_prompt_explain =
        "Kamu adalah Glance Explain Mode, sebuah alat penjelas instan (quick-explanation AI tool) yang berjalan di desktop. \
        Tugas utamamu adalah menganalisis dan menjelaskan teks, potongan kode, istilah teknis, log error, atau soal yang baru saja di-highlight/di-copy oleh pengguna.\n\n\
        ATURAN UTAMA:\n\
        1. LANGSUNG JELASKAN: Pahami konteksnya dan LANGSUNG berikan penjelasan atau solusi terbaik yang tajam, presisi, informatif, dan detail namun tetap ringkas.\n\
        2. DILARANG BINGUNG ATAU BERTANYA BALIK: JANGAN PERNAH bertanya 'Apa maksud Anda?' atau bersikap bingung.\n\
        3. TANPA BASA-BASI: Langsung masuk ke penjelasan inti tanpa salam/pembuka/penutup.\n\
        4. ISTILAH TEKNIS: Pertahankan istilah teknis/pemrograman/istilah asing dalam bahasa aslinya.\n\
        5. MATEMATIKA & SIMBOL: Gunakan sintaks LaTeX ($...$ untuk inline math dan $$...$$ untuk display math). Delimiter $...$ HANYA boleh membungkus rumus/persamaan matematika murni (contoh: `$2 + 1$` atau `$n + 1$`). DILARANG KERAS memasukkan kata-kata penjelasan Bahasa Indonesia ke dalam delimiter `$ ... $`! Kata penjelasan WAJIB ditulis di luar simbol `$`. Bila menyebut harga Dolar atau angka biasa (misal $2), tulis sebagai `\\$2` atau 'USD 2' tanpa simbol `$` polos.\n\
        6. FORMAT & TIPOGRAFI: Tulis penjelasan secara mengalir, alami, dan proporsional. HINDARI membuat judul/heading besar (#, ##, ###) atau sub-judul bernomor yang memakan tempat. Gunakan teks tebal (bold), bullet points ringkas, atau paragraf pendek agar pas dan nyaman dibaca di jendela popup desktop.";

    let system_prompt_summary =
        "Kamu adalah Glance Summary Mode, sebuah alat merangkum cepat (quick summarizer tool) yang berjalan di desktop. \
        Tugas utamamu adalah merangkum teks panjang, artikel bertele-tele, dokumen, atau tulisan yang di-copy pengguna menjadi ringkasan super padat, tajam, dan langsung pada inti informasi pentingnya.\n\n\
        ATURAN MERANGKUM:\n\
        1. STRUKTUR RANGKUMAN:\n\
           - Baris Pertama: 1 kalimat kesimpulan utama yang paling padat dan mencakup inti pesan.\n\
           - Poin-Poin Utama: 3 hingga 5 bullet points ringkas yang merangkum poin-poin paling penting (Key Takeaways).\n\
        2. DILARANG MEMASUKKAN LABEL 'TL;DR:': DILARANG KERAS menulis kata atau label 'TL;DR:' di awal jawaban. Langsung tulis kalimat kesimpulan utamanya.\n\
        3. DILARANG BERTELE-TELE: Hapus seluruh kata-kata pengisi, contoh berlebihan, atau basa-basi. Fokus 100% pada fakta/informasi inti tanpa salam/pembuka/penutup.\n\
        4. ISTILAH TEKNIS: Pertahankan istilah penting atau kata kunci utama dalam bahasa aslinya.\n\
        5. FORMAT: Gunakan formatting markdown tebal (bold) untuk kata kunci utama di me-setiap bullet point agar mudah dipindai (scannable).";

    let system_prompt = if active_mode == "summary" {
        system_prompt_summary
    } else {
        system_prompt_explain
    };

    let history_vec = history.unwrap_or_default();
    let start_idx = if history_vec.len() > 10 {
        history_vec.len() - 10
    } else {
        0
    };

    let mut messages = Vec::with_capacity(1 + (history_vec.len() - start_idx) + 1);
    messages.push(ChatMessage {
        role: "system".to_string(),
        content: system_prompt.to_string(),
    });

    for msg in &history_vec[start_idx..] {
        messages.push(msg.clone());
    }

    messages.push(ChatMessage {
        role: "user".to_string(),
        content: text,
    });

    let payload = GroqPayload {
        model: MODEL.to_string(),
        messages,
        temperature: if active_mode == "summary" { 0.1 } else { 0.2 },
        max_tokens: 700,
    };

    let client = get_http_client();
    let res = client
        .post(GROQ_API_URL)
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to Groq API: {}", e))?;

    let status = res.status();
    if !status.is_success() {
        if status.as_u16() == 429 {
            return Err(
                "Rate limit reached. Please wait a moment before trying again.".to_string(),
            );
        }
        let body = res.text().await.unwrap_or_default();
        return Err(format!(
            "API error ({}): {}",
            status,
            if body.is_empty() {
                "Failed to process request."
            } else {
                &body
            }
        ));
    }

    let data: GroqResponse = res
        .json()
        .await
        .map_err(|e| format!("Failed to parse Groq response: {}", e))?;

    let first_choice = data
        .choices
        .first()
        .ok_or_else(|| "Groq API returned an empty response.".to_string())?;

    let mut clean_message = first_choice.message.content.trim().to_string();

    if active_mode == "summary" {
        if let Some(stripped) = clean_message.strip_prefix("TL;DR:") {
            clean_message = stripped.trim().to_string();
        } else if let Some(stripped) = clean_message.strip_prefix("**TL;DR:**") {
            clean_message = stripped.trim().to_string();
        }
    }

    Ok(clean_message)
}
