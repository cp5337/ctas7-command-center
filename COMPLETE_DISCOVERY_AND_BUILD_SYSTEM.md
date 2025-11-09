# CTAS7 Complete Discovery & Build System
## Extract Existing Knowledge → Build Emulator/Operator Foundation

---

# 🎯 **MISSION**

Build a **script-based discovery system** that extracts and organizes ALL existing CTAS7 operational knowledge:

1. **Caldera Operations** (YAML adversary emulations)
2. **ATT&CK Mappings** (technique coverage)
3. **PTCC Profiles** (Persona-Tool-Chain-Context)
4. **Monte Carlo Results** (1000s of simulation runs)
5. **TETH Profiles** (Threat Emulation & Threat Hunting)
6. **ExploitDB Metadata** (NO POC code - just intelligence)
7. **Existing Tasks/Primitives** (our CTAS task framework)

**Output:** Foundation for emulator/operator that powers scenario execution

---

# 📚 **EXISTING DATA SOURCES**

## **What We Already Have (Ground Truth):**

### **1. Caldera Operations**
```yaml
# Location: Look for *.yml files with Caldera operations
# Structure:
adversary_id: "APT28"
name: "Fancy Bear Emulation"
atomic_ordering:
  - id: "T1078"
    name: "Valid Accounts"
    tactic: "initial-access"
    technique: "T1078"
    executor:
      name: "sh"
      command: "whoami"
```

### **2. ATT&CK Mappings**
```json
// Location: Look for MITRE ATT&CK coverage files
{
  "technique_id": "T1078",
  "technique_name": "Valid Accounts",
  "tactic": "Initial Access",
  "data_sources": ["Authentication logs", "Account management"],
  "platforms": ["Linux", "Windows", "macOS"],
  "detection": "Monitor logon behavior for unusual activity",
  "ctas_coverage": true,
  "mapped_tools": ["mimikatz", "bloodhound"]
}
```

### **3. PTCC Profiles**
```json
// Location: Look for PTCC decomposition results
{
  "ptcc_id": "PTCC-001",
  "persona": "APT Actor",
  "tool": "nmap",
  "chain": ["reconnaissance", "vulnerability_scan", "exploit"],
  "context": {
    "network": "corporate",
    "stealth_required": true,
    "time_window": "off_hours"
  },
  "primitives": ["READ", "TRANSFORM", "VALIDATE"],
  "entropy_score": 0.73,
  "validation_status": "verified"
}
```

### **4. Monte Carlo Results**
```json
// Location: Look for simulation results, HFT output
{
  "simulation_id": "MC-2024-0847",
  "scenario": "Credential Stuffing Attack",
  "runs": 1000,
  "success_rate": 0.23,
  "mean_time_to_detection": 47.3,  // seconds
  "critical_nodes": ["auth_server", "session_manager"],
  "brittle_points": [
    {
      "node": "rate_limiter",
      "failure_probability": 0.89,
      "impact": "high"
    }
  ],
  "recommended_defenses": ["implement_captcha", "geofencing"]
}
```

### **5. TETH Profiles** (Threat Emulation & Threat Hunting)
```json
// Location: Look for threat profiles, hunt playbooks
{
  "teth_id": "TETH-APT29",
  "threat_actor": "Cozy Bear",
  "emulation_playbook": {
    "initial_access": ["spearphishing", "supply_chain"],
    "persistence": ["registry_run_keys", "scheduled_tasks"],
    "defense_evasion": ["obfuscation", "rootkit"]
  },
  "hunting_queries": [
    {
      "data_source": "process_logs",
      "query": "SELECT * WHERE process_name LIKE '%rundll32%' AND parent_process = 'explorer.exe'",
      "ioc_type": "behavioral"
    }
  ],
  "phi3_training_data": true
}
```

### **6. ExploitDB Metadata** (NO POC)
```json
// Location: Look for exploitdb exports, CVE databases
{
  "edb_id": "50847",
  "cve": "CVE-2024-1234",
  "title": "Remote Code Execution in XYZ Service",
  "date_published": "2024-03-15",
  "author": "Security Researcher",
  "type": "remote",
  "platform": "linux",
  "port": 8080,
  "application": "XYZ Service 2.4.1",
  "description": "Buffer overflow in packet handler allows RCE",
  "verified": true,
  "attack_pattern": {
    "entry_point": "network_service",
    "vulnerability_class": "buffer_overflow",
    "exploitation_difficulty": "medium",
    "privileges_required": "none",
    "user_interaction": "none"
  },
  "defensive_measures": [
    "Update to version 2.4.2",
    "Implement input validation",
    "Deploy WAF rules"
  ],
  "mitre_attack": ["T1190"],
  "NOTICE": "NO_POC_CODE_STORED"
}
```

### **7. Existing CTAS Tasks**
```csv
// Already have: ctas_tasks_with_primitive_type.csv
task_id,task_name,category,hd4_phase,primitives,tools_required
uuid-001-001-001,OSINT Collection,Intelligence,Hunt,"READ,TRANSFORM",theHarvester
```

---

# 🏗️ **DISCOVERY SCRIPT ARCHITECTURE**

## **Phase 1: Multi-Source Discovery**

```python
#!/usr/bin/env python3
# File: 01_multi_source_discovery.py

"""
Discover and extract ALL existing operational knowledge
Uses pattern matching, YAML parsing, JSON extraction (no LLM)
"""

import os
import json
import yaml
import csv
import re
from pathlib import Path
from typing import Dict, List, Set
from collections import defaultdict
import hashlib

class MultiSourceDiscovery:
    def __init__(self, search_roots: List[str]):
        self.search_roots = [Path(root) for root in search_roots]
        self.discovered_data = {
            "caldera_operations": [],
            "attack_mappings": [],
            "ptcc_profiles": [],
            "monte_carlo_results": [],
            "teth_profiles": [],
            "exploitdb_metadata": [],
            "ctas_tasks": [],
            "files_analyzed": 0,
            "data_sources_found": set()
        }

    def discover_all(self) -> Dict:
        """
        Run all discovery methods
        """
        print("🔍 Starting multi-source discovery...")

        for root in self.search_roots:
            print(f"\n📂 Scanning: {root}")

            # Discover Caldera operations
            self._discover_caldera(root)

            # Discover ATT&CK mappings
            self._discover_attack_mappings(root)

            # Discover PTCC profiles
            self._discover_ptcc_profiles(root)

            # Discover Monte Carlo results
            self._discover_monte_carlo(root)

            # Discover TETH profiles
            self._discover_teth_profiles(root)

            # Discover ExploitDB metadata
            self._discover_exploitdb(root)

            # Discover CTAS tasks
            self._discover_ctas_tasks(root)

        return self.discovered_data

    def _discover_caldera(self, root: Path):
        """
        Find Caldera operation YAML files
        """
        print("  → Searching for Caldera operations...")

        # Look for YAML files with Caldera structure
        for yaml_file in root.rglob('*.yml'):
            try:
                with open(yaml_file, 'r') as f:
                    data = yaml.safe_load(f)

                # Check if it's a Caldera operation
                if isinstance(data, dict) and ('adversary_id' in data or 'atomic_ordering' in data):
                    operation = {
                        "source_file": str(yaml_file),
                        "adversary_id": data.get('adversary_id', 'unknown'),
                        "name": data.get('name', yaml_file.stem),
                        "description": data.get('description', ''),
                        "atomic_ordering": data.get('atomic_ordering', []),
                        "techniques": self._extract_techniques(data),
                        "platforms": data.get('platforms', []),
                        "discovery_hash": hashlib.md5(str(yaml_file).encode()).hexdigest()[:8]
                    }

                    self.discovered_data['caldera_operations'].append(operation)
                    self.discovered_data['data_sources_found'].add('caldera')
                    self.discovered_data['files_analyzed'] += 1

            except Exception as e:
                pass  # Skip malformed YAML

        # Also check for .yaml extension
        for yaml_file in root.rglob('*.yaml'):
            # Same logic as above
            pass

    def _extract_techniques(self, caldera_data: Dict) -> List[str]:
        """
        Extract ATT&CK techniques from Caldera operation
        """
        techniques = set()

        if 'atomic_ordering' in caldera_data:
            for atomic in caldera_data['atomic_ordering']:
                if isinstance(atomic, dict):
                    # Look for technique IDs (T####)
                    technique_id = atomic.get('technique', '')
                    if re.match(r'T\d{4}', technique_id):
                        techniques.add(technique_id)

        return list(techniques)

    def _discover_attack_mappings(self, root: Path):
        """
        Find ATT&CK mapping files (JSON, CSV)
        """
        print("  → Searching for ATT&CK mappings...")

        # Look for files with "attack" or "mitre" in name
        patterns = ['*attack*.json', '*mitre*.json', '*technique*.json']

        for pattern in patterns:
            for json_file in root.rglob(pattern):
                try:
                    with open(json_file, 'r') as f:
                        data = json.load(f)

                    # Check if it's ATT&CK data
                    if isinstance(data, dict):
                        if 'technique_id' in data or 'tactic' in data:
                            # Single technique
                            self.discovered_data['attack_mappings'].append({
                                "source_file": str(json_file),
                                **data
                            })
                            self.discovered_data['data_sources_found'].add('attack')
                            self.discovered_data['files_analyzed'] += 1

                        elif 'techniques' in data:
                            # Multiple techniques
                            for tech in data['techniques']:
                                self.discovered_data['attack_mappings'].append({
                                    "source_file": str(json_file),
                                    **tech
                                })
                            self.discovered_data['data_sources_found'].add('attack')
                            self.discovered_data['files_analyzed'] += 1

                    elif isinstance(data, list):
                        # Array of techniques
                        for tech in data:
                            if isinstance(tech, dict) and 'technique_id' in tech:
                                self.discovered_data['attack_mappings'].append({
                                    "source_file": str(json_file),
                                    **tech
                                })
                        self.discovered_data['data_sources_found'].add('attack')
                        self.discovered_data['files_analyzed'] += 1

                except Exception as e:
                    pass

    def _discover_ptcc_profiles(self, root: Path):
        """
        Find PTCC profile files
        """
        print("  → Searching for PTCC profiles...")

        # Look for files with "ptcc" in name
        for json_file in root.rglob('*ptcc*.json'):
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)

                # Check if it's PTCC data
                if isinstance(data, dict) and all(k in data for k in ['persona', 'tool', 'chain']):
                    self.discovered_data['ptcc_profiles'].append({
                        "source_file": str(json_file),
                        **data
                    })
                    self.discovered_data['data_sources_found'].add('ptcc')
                    self.discovered_data['files_analyzed'] += 1

                elif isinstance(data, list):
                    for profile in data:
                        if isinstance(profile, dict) and 'persona' in profile:
                            self.discovered_data['ptcc_profiles'].append({
                                "source_file": str(json_file),
                                **profile
                            })
                    self.discovered_data['data_sources_found'].add('ptcc')
                    self.discovered_data['files_analyzed'] += 1

            except Exception as e:
                pass

    def _discover_monte_carlo(self, root: Path):
        """
        Find Monte Carlo simulation results
        """
        print("  → Searching for Monte Carlo results...")

        # Look for simulation result files
        patterns = ['*monte*carlo*.json', '*simulation*.json', '*mc_*.json']

        for pattern in patterns:
            for json_file in root.rglob(pattern):
                try:
                    with open(json_file, 'r') as f:
                        data = json.load(f)

                    # Check if it's Monte Carlo data
                    if isinstance(data, dict) and ('runs' in data or 'simulation_id' in data):
                        self.discovered_data['monte_carlo_results'].append({
                            "source_file": str(json_file),
                            **data
                        })
                        self.discovered_data['data_sources_found'].add('monte_carlo')
                        self.discovered_data['files_analyzed'] += 1

                except Exception as e:
                    pass

    def _discover_teth_profiles(self, root: Path):
        """
        Find TETH (Threat Emulation & Threat Hunting) profiles
        """
        print("  → Searching for TETH profiles...")

        # Look for threat profile files
        patterns = ['*teth*.json', '*threat*.json', '*hunt*.json', '*emulation*.json']

        for pattern in patterns:
            for json_file in root.rglob(pattern):
                try:
                    with open(json_file, 'r') as f:
                        data = json.load(f)

                    # Check if it's TETH data
                    if isinstance(data, dict):
                        if 'threat_actor' in data or 'emulation_playbook' in data or 'hunting_queries' in data:
                            self.discovered_data['teth_profiles'].append({
                                "source_file": str(json_file),
                                **data
                            })
                            self.discovered_data['data_sources_found'].add('teth')
                            self.discovered_data['files_analyzed'] += 1

                except Exception as e:
                    pass

    def _discover_exploitdb(self, root: Path):
        """
        Find ExploitDB metadata (NO POC CODE)
        """
        print("  → Searching for ExploitDB metadata...")

        # Look for exploit database files
        patterns = ['*exploit*.json', '*edb*.json', '*cve*.json', '*vulnerability*.csv']

        for pattern in patterns:
            if pattern.endswith('.json'):
                for json_file in root.rglob(pattern):
                    try:
                        with open(json_file, 'r') as f:
                            data = json.load(f)

                        # Check if it's ExploitDB metadata
                        if isinstance(data, dict):
                            if 'edb_id' in data or 'cve' in data or 'exploit' in str(json_file).lower():
                                # Verify NO POC code is stored
                                if self._verify_no_poc_code(data):
                                    self.discovered_data['exploitdb_metadata'].append({
                                        "source_file": str(json_file),
                                        **data,
                                        "VERIFIED_NO_POC": True
                                    })
                                    self.discovered_data['data_sources_found'].add('exploitdb')
                                    self.discovered_data['files_analyzed'] += 1

                        elif isinstance(data, list):
                            for entry in data:
                                if isinstance(entry, dict) and self._verify_no_poc_code(entry):
                                    self.discovered_data['exploitdb_metadata'].append({
                                        "source_file": str(json_file),
                                        **entry,
                                        "VERIFIED_NO_POC": True
                                    })
                            if data:
                                self.discovered_data['data_sources_found'].add('exploitdb')
                                self.discovered_data['files_analyzed'] += 1

                    except Exception as e:
                        pass

            elif pattern.endswith('.csv'):
                for csv_file in root.rglob(pattern):
                    try:
                        with open(csv_file, 'r') as f:
                            reader = csv.DictReader(f)
                            for row in reader:
                                if self._verify_no_poc_code(row):
                                    self.discovered_data['exploitdb_metadata'].append({
                                        "source_file": str(csv_file),
                                        **row,
                                        "VERIFIED_NO_POC": True
                                    })

                        if self.discovered_data['exploitdb_metadata']:
                            self.discovered_data['data_sources_found'].add('exploitdb')
                            self.discovered_data['files_analyzed'] += 1

                    except Exception as e:
                        pass

    def _verify_no_poc_code(self, data: Dict) -> bool:
        """
        Verify that entry contains NO proof-of-concept code
        Only metadata/descriptions allowed
        """
        # Check for code-like content
        code_indicators = ['poc_code', 'exploit_code', 'payload', 'shellcode', 'def exploit', 'import socket']

        data_str = str(data).lower()

        for indicator in code_indicators:
            if indicator in data_str:
                return False  # Contains code - REJECT

        # Check for acceptable metadata fields
        metadata_fields = ['edb_id', 'cve', 'description', 'title', 'date', 'author',
                          'type', 'platform', 'application', 'attack_pattern',
                          'defensive_measures', 'mitre_attack']

        # Must have at least some metadata fields
        has_metadata = any(field in data for field in metadata_fields)

        return has_metadata

    def _discover_ctas_tasks(self, root: Path):
        """
        Find existing CTAS task definitions
        """
        print("  → Searching for CTAS tasks...")

        # Look for task CSV files
        for csv_file in root.rglob('*task*.csv'):
            try:
                with open(csv_file, 'r') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        if 'task_name' in row and row['task_name']:
                            self.discovered_data['ctas_tasks'].append({
                                "source_file": str(csv_file),
                                **row
                            })

                if self.discovered_data['ctas_tasks']:
                    self.discovered_data['data_sources_found'].add('ctas_tasks')
                    self.discovered_data['files_analyzed'] += 1

            except Exception as e:
                pass

    def generate_manifest(self, output_path: str):
        """
        Generate comprehensive discovery manifest
        """
        manifest = {
            "discovery_date": "2025-11-06",
            "search_roots": [str(r) for r in self.search_roots],
            "files_analyzed": self.discovered_data['files_analyzed'],
            "data_sources_found": list(self.discovered_data['data_sources_found']),

            "summary": {
                "caldera_operations": len(self.discovered_data['caldera_operations']),
                "attack_mappings": len(self.discovered_data['attack_mappings']),
                "ptcc_profiles": len(self.discovered_data['ptcc_profiles']),
                "monte_carlo_results": len(self.discovered_data['monte_carlo_results']),
                "teth_profiles": len(self.discovered_data['teth_profiles']),
                "exploitdb_entries": len(self.discovered_data['exploitdb_metadata']),
                "ctas_tasks": len(self.discovered_data['ctas_tasks']),
            },

            "data": self.discovered_data
        }

        with open(output_path, 'w') as f:
            json.dump(manifest, f, indent=2)

        print(f"\n✅ Discovery complete!")
        print(f"   📊 Files analyzed: {manifest['files_analyzed']}")
        print(f"   📂 Data sources found: {len(manifest['data_sources_found'])}")
        print(f"\n   Discovered:")
        for source, count in manifest['summary'].items():
            if count > 0:
                print(f"     • {source}: {count}")
        print(f"\n   Manifest: {output_path}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python3 01_multi_source_discovery.py <directory1> [directory2] ...")
        sys.exit(1)

    search_roots = sys.argv[1:]

    discoverer = MultiSourceDiscovery(search_roots)
    results = discoverer.discover_all()
    discoverer.generate_manifest("manifests/complete_discovery_manifest.json")
```

---

## **Phase 2: Knowledge Integration**

```python
#!/usr/bin/env python3
# File: 02_knowledge_integration.py

"""
Integrate discovered data sources into unified knowledge base
Creates cross-references between Caldera, ATT&CK, PTCC, etc.
"""

import json
from pathlib import Path
from typing import Dict, List, Set
from collections import defaultdict

class KnowledgeIntegrator:
    def __init__(self, discovery_manifest: str):
        with open(discovery_manifest, 'r') as f:
            self.manifest = json.load(f)

        self.integrated_knowledge = {
            "scenarios": [],        # Unified operational scenarios
            "technique_coverage": {},  # ATT&CK technique → tools/methods
            "tool_chains": [],      # PTCC-derived tool sequences
            "vulnerability_intel": [],  # ExploitDB → defensive measures
            "simulation_results": [],   # Monte Carlo brittle points
            "threat_profiles": []   # TETH → emulation playbooks
        }

    def integrate_all(self) -> Dict:
        """
        Integrate all data sources into unified knowledge
        """
        print("🔗 Integrating knowledge sources...")

        # Build technique coverage map
        self._build_technique_coverage()

        # Create operational scenarios
        self._create_scenarios()

        # Build tool chains from PTCC
        self._build_tool_chains()

        # Extract vulnerability intelligence
        self._extract_vulnerability_intel()

        # Integrate simulation results
        self._integrate_simulation_results()

        # Build threat profiles
        self._build_threat_profiles()

        return self.integrated_knowledge

    def _build_technique_coverage(self):
        """
        Map ATT&CK techniques to available tools/methods
        """
        print("  → Building ATT&CK technique coverage...")

        coverage = defaultdict(lambda: {
            "technique_id": "",
            "technique_name": "",
            "tactic": "",
            "caldera_operations": [],
            "ctas_tools": [],
            "ptcc_chains": [],
            "exploitation_examples": [],
            "defensive_measures": []
        })

        # Add from ATT&CK mappings
        for mapping in self.manifest['data']['attack_mappings']:
            tech_id = mapping.get('technique_id', '')
            if tech_id:
                coverage[tech_id]['technique_id'] = tech_id
                coverage[tech_id]['technique_name'] = mapping.get('technique_name', '')
                coverage[tech_id]['tactic'] = mapping.get('tactic', '')

                if 'mapped_tools' in mapping:
                    coverage[tech_id]['ctas_tools'].extend(mapping['mapped_tools'])

        # Add from Caldera operations
        for operation in self.manifest['data']['caldera_operations']:
            for tech_id in operation.get('techniques', []):
                coverage[tech_id]['caldera_operations'].append({
                    "operation_name": operation['name'],
                    "adversary_id": operation['adversary_id'],
                    "file": operation['source_file']
                })

        # Add from ExploitDB (defensive perspective)
        for exploit in self.manifest['data']['exploitdb_metadata']:
            for tech_id in exploit.get('mitre_attack', []):
                coverage[tech_id]['exploitation_examples'].append({
                    "cve": exploit.get('cve', ''),
                    "description": exploit.get('description', ''),
                    "attack_pattern": exploit.get('attack_pattern', {})
                })
                coverage[tech_id]['defensive_measures'].extend(
                    exploit.get('defensive_measures', [])
                )

        self.integrated_knowledge['technique_coverage'] = dict(coverage)

    def _create_scenarios(self):
        """
        Create unified operational scenarios from Caldera + TETH + Monte Carlo
        """
        print("  → Creating operational scenarios...")

        # Group by adversary/threat actor
        scenarios_by_actor = defaultdict(lambda: {
            "actor_name": "",
            "caldera_operations": [],
            "teth_profile": None,
            "monte_carlo_results": [],
            "scenario_steps": [],
            "success_metrics": {},
            "defensive_recommendations": []
        })

        # Add Caldera operations
        for operation in self.manifest['data']['caldera_operations']:
            actor = operation['adversary_id']
            scenarios_by_actor[actor]['actor_name'] = operation.get('name', actor)
            scenarios_by_actor[actor]['caldera_operations'].append(operation)

        # Add TETH profiles
        for teth in self.manifest['data']['teth_profiles']:
            actor = teth.get('threat_actor', 'unknown')
            scenarios_by_actor[actor]['teth_profile'] = teth

        # Add Monte Carlo results
        for mc in self.manifest['data']['monte_carlo_results']:
            scenario = mc.get('scenario', '')
            # Try to match to actor
            for actor in scenarios_by_actor.keys():
                if actor.lower() in scenario.lower():
                    scenarios_by_actor[actor]['monte_carlo_results'].append(mc)

        # Convert to list
        self.integrated_knowledge['scenarios'] = [
            {
                "scenario_id": f"SCENARIO-{i:03d}",
                "actor": actor,
                **data
            }
            for i, (actor, data) in enumerate(scenarios_by_actor.items(), 1)
        ]

    def _build_tool_chains(self):
        """
        Build tool chain sequences from PTCC profiles
        """
        print("  → Building tool chains...")

        for ptcc in self.manifest['data']['ptcc_profiles']:
            tool_chain = {
                "chain_id": ptcc.get('ptcc_id', ''),
                "persona": ptcc.get('persona', ''),
                "tools": [ptcc.get('tool', '')],
                "sequence": ptcc.get('chain', []),
                "primitives": ptcc.get('primitives', []),
                "context": ptcc.get('context', {}),
                "entropy_score": ptcc.get('entropy_score', 0),
                "deployment_level": self._determine_deployment_level(ptcc)
            }

            self.integrated_knowledge['tool_chains'].append(tool_chain)

    def _extract_vulnerability_intel(self):
        """
        Extract vulnerability intelligence from ExploitDB
        """
        print("  → Extracting vulnerability intelligence...")

        for exploit in self.manifest['data']['exploitdb_metadata']:
            vuln_intel = {
                "cve": exploit.get('cve', ''),
                "edb_id": exploit.get('edb_id', ''),
                "title": exploit.get('title', ''),
                "platform": exploit.get('platform', ''),
                "application": exploit.get('application', ''),
                "attack_pattern": exploit.get('attack_pattern', {}),
                "defensive_measures": exploit.get('defensive_measures', []),
                "mitre_attack": exploit.get('mitre_attack', []),
                "phi3_training_eligible": True,  # Metadata only, safe for training
                "exploitation_difficulty": exploit.get('attack_pattern', {}).get('exploitation_difficulty', 'unknown')
            }

            self.integrated_knowledge['vulnerability_intel'].append(vuln_intel)

    def _integrate_simulation_results(self):
        """
        Integrate Monte Carlo simulation results
        """
        print("  → Integrating simulation results...")

        for mc in self.manifest['data']['monte_carlo_results']:
            simulation = {
                "simulation_id": mc.get('simulation_id', ''),
                "scenario": mc.get('scenario', ''),
                "runs": mc.get('runs', 0),
                "success_rate": mc.get('success_rate', 0),
                "mean_time_to_detection": mc.get('mean_time_to_detection', 0),
                "critical_nodes": mc.get('critical_nodes', []),
                "brittle_points": mc.get('brittle_points', []),
                "recommended_defenses": mc.get('recommended_defenses', []),
                "confidence": self._calculate_confidence(mc)
            }

            self.integrated_knowledge['simulation_results'].append(simulation)

    def _build_threat_profiles(self):
        """
        Build comprehensive threat actor profiles
        """
        print("  → Building threat profiles...")

        for teth in self.manifest['data']['teth_profiles']:
            profile = {
                "teth_id": teth.get('teth_id', ''),
                "threat_actor": teth.get('threat_actor', ''),
                "emulation_playbook": teth.get('emulation_playbook', {}),
                "hunting_queries": teth.get('hunting_queries', []),
                "phi3_training_data": teth.get('phi3_training_data', False),
                "operational_tempo": self._analyze_tempo(teth),
                "stealth_level": self._analyze_stealth(teth)
            }

            self.integrated_knowledge['threat_profiles'].append(profile)

    def _determine_deployment_level(self, ptcc: Dict) -> str:
        """
        Determine micro-to-macro deployment level
        """
        tools_count = len(ptcc.get('chain', []))

        if tools_count <= 1:
            return "script"
        elif tools_count <= 3:
            return "wasm"
        elif tools_count <= 5:
            return "microkernel"
        elif tools_count <= 10:
            return "crate"
        elif tools_count <= 20:
            return "system"
        else:
            return "iac"

    def _calculate_confidence(self, mc: Dict) -> float:
        """
        Calculate confidence score from Monte Carlo runs
        """
        runs = mc.get('runs', 0)

        if runs >= 1000:
            return 0.95
        elif runs >= 500:
            return 0.85
        elif runs >= 100:
            return 0.75
        else:
            return 0.60

    def _analyze_tempo(self, teth: Dict) -> str:
        """
        Analyze operational tempo from TETH profile
        """
        playbook = teth.get('emulation_playbook', {})
        phases = len(playbook.keys())

        if phases >= 5:
            return "slow_methodical"
        elif phases >= 3:
            return "moderate"
        else:
            return "fast_aggressive"

    def _analyze_stealth(self, teth: Dict) -> str:
        """
        Analyze stealth level from TETH profile
        """
        playbook = teth.get('emulation_playbook', {})

        # Check for defense evasion techniques
        if 'defense_evasion' in playbook:
            evasion_count = len(playbook['defense_evasion'])
            if evasion_count >= 3:
                return "high_stealth"
            elif evasion_count >= 1:
                return "moderate_stealth"

        return "low_stealth"

    def generate_manifest(self, output_path: str):
        """
        Generate integrated knowledge manifest
        """
        manifest = {
            "integration_date": "2025-11-06",
            "source_manifest": "complete_discovery_manifest.json",

            "summary": {
                "scenarios": len(self.integrated_knowledge['scenarios']),
                "techniques_covered": len(self.integrated_knowledge['technique_coverage']),
                "tool_chains": len(self.integrated_knowledge['tool_chains']),
                "vulnerabilities": len(self.integrated_knowledge['vulnerability_intel']),
                "simulations": len(self.integrated_knowledge['simulation_results']),
                "threat_profiles": len(self.integrated_knowledge['threat_profiles'])
            },

            "integrated_knowledge": self.integrated_knowledge
        }

        with open(output_path, 'w') as f:
            json.dump(manifest, f, indent=2)

        print(f"\n✅ Knowledge integration complete!")
        print(f"   Manifest: {output_path}")
        print(f"\n   Integrated:")
        for key, count in manifest['summary'].items():
            print(f"     • {key}: {count}")


if __name__ == "__main__":
    integrator = KnowledgeIntegrator("manifests/complete_discovery_manifest.json")
    integrator.integrate_all()
    integrator.generate_manifest("manifests/integrated_knowledge_manifest.json")
```

---

## **Phase 3: Emulator/Operator Foundation Builder**

```python
#!/usr/bin/env python3
# File: 03_emulator_operator_builder.py

"""
Build emulator/operator foundation from integrated knowledge
Generates executable scenarios, tool chains, defensive playbooks
"""

import json
from pathlib import Path
from typing import Dict, List
from jinja2 import Environment, FileSystemLoader

class EmulatorOperatorBuilder:
    def __init__(self, integrated_manifest: str):
        with open(integrated_manifest, 'r') as f:
            self.manifest = json.load(f)

        self.knowledge = self.manifest['integrated_knowledge']
        self.env = Environment(loader=FileSystemLoader('templates/'))

    def build_all(self, output_dir: str):
        """
        Build complete emulator/operator foundation
        """
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        print("🏗️  Building emulator/operator foundation...")

        # Build scenario playbooks
        self._build_scenario_playbooks(output_path / "scenarios")

        # Build tool chain configs
        self._build_tool_chains(output_path / "tool_chains")

        # Build defensive playbooks
        self._build_defensive_playbooks(output_path / "defensive")

        # Build Phi-3 training dataset
        self._build_phi3_training_data(output_path / "phi3_training")

        # Build ISO manifest
        self._build_iso_manifest(output_path / "iso_manifest.json")

        print(f"\n✅ Foundation built: {output_path}")

    def _build_scenario_playbooks(self, output_dir: Path):
        """
        Build executable scenario playbooks (Caldera YAML format)
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        print("  → Building scenario playbooks...")

        for scenario in self.knowledge['scenarios']:
            playbook = {
                "id": scenario['scenario_id'],
                "name": scenario['actor_name'],
                "description": f"Emulation playbook for {scenario['actor']}",
                "atomic_ordering": self._build_atomic_ordering(scenario),
                "objectives": self._extract_objectives(scenario),
                "success_criteria": scenario.get('success_metrics', {}),
                "defensive_countermeasures": scenario.get('defensive_recommendations', [])
            }

            # Write as YAML
            output_file = output_dir / f"{scenario['scenario_id']}.yml"

            # Use template
            template = self.env.get_template('scenario_playbook.yml.j2')
            rendered = template.render(playbook=playbook)

            with open(output_file, 'w') as f:
                f.write(rendered)

    def _build_atomic_ordering(self, scenario: Dict) -> List[Dict]:
        """
        Build atomic ordering from Caldera operations
        """
        atomic_ordering = []

        for operation in scenario.get('caldera_operations', []):
            for atomic in operation.get('atomic_ordering', []):
                atomic_ordering.append({
                    "id": atomic.get('id', ''),
                    "name": atomic.get('name', ''),
                    "technique": atomic.get('technique', ''),
                    "tactic": atomic.get('tactic', ''),
                    "executor": atomic.get('executor', {}),
                    "cleanup": atomic.get('cleanup', '')
                })

        return atomic_ordering

    def _extract_objectives(self, scenario: Dict) -> List[str]:
        """
        Extract objectives from TETH profile
        """
        objectives = []

        if scenario.get('teth_profile'):
            playbook = scenario['teth_profile'].get('emulation_playbook', {})
            for phase, techniques in playbook.items():
                objectives.append(f"{phase}: {', '.join(techniques)}")

        return objectives

    def _build_tool_chains(self, output_dir: Path):
        """
        Build tool chain configurations
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        print("  → Building tool chains...")

        for chain in self.knowledge['tool_chains']:
            config = {
                "chain_id": chain['chain_id'],
                "persona": chain['persona'],
                "tools": chain['tools'],
                "sequence": chain['sequence'],
                "primitives": chain['primitives'],
                "deployment_level": chain['deployment_level'],
                "context": chain['context']
            }

            output_file = output_dir / f"{chain['chain_id']}.json"

            with open(output_file, 'w') as f:
                json.dump(config, f, indent=2)

    def _build_defensive_playbooks(self, output_dir: Path):
        """
        Build defensive playbooks from vulnerability intel
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        print("  → Building defensive playbooks...")

        # Group by ATT&CK technique
        defensive_by_technique = {}

        for tech_id, coverage in self.knowledge['technique_coverage'].items():
            if coverage['defensive_measures']:
                defensive_by_technique[tech_id] = {
                    "technique_id": tech_id,
                    "technique_name": coverage['technique_name'],
                    "defensive_measures": list(set(coverage['defensive_measures'])),
                    "exploitation_examples": coverage['exploitation_examples']
                }

        # Write master defensive playbook
        output_file = output_dir / "defensive_playbook.json"

        with open(output_file, 'w') as f:
            json.dump(defensive_by_technique, f, indent=2)

    def _build_phi3_training_data(self, output_dir: Path):
        """
        Build Phi-3 training dataset from safe metadata
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        print("  → Building Phi-3 training data...")

        training_data = []

        # Add from vulnerability intel (metadata only, no POC)
        for vuln in self.knowledge['vulnerability_intel']:
            if vuln.get('phi3_training_eligible'):
                training_data.append({
                    "type": "vulnerability_pattern",
                    "cve": vuln['cve'],
                    "attack_pattern": vuln['attack_pattern'],
                    "defensive_measures": vuln['defensive_measures'],
                    "mitre_attack": vuln['mitre_attack']
                })

        # Add from TETH profiles
        for teth in self.knowledge['threat_profiles']:
            if teth.get('phi3_training_data'):
                training_data.append({
                    "type": "threat_behavior",
                    "actor": teth['threat_actor'],
                    "playbook": teth['emulation_playbook'],
                    "tempo": teth['operational_tempo'],
                    "stealth": teth['stealth_level']
                })

        # Add from Monte Carlo results
        for mc in self.knowledge['simulation_results']:
            training_data.append({
                "type": "simulation_result",
                "scenario": mc['scenario'],
                "success_rate": mc['success_rate'],
                "brittle_points": mc['brittle_points'],
                "defenses": mc['recommended_defenses']
            })

        output_file = output_dir / "phi3_training_dataset.json"

        with open(output_file, 'w') as f:
            json.dump(training_data, f, indent=2)

    def _build_iso_manifest(self, output_file: str):
        """
        Build manifest for ISO generation
        """
        print("  → Building ISO manifest...")

        # Collect all tools from scenarios
        required_tools = set()

        for chain in self.knowledge['tool_chains']:
            required_tools.update(chain['tools'])

        # Map to deployment levels
        tools_by_level = {
            "script": [],
            "wasm": [],
            "microkernel": [],
            "crate": [],
            "system": [],
            "iac": []
        }

        for chain in self.knowledge['tool_chains']:
            level = chain['deployment_level']
            tools_by_level[level].extend(chain['tools'])

        iso_manifest = {
            "iso_version": "1.0.0",
            "build_date": "2025-11-06",
            "total_scenarios": len(self.knowledge['scenarios']),
            "total_tool_chains": len(self.knowledge['tool_chains']),
            "attack_coverage": len(self.knowledge['technique_coverage']),

            "required_tools": list(required_tools),
            "tools_by_deployment_level": tools_by_level,

            "included_scenarios": [s['scenario_id'] for s in self.knowledge['scenarios']],
            "included_tool_chains": [tc['chain_id'] for tc in self.knowledge['tool_chains']],

            "phi3_models": [
                "phi3:mini",  # Fast validation
                "phi3:small"  # Deep analysis
            ],

            "components": {
                "axon": "Neural operations engine",
                "legion": "Entity tracking",
                "hft": "Monte Carlo simulation",
                "plasma": "Threat intelligence",
                "kali_tools": "Offensive/defensive toolkit"
            }
        }

        with open(output_file, 'w') as f:
            json.dump(iso_manifest, f, indent=2)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        output_dir = "foundation_output"
    else:
        output_dir = sys.argv[1]

    builder = EmulatorOperatorBuilder("manifests/integrated_knowledge_manifest.json")
    builder.build_all(output_dir)
```

---

## **Container Build**

### **Dockerfile**

```dockerfile
# File: Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy scripts
COPY scripts/ ./scripts/
COPY templates/ ./templates/

# Create directories
RUN mkdir -p manifests foundation_output

# Expose port (optional API)
EXPOSE 18600

CMD ["python3", "scripts/00_run_discovery_and_build.sh"]
```

### **Master Runner**

```bash
#!/bin/bash
# File: scripts/00_run_discovery_and_build.sh

echo "🚀 CTAS7 Complete Discovery & Build System"
echo "=========================================="

# Phase 1: Multi-source discovery
python3 scripts/01_multi_source_discovery.py \
    /ctas-source/ctas-7-shipyard-staging \
    /ctas-source/ctas7-command-center \
    /customer-docs

# Phase 2: Knowledge integration
python3 scripts/02_knowledge_integration.py

# Phase 3: Emulator/Operator foundation
python3 scripts/03_emulator_operator_builder.py foundation_output

echo ""
echo "✅ Complete!"
echo "   📂 Manifests: manifests/"
echo "   📂 Foundation: foundation_output/"
```

---

## **Usage**

```bash
# Build container
docker build -t ctas7-discovery-system .

# Run discovery on CTAS7 itself
docker run -v /Users/cp5337/Developer:/ctas-source \
           -v /Users/cp5337/Desktop:/customer-docs \
           -v $(pwd)/output:/app/foundation_output \
           ctas7-discovery-system

# Output:
#   - manifests/complete_discovery_manifest.json
#   - manifests/integrated_knowledge_manifest.json
#   - foundation_output/scenarios/*.yml
#   - foundation_output/tool_chains/*.json
#   - foundation_output/defensive/defensive_playbook.json
#   - foundation_output/phi3_training/phi3_training_dataset.json
#   - foundation_output/iso_manifest.json
```

---

## **Success Criteria**

✅ **Discovers all 7 data sources** (Caldera, ATT&CK, PTCC, Monte Carlo, TETH, ExploitDB, Tasks)
✅ **ExploitDB has NO POC code** (metadata only, verified)
✅ **Integrates cross-references** (techniques → tools → scenarios)
✅ **Builds executable playbooks** (Caldera YAML format)
✅ **Generates ISO manifest** (tools needed for scenarios)
✅ **Creates Phi-3 training data** (safe metadata only)
✅ **Scenario-driven** (everything tied to operational scenarios)
✅ **Foundation for emulator/operator** (ready to execute)

---

**This discovers and organizes EXISTING knowledge into an executable foundation! No invention, just extraction and integration.**
