// ==========================================
// CTAS-7 Voice System Sanity Check (ElevenLabs)
// ==========================================
// Purpose: quick verification that TTS works, keys are loaded,
// and audio playback is functional before agent integration.

use std::fs::File;
use std::io::Write;
use reqwest::Client;
use std::process::Command;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🎙️  CTAS-7 Voice System Sanity Check");
    println!("=====================================");

    // ✅ 1. Grab your ElevenLabs API key from the environment
    let api_key = match std::env::var("ELEVENLABS_API_KEY") {
        Ok(key) => {
            println!("✅ ElevenLabs API key found");
            key
        },
        Err(_) => {
            eprintln!("❌ Missing ELEVENLABS_API_KEY environment variable");
            eprintln!("   Set it with: export ELEVENLABS_API_KEY=your_key_here");
            return Ok(());
        }
    };

    // ✅ 2. Choose a test voice (Rachel is reliable)
    let voice_id = "21m00Tcm4TlvDq8ikWAM"; // Rachel
    println!("🔊 Using voice: Rachel (ID: {})", voice_id);

    // ✅ 3. Prepare the test text
    let test_text = "CTAS Seven voice system online. All agents reporting operational. Foundation integration successful.";
    println!("📝 Test message: {}", test_text);

    // ✅ 4. Send the request
    println!("🌐 Sending request to ElevenLabs API...");
    let client = Client::new();
    let url = format!("https://api.elevenlabs.io/v1/text-to-speech/{}", voice_id);

    let payload = serde_json::json!({
        "text": test_text,
        "model_id": "eleven_turbo_v2",
        "voice_settings": {
            "stability": 0.35,
            "similarity_boost": 0.8,
            "style": 0.2,
            "use_speaker_boost": true
        }
    });

    let response = client
        .post(&url)
        .header("xi-api-key", api_key)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await?;

    if !response.status().is_success() {
        eprintln!("❌ ElevenLabs API error: HTTP {}", response.status());
        eprintln!("   Response: {}", response.text().await?);
        return Ok(());
    }

    println!("✅ ElevenLabs API request successful");

    // ✅ 5. Save and play
    let audio_bytes = response.bytes().await?;
    let output_file = "ctas7_voice_check.mp3";
    let mut file = File::create(output_file)?;
    file.write_all(&audio_bytes)?;

    println!("💾 Audio saved to: {}", output_file);
    println!("🔊 Playing audio...");

    // Cross-platform audio playback
    let playback_result = if cfg!(target_os = "macos") {
        Command::new("afplay").arg(output_file).status()
    } else if cfg!(target_os = "linux") {
        // Try multiple players in order of preference
        Command::new("mpg123").arg(output_file).status()
            .or_else(|_| Command::new("mpv").arg(output_file).status())
            .or_else(|_| Command::new("ffplay").args(["-nodisp", "-autoexit", output_file]).status())
    } else {
        eprintln!("⚠️  Audio playback not supported on this platform");
        eprintln!("   Please manually play: {}", output_file);
        return Ok(());
    };

    match playback_result {
        Ok(status) if status.success() => {
            println!("✅ Audio playback completed successfully");
            println!("🎯 CTAS-7 Voice System: OPERATIONAL");
        },
        Ok(_) => {
            eprintln!("⚠️  Audio player exited with error");
            eprintln!("   Audio file saved at: {}", output_file);
        },
        Err(e) => {
            eprintln!("⚠️  Could not play audio: {}", e);
            eprintln!("   Audio file saved at: {}", output_file);
            eprintln!("   Try: open {} (macOS) or mpg123 {} (Linux)", output_file, output_file);
        }
    }

    // ✅ 6. Cleanup (optional)
    if std::path::Path::new(output_file).exists() {
        println!("🧹 Cleaning up temporary file...");
        std::fs::remove_file(output_file)?;
    }

    println!("✅ Voice system sanity check completed");
    Ok(())
}