#!/usr/bin/env python3
"""
Beslan School Siege - OSINT Extraction (CLEAN VERSION)
50 lines vs. 875 lines - same functionality
"""

from osint_extractors import BaseOSINTExtractor, PatternMatcher, WebScraper

class BeslanExtractor(BaseOSINTExtractor):
    """Beslan-specific extractor"""
    
    def __init__(self):
        super().__init__("S-BESLAN-001", "Beslan School Siege")
        self.scenario_data["metadata"] = {
            "date": "2004-09-01 to 2004-09-03",
            "location": "Beslan, North Ossetia, Russia",
            "casualties": {"killed": 334, "wounded": 783},
            "hostages": 1100,
            "attackers": 32,
            "duration_hours": 52
        }
    
    def collect_data(self) -> str:
        """Collect from Wikipedia"""
        print("🔍 Collecting from Wikipedia...")
        text = WebScraper.scrape_wikipedia("Beslan_school_siege")
        print(f"   ✓ Collected {len(text)} characters")
        return text
    
    def extract_tasks(self, text: str) -> list:
        return PatternMatcher.extract_tasks(text)
    
    def extract_actors(self, text: str) -> list:
        return PatternMatcher.extract_actors(text)
    
    def run(self):
        """Execute extraction pipeline"""
        text = self.collect_data()
        
        print("📊 Extracting graph nodes...")
        self.scenario_data["graph_nodes"]["tasks"] = self.extract_tasks(text)[:50]
        self.scenario_data["graph_nodes"]["actors"] = self.extract_actors(text)[:30]
        self.scenario_data["graph_nodes"]["objects"] = PatternMatcher.extract_objects(text)[:20]
        self.scenario_data["graph_nodes"]["attributes"] = PatternMatcher.extract_attributes(text)[:30]
        
        self.scenario_data["metadata"]["sch"] = self.generate_sch(text)
        
        print(f"✅ Extracted {sum(len(v) for v in self.scenario_data['graph_nodes'].values())} nodes")
        return self.scenario_data

if __name__ == "__main__":
    extractor = BeslanExtractor()
    results = extractor.run()
    extractor.save("beslan_results.json")

