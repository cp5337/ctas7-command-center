# CTAS CLI Tool - Engineering Specification

**Status**: Specification - Ready for Implementation  
**Created**: November 17, 2025  
**Source**: Extracted from `.zshrc` functions and prompts  
**Target**: Unified CLI tool for CTAS operations

## Overview

This specification captures the CLI interface patterns and prompts that were embedded in shell functions. The goal is to create a proper CLI tool that consolidates these features into a well-structured command-line interface.

## Design Philosophy

- **Informative**: Rich status displays with emojis and color
- **Interactive**: Clear feedback for every operation
- **Modular**: Each feature as a subcommand
- **Consistent**: Unified UI/UX patterns across all commands

## Core Features Extracted

### 1. Context Awareness (`context_check`)

Monitor token usage and provide warnings at critical thresholds.

**Prompts**:

- `⚠️  CONTEXT WINDOW: 75%+ - Prepare for valence jump at 77%!`
- `⚠️  CONTEXT WINDOW: 70%`
- `⚠️  CONTEXT WINDOW: 60%`
- `⚠️  CONTEXT WINDOW: 50%`

**Implementation**:

```bash
ctas context check
ctas context watch  # continuous monitoring
```

### 2. Auto Commit (`auto_commit`)

Intelligent git operations with validation.

**Prompts**:

- `Usage: auto_commit 'commit message'`

**Implementation**:

```bash
ctas commit "message"
ctas commit --auto  # generate message from changes
```

### 3. Project Status (`project_status`)

Comprehensive project health check.

**Prompts**:

```
📍 Current Directory: $(pwd)
📂 Git Status:
🦀 Cargo Check (if Rust project):
✅ Cargo check passed / ❌ Cargo check failed
```

**Implementation**:

```bash
ctas status
ctas status --detailed
ctas status --watch
```

### 4. Repository Switching (`switch_repo`)

Quick navigation between CTAS repositories.

**Prompts**:

- `📍 Switched to CTAS main repo`
- `📍 Switched to NYX trace repo`
- `Available repos: ctas/main, nyx/trace`

**Implementation**:

```bash
ctas repo switch <name>
ctas repo list
ctas repo add <name> <path>
```

### 5. Environment Management (`load_env`)

Load and display environment configuration.

**Prompts**:

```
✅ Environment variables loaded from .env
🔒 SurrealDB: $SURREALDB_USER@$SURREALDB_ENDPOINT
🤖 GPT Model: $GPT_MODEL
🌍 Environment: $ENVIRONMENT
⚠️  No .env file found in current directory
```

**Implementation**:

```bash
ctas env load
ctas env show
ctas env validate
```

### 6. Port Management (`check_ports`)

Monitor service availability across CTAS port ranges.

**Prompts**:

```
🔍 Checking CTAS port availability...

🧠 AI Services:
  ✅ Port $port ($desc) - ACTIVE
  ❌ Port $port ($desc) - available

🔧 MCP Servers:
  ✅ Port $port ($desc) - ACTIVE
  ❌ Port $port ($desc) - available

🗃 Databases:
  ✅ Port $port ($desc) - ACTIVE
  ❌ Port $port ($desc) - available
```

**Port Ranges**:

- AI Services: 11434 (Ollama), 8080 (GPT proxy), 5000 (Claude), 8501 (Streamlit)
- MCP Servers: 3000-3010
- Databases: 8000 (SurrealDB), 5432 (PostgreSQL), 6379 (Redis), 27017 (MongoDB)

**Implementation**:

```bash
ctas ports check
ctas ports watch
ctas ports kill <port>
ctas ports scan <range>
```

### 7. Tor Management

Complete Tor service integration with security profiles.

#### Status (`tor_status`)

**Prompts**:

```
🧅 Tor Service Status:
  ✅ Tor daemon is RUNNING (PID: $pid)
  ❌ Tor daemon is STOPPED
  🔌 Port Status:
    ✅ Port $port ($desc) - ACTIVE
    ❌ Port $port ($desc) - available
  📍 Tor binary: $(which tor)
  📋 Version: $(tor --version)
  ⚠️  Tor binary not found in PATH
```

#### Start/Stop/Restart

**Prompts**:

```
🧅 Tor is already running (PID: $pid)
🧅 Starting Tor daemon...
✅ Tor started successfully (PID: $pid)
🔌 SOCKS proxy available at 127.0.0.1:9050
🎛️  Control port available at 127.0.0.1:9051
❌ Failed to start Tor daemon

🧅 Stopping Tor daemon (PID: $pid)...
⚠️  Tor still running, forcing termination...
✅ Tor stopped successfully

🧅 Restarting Tor service...
```

#### Test (`tor_test`)

**Prompts**:

```
❌ Tor is not running. Start it first with 'tor-start'
🧅 Testing Tor connectivity...
✅ Tor is working correctly!
🌐 Your Tor IP: $ip
🔒 Traffic is being routed through Tor network
❌ Tor connectivity test failed
🔍 Check your Tor configuration or network connection
```

#### New Identity (`tor_newid`)

**Prompts**:

```
🧅 Requesting new Tor identity...
✅ New Tor circuit established
⏳ Wait 10 seconds before making requests for best anonymity
❌ Failed to request new identity
🔍 Check if Tor control port (9051) is accessible
```

#### Logs (`tor_logs`)

**Prompts**:

```
🧅 Recent Tor logs:
🧅 No Tor log file found at $log_file
📍 If Tor is running, logs may be going to stdout/system logs
```

#### CTAS Security Profile (`tor_ctas`)

**Prompts**:

```
🛡️  Starting Tor for CTAS Security Toolkit...
📋 CTAS environment loaded
🔧 CTAS Security config found - using enhanced Tor settings
🧅 Tor already running - requesting new identity for CTAS session
🧅 Starting Tor with CTAS security profile...
✅ CTAS Tor profile active (PID: $pid)
🔒 Enhanced security settings applied
🌐 Ready for CTAS intelligence operations
❌ Failed to start CTAS Tor profile
```

**Implementation**:

```bash
ctas tor status
ctas tor start [--ctas-profile]
ctas tor stop
ctas tor restart
ctas tor test
ctas tor newid
ctas tor logs [--follow]
```

### 8. Session Torrification

Proxy current shell session through Tor.

#### Torrify (`torrify`)

**Prompts**:

```
🧅 Torrifying current shell session...
🧅 Starting Tor daemon...
❌ Failed to start Tor - cannot torrify
🧅 Tor already running (PID: $pid)

🧅 Testing Tor connectivity...
✅ Session successfully torrified!
🌐 Your Tor IP: $ip
🔒 All HTTP/HTTPS traffic will route through Tor
📋 Use 'de-torrify' to return to normal networking

❌ Tor connectivity test failed
🔧 Proxy variables set but Tor may not be working properly
🔍 Try 'tor-test' for detailed diagnostics
```

#### De-torrify (`de_torrify`)

**Prompts**:

```
🧅 De-torrifying current shell session...
⚠️  Session doesn't appear to be torrified
🔍 Clearing proxy variables anyway...

🌐 Testing normal connectivity...
✅ Session de-torrified successfully!
🌐 Your normal IP: $ip
🔓 Traffic restored to normal routing
⚠️  De-torrified but couldn't verify normal connectivity
```

**Implementation**:

```bash
ctas proxy torrify
ctas proxy detorrify
ctas proxy status
ctas proxy test
```

### 9. Dark Web Operations

Specialized tools for dark web intelligence gathering.

**Prompts**:

```
# (Similar patterns to Tor management but with dark web focus)
```

**Implementation**:

```bash
ctas darkweb start
ctas darkweb test
ctas darkweb curl <onion-url>
ctas darkweb newid
ctas darkweb browser
ctas darkweb status
```

## Technical Architecture

### Language: Rust

- Fast, safe, cross-platform
- Rich ecosystem for CLI (clap, colored, indicatif)
- Integrates well with existing Rust projects

### Project Structure

```
ctas-cli/
├── Cargo.toml
├── src/
│   ├── main.rs           # Entry point, command routing
│   ├── commands/
│   │   ├── mod.rs
│   │   ├── context.rs    # Context monitoring
│   │   ├── commit.rs     # Git operations
│   │   ├── status.rs     # Project status
│   │   ├── repo.rs       # Repository management
│   │   ├── env.rs        # Environment management
│   │   ├── ports.rs      # Port checking
│   │   ├── tor.rs        # Tor operations
│   │   ├── proxy.rs      # Session proxying
│   │   └── darkweb.rs    # Dark web tools
│   ├── utils/
│   │   ├── display.rs    # Terminal UI helpers
│   │   ├── process.rs    # Process management
│   │   └── network.rs    # Network utilities
│   └── config/
│       ├── mod.rs
│       └── ports.rs      # Port range definitions
└── tests/
```

### Dependencies (Cargo.toml)

```toml
[dependencies]
clap = { version = "4.0", features = ["derive", "color"] }
colored = "2.0"
indicatif = "0.17"
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
reqwest = "0.11"
anyhow = "1.0"
git2 = "0.18"
```

### Command Structure

```rust
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "ctas")]
#[command(about = "CTAS Command Center CLI", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Monitor context windows and token usage
    Context {
        #[command(subcommand)]
        action: ContextAction,
    },
    /// Git commit operations
    Commit {
        message: Option<String>,
        #[arg(long)]
        auto: bool,
    },
    /// Check project status
    Status {
        #[arg(long)]
        detailed: bool,
        #[arg(long)]
        watch: bool,
    },
    /// Repository management
    Repo {
        #[command(subcommand)]
        action: RepoAction,
    },
    /// Environment management
    Env {
        #[command(subcommand)]
        action: EnvAction,
    },
    /// Port management
    Ports {
        #[command(subcommand)]
        action: PortAction,
    },
    /// Tor operations
    Tor {
        #[command(subcommand)]
        action: TorAction,
    },
    /// Session proxy management
    Proxy {
        #[command(subcommand)]
        action: ProxyAction,
    },
    /// Dark web operations
    Darkweb {
        #[command(subcommand)]
        action: DarkwebAction,
    },
}
```

## UI/UX Patterns

### Colors

- 🟢 Green: Success, active services
- 🔴 Red: Errors, stopped services
- 🟡 Yellow: Warnings, pending actions
- 🔵 Blue: Info, neutral status
- ⚪ Gray: Disabled, unavailable

### Emojis

- 📍 Location/navigation
- 📂 File/directory operations
- 🦀 Rust-specific operations
- ✅ Success/confirmation
- ❌ Failure/error
- ⚠️ Warning/caution
- 🔍 Search/check operations
- 🔒 Security/encryption
- 🧅 Tor-related
- 🌐 Network/IP
- 🔌 Ports/connections
- 🛡️ Security profiles
- 📋 Lists/status
- 🧠 AI services
- 🔧 Configuration/tools
- 🗃 Databases

### Progress Indicators

Use `indicatif` for long-running operations:

- Spinner for unknown duration
- Progress bar for known steps
- Multi-progress for parallel operations

### Output Format

- JSON mode: `--json` flag for machine-readable output
- Quiet mode: `--quiet` for minimal output
- Verbose mode: `--verbose` for detailed logging

## Configuration

### Config File: `~/.ctas/config.toml`

```toml
[general]
default_repo = "ctas-main"
auto_commit = false

[repos]
ctas-main = "/Users/cp5337/Developer/ctas7-command-center"
ctas-staging = "/Users/cp5337/Developer/ctas-7-shipyard-staging"

[ports]
check_timeout = 1000  # milliseconds

[tor]
socks_port = 9050
control_port = 9051
ctas_profile = true

[display]
use_emoji = true
use_color = true
```

## Implementation Phases

### Phase 1: Core Infrastructure

- [ ] Project setup with Cargo
- [ ] CLI argument parsing with clap
- [ ] Display utilities (colored output, emojis)
- [ ] Configuration management

### Phase 2: Basic Commands

- [ ] `ctas status` - Project status
- [ ] `ctas commit` - Git operations
- [ ] `ctas env` - Environment management
- [ ] `ctas repo` - Repository switching

### Phase 3: Network Features

- [ ] `ctas ports` - Port checking
- [ ] `ctas tor` - Basic Tor operations
- [ ] Network utilities

### Phase 4: Advanced Security

- [ ] `ctas proxy` - Session torrification
- [ ] `ctas darkweb` - Dark web tools
- [ ] Enhanced Tor profiles
- [ ] Security validation

### Phase 5: Intelligence Features

- [ ] `ctas context` - Context monitoring
- [ ] Integration with AI services
- [ ] Automated workflows

## Testing Strategy

### Unit Tests

- Each command module has comprehensive tests
- Mock external dependencies (git, network)
- Test all error conditions

### Integration Tests

- End-to-end command execution
- Real git operations in temp repos
- Network operations with test endpoints

### Performance Tests

- Port scanning speed
- Large repo operations
- Parallel command execution

## Documentation

### User Guide

- Getting started
- Command reference
- Configuration guide
- Examples and recipes

### Developer Guide

- Architecture overview
- Adding new commands
- Testing guidelines
- Release process

## Distribution

### Binary Releases

- GitHub Releases with pre-built binaries
- Linux (x86_64, ARM64)
- macOS (Intel, Apple Silicon)
- Windows (x86_64)

### Package Managers

- Homebrew: `brew install ctas-cli`
- Cargo: `cargo install ctas-cli`
- AUR (Arch Linux)
- apt/deb repository

## Migration Path

### From Shell Functions

1. Install CLI: `cargo install ctas-cli`
2. Update aliases in `.zshrc`:
   ```bash
   alias ps="ctas status"
   alias ac="ctas commit"
   alias sr="ctas repo switch"
   alias ports="ctas ports check"
   alias tor-status="ctas tor status"
   # ... etc
   ```
3. Deprecate old shell functions
4. Remove after transition period

### Backward Compatibility

- CLI recognizes old function names as aliases
- Migration helper: `ctas migrate --from-zshrc`
- Generates new config from existing shell setup

## Future Enhancements

### Interactive Mode

- TUI with ratatui for real-time dashboards
- Live port monitoring
- Interactive repo selection

### Plugins

- Plugin system for custom commands
- Community-contributed extensions
- Private command modules

### Cloud Integration

- Sync config across machines
- Team collaboration features
- Shared repository configurations

### AI Integration

- Natural language command interface
- Intelligent commit message generation
- Predictive context warnings

## Raw Prompt Data

All 218 extracted echo statements are available in:
`/Users/cp5337/Developer/ctas7-command-center/zshrc_cli_prompts_raw.txt`

## Notes

- This spec preserves the visual design and UX patterns that made the shell functions appealing
- The CLI should feel like a natural evolution, not a rewrite
- Focus on making the "it never worked" parts actually work reliably
- Maintain the personality and character of the original prompts
- Make it easy to extend and customize

---

**Next Steps**:

1. Review and refine this specification
2. Create Rust project structure
3. Implement Phase 1 (core infrastructure)
4. Build iteratively, testing each command thoroughly
5. Migrate gradually from shell functions to CLI
