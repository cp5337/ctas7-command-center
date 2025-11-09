#!/usr/bin/env python3
"""
Base OSINT Extractor - Clean, modular, reusable
"""

import json
import hashlib
from typing import Dict, List, Any
from abc import ABC, abstractmethod

class BaseOSINTExtractor(ABC):
    """Base class for all OSINT extractors"""
    
    def __init__(self, scenario_id: str, scenario_name: str):
        self.scenario_id = scenario_id
        self.scenario_name = scenario_name
        self.scenario_data = {
            "scenario_id": scenario_id,
            "name": scenario_name,
            "scenario_type": "real_world",
            "graph_nodes": {
                "tasks": [],
                "actors": [],
                "objects": [],
                "events": [],
                "attributes": []
            }
        }
    
    @abstractmethod
    def collect_data(self) -> str:
        """Override to collect raw data from sources"""
        pass
    
    @abstractmethod
    def extract_tasks(self, text: str) -> List[Dict]:
        """Override to extract tasks"""
        pass
    
    @abstractmethod
    def extract_actors(self, text: str) -> List[Dict]:
        """Override to extract actors"""
        pass
    
    def generate_sch(self, content: str) -> str:
        """Generate SCH hash"""
        hash_obj = hashlib.sha256(content.encode())
        return f"SCH-{self.scenario_id}-{hash_obj.hexdigest()[:12]}"
    
    def save(self, output_file: str):
        """Save results to JSON"""
        with open(output_file, 'w') as f:
            json.dump(self.scenario_data, f, indent=2)
        print(f"✅ Saved: {output_file}")

