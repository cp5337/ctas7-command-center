"""
CTAS-7 Enterprise Voice CLI
Command-line interface for testing and debugging
"""

import asyncio
import sys
import time
import json
from typing import Optional
import click
import structlog
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.syntax import Syntax

from .config import VoiceConfig
from .core import VoiceOrchestrator
from .errors import initialize_error_handler, CTAS7VoiceException

console = Console()

@click.group()
@click.option('--debug', is_flag=True, help='Enable debug mode with verbose logging')
@click.option('--config-file', type=click.Path(exists=True), help='Path to configuration file')
@click.pass_context
def cli(ctx, debug, config_file):
    """CTAS-7 Enterprise Voice System CLI"""
    ctx.ensure_object(dict)
    ctx.obj['debug'] = debug
    ctx.obj['config_file'] = config_file

@cli.command()
@click.pass_context
def test(ctx):
    """Run comprehensive system tests"""
    debug = ctx.obj['debug']

    console.print("\n🎙️ [bold blue]CTAS-7 Enterprise Voice System Tests[/bold blue]")
    console.print("=" * 60)

    asyncio.run(_run_tests(debug))

@cli.command()
@click.option('--agent', default='natasha', help='Voice agent to use (natasha/marcus)')
@click.option('--text', prompt='Text to synthesize', help='Text to convert to speech')
@click.option('--streaming', is_flag=True, help='Use streaming synthesis')
@click.option('--play-audio', is_flag=True, help='Play audio after synthesis')
@click.pass_context
def speak(ctx, agent, text, streaming, play_audio):
    """Synthesize speech with specified agent"""
    debug = ctx.obj['debug']

    asyncio.run(_speak_text(agent, text, streaming, play_audio, debug))

@cli.command()
@click.pass_context
def health(ctx):
    """Check system health"""
    debug = ctx.obj['debug']

    asyncio.run(_health_check(debug))

@cli.command()
@click.pass_context
def config_check(ctx):
    """Validate configuration"""
    debug = ctx.obj['debug']

    _check_configuration(debug)

@cli.command()
@click.pass_context
def interactive(ctx):
    """Start interactive voice session"""
    debug = ctx.obj['debug']

    asyncio.run(_interactive_session(debug))

async def _run_tests(debug: bool):
    """Run comprehensive system tests"""

    test_results = []

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:

        # Test 1: Configuration
        task = progress.add_task("Testing configuration...", total=None)
        try:
            config = VoiceConfig.from_env()
            logger = config.setup_logging()
            error_handler = initialize_error_handler(logger, debug)

            validation = config.validate_configuration()
            if validation["valid"]:
                test_results.append(("Configuration", "✅ PASS", "All settings valid"))
            else:
                test_results.append(("Configuration", "❌ FAIL", f"Errors: {validation['errors']}"))

        except Exception as e:
            test_results.append(("Configuration", "❌ FAIL", str(e)))

        progress.update(task, completed=True)

        # Test 2: ElevenLabs API Connection
        task = progress.add_task("Testing ElevenLabs API...", total=None)
        try:
            orchestrator = VoiceOrchestrator(config)
            agents = await orchestrator.get_available_agents()

            if agents:
                test_results.append(("ElevenLabs API", "✅ PASS", f"Found {len(agents)} agents"))
            else:
                test_results.append(("ElevenLabs API", "❌ FAIL", "No agents available"))

        except Exception as e:
            test_results.append(("ElevenLabs API", "❌ FAIL", str(e)))

        progress.update(task, completed=True)

        # Test 3: Voice Synthesis
        task = progress.add_task("Testing voice synthesis...", total=None)
        try:
            test_text = "Testing CTAS-7 voice synthesis system."
            response = await orchestrator.synthesize_speech("natasha", test_text)

            if response.success and len(response.audio_data) > 0:
                test_results.append(("Voice Synthesis", "✅ PASS", f"Generated {len(response.audio_data)} bytes"))
            else:
                test_results.append(("Voice Synthesis", "❌ FAIL", response.error or "No audio generated"))

        except Exception as e:
            test_results.append(("Voice Synthesis", "❌ FAIL", str(e)))

        progress.update(task, completed=True)

        # Test 4: WebSocket Streaming
        task = progress.add_task("Testing streaming synthesis...", total=None)
        try:
            test_text = "Testing streaming voice synthesis."
            response = await orchestrator.synthesize_speech("natasha", test_text, streaming=True)

            if response.success and len(response.audio_data) > 0:
                test_results.append(("Streaming", "✅ PASS", f"Streamed {len(response.audio_data)} bytes"))
            else:
                test_results.append(("Streaming", "❌ FAIL", response.error or "No audio streamed"))

        except Exception as e:
            test_results.append(("Streaming", "❌ FAIL", str(e)))

        progress.update(task, completed=True)

        # Test 5: Health Check
        task = progress.add_task("Running health check...", total=None)
        try:
            health = await orchestrator.health_check()

            if health["status"] == "healthy":
                test_results.append(("Health Check", "✅ PASS", "All systems healthy"))
            else:
                test_results.append(("Health Check", "⚠️ WARN", f"Status: {health['status']}"))

        except Exception as e:
            test_results.append(("Health Check", "❌ FAIL", str(e)))

        progress.update(task, completed=True)

    # Display results
    table = Table(title="Test Results")
    table.add_column("Test", style="cyan")
    table.add_column("Result", style="bold")
    table.add_column("Details")

    for test_name, result, details in test_results:
        table.add_row(test_name, result, details)

    console.print("\n")
    console.print(table)

    # Summary
    passed = sum(1 for _, result, _ in test_results if "✅" in result)
    total = len(test_results)

    if passed == total:
        console.print(f"\n🎉 [bold green]All {total} tests passed![/bold green]")
    else:
        console.print(f"\n⚠️ [bold yellow]{passed}/{total} tests passed[/bold yellow]")

    # Show debug info if requested
    if debug:
        console.print("\n[bold blue]Debug Information:[/bold blue]")
        try:
            error_summary = error_handler.get_error_summary()
            if error_summary["total_errors"] > 0:
                console.print(f"Total errors encountered: {error_summary['total_errors']}")
                console.print("Recent errors:", style="red")
                for error in error_summary["recent_errors"]:
                    console.print(f"  - {error['message']}")
        except:
            pass

async def _speak_text(agent: str, text: str, streaming: bool, play_audio: bool, debug: bool):
    """Synthesize and optionally play text"""

    console.print(f"\n🎙️ [bold blue]Synthesizing speech with {agent}[/bold blue]")

    try:
        # Setup
        config = VoiceConfig.from_env()
        logger = config.setup_logging()
        error_handler = initialize_error_handler(logger, debug)
        orchestrator = VoiceOrchestrator(config)

        # Synthesis
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:

            task = progress.add_task(f"Synthesizing with {agent}...", total=None)

            start_time = time.time()
            response = await orchestrator.synthesize_speech(agent, text, streaming=streaming)
            duration = time.time() - start_time

            progress.update(task, completed=True)

        # Results
        if response.success:
            console.print(f"✅ [green]Success![/green]")
            console.print(f"Duration: {duration:.2f}s")
            console.print(f"Audio size: {len(response.audio_data)} bytes")
            console.print(f"Agent: {response.agent_name}")

            if play_audio and response.audio_data:
                console.print("🔊 Playing audio...")
                try:
                    # Save temporary file and play
                    import tempfile
                    import os
                    import subprocess

                    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f:
                        f.write(response.audio_data)
                        temp_file = f.name

                    # Try to play with system audio player
                    if sys.platform == "darwin":  # macOS
                        subprocess.run(["afplay", temp_file])
                    elif sys.platform == "linux":
                        subprocess.run(["aplay", temp_file])
                    elif sys.platform == "win32":
                        os.startfile(temp_file)

                    # Clean up
                    os.unlink(temp_file)

                except Exception as e:
                    console.print(f"❌ Could not play audio: {e}", style="red")
        else:
            console.print(f"❌ [red]Failed: {response.error}[/red]")

    except Exception as e:
        console.print(f"❌ [red]Error: {e}[/red]")
        if debug:
            import traceback
            console.print(traceback.format_exc(), style="red")

async def _health_check(debug: bool):
    """Check system health"""

    console.print("\n🏥 [bold blue]System Health Check[/bold blue]")

    try:
        config = VoiceConfig.from_env()
        logger = config.setup_logging()
        error_handler = initialize_error_handler(logger, debug)
        orchestrator = VoiceOrchestrator(config)

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:

            task = progress.add_task("Checking system health...", total=None)
            health = await orchestrator.health_check()
            progress.update(task, completed=True)

        # Display health status
        if health["status"] == "healthy":
            status_color = "green"
            status_icon = "✅"
        elif health["status"] == "degraded":
            status_color = "yellow"
            status_icon = "⚠️"
        else:
            status_color = "red"
            status_icon = "❌"

        console.print(f"\n{status_icon} Overall Status: [{status_color}]{health['status'].upper()}[/{status_color}]")

        # Services
        if health.get("services"):
            console.print("\n[bold]Services:[/bold]")
            for service, status in health["services"].items():
                icon = "✅" if status == "healthy" else "❌"
                console.print(f"  {icon} {service}: {status}")

        # Agents
        if health.get("agents"):
            console.print("\n[bold]Voice Agents:[/bold]")
            for agent_id, agent_status in health["agents"].items():
                icon = "✅" if agent_status.get("healthy") else "❌"
                name = agent_status.get("name", agent_id)
                console.print(f"  {icon} {name} ({agent_id})")

                if debug and not agent_status.get("healthy"):
                    console.print(f"      Error: {agent_status.get('error', 'Unknown')}", style="red")

        # Errors
        if health.get("errors") and health["errors"]["total_errors"] > 0:
            console.print(f"\n[bold yellow]Recent Errors: {health['errors']['total_errors']}[/bold yellow]")
            if debug:
                for error in health["errors"]["recent_errors"]:
                    console.print(f"  - {error['message']}", style="red")

    except Exception as e:
        console.print(f"❌ [red]Health check failed: {e}[/red]")

def _check_configuration(debug: bool):
    """Validate configuration"""

    console.print("\n⚙️ [bold blue]Configuration Validation[/bold blue]")

    try:
        config = VoiceConfig.from_env()
        validation = config.validate_configuration()

        if validation["valid"]:
            console.print("✅ [green]Configuration is valid[/green]")
        else:
            console.print("❌ [red]Configuration has errors[/red]")

            for error in validation["errors"]:
                console.print(f"  • {error}", style="red")

        if validation["warnings"]:
            console.print("\n⚠️ [yellow]Warnings:[/yellow]")
            for warning in validation["warnings"]:
                console.print(f"  • {warning}", style="yellow")

        if validation["info"]:
            console.print("\nℹ️ [blue]Information:[/blue]")
            for info in validation["info"]:
                console.print(f"  • {info}", style="blue")

        if debug:
            console.print("\n[bold]Configuration Details:[/bold]")

            # Mask sensitive information
            config_dict = config.dict()
            if "elevenlabs" in config_dict and "api_key" in config_dict["elevenlabs"]:
                config_dict["elevenlabs"]["api_key"] = config_dict["elevenlabs"]["api_key"][:10] + "..."

            syntax = Syntax(json.dumps(config_dict, indent=2), "json")
            console.print(syntax)

    except Exception as e:
        console.print(f"❌ [red]Configuration error: {e}[/red]")

async def _interactive_session(debug: bool):
    """Start interactive voice session"""

    console.print("\n🎙️ [bold blue]Interactive Voice Session[/bold blue]")
    console.print("Type 'quit' to exit, 'help' for commands")

    try:
        config = VoiceConfig.from_env()
        logger = config.setup_logging()
        error_handler = initialize_error_handler(logger, debug)
        orchestrator = VoiceOrchestrator(config)

        agents = await orchestrator.get_available_agents()
        current_agent = "natasha"

        console.print(f"\nAvailable agents: {', '.join(agents.keys())}")
        console.print(f"Current agent: {current_agent}")

        while True:
            try:
                command = console.input("\n[bold cyan]> [/bold cyan]").strip()

                if command.lower() in ["quit", "exit", "q"]:
                    break
                elif command.lower() == "help":
                    console.print("""
Commands:
  speak <text>     - Synthesize speech
  agent <name>     - Switch agent (natasha/marcus)
  health          - Check system health
  streaming <text> - Use streaming synthesis
  quit            - Exit
""")
                elif command.startswith("agent "):
                    new_agent = command[6:].strip()
                    if new_agent in agents:
                        current_agent = new_agent
                        console.print(f"Switched to {current_agent}")
                    else:
                        console.print(f"Unknown agent. Available: {', '.join(agents.keys())}")

                elif command == "health":
                    health = await orchestrator.health_check()
                    console.print(f"Status: {health['status']}")

                elif command.startswith("speak "):
                    text = command[6:].strip()
                    if text:
                        response = await orchestrator.synthesize_speech(current_agent, text)
                        if response.success:
                            console.print(f"✅ Synthesized {len(response.audio_data)} bytes")
                        else:
                            console.print(f"❌ {response.error}", style="red")

                elif command.startswith("streaming "):
                    text = command[10:].strip()
                    if text:
                        response = await orchestrator.synthesize_speech(current_agent, text, streaming=True)
                        if response.success:
                            console.print(f"✅ Streamed {len(response.audio_data)} bytes")
                        else:
                            console.print(f"❌ {response.error}", style="red")

                elif command:
                    console.print("Unknown command. Type 'help' for available commands.")

            except KeyboardInterrupt:
                break
            except Exception as e:
                console.print(f"❌ Error: {e}", style="red")

        console.print("\nGoodbye! 👋")

    except Exception as e:
        console.print(f"❌ [red]Session error: {e}[/red]")

def main():
    """Main CLI entry point"""
    try:
        cli()
    except KeyboardInterrupt:
        console.print("\n\nExiting... 👋")
        sys.exit(0)
    except Exception as e:
        console.print(f"❌ [red]Fatal error: {e}[/red]")
        sys.exit(1)

if __name__ == "__main__":
    main()