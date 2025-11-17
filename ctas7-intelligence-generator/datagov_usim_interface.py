#!/usr/bin/env python3
"""
Data.gov USIM (Universal Systems Interface Module)
Smart awareness and on-demand connection system for geospatial and intelligence data
"""

import asyncio
import json
import time
from pathlib import Path
from datetime import datetime
import google.generativeai as genai
import os
import sqlite3
import re
from playwright.async_api import async_playwright
from urllib.parse import urljoin, urlparse, parse_qs
import aiohttp
import aiofiles

class DataGovUSIM:
    def __init__(self):
        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # USIM cache and intelligence database
        self.usim_dir = Path("datagov_usim")
        self.usim_dir.mkdir(exist_ok=True)
        self.db_path = self.usim_dir / "usim_intelligence.db"

        # Connection profiles directory
        self.profiles_dir = self.usim_dir / "connection_profiles"
        self.profiles_dir.mkdir(exist_ok=True)

        # Initialize USIM database
        self.init_usim_database()

        # Geospatial intelligence focus areas
        self.geospatial_intel_focus = {
            "critical_infrastructure": [
                "power plant", "nuclear facility", "dam", "airport", "port",
                "military base", "government building", "embassy"
            ],
            "border_security": [
                "border", "crossing", "checkpoint", "fence", "wall",
                "patrol", "surveillance", "monitoring"
            ],
            "transportation": [
                "highway", "bridge", "tunnel", "railroad", "transit",
                "logistics", "supply chain", "cargo"
            ],
            "surveillance": [
                "camera", "sensor", "monitoring", "detection", "tracking",
                "observation", "reconnaissance", "intelligence"
            ],
            "threat_indicators": [
                "vulnerable", "risk", "threat", "security", "protection",
                "hazard", "emergency", "disaster", "incident"
            ]
        }

        # Data quality indicators (to avoid "shit" datasets)
        self.quality_indicators = {
            "high_quality": [
                "real-time", "updated daily", "official", "authoritative",
                "verified", "validated", "quality assured", "standardized"
            ],
            "low_quality": [
                "experimental", "draft", "incomplete", "legacy",
                "deprecated", "unmaintained", "partial", "sample only"
            ]
        }

    def init_usim_database(self):
        """Initialize USIM intelligence and connection database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Dataset intelligence profiles
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS dataset_profiles (
                dataset_id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                agency TEXT,
                data_type TEXT,
                access_level TEXT,
                quality_score INTEGER,
                intelligence_value TEXT,
                geospatial_relevance TEXT,
                connection_method TEXT,
                api_endpoint TEXT,
                access_requirements TEXT,
                update_frequency TEXT,
                data_format TEXT,
                size_estimate TEXT,
                streaming_capable BOOLEAN,
                mission_priority TEXT,
                abe_assessment TEXT,
                connection_profile_path TEXT,
                last_assessed TEXT
            )
        ''')

        # Connection endpoints and methods
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS connection_endpoints (
                endpoint_id TEXT PRIMARY KEY,
                dataset_id TEXT,
                endpoint_url TEXT,
                method_type TEXT,
                authentication_required BOOLEAN,
                rate_limits TEXT,
                response_format TEXT,
                test_query TEXT,
                test_result TEXT,
                connection_quality TEXT,
                latency_ms INTEGER,
                reliability_score REAL,
                last_tested TEXT,
                FOREIGN KEY (dataset_id) REFERENCES dataset_profiles (dataset_id)
            )
        ''')

        # Stream configurations for mission-critical data
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS stream_configs (
                stream_id TEXT PRIMARY KEY,
                dataset_id TEXT,
                mission_requirement TEXT,
                stream_type TEXT,
                polling_interval INTEGER,
                data_filters TEXT,
                alert_conditions TEXT,
                output_format TEXT,
                destination TEXT,
                status TEXT,
                created_date TEXT,
                last_active TEXT,
                FOREIGN KEY (dataset_id) REFERENCES dataset_profiles (dataset_id)
            )
        ''')

        # Query history and intelligence requests
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS query_intelligence (
                query_id TEXT PRIMARY KEY,
                query_text TEXT,
                query_type TEXT,
                datasets_searched TEXT,
                results_summary TEXT,
                intelligence_value TEXT,
                query_date TEXT,
                response_time_ms INTEGER,
                success_rate REAL
            )
        ''')

        conn.commit()
        conn.close()

    async def discover_geospatial_datasets(self, browser):
        """Discover and assess geospatial datasets for intelligence value"""
        print("🗺️ Discovering Geospatial Intelligence Datasets...")

        page = await browser.new_page()

        # Start with geospatial metadata catalog
        geospatial_urls = [
            'https://catalog.data.gov/dataset/?metadata_type=geospatial',
            'https://catalog.data.gov/dataset/?metadata_type=geospatial&organization_type=Federal+Government',
            'https://catalog.data.gov/dataset/?metadata_type=geospatial&tags=security',
            'https://catalog.data.gov/dataset/?metadata_type=geospatial&tags=infrastructure'
        ]

        for url in geospatial_urls:
            print(f"    📍 Analyzing: {url}")
            await self.analyze_geospatial_page(page, url)

        await page.close()

    async def analyze_geospatial_page(self, page, url):
        """Analyze geospatial catalog page for intelligence datasets"""
        try:
            await page.goto(url, wait_until='networkidle')

            # Extract dataset listings
            datasets = await page.evaluate('''
                () => {
                    const datasets = [];
                    const datasetElements = document.querySelectorAll('.dataset-item');

                    datasetElements.forEach(element => {
                        const titleElement = element.querySelector('h3 a');
                        const descElement = element.querySelector('.dataset-description');
                        const orgElement = element.querySelector('.dataset-organization');
                        const formatElements = element.querySelectorAll('.format-label');

                        if (titleElement) {
                            datasets.push({
                                title: titleElement.textContent.trim(),
                                url: titleElement.href,
                                description: descElement?.textContent.trim() || '',
                                organization: orgElement?.textContent.trim() || '',
                                formats: Array.from(formatElements).map(el => el.textContent.trim())
                            });
                        }
                    });

                    return datasets;
                }
            ''')

            # Process each dataset for intelligence value
            for dataset in datasets[:20]:  # Limit to avoid overwhelming
                await self.assess_dataset_intelligence_usim(page, dataset)

        except Exception as e:
            print(f"      ❌ Geospatial page analysis failed: {e}")

    async def assess_dataset_intelligence_usim(self, page, dataset):
        """USIM assessment: intelligence value without downloading data"""
        try:
            # Navigate to dataset page for detailed assessment
            await page.goto(dataset['url'], wait_until='networkidle')

            # Extract comprehensive metadata without downloading data
            dataset_metadata = await page.evaluate('''
                () => {
                    const metadata = {};

                    // Basic information
                    metadata.title = document.querySelector('h1')?.textContent?.trim() || '';
                    metadata.description = document.querySelector('.dataset-description, .notes')?.textContent?.trim() || '';
                    metadata.organization = document.querySelector('.dataset-organization a')?.textContent?.trim() || '';

                    // Technical metadata
                    const metadataTable = document.querySelector('.dataset-details');
                    if (metadataTable) {
                        const rows = metadataTable.querySelectorAll('dt, dd');
                        for (let i = 0; i < rows.length; i += 2) {
                            if (rows[i] && rows[i+1]) {
                                const key = rows[i].textContent.trim().toLowerCase();
                                const value = rows[i+1].textContent.trim();
                                metadata[key] = value;
                            }
                        }
                    }

                    // Resource information
                    const resources = [];
                    document.querySelectorAll('.resource-item').forEach(resource => {
                        const formatElement = resource.querySelector('.format-label');
                        const urlElement = resource.querySelector('.resource-url-analytics');
                        const sizeElement = resource.querySelector('.automatic-local-datetime');

                        resources.push({
                            format: formatElement?.textContent?.trim() || '',
                            url: urlElement?.href || '',
                            description: resource.querySelector('.resource-description')?.textContent?.trim() || ''
                        });
                    });
                    metadata.resources = resources;

                    // API endpoints
                    const apiElements = document.querySelectorAll('a[href*="api"], a[href*=".json"], a[href*=".xml"]');
                    metadata.api_endpoints = Array.from(apiElements).map(el => el.href);

                    return metadata;
                }
            ''')

            # Merge with original dataset info
            dataset_metadata.update(dataset)

            # ABE assessment for intelligence value
            intelligence_assessment = await self.abe_assess_dataset_value(dataset_metadata)

            # Quality assessment
            quality_score = await self.assess_data_quality(dataset_metadata)

            # Determine connection method
            connection_profile = await self.determine_connection_method(dataset_metadata)

            # Create dataset profile
            profile = {
                **dataset_metadata,
                'intelligence_assessment': intelligence_assessment,
                'quality_score': quality_score,
                'connection_profile': connection_profile,
                'assessment_date': datetime.now().isoformat()
            }

            # Cache in USIM database
            await self.cache_dataset_profile(profile)

            # If high value, create connection profile
            if intelligence_assessment.get('intelligence_value') in ['HIGH', 'MEDIUM']:
                await self.create_connection_profile(profile)

            print(f"      ✅ {dataset['title'][:50]}... [{intelligence_assessment.get('intelligence_value', 'LOW')}] Q:{quality_score}/10")

        except Exception as e:
            print(f"      ❌ Dataset assessment failed: {e}")

    async def abe_assess_dataset_value(self, dataset_metadata):
        """ABE assessment of dataset intelligence value without data download"""
        title = dataset_metadata.get('title', '')
        description = dataset_metadata.get('description', '')
        organization = dataset_metadata.get('organization', '')
        formats = dataset_metadata.get('formats', [])

        prompt = f"""
        USIM Assessment: Analyze this geospatial dataset for intelligence value WITHOUT downloading data:

        Title: {title}
        Organization: {organization}
        Description: {description[:800]}
        Available Formats: {formats}

        Assess for:
        1. GEOSPATIAL INTELLIGENCE: Location-based threat indicators
        2. CRITICAL INFRASTRUCTURE: Infrastructure vulnerability insights
        3. BORDER SECURITY: Immigration/customs intelligence
        4. SURVEILLANCE VALUE: Monitoring and tracking capabilities
        5. THREAT CORRELATION: Ability to correlate with threat data
        6. OPERATIONAL UTILITY: Real-world operational value

        Consider:
        - Can this answer intelligence questions on-demand?
        - Should we set up a stream for mission-critical use?
        - What connection method would be most effective?

        Return as JSON with: intelligence_value (HIGH/MEDIUM/LOW), geospatial_relevance, streaming_recommendation, connection_priority
        """

        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    'intelligence_value': 'LOW',
                    'geospatial_relevance': 'Unknown',
                    'streaming_recommendation': 'No',
                    'connection_priority': 'Low'
                }
        except Exception as e:
            return {
                'intelligence_value': 'UNKNOWN',
                'geospatial_relevance': f'Assessment failed: {e}',
                'streaming_recommendation': 'Unknown',
                'connection_priority': 'Unknown'
            }

    async def assess_data_quality(self, dataset_metadata):
        """Assess data quality to avoid 'shit' datasets"""
        description = (dataset_metadata.get('description', '') + ' ' +
                      dataset_metadata.get('title', '')).lower()

        quality_score = 5  # Start with neutral score

        # Check for high quality indicators
        for indicator in self.quality_indicators['high_quality']:
            if indicator in description:
                quality_score += 1

        # Check for low quality indicators
        for indicator in self.quality_indicators['low_quality']:
            if indicator in description:
                quality_score -= 2

        # Check for API availability (increases quality)
        if dataset_metadata.get('api_endpoints'):
            quality_score += 2

        # Check for recent updates
        last_modified = dataset_metadata.get('last modified', dataset_metadata.get('modified', ''))
        if last_modified and ('2023' in last_modified or '2024' in last_modified):
            quality_score += 1

        return max(0, min(10, quality_score))  # Clamp between 0-10

    async def determine_connection_method(self, dataset_metadata):
        """Determine optimal connection method for on-demand access"""
        connection_methods = []

        # Check for API endpoints
        if dataset_metadata.get('api_endpoints'):
            connection_methods.append({
                'method': 'API',
                'priority': 'HIGH',
                'endpoints': dataset_metadata['api_endpoints']
            })

        # Check for streaming formats
        formats = [f.lower() for f in dataset_metadata.get('formats', [])]
        if any(fmt in formats for fmt in ['json', 'geojson', 'xml', 'rss']):
            connection_methods.append({
                'method': 'STRUCTURED_DOWNLOAD',
                'priority': 'MEDIUM',
                'formats': formats
            })

        # Check for real-time indicators
        description = dataset_metadata.get('description', '').lower()
        if any(term in description for term in ['real-time', 'live', 'streaming', 'continuous']):
            connection_methods.append({
                'method': 'STREAM',
                'priority': 'HIGH',
                'description': 'Real-time streaming capable'
            })

        return connection_methods

    async def create_connection_profile(self, dataset_profile):
        """Create detailed connection profile for high-value datasets"""
        dataset_id = f"usim_{hash(dataset_profile['title'])}"

        profile_data = {
            'dataset_id': dataset_id,
            'title': dataset_profile['title'],
            'connection_methods': dataset_profile['connection_profile'],
            'intelligence_assessment': dataset_profile['intelligence_assessment'],
            'quality_score': dataset_profile['quality_score'],
            'api_endpoints': dataset_profile.get('api_endpoints', []),
            'sample_queries': await self.generate_sample_queries(dataset_profile),
            'stream_config': await self.generate_stream_config(dataset_profile),
            'created_date': datetime.now().isoformat()
        }

        # Save connection profile
        profile_file = self.profiles_dir / f"{dataset_id}.json"
        async with aiofiles.open(profile_file, 'w') as f:
            await f.write(json.dumps(profile_data, indent=2))

        return profile_file

    async def generate_sample_queries(self, dataset_profile):
        """Generate sample queries for on-demand intelligence requests"""
        title = dataset_profile['title']
        description = dataset_profile.get('description', '')

        prompt = f"""
        Generate 3-5 sample intelligence queries for this geospatial dataset:

        Title: {title}
        Description: {description[:400]}

        Create queries that would:
        1. Extract specific intelligence answers
        2. Monitor for threat indicators
        3. Correlate with other intelligence sources
        4. Support operational decision-making

        Format as JSON array of query objects with 'query' and 'expected_output' fields.
        """

        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\[.*?\]', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return [
                    {'query': f'Get recent data from {title}', 'expected_output': 'Latest dataset entries'},
                    {'query': f'Monitor {title} for changes', 'expected_output': 'Change notifications'}
                ]
        except:
            return [{'query': 'Basic data access', 'expected_output': 'Dataset content'}]

    async def generate_stream_config(self, dataset_profile):
        """Generate streaming configuration for mission-critical datasets"""
        if dataset_profile['intelligence_assessment'].get('streaming_recommendation') == 'Yes':
            return {
                'recommended': True,
                'polling_interval': 300,  # 5 minutes for high-value data
                'alert_conditions': ['new_entries', 'significant_changes'],
                'output_format': 'json',
                'mission_justification': 'High intelligence value warrants real-time monitoring'
            }
        else:
            return {
                'recommended': False,
                'reason': 'On-demand access sufficient for current intelligence value'
            }

    async def test_connection_endpoints(self):
        """Test connection endpoints for reliability and performance"""
        print("🔌 Testing Connection Endpoints...")

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get datasets with API endpoints
        cursor.execute('''
            SELECT dataset_id, api_endpoint FROM dataset_profiles
            WHERE api_endpoint IS NOT NULL AND api_endpoint != "[]"
        ''')

        for dataset_id, api_endpoints_json in cursor.fetchall():
            try:
                api_endpoints = json.loads(api_endpoints_json)
                for endpoint in api_endpoints[:2]:  # Test up to 2 endpoints per dataset
                    await self.test_single_endpoint(dataset_id, endpoint)
            except:
                continue

        conn.close()

    async def test_single_endpoint(self, dataset_id, endpoint_url):
        """Test individual API endpoint"""
        try:
            start_time = time.time()

            async with aiohttp.ClientSession() as session:
                async with session.get(endpoint_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    latency = int((time.time() - start_time) * 1000)

                    test_result = {
                        'status_code': response.status,
                        'content_type': response.headers.get('content-type', ''),
                        'latency_ms': latency,
                        'success': response.status == 200
                    }

                    if response.status == 200:
                        # Sample small amount of data
                        content = await response.text()
                        test_result['content_sample'] = content[:500]

                    await self.cache_endpoint_test(dataset_id, endpoint_url, test_result)

        except Exception as e:
            test_result = {
                'error': str(e),
                'success': False,
                'latency_ms': 0
            }
            await self.cache_endpoint_test(dataset_id, endpoint_url, test_result)

    async def cache_dataset_profile(self, profile):
        """Cache dataset profile in USIM database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        dataset_id = f"usim_{hash(profile['title'])}"

        cursor.execute('''
            INSERT OR REPLACE INTO dataset_profiles
            (dataset_id, title, description, agency, intelligence_value,
             geospatial_relevance, quality_score, api_endpoint,
             streaming_capable, abe_assessment, last_assessed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            dataset_id,
            profile['title'],
            profile.get('description', ''),
            profile.get('organization', ''),
            profile['intelligence_assessment'].get('intelligence_value', 'LOW'),
            profile['intelligence_assessment'].get('geospatial_relevance', ''),
            profile['quality_score'],
            json.dumps(profile.get('api_endpoints', [])),
            profile['intelligence_assessment'].get('streaming_recommendation') == 'Yes',
            json.dumps(profile['intelligence_assessment']),
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    async def cache_endpoint_test(self, dataset_id, endpoint_url, test_result):
        """Cache endpoint test results"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        endpoint_id = f"endpoint_{hash(endpoint_url)}"

        cursor.execute('''
            INSERT OR REPLACE INTO connection_endpoints
            (endpoint_id, dataset_id, endpoint_url, test_result,
             connection_quality, latency_ms, last_tested)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            endpoint_id,
            dataset_id,
            endpoint_url,
            json.dumps(test_result),
            'GOOD' if test_result.get('success') else 'FAILED',
            test_result.get('latency_ms', 0),
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    async def generate_usim_intelligence_report(self):
        """Generate USIM intelligence awareness report"""
        print("📊 Generating USIM Intelligence Report...")

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get statistics
        cursor.execute("SELECT COUNT(*) FROM dataset_profiles")
        total_datasets = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM dataset_profiles WHERE intelligence_value = 'HIGH'")
        high_value = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM dataset_profiles WHERE streaming_capable = 1")
        streaming_capable = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM connection_endpoints WHERE connection_quality = 'GOOD'")
        good_connections = cursor.fetchone()[0]

        # Get top intelligence sources
        cursor.execute('''
            SELECT title, agency, intelligence_value, quality_score
            FROM dataset_profiles
            WHERE intelligence_value IN ('HIGH', 'MEDIUM')
            ORDER BY quality_score DESC
            LIMIT 10
        ''')
        top_sources = cursor.fetchall()

        conn.close()

        prompt = f"""
        Generate USIM (Universal Systems Interface Module) intelligence awareness report:

        USIM Discovery Statistics:
        - Total Datasets Assessed: {total_datasets}
        - High Intelligence Value: {high_value}
        - Streaming Capable: {streaming_capable}
        - Reliable Connections: {good_connections}

        Top Intelligence Sources: {len(top_sources)}

        Create executive report covering:
        1. INTELLIGENCE LANDSCAPE: What geospatial intelligence is available on-demand?
        2. CONNECTION READINESS: Which systems can provide immediate answers?
        3. STREAMING OPPORTUNITIES: What mission-critical data warrants real-time monitoring?
        4. QUALITY ASSESSMENT: Which sources are reliable vs. problematic?
        5. OPERATIONAL RECOMMENDATIONS: How to leverage USIM for intelligence requirements?
        6. GAP ANALYSIS: What intelligence needs aren't met by available datasets?

        Format as professional USIM intelligence assessment.
        Focus on on-demand capability and mission-critical streaming potential.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "USIM intelligence report generation failed"

    async def run_usim_assessment(self):
        """Execute USIM intelligence assessment"""
        print("🎯 STARTING DATA.GOV USIM ASSESSMENT")
        print("=" * 60)
        print("Universal Systems Interface Module - Smart Awareness & Connection")

        start_time = datetime.now()

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)

            try:
                # Phase 1: Discover and assess geospatial datasets
                print("\n[1/3] Discovering Geospatial Intelligence Datasets...")
                await self.discover_geospatial_datasets(browser)

                # Phase 2: Test connection endpoints
                print("\n[2/3] Testing Connection Endpoints...")
                await self.test_connection_endpoints()

                # Phase 3: Generate USIM report
                print("\n[3/3] Generating USIM Intelligence Report...")
                report = await self.generate_usim_intelligence_report()

                # Save report
                report_file = self.usim_dir / f"usim_intelligence_report_{datetime.now().strftime('%Y%m%d_%H%M')}.txt"
                async with aiofiles.open(report_file, 'w') as f:
                    await f.write(report)

                elapsed = datetime.now() - start_time

                print(f"\n✅ USIM ASSESSMENT COMPLETE")
                print(f"   Duration: {elapsed}")
                print(f"   Report: {report_file}")
                print(f"   Database: {self.db_path}")
                print(f"   Connection Profiles: {self.profiles_dir}")

                return {
                    'report_file': report_file,
                    'database_path': self.db_path,
                    'profiles_dir': self.profiles_dir,
                    'duration': str(elapsed)
                }

            finally:
                await browser.close()

def main():
    """Run Data.gov USIM assessment"""
    usim = DataGovUSIM()
    result = asyncio.run(usim.run_usim_assessment())

    print(f"\n💡 USIM CAPABILITIES:")
    print("   • Smart dataset assessment without bulk download")
    print("   • Quality filtering to avoid problematic datasets")
    print("   • On-demand connection profiles for intelligence queries")
    print("   • Streaming configuration for mission-critical data only")
    print("   • Connection endpoint testing and reliability assessment")
    print("   • ABE-powered intelligence value assessment")

if __name__ == "__main__":
    main()