#!/usr/bin/env python3
"""
Pattern Matching Engine - Reusable across all scenarios
"""

import re
from typing import List, Dict

class PatternMatcher:
    """Pattern matching for CTAS ontology extraction"""
    
    TASK_PATTERNS = {
        "surveillance": ["surveillance", "reconnaissance", "observe", "monitor"],
        "planning": ["plan", "coordinate", "organize", "prepare"],
        "weaponization": ["explosive", "bomb", "IED", "weapon"],
        "infiltration": ["enter", "infiltrate", "breach", "access"],
        "hostage_taking": ["hostage", "captive", "prisoner", "detain"],
        "fortification": ["barricade", "fortify", "secure", "defend"],
        "communication": ["communicate", "demand", "negotiate"],
        "execution": ["kill", "shoot", "detonate", "execute"]
    }
    
    ACTOR_PATTERNS = {
        "terrorist": ["terrorist", "militant", "insurgent", "fighter"],
        "hostage": ["hostage", "victim", "child", "teacher"],
        "security_force": ["police", "special forces", "military", "FSB"]
    }
    
    OBJECT_PATTERNS = {
        "facility": ["school", "gymnasium", "building", "facility"],
        "weapon": ["explosive", "bomb", "grenade", "rifle", "gun"],
        "vehicle": ["vehicle", "car", "truck", "bus"]
    }
    
    @staticmethod
    def extract_tasks(text: str) -> List[Dict]:
        """Extract tasks using pattern matching"""
        tasks = []
        text_lower = text.lower()
        
        for task_type, keywords in PatternMatcher.TASK_PATTERNS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    pattern = re.compile(rf'.{{0,100}}{keyword}.{{0,100}}', re.IGNORECASE)
                    matches = pattern.findall(text)
                    for match in matches[:5]:
                        tasks.append({
                            "task_type": task_type,
                            "keyword": keyword,
                            "context": match.strip()
                        })
        return tasks
    
    @staticmethod
    def extract_actors(text: str) -> List[Dict]:
        """Extract actors using pattern matching"""
        actors = []
        text_lower = text.lower()
        
        for actor_type, keywords in PatternMatcher.ACTOR_PATTERNS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    actors.append({
                        "actor_type": actor_type,
                        "name": keyword.title()
                    })
        
        # Deduplicate
        seen = set()
        unique = []
        for actor in actors:
            key = (actor["actor_type"], actor["name"])
            if key not in seen:
                seen.add(key)
                unique.append(actor)
        return unique
    
    @staticmethod
    def extract_objects(text: str) -> List[Dict]:
        """Extract objects using pattern matching"""
        objects = []
        text_lower = text.lower()
        
        for obj_type, keywords in PatternMatcher.OBJECT_PATTERNS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    count = text_lower.count(keyword)
                    objects.append({
                        "object_type": obj_type,
                        "name": keyword.title(),
                        "mentions": count
                    })
        return objects
    
    @staticmethod
    def extract_attributes(text: str) -> List[Dict]:
        """Extract numeric attributes"""
        attributes = []
        number_pattern = re.compile(r'\b(\d+)\s+(killed|dead|wounded|injured|hostages?|children)\b', re.IGNORECASE)
        matches = number_pattern.findall(text)
        
        for number, category in matches:
            attributes.append({
                "attribute_type": "casualty_count" if category in ["killed", "dead", "wounded", "injured"] else "population_count",
                "value": int(number),
                "category": category
            })
        return attributes

