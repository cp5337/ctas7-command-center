use anyhow::{Context, Result};
use std::process::Command;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;
use std::path::Path;

/// CTAS System-Wide Voice Infrastructure Service
/// Handles voice processing for Intel Operations, DevOps, and Smart Crate Control
pub struct CTASVoiceInfrastructure {
    whisper_model_path: String,
    whisper_binary_path: String,
    sessions: Arc<Mutex<std::collections::HashMap<Uuid, VoiceSession>>>,
    system_config: VoiceInfraConfig,
}

#[derive(Debug, Clone)]
pub struct VoiceInfraConfig {
    pub intel_mode: bool,           // Enhanced security for intel operations
    pub devops_integration: bool,   // Integration with CI/CD pipelines
    pub emergency_protocols: bool,  // Emergency broadcast capabilities
    pub multi_tenant: bool,         // Support multiple CTAS services
}

struct VoiceSession {
    id: Uuid,
    service_type: CTASServiceType,
    audio_buffer: Vec<f32>,
    is_active: bool,
    security_level: SecurityLevel,
}

#[derive(Debug, Clone)]
pub enum CTASServiceType {
    SmartCrateControl,
    IntelOperations,
    DevOpsAutomation,
    SecurityMonitoring,
    EmergencyBroadcast,
    ContainerOrchestration,
    LinearIntegration,
    N8NWorkflows,
}

#[derive(Debug, Clone)]
pub enum SecurityLevel {
    Public,
    Restricted,
    Classified,
    TopSecret,
}

impl CTASVoiceInfrastructure {
    pub async fn new() -> Result<Self> {
        println!("🏗️  Initializing CTAS Voice Infrastructure Service...");

        let whisper_model_path = "/Users/cp5337/Developer/ui/ctas-7-ui-command-center/whisper.cpp/models/ggml-base.en.bin".to_string();
        let whisper_binary_path = "/Users/cp5337/Developer/ui/ctas-7-ui-command-center/whisper.cpp/build/bin/whisper-cli".to_string();

        // Verify Whisper components exist
        if !Path::new(&whisper_model_path).exists() {
            return Err(anyhow::anyhow!("Whisper model not found at: {}", whisper_model_path));
        }
        if !Path::new(&whisper_binary_path).exists() {
            return Err(anyhow::anyhow!("Whisper binary not found at: {}", whisper_binary_path));
        }

        let system_config = VoiceInfraConfig {
            intel_mode: true,
            devops_integration: true,
            emergency_protocols: true,
            multi_tenant: true,
        };

        println!("✅ CTAS Voice Infrastructure initialized");
        println!("🎯 Services: Intel Operations, DevOps, Smart Crate Control");
        println!("🔒 Security: Multi-level access control enabled");
        println!("📡 Emergency: Broadcast protocols active");

        Ok(Self {
            whisper_model_path,
            whisper_binary_path,
            sessions: Arc::new(Mutex::new(std::collections::HashMap::new())),
            system_config,
        })
    }

    /// Process audio for any CTAS service
    pub async fn process_audio_for_service(
        &self,
        session_id: Uuid,
        audio_data: Vec<u8>,
        service_type: CTASServiceType,
        security_level: SecurityLevel,
    ) -> Result<String> {
        println!("🎤 Processing audio for service: {:?}", service_type);

        // Write audio to temp file
        let temp_audio_path = format!("/tmp/ctas_voice_{}.wav", session_id);
        std::fs::write(&temp_audio_path, audio_data)?;

        // Run Whisper transcription
        let output = Command::new(&self.whisper_binary_path)
            .args(&[
                "-m", &self.whisper_model_path,
                "-f", &temp_audio_path,
                "--output-txt",
                "--no-timestamps",
            ])
            .output()
            .context("Failed to run Whisper transcription")?;

        // Clean up temp file
        let _ = std::fs::remove_file(&temp_audio_path);

        if !output.status.success() {
            return Err(anyhow::anyhow!(
                "Whisper transcription failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        let transcription = String::from_utf8_lossy(&output.stdout)
            .lines()
            .filter(|line| !line.trim().is_empty() && !line.contains("whisper_"))
            .collect::<Vec<_>>()
            .join(" ")
            .trim()
            .to_string();

        println!("📝 Transcription for {:?}: '{}'", service_type, transcription);

        // Route to appropriate service handler
        self.route_command_to_service(&transcription, service_type, security_level).await
    }

    /// Route voice commands to appropriate CTAS services
    async fn route_command_to_service(
        &self,
        command: &str,
        service_type: CTASServiceType,
        security_level: SecurityLevel,
    ) -> Result<String> {
        match service_type {
            CTASServiceType::SmartCrateControl => {
                self.handle_smart_crate_command(command).await
            }
            CTASServiceType::IntelOperations => {
                self.handle_intel_command(command, security_level).await
            }
            CTASServiceType::DevOpsAutomation => {
                self.handle_devops_command(command).await
            }
            CTASServiceType::SecurityMonitoring => {
                self.handle_security_command(command).await
            }
            CTASServiceType::EmergencyBroadcast => {
                self.handle_emergency_command(command).await
            }
            CTASServiceType::ContainerOrchestration => {
                self.handle_container_command(command).await
            }
            CTASServiceType::LinearIntegration => {
                self.handle_linear_command(command).await
            }
            CTASServiceType::N8NWorkflows => {
                self.handle_n8n_command(command).await
            }
        }
    }

    /// Smart Crate Control voice commands
    async fn handle_smart_crate_command(&self, command: &str) -> Result<String> {
        let cmd = command.to_lowercase();

        if cmd.contains("spin up") || cmd.contains("spin") {
            Ok("Da, Boss! Spinning up Smart Crate Orchestration system now...".to_string())
        } else if cmd.contains("retrofit") {
            Ok("Copy zat, Boss! Retrofitting legacy crates zrough VASM pipeline...".to_string())
        } else if cmd.contains("build") {
            Ok("Understood, Boss! Building new crate viz SLSA L3 certification...".to_string())
        } else if cmd.contains("orchestrate") || cmd.contains("swarm") {
            Ok("Da! Initiating Docker Svarm orchestration across all nodes...".to_string())
        } else {
            Ok("Ya ne ponimayu, Boss. Please repeat Smart Crate command.".to_string())
        }
    }

    /// Intel Operations voice commands
    async fn handle_intel_command(&self, command: &str, security_level: SecurityLevel) -> Result<String> {
        let cmd = command.to_lowercase();

        match security_level {
            SecurityLevel::TopSecret | SecurityLevel::Classified => {
                if cmd.contains("threat analysis") {
                    Ok("Initiating classified threat analysis protocols...".to_string())
                } else if cmd.contains("surveillance") {
                    Ok("Activating surveillance monitoring systems...".to_string())
                } else {
                    Ok("Intel command processed at secure level.".to_string())
                }
            }
            _ => {
                Ok("Intel operations require elevated security clearance.".to_string())
            }
        }
    }

    /// DevOps automation voice commands
    async fn handle_devops_command(&self, command: &str) -> Result<String> {
        let cmd = command.to_lowercase();

        if cmd.contains("deploy") {
            Ok("Initiating deployment pipeline across CTAS infrastructure...".to_string())
        } else if cmd.contains("monitor") || cmd.contains("status") {
            Ok("Displaying system monitoring dashboard and telemetry...".to_string())
        } else if cmd.contains("rollback") {
            Ok("Emergency rollback initiated - reverting to last stable deployment...".to_string())
        } else {
            Ok("DevOps automation command processed.".to_string())
        }
    }

    /// Security monitoring voice commands
    async fn handle_security_command(&self, command: &str) -> Result<String> {
        let cmd = command.to_lowercase();

        if cmd.contains("intrusion") || cmd.contains("breach") {
            Ok("SECURITY ALERT: Intrusion detection protocols activated!".to_string())
        } else if cmd.contains("lockdown") {
            Ok("System lockdown initiated - securing all CTAS endpoints...".to_string())
        } else {
            Ok("Security monitoring active - all systems nominal.".to_string())
        }
    }

    /// Emergency broadcast voice commands
    async fn handle_emergency_command(&self, command: &str) -> Result<String> {
        Ok("ALERT! ALERT! ALERT! Emergency broadcast system activated! All units stand by for emergency protocols!".to_string())
    }

    /// Container orchestration voice commands
    async fn handle_container_command(&self, command: &str) -> Result<String> {
        let cmd = command.to_lowercase();

        if cmd.contains("scale up") {
            Ok("Scaling up container clusters across CTAS infrastructure...".to_string())
        } else if cmd.contains("health check") {
            Ok("Running health checks on all container services...".to_string())
        } else {
            Ok("Container orchestration command processed.".to_string())
        }
    }

    /// Linear integration voice commands
    async fn handle_linear_command(&self, command: &str) -> Result<String> {
        Ok("Creating Linear issue and updating project workflows...".to_string())
    }

    /// n8n workflow voice commands
    async fn handle_n8n_command(&self, command: &str) -> Result<String> {
        Ok("Triggering n8n Neural Mux workflow automation...".to_string())
    }

    /// Create a new voice session for a CTAS service
    pub async fn create_session(
        &self,
        service_type: CTASServiceType,
        security_level: SecurityLevel,
    ) -> Result<Uuid> {
        let session_id = Uuid::new_v4();
        let session = VoiceSession {
            id: session_id,
            service_type: service_type.clone(),
            audio_buffer: Vec::new(),
            is_active: true,
            security_level,
        };

        let mut sessions = self.sessions.lock().await;
        sessions.insert(session_id, session);

        println!("🎤 Voice session created for {:?}: {}", service_type, session_id);
        Ok(session_id)
    }

    /// End a voice session
    pub async fn end_session(&self, session_id: Uuid) -> Result<()> {
        let mut sessions = self.sessions.lock().await;
        sessions.remove(&session_id);

        println!("🎤 Voice session ended: {}", session_id);
        Ok(())
    }

    /// Get system-wide voice infrastructure status
    pub async fn get_infrastructure_status(&self) -> Result<String> {
        let sessions = self.sessions.lock().await;
        let active_sessions = sessions.len();

        Ok(format!(
            "CTAS Voice Infrastructure Status:\n\
             Active Sessions: {}\n\
             Intel Mode: {}\n\
             DevOps Integration: {}\n\
             Emergency Protocols: {}\n\
             Multi-Tenant: {}",
            active_sessions,
            self.system_config.intel_mode,
            self.system_config.devops_integration,
            self.system_config.emergency_protocols,
            self.system_config.multi_tenant
        ))
    }
}

/// Simplified interface for Smart Crate Control (backward compatibility)
pub struct SmartCrateVoiceEngine {
    infrastructure: Arc<CTASVoiceInfrastructure>,
}

impl SmartCrateVoiceEngine {
    pub async fn new() -> Result<Self> {
        let infrastructure = Arc::new(CTASVoiceInfrastructure::new().await?);
        Ok(Self { infrastructure })
    }

    pub async fn process_audio(&self, session_id: Uuid, audio_data: Vec<u8>) -> Result<String> {
        self.infrastructure
            .process_audio_for_service(
                session_id,
                audio_data,
                CTASServiceType::SmartCrateControl,
                SecurityLevel::Restricted,
            )
            .await
    }

    pub async fn synthesize_speech(&self, text: &str) -> Result<Vec<u8>> {
        let audio_path = format!("/tmp/natasha_voice_{}.wav", uuid::Uuid::new_v4());

        println!("🔊 Natasha speaking: {}", text);

        let output = Command::new("espeak")
            .args(&[
                "-v", "ru",           // Russian voice
                "-s", "140",          // Speech rate (words per minute)
                "-p", "30",           // Pitch (0-99)
                "-a", "200",          // Amplitude (volume)
                "-w", &audio_path,    // Write to WAV file
                text
            ])
            .output()
            .context("Failed to run espeak TTS")?;

        if !output.status.success() {
            return Err(anyhow::anyhow!(
                "espeak TTS failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        let audio_data = std::fs::read(&audio_path)
            .context("Failed to read generated audio file")?;

        let _ = std::fs::remove_file(&audio_path);

        println!("🔊 Generated {} bytes of Russian audio", audio_data.len());
        Ok(audio_data)
    }
}