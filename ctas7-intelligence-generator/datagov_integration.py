#!/usr/bin/env python3
"""
Data.gov Integration for Government Datasets
Raw intelligence data from federal agencies
"""

import requests
import json
import pandas as pd
import time
from pathlib import Path
from datetime import datetime
import google.generativeai as genai
import os
import csv
from urllib.parse import urljoin

class DataGovIntelligenceHarvester:
    def __init__(self):
        # Data.gov CKAN API
        self.datagov_base = "https://catalog.data.gov"
        self.api_base = f"{self.datagov_base}/api/3"

        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Cache directories
        self.cache_dir = Path("datagov_intelligence_cache")
        self.datasets_dir = self.cache_dir / "datasets"
        self.cache_dir.mkdir(exist_ok=True)
        self.datasets_dir.mkdir(exist_ok=True)

        # Rate limiting
        self.request_delay = 1.0

    def search_security_datasets(self, query, limit=50):
        """Search Data.gov for security-related datasets"""
        url = f"{self.api_base}/action/package_search"

        params = {
            'q': query,
            'rows': limit,
            'sort': 'metadata_modified desc'
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            else:
                print(f"Data.gov search error: {response.status_code}")
                return None

        except Exception as e:
            print(f"Data.gov search failed: {e}")
            return None

    def get_dataset_details(self, dataset_id):
        """Get detailed information about specific dataset"""
        url = f"{self.api_base}/action/package_show"

        params = {'id': dataset_id}

        try:
            response = requests.get(url, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            return None

        except Exception as e:
            print(f"Dataset details failed: {e}")
            return None

    def analyze_dataset_intelligence_value(self, dataset):
        """Use ABE to assess intelligence value of dataset"""
        prompt = f"""
        Assess the terrorism/counterterrorism intelligence value of this government dataset:

        Title: {dataset.get('title', 'Unknown')}
        Organization: {dataset.get('organization', {}).get('title', 'Unknown')}
        Description: {dataset.get('notes', 'No description')[:800]}
        Tags: {', '.join([tag.get('name', '') for tag in dataset.get('tags', [])])}

        Resources: {len(dataset.get('resources', []))} files available

        Evaluate for:
        1. THREAT ANALYSIS: Does this data reveal threat patterns or vulnerabilities?
        2. OPERATIONAL INTELLIGENCE: Can this data support counterterrorism operations?
        3. VULNERABILITY ASSESSMENT: Does this expose security gaps or weaknesses?
        4. PATTERN RECOGNITION: Can this data identify terrorist/criminal patterns?
        5. POLICY INSIGHTS: Does this inform counterterrorism policy decisions?
        6. HISTORICAL CONTEXT: Does this provide background on past incidents?

        Rate intelligence value: HIGH/MEDIUM/LOW
        Provide specific reasoning for rating.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Dataset analysis failed: {e}")
            return "Analysis failed"

    def download_dataset_sample(self, resource_url, dataset_name):
        """Download sample of dataset for analysis"""
        try:
            response = requests.get(resource_url, timeout=60)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                # Save sample data
                filename = f"{dataset_name.replace(' ', '_')[:30]}_sample"

                # Determine file type and save accordingly
                if 'json' in response.headers.get('content-type', ''):
                    filepath = self.datasets_dir / f"{filename}.json"
                    with open(filepath, 'w') as f:
                        json.dump(response.json(), f, indent=2)
                elif 'csv' in resource_url.lower() or 'csv' in response.headers.get('content-type', ''):
                    filepath = self.datasets_dir / f"{filename}.csv"
                    with open(filepath, 'w') as f:
                        f.write(response.text)
                else:
                    filepath = self.datasets_dir / f"{filename}.txt"
                    with open(filepath, 'wb') as f:
                        f.write(response.content)

                return filepath

            return None

        except Exception as e:
            print(f"Dataset download failed: {e}")
            return None

    def gather_terrorism_datasets(self):
        """Gather terrorism and security-related datasets"""
        security_queries = [
            "terrorism",
            "counterterrorism",
            "homeland security",
            "TSA security",
            "border security",
            "FBI crime",
            "sanctions",
            "OFAC",
            "suspicious activity",
            "threat indicators",
            "emergency response",
            "critical infrastructure",
            "cybersecurity incidents",
            "aviation security"
        ]

        all_datasets = []

        for query in security_queries:
            print(f"\n🔍 Searching datasets: {query}")

            search_results = self.search_security_datasets(query, limit=20)

            if search_results and 'result' in search_results:
                for dataset in search_results['result']['results']:
                    # Get detailed dataset information
                    details = self.get_dataset_details(dataset['id'])
                    if details and 'result' in details:
                        dataset_full = details['result']

                        # ABE intelligence assessment
                        intelligence_value = self.analyze_dataset_intelligence_value(dataset_full)
                        dataset_full['abe_intelligence_assessment'] = intelligence_value
                        dataset_full['search_query'] = query

                        # Filter for high-value datasets
                        if 'HIGH' in intelligence_value or 'MEDIUM' in intelligence_value:
                            # Download sample data if available
                            resources = dataset_full.get('resources', [])
                            if resources:
                                for resource in resources[:2]:  # Limit downloads
                                    if resource.get('url'):
                                        sample_path = self.download_dataset_sample(
                                            resource['url'],
                                            dataset_full['title']
                                        )
                                        if sample_path:
                                            resource['sample_file'] = str(sample_path)

                            all_datasets.append(dataset_full)
                            print(f"  ✅ High-value dataset: {dataset_full['title'][:50]}...")

                    time.sleep(self.request_delay)

        return all_datasets

    def gather_agency_specific_datasets(self):
        """Gather datasets from specific intelligence/security agencies"""
        agency_queries = [
            "organization:department-of-homeland-security",
            "organization:federal-bureau-of-investigation",
            "organization:transportation-security-administration",
            "organization:customs-and-border-protection",
            "organization:department-of-treasury",
            "organization:department-of-state",
            "organization:department-of-defense",
            "organization:national-institute-of-standards-and-technology"
        ]

        agency_datasets = []

        for agency_query in agency_queries:
            print(f"\n🏛️ Agency datasets: {agency_query}")

            # Search with organization filter
            search_results = self.search_security_datasets(
                f"security OR terrorism OR threat AND {agency_query}",
                limit=15
            )

            if search_results and 'result' in search_results:
                for dataset in search_results['result']['results']:
                    details = self.get_dataset_details(dataset['id'])
                    if details and 'result' in details:
                        dataset_full = details['result']

                        # Focus on security-related datasets from agencies
                        intelligence_value = self.analyze_dataset_intelligence_value(dataset_full)
                        if 'HIGH' in intelligence_value or 'MEDIUM' in intelligence_value:
                            dataset_full['abe_intelligence_assessment'] = intelligence_value
                            dataset_full['agency_query'] = agency_query

                            agency_datasets.append(dataset_full)
                            print(f"  ✅ Agency dataset: {dataset_full['title'][:50]}...")

                    time.sleep(self.request_delay)

        return agency_datasets

    def analyze_dataset_samples(self, datasets):
        """Use ABE to analyze downloaded dataset samples"""
        sample_analyses = []

        for dataset in datasets:
            if 'resources' in dataset:
                for resource in dataset['resources']:
                    if 'sample_file' in resource:
                        sample_file = Path(resource['sample_file'])

                        if sample_file.exists():
                            print(f"  🔍 Analyzing sample: {sample_file.name}")

                            # Read sample data
                            try:
                                if sample_file.suffix == '.json':
                                    with open(sample_file, 'r') as f:
                                        sample_data = json.load(f)
                                    data_preview = str(sample_data)[:1000]
                                elif sample_file.suffix == '.csv':
                                    df = pd.read_csv(sample_file, nrows=10)
                                    data_preview = df.to_string()
                                else:
                                    with open(sample_file, 'r', encoding='utf-8', errors='ignore') as f:
                                        data_preview = f.read()[:1000]

                                # ABE analysis of actual data
                                analysis_prompt = f"""
                                Analyze this government dataset sample for actionable intelligence:

                                Dataset: {dataset['title']}
                                Organization: {dataset.get('organization', {}).get('title', 'Unknown')}

                                Sample Data:
                                {data_preview}

                                Extract:
                                1. INTELLIGENCE PATTERNS: What patterns or trends are visible?
                                2. OPERATIONAL VALUE: How could this data support operations?
                                3. THREAT INDICATORS: What threat-related information is present?
                                4. VULNERABILITY INSIGHTS: What vulnerabilities does this reveal?
                                5. CORRELATION OPPORTUNITIES: How could this correlate with other intelligence?

                                Provide specific, actionable intelligence insights.
                                """

                                response = self.model.generate_content(analysis_prompt)

                                sample_analyses.append({
                                    'dataset_title': dataset['title'],
                                    'sample_file': str(sample_file),
                                    'abe_sample_analysis': response.text,
                                    'organization': dataset.get('organization', {}).get('title', 'Unknown')
                                })

                            except Exception as e:
                                print(f"    ❌ Sample analysis failed: {e}")

        return sample_analyses

    def generate_datagov_intelligence_summary(self, datasets, sample_analyses):
        """Generate executive intelligence summary from Data.gov findings"""
        prompt = f"""
        Generate executive intelligence summary from {len(datasets)} government datasets:

        Datasets include security, terrorism, and intelligence data from:
        - Department of Homeland Security
        - FBI, TSA, CBP
        - Treasury OFAC
        - State Department
        - Other federal agencies

        Sample analysis of {len(sample_analyses)} datasets reveals actual data patterns.

        Create summary addressing:
        1. DATA-DRIVEN THREAT INSIGHTS: What threat patterns are revealed in the data?
        2. VULNERABILITY INDICATORS: What security gaps are exposed by government data?
        3. OPERATIONAL INTELLIGENCE: What actionable intelligence can be derived?
        4. POLICY IMPLICATIONS: What do the datasets reveal about policy effectiveness?
        5. CORRELATION OPPORTUNITIES: How can different datasets be combined for insights?
        6. INTELLIGENCE GAPS: What critical data is missing or incomplete?

        Format as professional data intelligence brief.
        Include specific dataset names and intelligence findings.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Data intelligence summary generation failed"

    def save_intelligence_package(self, data, category):
        """Save Data.gov intelligence package"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"datagov_{category}_{timestamp}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

def main():
    print("📊 Data.gov Intelligence Harvester - Government Dataset Analysis")
    print("=" * 70)

    harvester = DataGovIntelligenceHarvester()

    # Gather terrorism/security datasets
    print("\n🔍 Gathering terrorism and security datasets...")
    security_datasets = harvester.gather_terrorism_datasets()
    if security_datasets:
        security_file = harvester.save_intelligence_package(security_datasets, "security_datasets")
        print(f"   ✅ {len(security_datasets)} security datasets saved: {security_file.name}")

    # Gather agency-specific datasets
    print("\n🏛️ Gathering agency-specific security datasets...")
    agency_datasets = harvester.gather_agency_specific_datasets()
    if agency_datasets:
        agency_file = harvester.save_intelligence_package(agency_datasets, "agency_datasets")
        print(f"   ✅ {len(agency_datasets)} agency datasets saved: {agency_file.name}")

    # Analyze dataset samples
    all_datasets = security_datasets + agency_datasets
    if all_datasets:
        print(f"\n🔬 Analyzing downloaded dataset samples...")
        sample_analyses = harvester.analyze_dataset_samples(all_datasets)
        if sample_analyses:
            sample_file = harvester.save_intelligence_package(sample_analyses, "dataset_sample_analysis")
            print(f"   ✅ {len(sample_analyses)} sample analyses saved: {sample_file.name}")

        # Generate intelligence summary
        print(f"\n📋 Generating Data.gov intelligence summary...")
        summary = harvester.generate_datagov_intelligence_summary(all_datasets, sample_analyses)

        summary_file = harvester.cache_dir / f"datagov_intelligence_summary_{datetime.now().strftime('%Y%m%d')}.txt"
        with open(summary_file, 'w') as f:
            f.write(summary)

        print(f"   ✅ Data intelligence summary generated: {summary_file.name}")

    print(f"\n🎯 Data.gov intelligence harvesting complete!")
    print(f"   Total datasets analyzed: {len(all_datasets)}")
    print(f"   Sample analyses: {len(sample_analyses) if 'sample_analyses' in locals() else 0}")
    print(f"   Cache directory: {harvester.cache_dir}")
    print(f"   Dataset samples: {harvester.datasets_dir}")

    print(f"\n💡 Data.gov provides:")
    print(f"   • Raw government intelligence data")
    print(f"   • Agency-specific security datasets")
    print(f"   • Threat pattern analysis from actual data")
    print(f"   • Vulnerability insights from government sources")

if __name__ == "__main__":
    main()