use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::{accept_async, tungstenite::Message};
use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use anyhow::Result;
use std::sync::Arc;
use uuid::Uuid;

mod voice_engine;
use voice_engine::SmartCrateVoiceEngine;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    println!("🎤 Smart Crate Voice Control - CTAS Edition");
    println!("🚀 Initializing Whisper + Real TTS system...");

    // Initialize voice engine with Whisper
    let voice_engine = Arc::new(SmartCrateVoiceEngine::new().await?);

    println!("✅ Voice engine ready");
    println!("🚀 WebSocket server starting on ws://localhost:15180");

    let listener = TcpListener::bind("127.0.0.1:15180").await?;

    while let Ok((stream, _)) = listener.accept().await {
        let engine = voice_engine.clone();
        tokio::spawn(handle_connection(stream, engine));
    }

    Ok(())
}

async fn handle_connection(stream: TcpStream, voice_engine: Arc<SmartCrateVoiceEngine>) {
    let ws_stream = match accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            eprintln!("WebSocket connection failed: {}", e);
            return;
        }
    };

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();
    let session_id = Uuid::new_v4();

    println!("🔌 Natasha voice client connected: {}", session_id);

    while let Some(msg) = ws_receiver.next().await {
        if let Ok(msg) = msg {
            match msg {
                Message::Text(text) => {
                    if let Ok(data) = serde_json::from_str::<Value>(&text) {
                        let response = handle_voice_command(&data, &voice_engine, session_id).await;

                        // Send text response
                        if let Ok(response_text) = serde_json::to_string(&response) {
                            let _ = ws_sender.send(Message::Text(response_text)).await;
                        }

                        // Generate and send real Russian audio response
                        if let Some(response_str) = response["response"].as_str() {
                            if let Ok(audio_response) = voice_engine.synthesize_speech(response_str).await {
                                let _ = ws_sender.send(Message::Binary(audio_response)).await;
                            }
                        }
                    }
                }
                Message::Binary(audio_data) => {
                    // Handle real audio input from microphone
                    match voice_engine.process_audio(session_id, audio_data).await {
                        Ok(transcription) => {
                            let response = process_smart_crate_command(&transcription).await;

                            // Send text response
                            if let Ok(response_text) = serde_json::to_string(&response) {
                                let _ = ws_sender.send(Message::Text(response_text)).await;
                            }

                            // Generate and send audio response
                            if let Ok(audio_response) = voice_engine.synthesize_speech(&response["response"].as_str().unwrap_or("")).await {
                                let _ = ws_sender.send(Message::Binary(audio_response)).await;
                            }
                        }
                        Err(e) => {
                            eprintln!("Audio processing error: {}", e);
                        }
                    }
                }
                _ => {}
            }
        }
    }

    println!("🔌 Natasha voice client disconnected: {}", session_id);
}

async fn handle_voice_command(data: &Value, voice_engine: &SmartCrateVoiceEngine, session_id: Uuid) -> Value {
    let command_type = data.get("type").and_then(|v| v.as_str()).unwrap_or("");
    let text = data.get("text").and_then(|v| v.as_str()).unwrap_or("");

    match command_type {
        "voice_command" => {
            println!("🎤 Voice command ({}): {}", session_id, text);
            process_smart_crate_command(text).await
        }
        "audio_stream" => {
            // Handle real-time audio streaming
            json!({
                "type": "audio_ready",
                "session_id": session_id.to_string()
            })
        }
        _ => {
            json!({
                "type": "error",
                "message": "Unknown command type"
            })
        }
    }
}

async fn process_smart_crate_command(text: &str) -> Value {
    let command = text.to_lowercase();

    if command.contains("spin up crates") || command.contains("spin up") {
        natasha_response("Da, Boss! Spinning up Smart Crate Orchestration system now...", "spin_up_crates")
    } else if command.contains("retrofit crates") || command.contains("retrofit") {
        natasha_response("Copy zat, Boss! Retrofitting legacy crates zrough VASM pipeline...", "retrofit_crates")
    } else if command.contains("build crate") || command.contains("build") {
        natasha_response("Understood, Boss! Building new crate viz SLSA L3 certification...", "build_new_crate")
    } else if command.contains("orchestrate") || command.contains("swarm") {
        natasha_response("Da! Initiating Docker Svarm orchestration across all nodes...", "orchestrate_swarm")
    } else if command.contains("emergency") || command.contains("drop ui") || command.contains("broadcast") {
        natasha_response("ALERT! ALERT! ALERT! Zis is EMERGENCY BROADCAST SYSTEM! All units - CODE BLACK INITIATED! Boss, ve have hostile activity detected! All teams drop ze UIs NOV! Svitch to ghost protocol! All telemetry servers online! Lock and load ze black hat arsenal! NO HEROES TODAY!", "emergency_broadcast")
    } else {
        natasha_response("Ya ne ponimayu, Boss. Please repeat command.", "unknown")
    }
}

fn natasha_response(text: &str, action: &str) -> Value {
    // Enhanced Russian accent transformation
    let accented = text
        .replace("th", "z")
        .replace("Th", "Z")
        .replace("w", "v")
        .replace("W", "V")
        .replace("with", "viz")
        .replace("With", "Viz")
        .replace("the", "ze")
        .replace("The", "Ze")
        .replace("this", "zis")
        .replace("This", "Zis")
        .replace("through", "zrough")
        .replace("Through", "Zrough");

    json!({
        "type": "command_result",
        "session_id": Uuid::new_v4().to_string(),
        "result": {
            "action": action,
            "status": "initiated"
        },
        "response": accented,
        "accented": accented,
        "audio_ready": true
    })
}