#!/usr/bin/env python3
"""
People/Actor Extraction Module
Extracts person entities using CTAS Actor ontology
"""

import re
from typing import List, Dict
try:
    import nltk
    from nltk import pos_tag, word_tokenize, ne_chunk
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False

class PeopleExtractor:
    """Extract people/actors from text using CTAS ontology"""
    
    # CTAS Actor Types (from IED TTL + 5-tuple ontology)
    ACTOR_TYPES = {
        "adversary": ["terrorist", "militant", "insurgent", "fighter", "attacker", "perpetrator", "suspect"],
        "victim": ["hostage", "victim", "casualty", "civilian", "child", "teacher", "student"],
        "security_force": ["police", "officer", "agent", "soldier", "special forces", "FSB", "Alpha Group", "SWAT"],
        "leadership": ["commander", "leader", "chief", "director", "president", "minister", "general"],
        "support": ["medic", "doctor", "nurse", "negotiator", "translator", "analyst"]
    }
    
    # Role indicators
    ROLE_PATTERNS = {
        "commander": r"(commander|leader|chief)\s+(\w+)",
        "operative": r"(operative|agent|member)\s+(\w+)",
        "official": r"(official|minister|director)\s+(\w+)"
    }
    
    @staticmethod
    def extract_people_nltk(text: str) -> List[Dict]:
        """Extract people using NLTK NER"""
        if not NLTK_AVAILABLE:
            return []
        
        people = []
        tokens = word_tokenize(text)
        pos_tags = pos_tag(tokens)
        chunks = ne_chunk(pos_tags, binary=False)
        
        for chunk in chunks:
            if hasattr(chunk, 'label') and chunk.label() == 'PERSON':
                name = ' '.join(c[0] for c in chunk)
                people.append({
                    "name": name,
                    "actor_type": "individual",
                    "source": "nltk_ner",
                    "confidence": 0.8
                })
        
        return people
    
    @staticmethod
    def extract_people_pattern(text: str) -> List[Dict]:
        """Extract people using pattern matching"""
        people = []
        text_lower = text.lower()
        
        for actor_type, keywords in PeopleExtractor.ACTOR_TYPES.items():
            for keyword in keywords:
                if keyword in text_lower:
                    # Extract context around keyword
                    pattern = re.compile(rf'.{{0,50}}{keyword}.{{0,50}}', re.IGNORECASE)
                    matches = pattern.findall(text)
                    
                    for match in matches[:3]:  # Limit to 3 per keyword
                        people.append({
                            "name": keyword.title(),
                            "actor_type": actor_type,
                            "context": match.strip(),
                            "source": "pattern_matching",
                            "confidence": 0.6
                        })
        
        return people
    
    @staticmethod
    def extract_roles(text: str) -> List[Dict]:
        """Extract roles and positions"""
        roles = []
        
        for role_type, pattern in PeopleExtractor.ROLE_PATTERNS.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                roles.append({
                    "role": match[0],
                    "name": match[1] if len(match) > 1 else "Unknown",
                    "role_type": role_type
                })
        
        return roles
    
    @staticmethod
    def extract_all(text: str) -> Dict[str, List[Dict]]:
        """Extract all people-related entities"""
        return {
            "people_ner": PeopleExtractor.extract_people_nltk(text),
            "people_pattern": PeopleExtractor.extract_people_pattern(text),
            "roles": PeopleExtractor.extract_roles(text)
        }
    
    @staticmethod
    def deduplicate(people_list: List[Dict]) -> List[Dict]:
        """Remove duplicates based on name and type"""
        seen = set()
        unique = []
        
        for person in people_list:
            key = (person.get("name", "").lower(), person.get("actor_type", ""))
            if key not in seen and key[0]:
                seen.add(key)
                unique.append(person)
        
        return unique

