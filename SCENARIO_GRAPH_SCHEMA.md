# 🎯 CTAS Scenario Graph Schema (Normalized)

**Date:** November 9, 2025  
**Purpose:** Super-normalized scenario dataset for node interviews, graph traversal, and matroid analysis

---

## 🧠 SCHEMA PHILOSOPHY

**When a scenario is called:**
1. **Graph the scenario** → Instantiate all nodes (Task, Actor, Object, Event, Attribute)
2. **Find vulnerabilities** → Map to CVEs, exploits, attack surfaces
3. **Link to TTL tasks** → Connect to 165 CTAS tasks (Mandatory/Desirable/Optional)
4. **Identify dependencies** → Use matroids to find supporting/blocking relationships
5. **Calculate entropy** → Determine uncertainty and decision points
6. **Generate COAs** → Course of Action recommendations

---

## 📊 NORMALIZED SCENARIO STRUCTURE

```json
{
  "scenario_id": "S001",
  "name": "Blue Dusk Black Sky",
  "classification": "UNCLASSIFIED//EXERCISE",
  "scenario_type": "created|real_world",
  "domains": ["kinetic", "cyber", "space", "maritime"],
  
  "metadata": {
    "uuid": "UUID-001-001",
    "sch": "SCH001.000‼",
    "cuid": "cuid-001-geo-nyc",
    "entropy": 0.81,
    "matroid_rank": 3,
    "complexity_score": 0.9,
    "created_date": "2025-04-10",
    "last_updated": "2025-04-10"
  },
  
  "narrative": {
    "executive_summary": "Converged multi-domain threat...",
    "operational_context": "March 2025, HUMINT/SIGINT detect...",
    "timeline_file": "scenario_27_timeline.json",
    "monte_carlo_file": "Randoms for Blue Dust v1.csv"
  },
  
  "graph_nodes": {
    "tasks": [
      {
        "task_id": "uuid-011-017-001",
        "sch": "SCH011-017‼",
        "name": "Maritime Hostage Event",
        "ttl_classification": "mandatory",
        "ttl_category": "kinetic_attack",
        "hd4_phase": "disrupt",
        "primitives_required": ["coordinate", "signal", "encrypt"],
        "dependencies": ["uuid-006-004-003", "uuid-007-000-003"],
        "interdiction_points": ["T+0", "T+2"],
        "indicators": ["GPS spoofing", "manifest manipulation", "video leak"]
      }
    ],
    
    "actors": [
      {
        "actor_id": "ACT-001",
        "name": "Hezbollah",
        "actor_type": "terrorist_organization",
        "nation_state_sponsor": "Iran",
        "apt_level": "advanced",
        "ptcc_level": 5,
        "geopolitical_context": "Lebanese militant group",
        "capabilities": ["maritime_ops", "hostage_taking", "explosives"],
        "related_tasks": ["uuid-011-017-001", "uuid-011-000-001"]
      },
      {
        "actor_id": "ACT-002",
        "name": "PRC Unit 61419",
        "actor_type": "nation_state",
        "nation_state_sponsor": "China",
        "apt_level": "apt_nation_state",
        "ptcc_level": 7,
        "geopolitical_context": "Chinese cyber espionage unit",
        "capabilities": ["satellite_hacking", "firmware_exploitation", "supply_chain"],
        "related_tasks": ["uuid-006-013-004", "uuid-005-004-003"]
      }
    ],
    
    "objects": [
      {
        "object_id": "OBJ-001",
        "name": "LaserLight MEO Satellites",
        "object_type": "infrastructure",
        "criticality": "critical",
        "owner": "Private sector (LaserLight)",
        "location": "MEO orbit (15,000 km)",
        "vulnerabilities": [
          {
            "vuln_id": "CVE-2024-XXXX",
            "description": "Firmware-level intrusion on ground nodes",
            "cvss_score": 9.8,
            "exploit_available": true,
            "exploit_db_id": "EDB-12345",
            "mitigation": "Patch firmware, implement MFA"
          }
        ],
        "dependencies": ["Ground stations (Chile, Kazakhstan, Nigeria)"],
        "related_tasks": ["uuid-006-013-004", "uuid-005-004-003"]
      },
      {
        "object_id": "OBJ-002",
        "name": "NYC Department of Transportation SCADA",
        "object_type": "ics_scada",
        "criticality": "high",
        "owner": "NYC DOT",
        "location": "New York City",
        "vulnerabilities": [
          {
            "vuln_id": "CVE-2024-YYYY",
            "description": "TYRANT-5 ransomware encrypts control logic",
            "cvss_score": 8.5,
            "exploit_available": true,
            "exploit_db_id": "EDB-67890",
            "mitigation": "Network segmentation, offline backups"
          }
        ],
        "dependencies": ["Traffic signal hubs", "LIRR scheduling systems"],
        "related_tasks": ["uuid-007-003-003", "uuid-006-010-003"]
      }
    ],
    
    "events": [
      {
        "event_id": "EVT-001",
        "name": "Maritime Hostage Initiation",
        "event_type": "kinetic_attack",
        "timestamp": "T+0",
        "location": "Gulf of Mexico, off Yucatán Peninsula",
        "severity": "critical",
        "casualties": 0,
        "hostages": 17,
        "related_tasks": ["uuid-011-017-001"],
        "related_actors": ["ACT-001", "ACT-003"],
        "related_objects": ["OBJ-003"]
      },
      {
        "event_id": "EVT-002",
        "name": "LaserLight Satellite Compromise",
        "event_type": "cyber_attack",
        "timestamp": "T+2",
        "location": "Ground nodes (Chile, Kazakhstan, Nigeria)",
        "severity": "critical",
        "impact": "Global equity trading degraded",
        "related_tasks": ["uuid-006-013-004"],
        "related_actors": ["ACT-002"],
        "related_objects": ["OBJ-001"]
      }
    ],
    
    "attributes": [
      {
        "attribute_id": "ATTR-001",
        "name": "GPS Spoofing Indicator",
        "attribute_type": "ioc",
        "value": "Modified SDK beacon libraries",
        "confidence": 0.87,
        "source": "SIGINT",
        "related_tasks": ["uuid-006-013-002"],
        "detection_method": "Anomaly detection on GPS signals"
      },
      {
        "attribute_id": "ATTR-002",
        "name": "Phishing Email Hash",
        "attribute_type": "ioc",
        "value": "SHA256:abc123...",
        "confidence": 0.92,
        "source": "DHS CISA",
        "related_tasks": ["uuid-006-002-001"],
        "detection_method": "Email gateway analysis"
      }
    ]
  },
  
  "ttl_mapping": {
    "mandatory_tasks": [
      {
        "ttl_task_id": "TTL-M-001",
        "name": "Surveillance of target",
        "ctas_task": "uuid-006-004-003",
        "indicators": ["Persistent ISR", "Route surveillance"],
        "interdiction_point": "T-120 to T-7",
        "blue_team_action": "Counter-surveillance, increase patrols"
      }
    ],
    "desirable_tasks": [
      {
        "ttl_task_id": "TTL-D-001",
        "name": "GPS spoofing",
        "ctas_task": "uuid-006-013-002",
        "indicators": ["Modified SDK beacons", "Route falsification"],
        "interdiction_point": "T-14",
        "blue_team_action": "Deploy GPS integrity monitoring"
      }
    ],
    "optional_tasks": [
      {
        "ttl_task_id": "TTL-O-001",
        "name": "Social media propaganda",
        "ctas_task": "uuid-007-001-001",
        "indicators": ["Telegram/Odyssey posts", "Video leaks"],
        "interdiction_point": "T+0 (post-attack)",
        "blue_team_action": "Counter-narrative, platform takedowns"
      }
    ]
  },
  
  "vulnerability_matrix": {
    "attack_surface": [
      {
        "surface_id": "AS-001",
        "name": "LaserLight Ground Nodes",
        "asset_type": "satellite_infrastructure",
        "exposure": "internet_facing",
        "cves": ["CVE-2024-XXXX"],
        "exploits": ["EDB-12345"],
        "kali_tools": ["nmap", "metasploit", "rustscan"],
        "wazuh_rules": ["100001", "100002"],
        "openvas_scan_id": "scan-001"
      },
      {
        "surface_id": "AS-002",
        "name": "NYC DOT SCADA",
        "asset_type": "ics_scada",
        "exposure": "internal_network",
        "cves": ["CVE-2024-YYYY"],
        "exploits": ["EDB-67890"],
        "kali_tools": ["nmap", "metasploit", "scapy"],
        "wazuh_rules": ["100003", "100004"],
        "openvas_scan_id": "scan-002"
      }
    ],
    
    "exploit_chains": [
      {
        "chain_id": "EC-001",
        "name": "LaserLight Compromise Chain",
        "steps": [
          {
            "step": 1,
            "task": "uuid-006-002-001",
            "action": "Phishing email grants manifest access",
            "tool": "gophish",
            "success_probability": 0.65
          },
          {
            "step": 2,
            "task": "uuid-006-013-004",
            "action": "Firmware-level intrusion on ground nodes",
            "tool": "metasploit",
            "success_probability": 0.82,
            "depends_on": [1]
          },
          {
            "step": 3,
            "task": "uuid-005-004-003",
            "action": "Force satellite reboot cycles",
            "tool": "custom_exploit",
            "success_probability": 0.91,
            "depends_on": [2]
          }
        ],
        "total_probability": 0.486,
        "matroid_independent_set": [1, 2, 3]
      }
    ]
  },
  
  "matroid_analysis": {
    "ground_set": ["uuid-011-017-001", "uuid-006-013-004", "uuid-006-010-001", "uuid-007-003-003"],
    "independent_sets": [
      ["uuid-011-017-001"],
      ["uuid-006-013-004"],
      ["uuid-011-017-001", "uuid-006-013-004"],
      ["uuid-006-013-004", "uuid-006-010-001"]
    ],
    "bases": [
      ["uuid-011-017-001", "uuid-006-013-004", "uuid-006-010-001"]
    ],
    "rank": 3,
    "circuits": [
      ["uuid-006-010-001", "uuid-007-003-003"]
    ],
    "dependencies": [
      {
        "task": "uuid-005-004-003",
        "depends_on": ["uuid-006-013-004"],
        "dependency_type": "sequential"
      },
      {
        "task": "uuid-007-003-003",
        "depends_on": ["uuid-006-010-001"],
        "dependency_type": "enabling"
      }
    ]
  },
  
  "coa_generation": {
    "branches": [
      {
        "coa_id": "COA-001",
        "name": "Kinetic Rescue",
        "description": "Deploy SEAL teams + RAPTOR deception layer",
        "success_probability": 0.72,
        "resource_requirements": ["SEAL_team", "RAPTOR_system", "ISR_assets"],
        "timeline": "T+4 to T+8",
        "risks": ["Hostage casualties", "International incident"]
      },
      {
        "coa_id": "COA-002",
        "name": "Cyber Disruption",
        "description": "Neutralize MEO uplink via coordinated AI SIGINT",
        "success_probability": 0.68,
        "resource_requirements": ["SIGINT_assets", "Cyber_ops_team"],
        "timeline": "T+2 to T+6",
        "risks": ["Collateral damage to commercial satellites"]
      }
    ],
    "recommended_coa": "COA-001",
    "rationale": "Higher success probability, lower collateral damage"
  },
  
  "geospatial_data": {
    "primary_location": {
      "location_id": "LOC-PRIMARY",
      "name": "New York City",
      "lat": 40.7128,
      "lon": -74.0060,
      "zoom_level": 10,
      "description": "Primary operational area for scenario"
    },
    
    "locations": [
      {
        "location_id": "LOC-001",
        "name": "Yucatán Peninsula",
        "lat": 21.1619,
        "lon": -86.8515,
        "location_type": "maritime",
        "events": ["EVT-001"],
        "actors": ["ACT-001", "ACT-003"],
        "marker_icon": "ship",
        "marker_color": "red",
        "radius_km": 50,
        "visibility": "always"
      },
      {
        "location_id": "LOC-002",
        "name": "New York City",
        "lat": 40.7128,
        "lon": -74.0060,
        "location_type": "urban",
        "events": ["EVT-003", "EVT-004"],
        "objects": ["OBJ-002"],
        "marker_icon": "building",
        "marker_color": "orange",
        "radius_km": 10,
        "visibility": "always"
      },
      {
        "location_id": "LOC-003",
        "name": "LaserLight Ground Station - Chile",
        "lat": -33.4489,
        "lon": -70.6693,
        "location_type": "infrastructure",
        "objects": ["OBJ-001"],
        "marker_icon": "satellite",
        "marker_color": "cyan",
        "radius_km": 5,
        "visibility": "on_zoom"
      },
      {
        "location_id": "LOC-004",
        "name": "LaserLight Ground Station - Kazakhstan",
        "lat": 51.1694,
        "lon": 71.4491,
        "location_type": "infrastructure",
        "objects": ["OBJ-001"],
        "marker_icon": "satellite",
        "marker_color": "cyan",
        "radius_km": 5,
        "visibility": "on_zoom"
      },
      {
        "location_id": "LOC-005",
        "name": "LaserLight Ground Station - Nigeria",
        "lat": 9.0820,
        "lon": 8.6753,
        "location_type": "infrastructure",
        "objects": ["OBJ-001"],
        "marker_icon": "satellite",
        "marker_color": "cyan",
        "radius_km": 5,
        "visibility": "on_zoom"
      }
    ],
    
    "connections": [
      {
        "connection_id": "CONN-001",
        "name": "Attack Arc - Yucatán to NYC",
        "from": "LOC-001",
        "to": "LOC-002",
        "connection_type": "threat_vector",
        "line_style": "dashed",
        "line_color": "red",
        "line_width": 3,
        "animated": true,
        "animation_direction": "from_to_to",
        "events": ["EVT-001"],
        "visibility": "T+0 to T+4"
      },
      {
        "connection_id": "CONN-002",
        "name": "Satellite Uplink - Chile to Space",
        "from": "LOC-003",
        "to": {"lat": -33.4489, "lon": -70.6693, "alt_km": 15000},
        "connection_type": "infrastructure",
        "line_style": "solid",
        "line_color": "cyan",
        "line_width": 2,
        "animated": false,
        "events": ["EVT-002"],
        "visibility": "always"
      }
    ],
    
    "areas_of_interest": [
      {
        "aoi_id": "AOI-001",
        "name": "Gulf of Mexico Operational Zone",
        "geometry_type": "polygon",
        "coordinates": [
          [21.0, -87.0],
          [21.5, -87.0],
          [21.5, -86.5],
          [21.0, -86.5],
          [21.0, -87.0]
        ],
        "fill_color": "rgba(255, 0, 0, 0.2)",
        "border_color": "red",
        "border_width": 2,
        "description": "Maritime interdiction zone",
        "active_window": "T-7 to T+4"
      },
      {
        "aoi_id": "AOI-002",
        "name": "NYC Critical Infrastructure Zone",
        "geometry_type": "circle",
        "center": [40.7128, -74.0060],
        "radius_km": 15,
        "fill_color": "rgba(255, 165, 0, 0.2)",
        "border_color": "orange",
        "border_width": 2,
        "description": "Urban response perimeter",
        "active_window": "T+0 to T+4"
      }
    ],
    
    "heatmap_data": [
      {
        "heatmap_id": "HEAT-001",
        "name": "Threat Density",
        "data_points": [
          {"lat": 40.7128, "lon": -74.0060, "intensity": 0.9, "timestamp": "T+0"},
          {"lat": 21.1619, "lon": -86.8515, "intensity": 0.8, "timestamp": "T+0"},
          {"lat": -33.4489, "lon": -70.6693, "intensity": 0.6, "timestamp": "T+2"}
        ],
        "gradient": {
          "0.0": "blue",
          "0.5": "yellow",
          "1.0": "red"
        },
        "radius": 50,
        "blur": 15,
        "active_window": "T+0 to T+4"
      }
    ],
    
    "temporal_animation": {
      "enabled": true,
      "start_time": "T-14",
      "end_time": "T+4",
      "current_time": "T+0",
      "playback_speed": "1x",
      "keyframes": [
        {
          "time": "T-14",
          "visible_locations": ["LOC-001"],
          "visible_connections": [],
          "camera_position": {"lat": 21.1619, "lon": -86.8515, "zoom": 8}
        },
        {
          "time": "T+0",
          "visible_locations": ["LOC-001", "LOC-002"],
          "visible_connections": ["CONN-001"],
          "camera_position": {"lat": 30.0, "lon": -80.0, "zoom": 5}
        },
        {
          "time": "T+2",
          "visible_locations": ["LOC-001", "LOC-002", "LOC-003", "LOC-004", "LOC-005"],
          "visible_connections": ["CONN-001", "CONN-002"],
          "camera_position": {"lat": 0.0, "lon": 0.0, "zoom": 2}
        }
      ]
    },
    
    "layer_overlays": {
      "base_layers": [
        {
          "layer_id": "BASE-001",
          "name": "Mapbox Dark",
          "type": "mapbox",
          "style": "mapbox://styles/mapbox/dark-v11",
          "default": true
        },
        {
          "layer_id": "BASE-002",
          "name": "Satellite",
          "type": "mapbox",
          "style": "mapbox://styles/mapbox/satellite-v9",
          "default": false
        }
      ],
      
      "data_layers": [
        {
          "layer_id": "LAYER-001",
          "name": "Power Grid",
          "type": "kmz",
          "source": "power_grid.kmz",
          "visible": true,
          "opacity": 0.7,
          "color": "yellow"
        },
        {
          "layer_id": "LAYER-002",
          "name": "Submarine Cables",
          "type": "kmz",
          "source": "submarine_cables.kmz",
          "visible": true,
          "opacity": 0.8,
          "color": "cyan"
        },
        {
          "layer_id": "LAYER-003",
          "name": "Ground Stations",
          "type": "geojson",
          "source": "ground_stations.geojson",
          "visible": false,
          "opacity": 0.9,
          "color": "green"
        },
        {
          "layer_id": "LAYER-004",
          "name": "BGP Peering Points",
          "type": "geojson",
          "source": "bgp_peers.geojson",
          "visible": false,
          "opacity": 0.6,
          "color": "magenta"
        }
      ]
    },
    
    "superimpose_options": {
      "allow_custom_location": true,
      "allow_location_override": true,
      "allow_multi_location": true,
      "location_templates": [
        {
          "template_id": "TMPL-001",
          "name": "Urban Attack",
          "locations": ["major_city", "critical_infrastructure", "transport_hub"],
          "default_zoom": 12
        },
        {
          "template_id": "TMPL-002",
          "name": "Maritime Interdiction",
          "locations": ["port", "shipping_lane", "coastal_area"],
          "default_zoom": 8
        },
        {
          "template_id": "TMPL-003",
          "name": "Cyber-Physical",
          "locations": ["data_center", "power_substation", "telecom_hub"],
          "default_zoom": 10
        }
      ],
      
      "location_picker": {
        "enabled": true,
        "search_providers": ["nominatim", "mapbox_geocoding"],
        "allow_coordinates": true,
        "allow_address": true,
        "allow_poi": true,
        "recent_locations": []
      }
    }
  },
  
  "integration": {
    "wazuh_alerts": ["alert-001", "alert-002"],
    "openvas_scans": ["scan-001", "scan-002"],
    "kali_tools": ["nmap", "metasploit", "rustscan", "scapy"],
    "caldera_adversary": "APT28_emulation",
    "mitre_attck": ["T1190", "T1059", "T1498", "T1480"],
    "taps_channel": "ThreatIntel",
    "legion_world": ["cyber", "geospatial", "space", "maritime"]
  },
  
  "time_of_value": {
    "scenario_duration": "T-365 to T+30 days",
    "critical_window": "T-14 to T+4",
    "intelligence_decay": [
      {
        "intel_type": "SIGINT",
        "half_life": "48 hours",
        "value_curve": "exponential_decay",
        "collection_window": "T-120 to T-7",
        "actionable_until": "T-3",
        "rationale": "Adversary comms patterns change rapidly"
      },
      {
        "intel_type": "HUMINT",
        "half_life": "7 days",
        "value_curve": "linear_decay",
        "collection_window": "T-365 to T-30",
        "actionable_until": "T-14",
        "rationale": "Human sources provide strategic warning"
      },
      {
        "intel_type": "GEOINT",
        "half_life": "30 days",
        "value_curve": "step_decay",
        "collection_window": "T-180 to T-60",
        "actionable_until": "T-30",
        "rationale": "Infrastructure changes slowly"
      },
      {
        "intel_type": "OSINT",
        "half_life": "24 hours",
        "value_curve": "exponential_decay",
        "collection_window": "T-7 to T+0",
        "actionable_until": "T+2",
        "rationale": "Social media/news cycles are fast"
      },
      {
        "intel_type": "TECHINT",
        "half_life": "90 days",
        "value_curve": "plateau_then_cliff",
        "collection_window": "T-365 to T-180",
        "actionable_until": "T-60",
        "rationale": "Vulnerabilities persist until patched"
      }
    ],
    
    "sliding_windows": [
      {
        "window_id": "SW-001",
        "name": "Strategic Warning Window",
        "timeframe": "T-365 to T-180",
        "intel_types": ["HUMINT", "GEOINT", "TECHINT"],
        "collection_priority": "low",
        "processing_mode": "batch",
        "storage": "archive",
        "value_threshold": 0.3,
        "tasks_active": ["uuid-011-000-001", "uuid-004-002-001"],
        "indicators": ["Early-stage logistics", "Territory militarization"],
        "blue_team_actions": ["Increase surveillance", "Deploy sensors"]
      },
      {
        "window_id": "SW-002",
        "name": "Operational Preparation Window",
        "timeframe": "T-180 to T-60",
        "intel_types": ["SIGINT", "GEOINT", "OSINT"],
        "collection_priority": "medium",
        "processing_mode": "real_time",
        "storage": "hot",
        "value_threshold": 0.6,
        "tasks_active": ["uuid-006-004-003", "uuid-007-000-003"],
        "indicators": ["Route surveillance", "Container manipulation"],
        "blue_team_actions": ["Counter-surveillance", "Increase patrols"]
      },
      {
        "window_id": "SW-003",
        "name": "Tactical Execution Window",
        "timeframe": "T-14 to T+0",
        "intel_types": ["SIGINT", "OSINT", "TECHINT"],
        "collection_priority": "critical",
        "processing_mode": "streaming",
        "storage": "ephemeral",
        "value_threshold": 0.9,
        "tasks_active": ["uuid-006-013-002", "uuid-006-002-001"],
        "indicators": ["GPS spoofing", "Phishing emails", "Final preparations"],
        "blue_team_actions": ["Deploy GPS monitoring", "Alert all agencies"]
      },
      {
        "window_id": "SW-004",
        "name": "Crisis Response Window",
        "timeframe": "T+0 to T+4",
        "intel_types": ["OSINT", "SIGINT", "IMINT"],
        "collection_priority": "critical",
        "processing_mode": "streaming",
        "storage": "ephemeral",
        "value_threshold": 1.0,
        "tasks_active": ["uuid-011-017-001", "uuid-006-010-001", "uuid-007-003-003"],
        "indicators": ["Hostage video", "Ransomware execution", "Traffic disruption"],
        "blue_team_actions": ["Execute COAs", "Coordinate response"]
      },
      {
        "window_id": "SW-005",
        "name": "Post-Event Analysis Window",
        "timeframe": "T+4 to T+30",
        "intel_types": ["FORENSICS", "OSINT", "HUMINT"],
        "collection_priority": "medium",
        "processing_mode": "batch",
        "storage": "archive",
        "value_threshold": 0.5,
        "tasks_active": ["uuid-012-003-001"],
        "indicators": ["Attribution data", "Lessons learned"],
        "blue_team_actions": ["Forensic analysis", "Update defenses"]
      }
    ],
    
    "ephemeral_intelligence": {
      "discard_after": {
        "SIGINT_raw": "24 hours",
        "OSINT_social_media": "12 hours",
        "TECHINT_vuln_scan": "7 days",
        "GEOINT_satellite": "30 days"
      },
      "persist_conditions": [
        "Attribution confirmed",
        "Legal hold required",
        "Training dataset value",
        "Pattern matches EEI"
      ],
      "nyx_trace_activation": {
        "trigger": "Scenario called by operator",
        "action": "Activate collection windows SW-002, SW-003, SW-004",
        "duration": "T-60 to T+4",
        "auto_deactivate": "T+30 or scenario resolution"
      }
    },
    
    "validation_metrics": {
      "sliding_window_theory": {
        "hypothesis": "Intelligence value peaks in tactical window (T-14 to T+4)",
        "test_method": "Monte Carlo simulation across all 41 scenarios",
        "success_criteria": "90%+ of actionable intel falls within tactical window",
        "validation_status": "pending",
        "data_sources": [
          "Randoms for Blue Dust v1.csv",
          "All scenario Monte Carlo runs"
        ]
      },
      "time_of_value_theory": {
        "hypothesis": "Different intel types have predictable decay curves",
        "test_method": "Measure intel freshness vs. COA success probability",
        "success_criteria": "Correlation coefficient > 0.7",
        "validation_status": "pending",
        "data_sources": [
          "Historical scenario outcomes",
          "Real-world incident timelines (9/11, NotPetya, etc.)"
        ]
      },
      "ephemeral_threshold": {
        "hypothesis": "Intelligence older than 2x half-life has <10% value",
        "test_method": "Compare old intel vs. new intel in COA generation",
        "success_criteria": "Old intel contributes <10% to decision quality",
        "validation_status": "pending",
        "data_sources": [
          "Node interview responses",
          "COA success probabilities"
        ]
      }
    }
  }
}
```

---

## 🔗 NODE INTERVIEW INTEGRATION

**When Marcus interviews a scenario node:**

```rust
// Node interview query
let interview = NodeInterview {
    scenario_id: "S001",
    interview_type: InterviewType::Comprehensive,
    questions: vec![
        "What are the mandatory tasks?",
        "Who are the primary actors?",
        "What vulnerabilities exist?",
        "What are the interdiction points?",
        "What COAs are available?"
    ]
};

// Response structure
struct InterviewResponse {
    tasks: Vec<Task>,           // 5-tuple: Task
    actors: Vec<Actor>,         // 5-tuple: Actor
    objects: Vec<Object>,       // 5-tuple: Object
    events: Vec<Event>,         // 5-tuple: Event
    attributes: Vec<Attribute>, // 5-tuple: Attribute
    
    ttl_mapping: TTLMapping,
    vulnerabilities: Vec<Vulnerability>,
    matroid_analysis: MatroidAnalysis,
    coas: Vec<CourseOfAction>,
}
```

---

## 📊 MATROID DEPENDENCY ANALYSIS

**Purpose:** Find which tasks are independent, which depend on others, and what the critical paths are.

```python
# Example: Blue Dusk Black Sky matroid
ground_set = [
    "uuid-011-017-001",  # Maritime hostage
    "uuid-006-013-004",  # LaserLight compromise
    "uuid-006-010-001",  # Power grid ransomware
    "uuid-007-003-003"   # NYC traffic disruption
]

# Independent sets (tasks that can execute in parallel)
independent_sets = [
    ["uuid-011-017-001"],  # Can execute alone
    ["uuid-006-013-004"],  # Can execute alone
    ["uuid-011-017-001", "uuid-006-013-004"],  # Can execute together
    ["uuid-006-013-004", "uuid-006-010-001"]   # Can execute together
]

# Circuits (minimal dependent sets)
circuits = [
    ["uuid-006-010-001", "uuid-007-003-003"]  # One depends on the other
]

# Rank = 3 (max independent set size)
# This tells us: 3 tasks can execute in parallel, but 4th creates dependency
```

---

## 🎯 QUERY EXAMPLES

### **1. Find all vulnerabilities in a scenario**
```cypher
MATCH (s:Scenario {scenario_id: 'S001'})-[:HAS_OBJECT]->(o:Object)-[:HAS_VULN]->(v:Vulnerability)
RETURN s.name, o.name, v.cve_id, v.cvss_score
ORDER BY v.cvss_score DESC
```

### **2. Find supporting tasks for an event**
```cypher
MATCH (e:Event {event_id: 'EVT-001'})<-[:ENABLES]-(t:Task)
RETURN t.task_id, t.name, t.ttl_classification
```

### **3. Find interdiction points**
```cypher
MATCH (s:Scenario {scenario_id: 'S001'})-[:HAS_TASK]->(t:Task)
WHERE t.interdiction_points IS NOT NULL
RETURN t.task_id, t.name, t.interdiction_points, t.indicators
```

### **4. Calculate attack path probability**
```cypher
MATCH path = (start:Task)-[:DEPENDS_ON*]->(end:Task)
WHERE start.task_id = 'uuid-006-002-001'
RETURN path, 
       reduce(prob = 1.0, step IN relationships(path) | prob * step.success_probability) AS total_probability
```

---

## 🚀 IMPLEMENTATION

### **Phase 1: Extract & Normalize (1 week)**
- Parse all 41 scenarios from Dell XPS
- Extract to normalized JSON schema
- Store in SurrealDB with graph relationships

### **Phase 2: TTL Mapping (1 week)**
- Map each scenario task to IED TTL structure
- Classify as Mandatory/Desirable/Optional
- Identify interdiction points

### **Phase 3: Vulnerability Integration (1 week)**
- Link to Exploit-DB, CVE database
- Map to Kali tools
- Generate Wazuh rules
- Create OpenVAS scan configs

### **Phase 4: Matroid Analysis (1 week)**
- Calculate dependency graphs
- Find independent sets
- Identify critical paths
- Generate COA trees

### **Phase 5: Node Interviews (ongoing)**
- Marcus (Gemini 2M) interviews each scenario
- Extracts narrative, actors, vulnerabilities
- Generates Frontline documentary scripts

---

**Ready to extract and normalize all 41 scenarios?** 🎯

