#!/usr/bin/env python3
"""
BESLAN SCHOOL SIEGE - OSINT Collection & Extraction
Using old-school OSINT stack (NO AI) with CTAS 5-tuple ontology

Target: Beslan School Siege (September 1-3, 2004)
Method: Scrapy + NLTK + N-V-N-N pattern matching
Output: Normalized CTAS scenario data
"""

import json
import re
from datetime import datetime
from typing import List, Dict, Any
import requests
from bs4 import BeautifulSoup
import nltk
from nltk import pos_tag, word_tokenize
from nltk.chunk import ne_chunk
from collections import defaultdict

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('averaged_perceptron_tagger')
    nltk.download('maxent_ne_chunker')
    nltk.download('words')

class BeslanOSINTCollector:
    """Old-school OSINT collector - no LLMs, just pattern matching"""
    
    def __init__(self):
        self.scenario_data = {
            "scenario_id": "S-BESLAN-001",
            "name": "Beslan School Siege",
            "scenario_type": "real_world",
            "domains": ["kinetic", "terrorism", "hostage_crisis"],
            "metadata": {
                "date": "2004-09-01 to 2004-09-03",
                "location": "Beslan, North Ossetia, Russia",
                "casualties": {"killed": 334, "wounded": 783},
                "hostages": 1100,
                "attackers": 32,
                "duration_hours": 52
            },
            "graph_nodes": {
                "tasks": [],
                "actors": [],
                "objects": [],
                "events": [],
                "attributes": []
            }
        }
        
        # CTAS task patterns (from IED TTL)
        self.task_patterns = {
            "surveillance": ["surveillance", "reconnaissance", "observe", "monitor", "watch"],
            "planning": ["plan", "coordinate", "organize", "prepare"],
            "weaponization": ["explosive", "bomb", "IED", "weapon", "arms"],
            "infiltration": ["enter", "infiltrate", "breach", "access"],
            "hostage_taking": ["hostage", "captive", "prisoner", "detain"],
            "fortification": ["barricade", "fortify", "secure", "defend"],
            "communication": ["communicate", "demand", "negotiate", "message"],
            "execution": ["kill", "shoot", "detonate", "execute"]
        }
        
        # Actor patterns
        self.actor_patterns = {
            "terrorist": ["terrorist", "militant", "insurgent", "fighter", "attacker"],
            "hostage": ["hostage", "victim", "child", "teacher", "parent"],
            "security_force": ["police", "special forces", "military", "FSB", "Alpha Group"]
        }
        
        # Object patterns
        self.object_patterns = {
            "facility": ["school", "gymnasium", "building", "facility"],
            "weapon": ["explosive", "bomb", "grenade", "rifle", "gun"],
            "vehicle": ["vehicle", "car", "truck", "bus"]
        }
    
    def collect_from_wikipedia(self) -> str:
        """Collect baseline data from Wikipedia"""
        url = "https://en.wikipedia.org/wiki/Beslan_school_siege"
        try:
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract main content
            content = soup.find('div', {'id': 'mw-content-text'})
            if content:
                # Remove references, navigation, etc.
                for tag in content.find_all(['sup', 'table', 'div']):
                    tag.decompose()
                return content.get_text()
        except Exception as e:
            print(f"Wikipedia collection failed: {e}")
        return ""
    
    def collect_from_global_terrorism_database(self) -> Dict:
        """Simulate GTD data collection (would use API in production)"""
        # GTD Event ID: 200409010001
        return {
            "event_id": "200409010001",
            "date": "2004-09-01",
            "country": "Russia",
            "region": "North Caucasus",
            "city": "Beslan",
            "attack_type": "Hostage Taking (Barricade Incident)",
            "target_type": "Educational Institution",
            "target_subtype": "School",
            "weapon_type": "Explosives",
            "nkill": 334,
            "nwound": 783,
            "group_name": "Riyadus-Salikhin Reconnaissance and Sabotage Battalion",
            "motive": "Chechen separatism"
        }
    
    def extract_entities_nltk(self, text: str) -> Dict[str, List[str]]:
        """Extract named entities using NLTK (no AI)"""
        entities = {
            "PERSON": [],
            "ORGANIZATION": [],
            "GPE": [],  # Geo-political entity
            "DATE": [],
            "TIME": []
        }
        
        # Tokenize and tag
        tokens = word_tokenize(text)
        pos_tags = pos_tag(tokens)
        chunks = ne_chunk(pos_tags, binary=False)
        
        # Extract named entities
        for chunk in chunks:
            if hasattr(chunk, 'label'):
                entity_type = chunk.label()
                entity_text = ' '.join(c[0] for c in chunk)
                if entity_type in entities:
                    entities[entity_type].append(entity_text)
        
        return entities
    
    def extract_nvnn_patterns(self, text: str) -> List[Dict]:
        """Extract Noun-Verb-Noun-Noun patterns for action identification"""
        patterns = []
        sentences = nltk.sent_tokenize(text)
        
        for sentence in sentences[:100]:  # Limit to first 100 sentences
            tokens = word_tokenize(sentence)
            pos_tags = pos_tag(tokens)
            
            # Look for N-V-N-N pattern
            for i in range(len(pos_tags) - 3):
                if (pos_tags[i][1].startswith('NN') and 
                    pos_tags[i+1][1].startswith('VB') and
                    pos_tags[i+2][1].startswith('NN') and
                    pos_tags[i+3][1].startswith('NN')):
                    
                    pattern = {
                        "actor": pos_tags[i][0],
                        "action": pos_tags[i+1][0],
                        "object1": pos_tags[i+2][0],
                        "object2": pos_tags[i+3][0],
                        "sentence": sentence
                    }
                    patterns.append(pattern)
        
        return patterns
    
    def map_to_ctas_tasks(self, text: str) -> List[Dict]:
        """Map text to CTAS tasks using pattern matching"""
        tasks = []
        text_lower = text.lower()
        
        for task_type, keywords in self.task_patterns.items():
            for keyword in keywords:
                if keyword in text_lower:
                    # Extract context around keyword
                    pattern = re.compile(rf'.{{0,100}}{keyword}.{{0,100}}', re.IGNORECASE)
                    matches = pattern.findall(text)
                    
                    for match in matches[:5]:  # Limit to 5 matches per keyword
                        tasks.append({
                            "task_type": task_type,
                            "keyword": keyword,
                            "context": match.strip(),
                            "ttl_classification": self._classify_ttl(task_type)
                        })
        
        return tasks
    
    def _classify_ttl(self, task_type: str) -> str:
        """Classify task as Mandatory/Desirable/Optional (IED TTL style)"""
        mandatory = ["surveillance", "planning", "infiltration", "hostage_taking"]
        desirable = ["weaponization", "fortification", "communication"]
        optional = ["execution"]
        
        if task_type in mandatory:
            return "mandatory"
        elif task_type in desirable:
            return "desirable"
        else:
            return "optional"
    
    def extract_actors(self, text: str, entities: Dict) -> List[Dict]:
        """Extract actors using pattern matching + NER"""
        actors = []
        text_lower = text.lower()
        
        # Pattern-based extraction
        for actor_type, keywords in self.actor_patterns.items():
            for keyword in keywords:
                if keyword in text_lower:
                    actors.append({
                        "actor_type": actor_type,
                        "name": keyword.title(),
                        "source": "pattern_matching"
                    })
        
        # NER-based extraction
        for person in set(entities.get("PERSON", [])):
            actors.append({
                "actor_type": "individual",
                "name": person,
                "source": "nltk_ner"
            })
        
        # Deduplicate
        seen = set()
        unique_actors = []
        for actor in actors:
            key = (actor["actor_type"], actor["name"])
            if key not in seen:
                seen.add(key)
                unique_actors.append(actor)
        
        return unique_actors
    
    def extract_objects(self, text: str) -> List[Dict]:
        """Extract objects (weapons, facilities, vehicles)"""
        objects = []
        text_lower = text.lower()
        
        for obj_type, keywords in self.object_patterns.items():
            for keyword in keywords:
                if keyword in text_lower:
                    # Count occurrences
                    count = text_lower.count(keyword)
                    objects.append({
                        "object_type": obj_type,
                        "name": keyword.title(),
                        "mentions": count
                    })
        
        return objects
    
    def extract_timeline(self, text: str) -> List[Dict]:
        """Extract temporal events"""
        events = []
        
        # Date patterns
        date_pattern = re.compile(r'(September \d+|Sept\. \d+|\d{1,2} September)', re.IGNORECASE)
        dates = date_pattern.findall(text)
        
        # Time patterns
        time_pattern = re.compile(r'(\d{1,2}:\d{2}|\d{1,2} [ap]\.?m\.?)', re.IGNORECASE)
        times = time_pattern.findall(text)
        
        # Extract sentences with dates/times
        sentences = nltk.sent_tokenize(text)
        for sentence in sentences:
            if any(date in sentence for date in dates) or any(time in sentence for time in times):
                events.append({
                    "event_type": "temporal_marker",
                    "description": sentence[:200],  # Truncate long sentences
                    "source": "regex_extraction"
                })
        
        return events[:20]  # Limit to 20 events
    
    def extract_attributes(self, text: str) -> List[Dict]:
        """Extract attributes (numbers, indicators, metadata)"""
        attributes = []
        
        # Extract numbers (casualties, hostages, etc.)
        number_pattern = re.compile(r'\b(\d+)\s+(killed|dead|wounded|injured|hostages?|children|people)\b', re.IGNORECASE)
        matches = number_pattern.findall(text)
        
        for number, category in matches:
            attributes.append({
                "attribute_type": "casualty_count" if category in ["killed", "dead", "wounded", "injured"] else "population_count",
                "value": int(number),
                "category": category,
                "source": "regex_extraction"
            })
        
        return attributes
    
    def generate_sch_hash(self, content: str) -> str:
        """Generate SCH hash (simplified - real version uses Murmur3)"""
        import hashlib
        hash_obj = hashlib.sha256(content.encode())
        return f"SCH-BESLAN-{hash_obj.hexdigest()[:12]}"
    
    def run_collection(self) -> Dict:
        """Execute full OSINT collection pipeline"""
        print("🔍 Starting Beslan OSINT Collection (No AI)...")
        print("=" * 60)
        
        # Step 1: Collect raw data
        print("\n[1/6] Collecting from Wikipedia...")
        wiki_text = self.collect_from_wikipedia()
        print(f"   ✓ Collected {len(wiki_text)} characters")
        
        print("\n[2/6] Collecting from GTD (simulated)...")
        gtd_data = self.collect_from_global_terrorism_database()
        print(f"   ✓ GTD Event ID: {gtd_data['event_id']}")
        
        # Step 2: Extract entities
        print("\n[3/6] Extracting entities with NLTK...")
        entities = self.extract_entities_nltk(wiki_text)
        print(f"   ✓ Found {len(entities['PERSON'])} persons, {len(entities['ORGANIZATION'])} orgs")
        
        # Step 3: Extract N-V-N-N patterns
        print("\n[4/6] Extracting N-V-N-N action patterns...")
        nvnn_patterns = self.extract_nvnn_patterns(wiki_text)
        print(f"   ✓ Found {len(nvnn_patterns)} action patterns")
        
        # Step 4: Map to CTAS ontology
        print("\n[5/6] Mapping to CTAS 5-tuple ontology...")
        
        # Tasks
        tasks = self.map_to_ctas_tasks(wiki_text)
        self.scenario_data["graph_nodes"]["tasks"] = tasks[:50]  # Limit to 50
        print(f"   ✓ Tasks: {len(tasks)} mapped")
        
        # Actors
        actors = self.extract_actors(wiki_text, entities)
        self.scenario_data["graph_nodes"]["actors"] = actors[:30]
        print(f"   ✓ Actors: {len(actors)} identified")
        
        # Objects
        objects = self.extract_objects(wiki_text)
        self.scenario_data["graph_nodes"]["objects"] = objects[:20]
        print(f"   ✓ Objects: {len(objects)} identified")
        
        # Events
        events = self.extract_timeline(wiki_text)
        self.scenario_data["graph_nodes"]["events"] = events[:20]
        print(f"   ✓ Events: {len(events)} extracted")
        
        # Attributes
        attributes = self.extract_attributes(wiki_text)
        self.scenario_data["graph_nodes"]["attributes"] = attributes[:30]
        print(f"   ✓ Attributes: {len(attributes)} extracted")
        
        # Step 6: Generate hash
        print("\n[6/6] Generating SCH hash...")
        content_for_hash = json.dumps(self.scenario_data, sort_keys=True)
        self.scenario_data["metadata"]["sch"] = self.generate_sch_hash(content_for_hash)
        print(f"   ✓ SCH: {self.scenario_data['metadata']['sch']}")
        
        return self.scenario_data
    
    def save_results(self, output_file: str = "beslan_osint_results.json"):
        """Save results to JSON file"""
        with open(output_file, 'w') as f:
            json.dump(self.scenario_data, f, indent=2)
        print(f"\n✅ Results saved to: {output_file}")
        print(f"   Total nodes: {sum(len(v) for v in self.scenario_data['graph_nodes'].values())}")

if __name__ == "__main__":
    collector = BeslanOSINTCollector()
    results = collector.run_collection()
    collector.save_results()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 BESLAN OSINT EXTRACTION SUMMARY (NO AI)")
    print("=" * 60)
    print(f"Scenario: {results['name']}")
    print(f"Date: {results['metadata']['date']}")
    print(f"Location: {results['metadata']['location']}")
    print(f"Casualties: {results['metadata']['casualties']['killed']} killed, {results['metadata']['casualties']['wounded']} wounded")
    print(f"\nGraph Nodes Extracted:")
    print(f"  - Tasks: {len(results['graph_nodes']['tasks'])}")
    print(f"  - Actors: {len(results['graph_nodes']['actors'])}")
    print(f"  - Objects: {len(results['graph_nodes']['objects'])}")
    print(f"  - Events: {len(results['graph_nodes']['events'])}")
    print(f"  - Attributes: {len(results['graph_nodes']['attributes'])}")
    print(f"\nSCH Hash: {results['metadata']['sch']}")
    print("\n🎯 Ready for graph insertion and matroid analysis")

