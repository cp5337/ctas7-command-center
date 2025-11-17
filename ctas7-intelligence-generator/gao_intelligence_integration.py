#!/usr/bin/env python3
"""
GAO Intelligence Integration
Government Accountability Office reports for threat analysis
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
import google.generativeai as genai
import os
from bs4 import BeautifulSoup
import re

class GAOIntelligenceGatherer:
    def __init__(self):
        # GAO endpoints
        self.gao_base = "https://www.gao.gov"
        self.gao_api = "https://www.gao.gov/api"

        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Cache directory
        self.cache_dir = Path("gao_intelligence_cache")
        self.cache_dir.mkdir(exist_ok=True)

        # Rate limiting
        self.request_delay = 1.0

    def get_terrorism_topics(self):
        """Get GAO terrorism and security related topics"""
        terrorism_topics = [
            "homeland-security",
            "terrorism",
            "cybersecurity",
            "counterterrorism",
            "national-security",
            "intelligence",
            "border-security",
            "transportation-security",
            "aviation-security",
            "nuclear-security",
            "emergency-preparedness",
            "information-security",
            "critical-infrastructure-protection"
        ]
        return terrorism_topics

    def search_gao_reports(self, topic, max_results=50):
        """Search GAO reports for specific topic"""
        # GAO search URL structure
        search_url = f"{self.gao_base}/reports-testimonies"

        params = {
            'q': topic,
            'advanced': '1'
        }

        try:
            response = requests.get(search_url, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                # Parse search results
                soup = BeautifulSoup(response.text, 'html.parser')
                reports = self.parse_search_results(soup, topic)
                return reports[:max_results]

            return []

        except Exception as e:
            print(f"GAO search failed for {topic}: {e}")
            return []

    def parse_search_results(self, soup, search_topic):
        """Parse GAO search results page"""
        reports = []

        # Look for report listings (GAO uses specific CSS classes)
        report_items = soup.find_all(['div', 'article'], class_=re.compile(r'report|result|item'))

        for item in report_items:
            try:
                # Extract basic report info
                title_elem = item.find(['h2', 'h3', 'h4', 'a'])
                if title_elem:
                    title = title_elem.get_text(strip=True)

                    # Get report URL
                    link_elem = title_elem if title_elem.name == 'a' else title_elem.find('a')
                    if link_elem and 'href' in link_elem.attrs:
                        report_url = link_elem['href']
                        if not report_url.startswith('http'):
                            report_url = self.gao_base + report_url

                        # Extract additional metadata
                        date_elem = item.find(string=re.compile(r'\d{1,2}/\d{1,2}/\d{4}|\d{4}'))
                        report_date = date_elem.strip() if date_elem else "Unknown"

                        # Extract GAO ID if present
                        gao_id_elem = item.find(string=re.compile(r'GAO-\d{2}-\d+'))
                        gao_id = gao_id_elem.strip() if gao_id_elem else "Unknown"

                        reports.append({
                            'title': title,
                            'url': report_url,
                            'gao_id': gao_id,
                            'date': report_date,
                            'search_topic': search_topic,
                            'source': 'GAO'
                        })

            except Exception as e:
                continue

        return reports

    def get_report_details(self, report_url):
        """Get detailed content from GAO report page"""
        try:
            response = requests.get(report_url, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')

                # Extract report details
                details = {
                    'full_text': '',
                    'summary': '',
                    'recommendations': [],
                    'key_findings': []
                }

                # Get summary/highlights
                summary_section = soup.find(['div', 'section'], class_=re.compile(r'summary|highlight|excerpt'))
                if summary_section:
                    details['summary'] = summary_section.get_text(strip=True)

                # Get recommendations
                rec_section = soup.find(['div', 'section'], string=re.compile(r'recommendation', re.I))
                if rec_section:
                    rec_parent = rec_section.find_parent()
                    if rec_parent:
                        rec_items = rec_parent.find_all(['li', 'p'])
                        details['recommendations'] = [item.get_text(strip=True) for item in rec_items]

                # Get main content
                content_div = soup.find(['div', 'section', 'article'], class_=re.compile(r'content|body|main'))
                if content_div:
                    details['full_text'] = content_div.get_text(strip=True)[:5000]  # Limit size

                return details

        except Exception as e:
            print(f"Failed to get report details: {e}")
            return None

    def analyze_gao_report_intelligence(self, report_data):
        """Use ABE to analyze GAO report for intelligence value"""
        prompt = f"""
        Analyze this GAO report for terrorism/counterterrorism intelligence:

        Title: {report_data.get('title', 'Unknown')}
        GAO ID: {report_data.get('gao_id', 'Unknown')}
        Date: {report_data.get('date', 'Unknown')}
        Summary: {report_data.get('summary', 'No summary')[:800]}

        Extract intelligence insights:
        1. VULNERABILITIES: What security gaps or weaknesses are identified?
        2. THREATS: What specific threats or threat actors are mentioned?
        3. POLICY FAILURES: What government programs or policies are criticized?
        4. FINANCIAL WASTE: What counterterrorism spending is ineffective?
        5. RECOMMENDATIONS: What improvements does GAO suggest?
        6. OPERATIONAL INSIGHTS: What tactical/operational intelligence is revealed?
        7. INTELLIGENCE VALUE: Rate as HIGH/MEDIUM/LOW for threat analysis

        Focus on actionable intelligence for counterterrorism operations.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"ABE analysis failed: {e}")
            return "Analysis failed"

    def gather_counterterrorism_reports(self):
        """Gather GAO reports on counterterrorism topics"""
        ct_topics = [
            "counterterrorism",
            "terrorism prevention",
            "homeland security effectiveness",
            "TSA security gaps",
            "FBI terrorism investigations",
            "DHS threat assessment",
            "border security terrorism",
            "aviation security failures",
            "critical infrastructure protection",
            "intelligence community coordination"
        ]

        all_reports = []

        for topic in ct_topics:
            print(f"\n🔍 Searching GAO reports: {topic}")

            reports = self.search_gao_reports(topic, max_results=15)

            for report in reports:
                # Get detailed content
                details = self.get_report_details(report['url'])
                if details:
                    report.update(details)

                # ABE intelligence analysis
                intelligence_analysis = self.analyze_gao_report_intelligence(report)
                report['abe_intelligence_analysis'] = intelligence_analysis

                # Filter for high-value intelligence
                if 'HIGH' in intelligence_analysis or 'MEDIUM' in intelligence_analysis:
                    all_reports.append(report)
                    print(f"  ✅ High-value report: {report['title'][:60]}...")

                time.sleep(self.request_delay)

        return all_reports

    def gather_security_program_assessments(self):
        """Gather GAO assessments of security programs"""
        security_programs = [
            "TSA effectiveness",
            "CBP border security",
            "FEMA emergency response",
            "FBI counterterrorism",
            "CIA intelligence operations",
            "NSA surveillance programs",
            "DHS coordination",
            "Secret Service security",
            "Coast Guard maritime security"
        ]

        program_assessments = []

        for program in security_programs:
            print(f"\n📊 GAO program assessment: {program}")

            reports = self.search_gao_reports(program, max_results=10)

            for report in reports:
                details = self.get_report_details(report['url'])
                if details:
                    report.update(details)

                # Focus on program effectiveness analysis
                effectiveness_prompt = f"""
                Analyze this GAO report for security program effectiveness:

                Title: {report.get('title', 'Unknown')}

                Extract:
                1. Program failures and weaknesses
                2. Budget waste and inefficiencies
                3. Security gaps that could be exploited
                4. Recommendations to improve effectiveness
                5. Impact on national security

                Rate program effectiveness: EFFECTIVE/PARTIALLY_EFFECTIVE/INEFFECTIVE
                """

                try:
                    effectiveness_analysis = self.model.generate_content(effectiveness_prompt)
                    report['program_effectiveness_analysis'] = effectiveness_analysis.text

                    if 'INEFFECTIVE' in effectiveness_analysis.text or 'PARTIALLY_EFFECTIVE' in effectiveness_analysis.text:
                        program_assessments.append(report)
                        print(f"  ⚠️ Program issues identified: {report['title'][:50]}...")

                except:
                    continue

                time.sleep(self.request_delay)

        return program_assessments

    def generate_gao_intelligence_summary(self, all_reports):
        """Generate executive intelligence summary from GAO reports"""
        prompt = f"""
        Generate an executive intelligence summary from {len(all_reports)} GAO reports on terrorism and security:

        Reports cover counterterrorism programs, security assessments, and government effectiveness.

        Create summary with:
        1. CRITICAL VULNERABILITIES: What are the biggest security gaps identified by GAO?
        2. PROGRAM FAILURES: Which counterterrorism programs are failing or ineffective?
        3. FINANCIAL WASTE: How much money is being wasted on ineffective security measures?
        4. THREAT IMPLICATIONS: How do these failures create opportunities for terrorists?
        5. POLICY RECOMMENDATIONS: What does GAO recommend to improve security?
        6. SYSTEMIC ISSUES: What are recurring problems across multiple agencies?

        Format as professional intelligence brief for senior decision makers.
        Include specific GAO report citations and recommendations.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Intelligence summary generation failed"

    def save_intelligence_package(self, data, category):
        """Save GAO intelligence data"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"gao_{category}_{timestamp}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

def main():
    print("📊 GAO Intelligence Gatherer - Government Accountability Analysis")
    print("=" * 70)

    gatherer = GAOIntelligenceGatherer()

    # Gather counterterrorism reports
    print("\n🛡️ Gathering GAO counterterrorism reports...")
    ct_reports = gatherer.gather_counterterrorism_reports()

    if ct_reports:
        ct_file = gatherer.save_intelligence_package(ct_reports, "counterterrorism_reports")
        print(f"   ✅ {len(ct_reports)} counterterrorism reports saved: {ct_file.name}")

    # Gather security program assessments
    print("\n🏛️ Gathering GAO security program assessments...")
    program_reports = gatherer.gather_security_program_assessments()

    if program_reports:
        program_file = gatherer.save_intelligence_package(program_reports, "security_program_assessments")
        print(f"   ✅ {len(program_reports)} program assessments saved: {program_file.name}")

    # Generate intelligence summary
    all_reports = ct_reports + program_reports
    if all_reports:
        print(f"\n📋 Generating GAO intelligence summary...")
        summary = gatherer.generate_gao_intelligence_summary(all_reports)

        summary_file = gatherer.cache_dir / f"gao_intelligence_summary_{datetime.now().strftime('%Y%m%d')}.txt"
        with open(summary_file, 'w') as f:
            f.write(summary)

        print(f"   ✅ Intelligence summary generated: {summary_file.name}")

    print(f"\n🎯 GAO intelligence gathering complete!")
    print(f"   Total reports analyzed: {len(all_reports)}")
    print(f"   Cache directory: {gatherer.cache_dir}")
    print(f"\n💡 GAO reports reveal government security program failures and vulnerabilities")

if __name__ == "__main__":
    main()