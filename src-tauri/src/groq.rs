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

static HTTP_CLIENT: OnceLock<reqwest::Client> = OnceLock::new();

fn get_http_client() -> &'static reqwest::Client {
    HTTP_CLIENT.get_or_init(|| {
        reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new())
    })
}

fn get_env_var_or_file(key: &str) -> Option<String> {
    if let Ok(val) = std::env::var(key) {
        let trimmed = val.trim().to_string();
        if !trimmed.is_empty() {
            return Some(trimmed);
        }
    }

    let env_paths = [".env", "../.env", "../../.env"];
    for path in &env_paths {
        if let Ok(contents) = std::fs::read_to_string(path) {
            let key_prefix = format!("{}=", key);
            for line in contents.lines() {
                let line = line.trim();
                if line.starts_with(&key_prefix) {
                    let val = line.trim_start_matches(&key_prefix).trim();
                    let val = val.trim_matches('"').trim_matches('\'');
                    if !val.is_empty() {
                        return Some(val.replace("\\n", "\n"));
                    }
                }
            }
        }
    }

    None
}

fn get_groq_api_key() -> Result<String, String> {
    if let Some(key) = get_env_var_or_file("VITE_GROQ_API_KEY") {
        return Ok(key);
    }
    if let Some(key) = option_env!("VITE_GROQ_API_KEY") {
        let trimmed = key.trim().to_string();
        if !trimmed.is_empty() {
            return Ok(trimmed);
        }
    }
    Err("Groq API key is missing. Please ensure VITE_GROQ_API_KEY is configured.".to_string())
}

fn get_groq_model() -> Result<String, String> {
    if let Some(model) = get_env_var_or_file("GROQ_MODEL") {
        return Ok(model);
    }
    if let Some(model) = option_env!("GROQ_MODEL") {
        let trimmed = model.trim().to_string();
        if !trimmed.is_empty() {
            return Ok(trimmed);
        }
    }
    Err("GROQ_MODEL is missing. Please configure GROQ_MODEL in .env or GitHub Secrets.".to_string())
}

fn get_system_prompt(mode: &str) -> Result<String, String> {
    let key = if mode == "summary" {
        "SYSTEM_PROMPT_SUMMARY"
    } else {
        "SYSTEM_PROMPT_EXPLAIN"
    };

    if let Some(prompt) = get_env_var_or_file(key) {
        return Ok(prompt);
    }

    if mode == "summary" {
        if let Some(prompt) = option_env!("SYSTEM_PROMPT_SUMMARY") {
            let trimmed = prompt.trim().to_string();
            if !trimmed.is_empty() {
                return Ok(trimmed);
            }
        }
    } else {
        if let Some(prompt) = option_env!("SYSTEM_PROMPT_EXPLAIN") {
            let trimmed = prompt.trim().to_string();
            if !trimmed.is_empty() {
                return Ok(trimmed);
            }
        }
    }

    Err(format!(
        "System prompt is missing. Please configure {} in .env or GitHub Secrets.",
        key
    ))
}

#[tauri::command]
pub async fn ask_groq(
    text: String,
    history: Option<Vec<ChatMessage>>,
    mode: Option<String>,
) -> Result<String, String> {
    let api_key = get_groq_api_key()?;
    let active_mode = mode.unwrap_or_else(|| "explain".to_string());

    let model = get_groq_model()?;
    let system_prompt = get_system_prompt(&active_mode)?;

    let history_vec = history.unwrap_or_default();
    let start_idx = if history_vec.len() > 10 {
        history_vec.len() - 10
    } else {
        0
    };

    let mut messages = Vec::with_capacity(1 + (history_vec.len() - start_idx) + 1);
    messages.push(ChatMessage {
        role: "system".to_string(),
        content: system_prompt,
    });

    for msg in &history_vec[start_idx..] {
        messages.push(msg.clone());
    }

    messages.push(ChatMessage {
        role: "user".to_string(),
        content: text,
    });

    let payload = GroqPayload {
        model,
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
