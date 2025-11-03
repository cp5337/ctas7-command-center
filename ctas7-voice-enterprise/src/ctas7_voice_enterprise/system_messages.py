"""
CTAS-7 System Startup Messages for Natasha Volkov
Strategic AI persona system initialization and status announcements
"""

import asyncio
import time
from typing import Dict, List, Optional
from dataclasses import dataclass
import structlog

from .agents import NatashaVolkovAgent, MarcusChenAgent
from .config import VoiceConfig

@dataclass
class SystemStatus:
    """Current system status for voice announcements"""
    timestamp: float
    services_online: List[str]
    services_pending: List[str]
    services_failed: List[str]
    overall_health: str  # "optimal", "degraded", "critical"
    mission_status: str

class NatashaSystemMessages:
    """Natasha's system startup and status announcements"""

    def __init__(self, natasha_agent: NatashaVolkovAgent):
        self.natasha = natasha_agent
        self.logger = structlog.get_logger("natasha_system_messages")

        # System message templates with Natasha's personality
        self.startup_messages = {
            "system_initialization": [
                "CTAS-7 tactical systems initializing... Natasha Volkov assuming operational command.",
                "All units, this is Natasha. Beginning strategic system deployment sequence.",
                "Command authority established. Initiating comprehensive system architecture activation."
            ],
            "services_coming_online": [
                "Core services establishing operational status... Monitoring deployment progression.",
                "Strategic systems achieving readiness state. Verifying mission-critical components.",
                "Infrastructure deployment proceeding according to tactical parameters."
            ],
            "voice_system_ready": [
                "Voice communication systems fully operational. Natasha Volkov standing by for mission directives.",
                "Strategic communication protocols active. Ready to coordinate tactical operations.",
                "Command voice interface established. All channels operational and secure."
            ],
            "abe_integration": [
                "Automated Business Environment systems online. Document analysis capabilities ready.",
                "ABE platform operational. Strategic document processing and intelligence analysis active.",
                "Business intelligence systems integrated. Ready for mission-critical data analysis."
            ],
            "full_operational": [
                "All systems operational. CTAS-7 platform ready for strategic deployment.",
                "Mission readiness achieved. Standing by for operational directives.",
                "Command structure fully established. Ready to execute tactical objectives."
            ]
        }

        self.status_messages = {
            "optimal": [
                "All strategic systems operating at optimal efficiency.",
                "Platform status: mission-ready. No tactical concerns detected.",
                "Operational excellence maintained across all command systems."
            ],
            "degraded": [
                "Minor system irregularities detected. Implementing corrective measures.",
                "Operational capacity maintained. Monitoring system performance parameters.",
                "Strategic systems functional with minor efficiency reduction."
            ],
            "critical": [
                "Critical system alerts detected. Immediate tactical intervention required.",
                "Mission-critical systems experiencing operational difficulties.",
                "Emergency protocols engaged. Requesting immediate technical support."
            ]
        }

    async def announce_system_startup(self, system_status: SystemStatus) -> Dict[str, any]:
        """Natasha announces system startup sequence"""

        messages = []

        # 1. Initial system announcement
        init_message = self._select_message("system_initialization")
        init_response = await self.natasha.synthesize_with_personality(
            init_message,
            session_id="system_startup",
            context={"announcement_type": "system_initialization"}
        )
        messages.append(("initialization", init_response))

        # Small pause for dramatic effect
        await asyncio.sleep(2)

        # 2. Services status announcement
        if system_status.services_online:
            services_message = self._create_services_message(system_status)
            services_response = await self.natasha.synthesize_with_personality(
                services_message,
                session_id="system_startup",
                context={"announcement_type": "services_status", "services": system_status.services_online}
            )
            messages.append(("services", services_response))

        await asyncio.sleep(1.5)

        # 3. Voice system ready
        voice_message = self._select_message("voice_system_ready")
        voice_response = await self.natasha.synthesize_with_personality(
            voice_message,
            session_id="system_startup",
            context={"announcement_type": "voice_ready"}
        )
        messages.append(("voice_ready", voice_response))

        await asyncio.sleep(1)

        # 4. ABE integration status
        if "abe" in [s.lower() for s in system_status.services_online]:
            abe_message = self._select_message("abe_integration")
            abe_response = await self.natasha.synthesize_with_personality(
                abe_message,
                session_id="system_startup",
                context={"announcement_type": "abe_integration"}
            )
            messages.append(("abe_ready", abe_response))

        await asyncio.sleep(1)

        # 5. Final operational status
        final_message = self._select_message("full_operational")
        final_response = await self.natasha.synthesize_with_personality(
            final_message,
            session_id="system_startup",
            context={"announcement_type": "operational_ready"}
        )
        messages.append(("operational", final_response))

        self.logger.info("Natasha system startup sequence completed",
                        messages_count=len(messages),
                        system_health=system_status.overall_health)

        return {
            "startup_sequence": messages,
            "system_status": system_status,
            "total_messages": len(messages),
            "completion_time": time.time()
        }

    async def announce_status_update(self, system_status: SystemStatus) -> Dict[str, any]:
        """Natasha announces periodic status updates"""

        status_message = self._select_message(system_status.overall_health, "status_messages")

        # Add specific service information
        if system_status.services_failed:
            status_message += f" Critical systems requiring attention: {', '.join(system_status.services_failed)}."
        elif system_status.services_pending:
            status_message += f" Systems in deployment phase: {', '.join(system_status.services_pending)}."

        response = await self.natasha.synthesize_with_personality(
            status_message,
            session_id="status_update",
            context={
                "announcement_type": "status_update",
                "system_health": system_status.overall_health,
                "services_status": {
                    "online": system_status.services_online,
                    "pending": system_status.services_pending,
                    "failed": system_status.services_failed
                }
            }
        )

        return {
            "status_announcement": response,
            "system_status": system_status,
            "announcement_time": time.time()
        }

    async def announce_mission_update(self, mission_context: str, priority: str = "normal") -> Dict[str, any]:
        """Natasha announces mission-related updates"""

        # Mission announcement with tactical context
        mission_templates = {
            "normal": f"Mission update: {mission_context}. Proceeding with tactical objectives.",
            "high": f"Priority mission directive: {mission_context}. Immediate strategic action required.",
            "critical": f"Critical mission alert: {mission_context}. All units respond immediately."
        }

        message = mission_templates.get(priority, mission_templates["normal"])

        response = await self.natasha.synthesize_with_personality(
            message,
            session_id="mission_update",
            context={
                "announcement_type": "mission_update",
                "priority": priority,
                "mission_context": mission_context
            }
        )

        return {
            "mission_announcement": response,
            "priority": priority,
            "context": mission_context,
            "announcement_time": time.time()
        }

    def _select_message(self, category: str, message_group: str = "startup_messages") -> str:
        """Select appropriate message from category"""
        messages = getattr(self, message_group, {}).get(category, [])
        if not messages:
            return f"System {category} status update."

        # Use timestamp to vary message selection
        selection_index = int(time.time()) % len(messages)
        return messages[selection_index]

    def _create_services_message(self, system_status: SystemStatus) -> str:
        """Create dynamic services status message"""

        online_count = len(system_status.services_online)
        pending_count = len(system_status.services_pending)

        if online_count > 0:
            base_message = f"{online_count} strategic systems now operational."

            # Add specific critical services
            critical_services = ["ABE", "Database", "Voice", "MCP", "Command Center"]
            online_critical = [s for s in system_status.services_online if any(crit in s for crit in critical_services)]

            if online_critical:
                base_message += f" Mission-critical components active: {', '.join(online_critical[:3])}."

            if pending_count > 0:
                base_message += f" {pending_count} additional systems deploying."

            return base_message
        else:
            return "Strategic system deployment in progress. Monitoring operational readiness."

# Marcus system messages for technical announcements
class MarcusSystemMessages:
    """Marcus's technical system announcements"""

    def __init__(self, marcus_agent: MarcusChenAgent):
        self.marcus = marcus_agent
        self.logger = structlog.get_logger("marcus_system_messages")

    async def announce_technical_status(self, technical_metrics: Dict[str, any]) -> Dict[str, any]:
        """Marcus provides technical system analysis"""

        # Technical status templates
        cpu_usage = technical_metrics.get("cpu_usage", 0)
        memory_usage = technical_metrics.get("memory_usage", 0)
        network_status = technical_metrics.get("network_latency", "optimal")

        technical_message = f"""
        Technical analysis: System performance within operational parameters.
        CPU utilization: {cpu_usage}%. Memory allocation: {memory_usage}%.
        Network performance: {network_status}. All technical systems stable.
        """

        response = await self.marcus.synthesize_with_personality(
            technical_message.strip(),
            session_id="technical_status",
            context={
                "announcement_type": "technical_analysis",
                "metrics": technical_metrics
            }
        )

        return {
            "technical_announcement": response,
            "metrics": technical_metrics,
            "analysis_time": time.time()
        }

# Factory for system message coordinators
class SystemMessageCoordinator:
    """Coordinates system messages between Natasha and Marcus"""

    def __init__(self, config: VoiceConfig):
        self.config = config
        self.natasha_messages = None
        self.marcus_messages = None
        self.logger = structlog.get_logger("system_coordinator")

    async def initialize_agents(self, natasha_agent: NatashaVolkovAgent, marcus_agent: MarcusChenAgent):
        """Initialize message coordinators with voice agents"""
        self.natasha_messages = NatashaSystemMessages(natasha_agent)
        self.marcus_messages = MarcusSystemMessages(marcus_agent)

        self.logger.info("System message coordinators initialized")

    async def full_startup_sequence(self, system_status: SystemStatus) -> Dict[str, any]:
        """Execute complete startup sequence with both agents"""

        if not self.natasha_messages:
            raise ValueError("Agents not initialized. Call initialize_agents() first.")

        # Natasha handles strategic announcements
        natasha_sequence = await self.natasha_messages.announce_system_startup(system_status)

        # Marcus provides technical followup
        technical_metrics = {
            "cpu_usage": 25,  # Example metrics
            "memory_usage": 45,
            "network_latency": "optimal",
            "services_healthy": len(system_status.services_online)
        }

        marcus_technical = await self.marcus_messages.announce_technical_status(technical_metrics)

        return {
            "startup_complete": True,
            "natasha_sequence": natasha_sequence,
            "marcus_technical": marcus_technical,
            "coordination_time": time.time()
        }