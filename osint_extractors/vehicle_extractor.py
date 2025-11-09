#!/usr/bin/env python3
"""
Vehicle/Transport Extraction Module
Extracts vehicle entities using CTAS Object ontology
"""

import re
from typing import List, Dict

class VehicleExtractor:
    """Extract vehicles/transport from text using CTAS ontology"""
    
    # CTAS Vehicle Types (from IED TTL + Object ontology)
    VEHICLE_TYPES = {
        "ground": ["car", "truck", "van", "bus", "vehicle", "SUV", "sedan", "motorcycle", "bicycle"],
        "air": ["aircraft", "plane", "helicopter", "drone", "UAV", "jet", "chopper"],
        "maritime": ["boat", "ship", "vessel", "submarine", "yacht", "ferry", "cargo ship"],
        "rail": ["train", "subway", "metro", "locomotive", "rail car"],
        "tactical": ["armored vehicle", "APC", "tank", "MRAP", "humvee", "technical"]
    }
    
    # Vehicle identifiers
    IDENTIFIER_PATTERNS = {
        "license_plate": r"\b[A-Z]{2,3}[-\s]?\d{3,4}\b",
        "vin": r"\b[A-HJ-NPR-Z0-9]{17}\b",
        "tail_number": r"\b[N][0-9]{1,5}[A-Z]{0,2}\b",  # Aircraft
        "registration": r"\breg(?:istration)?[:\s]+([A-Z0-9-]+)\b"
    }
    
    # Vehicle actions (for context)
    VEHICLE_ACTIONS = [
        "drove", "parked", "crashed", "exploded", "transported", "delivered",
        "arrived", "departed", "stopped", "accelerated", "rammed"
    ]
    
    @staticmethod
    def extract_vehicles_pattern(text: str) -> List[Dict]:
        """Extract vehicles using pattern matching"""
        vehicles = []
        text_lower = text.lower()
        
        for vehicle_category, keywords in VehicleExtractor.VEHICLE_TYPES.items():
            for keyword in keywords:
                if keyword in text_lower:
                    # Extract context around keyword
                    pattern = re.compile(rf'.{{0,80}}{keyword}.{{0,80}}', re.IGNORECASE)
                    matches = pattern.findall(text)
                    
                    for match in matches[:3]:  # Limit to 3 per keyword
                        vehicles.append({
                            "vehicle_type": keyword,
                            "category": vehicle_category,
                            "context": match.strip(),
                            "source": "pattern_matching"
                        })
        
        return vehicles
    
    @staticmethod
    def extract_identifiers(text: str) -> List[Dict]:
        """Extract vehicle identifiers (plates, VINs, etc.)"""
        identifiers = []
        
        for id_type, pattern in VehicleExtractor.IDENTIFIER_PATTERNS.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                identifiers.append({
                    "identifier_type": id_type,
                    "value": match if isinstance(match, str) else match[0],
                    "source": "regex_extraction"
                })
        
        return identifiers
    
    @staticmethod
    def extract_vehicle_actions(text: str) -> List[Dict]:
        """Extract vehicle-related actions"""
        actions = []
        
        for action in VehicleExtractor.VEHICLE_ACTIONS:
            pattern = re.compile(rf'(\w+)\s+{action}\s+(\w+)', re.IGNORECASE)
            matches = pattern.findall(text)
            
            for match in matches[:2]:
                actions.append({
                    "actor": match[0],
                    "action": action,
                    "object": match[1],
                    "source": "action_extraction"
                })
        
        return actions
    
    @staticmethod
    def extract_all(text: str) -> Dict[str, List[Dict]]:
        """Extract all vehicle-related entities"""
        return {
            "vehicles": VehicleExtractor.extract_vehicles_pattern(text),
            "identifiers": VehicleExtractor.extract_identifiers(text),
            "actions": VehicleExtractor.extract_vehicle_actions(text)
        }
    
    @staticmethod
    def deduplicate(vehicle_list: List[Dict]) -> List[Dict]:
        """Remove duplicates based on type and context"""
        seen = set()
        unique = []
        
        for vehicle in vehicle_list:
            key = (vehicle.get("vehicle_type", "").lower(), vehicle.get("category", ""))
            if key not in seen and key[0]:
                seen.add(key)
                unique.append(vehicle)
        
        return unique

