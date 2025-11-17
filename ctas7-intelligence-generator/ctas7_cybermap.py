#!/usr/bin/env python3
"""
CTAS7 Cybermap - Real-time Cybersecurity Threat Visualization
Kaspersky-style cybermap using Mapbox for geographic threat visualization
"""

import asyncio
import json
import os
import time
import random
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
import requests
import threading
from dataclasses import dataclass, asdict
from flask import Flask, render_template, jsonify, send_from_directory, request
from flask_socketio import SocketIO, emit

# Load environment variables
def load_env_file():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

load_env_file()

@dataclass
class ThreatEvent:
    """Real-time threat event for cybermap"""
    id: str
    timestamp: str
    source_country: str
    source_coords: List[float]
    target_country: str
    target_coords: List[float]
    threat_type: str
    severity: str
    confidence: float
    source_ip: str
    target_ip: str
    attack_vector: str
    malware_family: Optional[str] = None
    campaign_name: Optional[str] = None
    ttl: int = 30  # Time to live in seconds

@dataclass
class ThreatStatistics:
    """Global threat statistics"""
    total_attacks_24h: int
    active_threats: int
    countries_affected: int
    top_attack_types: List[Dict[str, Any]]
    top_source_countries: List[Dict[str, Any]]
    top_target_countries: List[Dict[str, Any]]

class CTAS7Cybermap:
    """Real-time cybersecurity threat visualization system"""

    def __init__(self):
        self.app = Flask(__name__, template_folder='templates', static_folder='static')
        self.app.config['SECRET_KEY'] = 'ctas7-cybermap-secret'
        self.socketio = SocketIO(self.app, cors_allowed_origins="*")

        self.mapbox_token = os.getenv("VITE_MAPBOX_TOKEN")
        self.virustotal_key = os.getenv("VIRUSTOTAL_API_KEY")
        self.otx_key = os.getenv("ALIENVAULT_OTX_API_KEY")

        # Active threats storage
        self.active_threats: Dict[str, ThreatEvent] = {}
        self.threat_history: List[ThreatEvent] = []
        self.statistics = ThreatStatistics(0, 0, 0, [], [], [])

        # Geographic data
        self.country_coords = {
            "US": [39.8283, -98.5795], "CN": [35.8617, 104.1954], "RU": [61.5240, 105.3188],
            "DE": [51.1657, 10.4515], "GB": [55.3781, -3.4360], "FR": [46.6034, 1.8883],
            "JP": [36.2048, 138.2529], "KR": [35.9078, 127.7669], "IN": [20.5937, 78.9629],
            "BR": [-14.2350, -51.9253], "CA": [56.1304, -106.3468], "AU": [-25.2744, 133.7751],
            "IT": [41.8719, 12.5674], "ES": [40.4637, -3.7492], "NL": [52.1326, 5.2913],
            "PL": [51.9194, 19.1451], "TR": [38.9637, 35.2433], "IR": [32.4279, 53.6880],
            "KP": [40.3399, 127.5101], "UA": [48.3794, 31.1656], "IL": [31.0461, 34.8516]
        }

        # Setup routes and background tasks
        self.setup_routes()
        self.setup_socketio_events()

        # Start background threat generation
        self.running = True
        self.threat_thread = threading.Thread(target=self._threat_generator_loop, daemon=True)
        self.cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)

    def setup_routes(self):
        """Setup Flask routes"""

        @self.app.route('/')
        def index():
            return render_template('cybermap.html', mapbox_token=self.mapbox_token)

        @self.app.route('/api/threats')
        def get_threats():
            """Get current active threats"""
            return jsonify({
                'threats': [asdict(threat) for threat in self.active_threats.values()],
                'count': len(self.active_threats)
            })

        @self.app.route('/api/statistics')
        def get_statistics():
            """Get threat statistics"""
            return jsonify(asdict(self.statistics))

        @self.app.route('/api/config')
        def get_config():
            """Get map configuration"""
            return jsonify({
                'mapbox_token': self.mapbox_token,
                'center': [20.0, 0.0],  # World center
                'zoom': 2,
                'style': 'mapbox://styles/mapbox/dark-v10'
            })

    def setup_socketio_events(self):
        """Setup WebSocket events"""

        @self.socketio.on('connect')
        def handle_connect():
            print(f"🔗 Client connected: {request.sid}")
            # Send current threats to new client
            emit('threats_update', {
                'threats': [asdict(threat) for threat in self.active_threats.values()],
                'statistics': asdict(self.statistics)
            })

        @self.socketio.on('disconnect')
        def handle_disconnect():
            print(f"❌ Client disconnected: {request.sid}")

    async def get_real_threat_intel(self) -> List[Dict[str, Any]]:
        """Get real threat intelligence from configured APIs"""
        threats = []

        try:
            # VirusTotal recent files
            if self.virustotal_key and 'get_free_key' not in self.virustotal_key:
                headers = {'x-apikey': self.virustotal_key}

                # Get recent submissions (last hour)
                response = requests.get(
                    "https://www.virustotal.com/api/v3/intelligence/search",
                    headers=headers,
                    params={'query': 'type:file positives:5+', 'limit': 10},
                    timeout=10
                )

                if response.status_code == 200:
                    data = response.json()
                    for item in data.get('data', []):
                        attrs = item.get('attributes', {})
                        stats = attrs.get('last_analysis_stats', {})

                        if stats.get('malicious', 0) >= 5:
                            threats.append({
                                'source': 'virustotal',
                                'type': 'malware_detection',
                                'severity': 'high' if stats.get('malicious', 0) >= 10 else 'medium',
                                'confidence': min(stats.get('malicious', 0) / 20.0, 1.0),
                                'details': {
                                    'sha256': attrs.get('sha256'),
                                    'detections': stats.get('malicious', 0),
                                    'family': attrs.get('popular_threat_classification', {}).get('suggested_threat_label')
                                }
                            })

            # OTX pulses
            if self.otx_key and 'get_free_key' not in self.otx_key:
                headers = {'X-OTX-API-KEY': self.otx_key}

                response = requests.get(
                    "https://otx.alienvault.com/api/v1/pulses/subscribed",
                    headers=headers,
                    params={'limit': 10, 'modified_since': (datetime.now() - timedelta(hours=1)).isoformat()},
                    timeout=10
                )

                if response.status_code == 200:
                    data = response.json()
                    for pulse in data.get('results', []):
                        threats.append({
                            'source': 'otx',
                            'type': 'threat_intelligence',
                            'severity': 'high' if 'apt' in pulse.get('name', '').lower() else 'medium',
                            'confidence': 0.8,
                            'details': {
                                'pulse_name': pulse.get('name'),
                                'description': pulse.get('description'),
                                'indicators': len(pulse.get('indicators', []))
                            }
                        })

        except Exception as e:
            print(f"⚠️  Error fetching real threat intel: {e}")

        return threats

    def generate_synthetic_threat(self) -> ThreatEvent:
        """Generate realistic synthetic threat event"""

        # Common attack patterns
        attack_vectors = [
            "phishing", "malware", "ransomware", "apt", "botnet",
            "ddos", "credential_stuffing", "sql_injection", "xss", "rce"
        ]

        threat_types = [
            "trojan", "backdoor", "spyware", "adware", "rootkit",
            "worm", "virus", "cryptominer", "infostealer", "rat"
        ]

        # Realistic source/target patterns
        high_risk_sources = ["CN", "RU", "KP", "IR"]
        common_targets = ["US", "GB", "DE", "FR", "JP", "KR", "AU", "CA"]

        source_country = random.choice(high_risk_sources + list(self.country_coords.keys()))
        target_country = random.choice(common_targets)

        # Ensure different source and target
        while target_country == source_country:
            target_country = random.choice(list(self.country_coords.keys()))

        threat_id = f"threat_{int(time.time())}_{random.randint(1000, 9999)}"

        # Add some geographic jitter
        source_coords = [
            self.country_coords[source_country][0] + random.uniform(-2, 2),
            self.country_coords[source_country][1] + random.uniform(-2, 2)
        ]
        target_coords = [
            self.country_coords[target_country][0] + random.uniform(-2, 2),
            self.country_coords[target_country][1] + random.uniform(-2, 2)
        ]

        return ThreatEvent(
            id=threat_id,
            timestamp=datetime.now().isoformat(),
            source_country=source_country,
            source_coords=source_coords,
            target_country=target_country,
            target_coords=target_coords,
            threat_type=random.choice(threat_types),
            severity=random.choice(["low", "medium", "high", "critical"]),
            confidence=random.uniform(0.6, 0.95),
            source_ip=f"{random.randint(1,223)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
            target_ip=f"{random.randint(1,223)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
            attack_vector=random.choice(attack_vectors),
            malware_family=random.choice(["APT1", "Lazarus", "FancyBear", "Carbanak", "Silence", None]),
            campaign_name=random.choice(["Operation Aurora", "Stuxnet", "SolarWinds", None])
        )

    def update_statistics(self):
        """Update global threat statistics"""
        now = datetime.now()
        last_24h = now - timedelta(hours=24)

        # Count threats from last 24 hours
        recent_threats = [t for t in self.threat_history
                         if datetime.fromisoformat(t.timestamp.replace('Z', '+00:00').replace('+00:00', '')) > last_24h]

        # Attack type statistics
        attack_types = {}
        source_countries = {}
        target_countries = {}

        for threat in recent_threats:
            # Attack types
            if threat.threat_type in attack_types:
                attack_types[threat.threat_type] += 1
            else:
                attack_types[threat.threat_type] = 1

            # Source countries
            if threat.source_country in source_countries:
                source_countries[threat.source_country] += 1
            else:
                source_countries[threat.source_country] = 1

            # Target countries
            if threat.target_country in target_countries:
                target_countries[threat.target_country] += 1
            else:
                target_countries[threat.target_country] = 1

        # Top 5 lists
        top_attack_types = [{"name": k, "count": v} for k, v in
                           sorted(attack_types.items(), key=lambda x: x[1], reverse=True)[:5]]
        top_source_countries = [{"country": k, "count": v} for k, v in
                               sorted(source_countries.items(), key=lambda x: x[1], reverse=True)[:5]]
        top_target_countries = [{"country": k, "count": v} for k, v in
                               sorted(target_countries.items(), key=lambda x: x[1], reverse=True)[:5]]

        self.statistics = ThreatStatistics(
            total_attacks_24h=len(recent_threats),
            active_threats=len(self.active_threats),
            countries_affected=len(set([t.source_country for t in recent_threats] +
                                      [t.target_country for t in recent_threats])),
            top_attack_types=top_attack_types,
            top_source_countries=top_source_countries,
            top_target_countries=top_target_countries
        )

    def _threat_generator_loop(self):
        """Background thread for generating threats"""
        while self.running:
            try:
                # Generate new threat
                threat = self.generate_synthetic_threat()
                self.active_threats[threat.id] = threat
                self.threat_history.append(threat)

                # Keep history manageable
                if len(self.threat_history) > 10000:
                    self.threat_history = self.threat_history[-5000:]

                # Update statistics
                self.update_statistics()

                # Emit to connected clients
                self.socketio.emit('new_threat', {
                    'threat': asdict(threat),
                    'statistics': asdict(self.statistics)
                })

                # Random delay between threats (1-5 seconds)
                time.sleep(random.uniform(1, 5))

            except Exception as e:
                print(f"⚠️  Error in threat generator: {e}")
                time.sleep(5)

    def _cleanup_loop(self):
        """Background thread for cleaning up expired threats"""
        while self.running:
            try:
                now = time.time()
                expired_threats = []

                for threat_id, threat in self.active_threats.items():
                    threat_time = datetime.fromisoformat(threat.timestamp.replace('Z', '+00:00').replace('+00:00', '')).timestamp()
                    if now - threat_time > threat.ttl:
                        expired_threats.append(threat_id)

                # Remove expired threats
                for threat_id in expired_threats:
                    del self.active_threats[threat_id]

                if expired_threats:
                    self.socketio.emit('threats_cleanup', {'removed': expired_threats})

                time.sleep(5)  # Check every 5 seconds

            except Exception as e:
                print(f"⚠️  Error in cleanup: {e}")
                time.sleep(10)

    def start_server(self, host='127.0.0.1', port=5000, debug=False):
        """Start the cybermap server"""
        print(f"🚀 Starting CTAS7 Cybermap server...")
        print(f"🌐 URL: http://{host}:{port}")
        print(f"🗺️  Mapbox: {'✅ Configured' if self.mapbox_token and 'your_mapbox' not in self.mapbox_token else '❌ Configure VITE_MAPBOX_TOKEN'}")

        # Start background threads
        self.threat_thread.start()
        self.cleanup_thread.start()

        try:
            self.socketio.run(self.app, host=host, port=port, debug=debug)
        except KeyboardInterrupt:
            print("\n🛑 Shutting down CTAS7 Cybermap...")
            self.running = False

def main():
    """Launch CTAS7 Cybermap"""
    cybermap = CTAS7Cybermap()
    cybermap.start_server(host='0.0.0.0', port=5000, debug=False)

if __name__ == "__main__":
    main()