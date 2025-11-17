#!/usr/bin/env python3
"""
Data.gov Deep Dive Intelligence Crawler
Using Playwright for comprehensive government dataset discovery and analysis
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
from urllib.parse import urljoin, urlparse
import aiofiles

class DataGovPlaywrightCrawler:
    def __init__(self):
        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Cache and database setup
        self.cache_dir = Path("datagov_deep_dive")
        self.cache_dir.mkdir(exist_ok=True)
        self.db_path = self.cache_dir / "datagov_intelligence.db"

        # Screenshots directory
        self.screenshots_dir = self.cache_dir / "screenshots"
        self.screenshots_dir.mkdir(exist_ok=True)

        # Initialize database
        self.init_database()

        # Site mapping structure
        self.site_map = {
            'base_url': 'https://data.gov',
            'discovered_pages': set(),
            'datasets': [],
            'apis': [],
            'agencies': [],
            'categories': [],
            'intelligence_sources': []
        }

        # Intelligence-focused search terms
        self.intel_search_terms = {
            "terrorism_security": [
                "terrorism", "terrorist", "counterterrorism", "national security",
                "homeland security", "threat", "intelligence", "surveillance"
            ],
            "law_enforcement": [
                "FBI", "DEA", "ATF", "law enforcement", "criminal", "investigation",
                "prosecution", "arrest", "conviction", "crime statistics"
            ],
            "border_security": [
                "border security", "customs", "immigration", "CBP", "ICE",
                "port security", "transportation security", "TSA"
            ],
            "cybersecurity": [
                "cybersecurity", "cyber attack", "data breach", "information security",
                "cyber threat", "network security", "malware", "ransomware"
            ],
            "weapons_explosives": [
                "explosive", "weapons", "ammunition", "firearms", "bomb",
                "chemical", "biological", "hazmat", "WMD"
            ],
            "critical_infrastructure": [
                "critical infrastructure", "power grid", "energy", "nuclear",
                "water supply", "telecommunications", "transportation"
            ]
        }

    def init_database(self):
        """Initialize comprehensive data.gov database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Page discovery and mapping
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS site_pages (
                url TEXT PRIMARY KEY,
                page_type TEXT,
                title TEXT,
                description TEXT,
                content_preview TEXT,
                links_count INTEGER,
                datasets_count INTEGER,
                discovery_date TEXT,
                intelligence_value TEXT,
                screenshot_path TEXT
            )
        ''')

        # Deep dataset analysis
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS deep_datasets (
                dataset_id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                agency TEXT,
                bureau TEXT,
                category TEXT,
                tags TEXT,
                download_url TEXT,
                api_endpoint TEXT,
                metadata_json TEXT,
                intelligence_keywords TEXT,
                security_relevance TEXT,
                data_classification TEXT,
                abe_analysis TEXT,
                discovery_method TEXT,
                last_updated TEXT
            )
        ''')

        # API endpoint discovery
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS discovered_apis (
                api_id TEXT PRIMARY KEY,
                endpoint_url TEXT,
                api_type TEXT,
                description TEXT,
                authentication_required TEXT,
                rate_limits TEXT,
                documentation_url TEXT,
                intelligence_potential TEXT,
                test_results TEXT,
                discovery_date TEXT
            )
        ''')

        # Agency intelligence mapping
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agency_intelligence (
                agency_name TEXT PRIMARY KEY,
                full_name TEXT,
                datasets_count INTEGER,
                security_datasets INTEGER,
                api_endpoints TEXT,
                data_categories TEXT,
                intelligence_value TEXT,
                priority_datasets TEXT,
                contact_info TEXT,
                last_analyzed TEXT
            )
        ''')

        conn.commit()
        conn.close()

    async def discover_site_structure(self, browser):
        """Comprehensively map data.gov structure"""
        print("🗺️ Discovering Data.gov Site Structure...")

        page = await browser.new_page()
        await page.goto('https://data.gov')

        # Take screenshot of homepage
        await page.screenshot(path=self.screenshots_dir / "homepage.png")

        # Discover main navigation structure
        nav_links = await self.extract_navigation_links(page)

        # Key pages to explore
        key_pages = [
            '/browse/',
            '/developers/',
            '/metrics/',
            '/about/',
            '/catalog/',
            '/organization/',
            '/dataset/'
        ]

        for nav_link in nav_links[:10]:  # Limit initial discovery
            if any(key_page in nav_link for key_page in key_pages):
                await self.explore_page(page, nav_link)

        await page.close()

    async def extract_navigation_links(self, page):
        """Extract all navigation and important links"""
        try:
            # Get all links from navigation areas
            nav_links = await page.evaluate('''
                () => {
                    const links = [];
                    // Get header navigation
                    const navElements = document.querySelectorAll('nav a, header a, .navbar a');
                    navElements.forEach(link => {
                        if (link.href && !link.href.includes('javascript:')) {
                            links.push(link.href);
                        }
                    });

                    // Get main content area links
                    const contentLinks = document.querySelectorAll('.main-content a, #content a');
                    contentLinks.forEach(link => {
                        if (link.href && !link.href.includes('javascript:') && !link.href.includes('mailto:')) {
                            links.push(link.href);
                        }
                    });

                    return [...new Set(links)]; // Remove duplicates
                }
            ''')

            return [link for link in nav_links if 'data.gov' in link][:50]  # Limit to 50 links

        except Exception as e:
            print(f"      ❌ Link extraction failed: {e}")
            return []

    async def explore_page(self, page, url):
        """Explore individual page for intelligence value"""
        try:
            print(f"    🔍 Exploring: {url}")
            await page.goto(url, wait_until='networkidle')

            # Extract page metadata
            page_data = await page.evaluate('''
                () => ({
                    title: document.title,
                    description: document.querySelector('meta[name="description"]')?.content || '',
                    h1: document.querySelector('h1')?.textContent || '',
                    datasetCount: document.querySelectorAll('[data-dataset], .dataset-item').length,
                    linksCount: document.querySelectorAll('a').length,
                    content: document.body.textContent.substring(0, 1000)
                })
            ''')

            # Take screenshot if valuable
            if page_data['datasetCount'] > 0 or any(term in page_data['content'].lower()
                   for category in self.intel_search_terms.values()
                   for term in category[:3]):

                screenshot_name = f"page_{hash(url)}.png"
                await page.screenshot(path=self.screenshots_dir / screenshot_name)
                page_data['screenshot_path'] = str(self.screenshots_dir / screenshot_name)

            # Analyze intelligence value
            intelligence_value = await self.analyze_page_intelligence_value(page_data, url)
            page_data['intelligence_value'] = intelligence_value

            # Store in database
            await self.cache_page_data(url, page_data)

            # If high value, discover more pages from this one
            if intelligence_value in ['HIGH', 'MEDIUM']:
                await self.discover_linked_datasets(page)

        except Exception as e:
            print(f"      ❌ Page exploration failed for {url}: {e}")

    async def search_intelligence_datasets(self, browser):
        """Search for specific intelligence-related datasets"""
        print("🔍 Searching for Intelligence Datasets...")

        page = await browser.new_page()

        for category, search_terms in self.intel_search_terms.items():
            print(f"    📊 Searching {category}...")

            for term in search_terms[:3]:  # Limit searches to avoid rate limiting
                try:
                    # Navigate to search
                    search_url = f"https://catalog.data.gov/dataset?q={term.replace(' ', '+')}"
                    await page.goto(search_url, wait_until='networkidle')

                    # Extract search results
                    search_results = await self.extract_search_results(page)

                    for result in search_results[:10]:  # Limit to 10 results per search
                        # Analyze each dataset
                        dataset_data = await self.analyze_dataset_deep(page, result)
                        if dataset_data:
                            await self.cache_dataset_data(dataset_data)

                    await asyncio.sleep(2)  # Rate limiting

                except Exception as e:
                    print(f"      ❌ Search failed for {term}: {e}")

        await page.close()

    async def extract_search_results(self, page):
        """Extract detailed search results"""
        try:
            results = await page.evaluate('''
                () => {
                    const results = [];
                    const resultElements = document.querySelectorAll('.dataset-item, [data-module="dataset-item"]');

                    resultElements.forEach(element => {
                        const titleElement = element.querySelector('h3 a, .dataset-heading a');
                        const descElement = element.querySelector('.dataset-description, p');
                        const orgElement = element.querySelector('.dataset-organization, .organization');
                        const tagsElements = element.querySelectorAll('.tag, .dataset-tag');

                        if (titleElement) {
                            results.push({
                                title: titleElement.textContent.trim(),
                                url: titleElement.href,
                                description: descElement?.textContent.trim() || '',
                                organization: orgElement?.textContent.trim() || '',
                                tags: Array.from(tagsElements).map(tag => tag.textContent.trim())
                            });
                        }
                    });

                    return results;
                }
            ''')

            return results

        except Exception as e:
            print(f"      ❌ Search results extraction failed: {e}")
            return []

    async def analyze_dataset_deep(self, page, result):
        """Deep analysis of individual dataset"""
        try:
            # Navigate to dataset page
            await page.goto(result['url'], wait_until='networkidle')

            # Extract comprehensive dataset information
            dataset_data = await page.evaluate('''
                () => {
                    const data = {};

                    // Basic info
                    data.title = document.querySelector('h1')?.textContent?.trim() || '';
                    data.description = document.querySelector('.dataset-description, .notes')?.textContent?.trim() || '';

                    // Agency information
                    data.agency = document.querySelector('.dataset-organization a, .organization a')?.textContent?.trim() || '';

                    // Tags and categories
                    const tags = document.querySelectorAll('.tag, .dataset-tag');
                    data.tags = Array.from(tags).map(tag => tag.textContent.trim());

                    // Download links and APIs
                    const downloadLinks = document.querySelectorAll('a[href*="download"], .resource-url-analytics');
                    data.download_urls = Array.from(downloadLinks).map(link => link.href);

                    // API endpoints
                    const apiLinks = document.querySelectorAll('a[href*="api"], a[href*="json"], a[href*="xml"]');
                    data.api_endpoints = Array.from(apiLinks).map(link => link.href);

                    // Additional metadata
                    const metadataElements = document.querySelectorAll('.dataset-details dl dt, .dataset-details dl dd');
                    const metadata = {};
                    for (let i = 0; i < metadataElements.length; i += 2) {
                        if (metadataElements[i] && metadataElements[i+1]) {
                            metadata[metadataElements[i].textContent.trim()] = metadataElements[i+1].textContent.trim();
                        }
                    }
                    data.metadata = metadata;

                    return data;
                }
            ''')

            # Enhance with original search result data
            dataset_data.update(result)

            # ABE intelligence analysis
            intelligence_analysis = await self.analyze_dataset_intelligence_value(dataset_data)
            dataset_data.update(intelligence_analysis)

            return dataset_data

        except Exception as e:
            print(f"      ❌ Dataset analysis failed: {e}")
            return None

    async def discover_apis(self, browser):
        """Discover and catalog available APIs"""
        print("🔌 Discovering Data.gov APIs...")

        page = await browser.new_page()

        # Check developers section
        api_pages = [
            'https://data.gov/developers/',
            'https://catalog.data.gov/api/',
            'https://www.data.gov/developers/apis',
        ]

        for api_page in api_pages:
            try:
                await page.goto(api_page, wait_until='networkidle')

                # Extract API documentation and endpoints
                api_data = await page.evaluate('''
                    () => {
                        const apis = [];

                        // Look for API endpoint patterns
                        const links = document.querySelectorAll('a');
                        links.forEach(link => {
                            if (link.href && (
                                link.href.includes('/api/') ||
                                link.href.includes('.json') ||
                                link.href.includes('.xml') ||
                                link.href.includes('api.')
                            )) {
                                apis.push({
                                    url: link.href,
                                    text: link.textContent.trim(),
                                    context: link.parentElement?.textContent?.substring(0, 200) || ''
                                });
                            }
                        });

                        return apis;
                    }
                ''')

                for api in api_data[:20]:  # Limit API discovery
                    await self.test_api_endpoint(api)

            except Exception as e:
                print(f"      ❌ API discovery failed for {api_page}: {e}")

        await page.close()

    async def analyze_agency_intelligence(self, browser):
        """Analyze intelligence value by government agency"""
        print("🏛️ Analyzing Agency Intelligence Sources...")

        page = await browser.new_page()

        try:
            # Navigate to organization/agency listing
            await page.goto('https://catalog.data.gov/organization', wait_until='networkidle')

            # Extract agency list
            agencies = await page.evaluate('''
                () => {
                    const agencies = [];
                    const agencyElements = document.querySelectorAll('.organization-item, .media-object');

                    agencyElements.forEach(element => {
                        const nameElement = element.querySelector('h3 a, .media-heading a');
                        const countElement = element.querySelector('.dataset-count, .count');
                        const descElement = element.querySelector('p, .description');

                        if (nameElement) {
                            agencies.push({
                                name: nameElement.textContent.trim(),
                                url: nameElement.href,
                                dataset_count: countElement?.textContent?.match(/\\d+/)?.[0] || '0',
                                description: descElement?.textContent?.trim() || ''
                            });
                        }
                    });

                    return agencies;
                }
            ''')

            # Analyze high-priority intelligence agencies
            intel_agencies = [
                'department-of-homeland-security',
                'federal-bureau-of-investigation',
                'department-of-defense',
                'department-of-treasury',
                'transportation-security-administration',
                'drug-enforcement-administration'
            ]

            for agency in agencies[:30]:  # Limit to 30 agencies
                agency_slug = agency['url'].split('/')[-1] if agency['url'] else ''

                if any(intel_agency in agency_slug.lower() for intel_agency in intel_agencies) or \
                   int(agency['dataset_count']) > 100:  # High-dataset agencies

                    await self.analyze_agency_datasets(page, agency)

        except Exception as e:
            print(f"      ❌ Agency analysis failed: {e}")

        await page.close()

    async def analyze_agency_datasets(self, page, agency):
        """Deep dive into specific agency datasets"""
        try:
            print(f"      🔍 Analyzing {agency['name']}...")

            await page.goto(agency['url'], wait_until='networkidle')

            # Get agency's datasets with security focus
            security_datasets = await page.evaluate(f'''
                () => {{
                    const datasets = [];
                    const datasetElements = document.querySelectorAll('.dataset-item');

                    const securityKeywords = {list(self.intel_search_terms['terrorism_security'])};

                    datasetElements.forEach(element => {{
                        const title = element.querySelector('h3 a')?.textContent?.toLowerCase() || '';
                        const description = element.querySelector('.dataset-description')?.textContent?.toLowerCase() || '';

                        if (securityKeywords.some(keyword =>
                            title.includes(keyword) || description.includes(keyword))) {{

                            datasets.push({{
                                title: element.querySelector('h3 a')?.textContent?.trim() || '',
                                url: element.querySelector('h3 a')?.href || '',
                                description: element.querySelector('.dataset-description')?.textContent?.trim() || ''
                            }});
                        }}
                    }});

                    return datasets;
                }}
            ''')

            # Cache agency intelligence profile
            agency_data = {
                **agency,
                'security_datasets': security_datasets,
                'intelligence_value': 'HIGH' if len(security_datasets) > 5 else 'MEDIUM' if len(security_datasets) > 0 else 'LOW'
            }

            await self.cache_agency_data(agency_data)

        except Exception as e:
            print(f"        ❌ Agency dataset analysis failed: {e}")

    async def analyze_page_intelligence_value(self, page_data, url):
        """Use ABE to analyze page intelligence value"""
        content = f"{page_data.get('title', '')} {page_data.get('description', '')} {page_data.get('content', '')}"

        prompt = f"""
        Analyze this data.gov page for intelligence value:

        URL: {url}
        Title: {page_data.get('title', '')}
        Content Preview: {content[:800]}
        Dataset Count: {page_data.get('datasetCount', 0)}

        Assess for:
        1. National security relevance
        2. Law enforcement intelligence value
        3. Terrorism/counterterrorism data potential
        4. Government transparency insights
        5. Operational intelligence opportunities

        Rate as: HIGH/MEDIUM/LOW
        Return only the rating.
        """

        try:
            response = self.model.generate_content(prompt)
            rating = response.text.strip().upper()
            return rating if rating in ['HIGH', 'MEDIUM', 'LOW'] else 'LOW'
        except:
            return 'LOW'

    async def analyze_dataset_intelligence_value(self, dataset_data):
        """Use ABE to analyze dataset intelligence value"""
        content = f"{dataset_data.get('title', '')} {dataset_data.get('description', '')} {' '.join(dataset_data.get('tags', []))}"

        prompt = f"""
        Analyze this government dataset for intelligence value:

        Title: {dataset_data.get('title', '')}
        Agency: {dataset_data.get('agency', '')}
        Description: {dataset_data.get('description', '')[:500]}
        Tags: {dataset_data.get('tags', [])}

        Evaluate for:
        1. THREAT INTELLIGENCE: Security/terrorism threat data
        2. OPERATIONAL VALUE: Law enforcement utility
        3. POLICY INSIGHTS: Government decision-making data
        4. VULNERABILITY ANALYSIS: Security gap identification
        5. PATTERN RECOGNITION: Criminal/terrorist behavior patterns

        Return as JSON with: intelligence_value, security_relevance, operational_potential
        """

        try:
            response = self.model.generate_content(prompt)
            import json as json_lib
            json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
            if json_match:
                return json_lib.loads(json_match.group())
            else:
                return {
                    'intelligence_value': 'MEDIUM',
                    'security_relevance': response.text[:200],
                    'operational_potential': 'Requires further analysis'
                }
        except:
            return {
                'intelligence_value': 'LOW',
                'security_relevance': 'Analysis failed',
                'operational_potential': 'Unknown'
            }

    async def test_api_endpoint(self, api_data):
        """Test API endpoint availability and analyze"""
        try:
            # Simple connectivity test (would expand in production)
            print(f"      🔌 Testing API: {api_data['url'][:60]}...")

            # Store API discovery data
            api_record = {
                'endpoint_url': api_data['url'],
                'description': api_data.get('text', ''),
                'context': api_data.get('context', ''),
                'discovery_date': datetime.now().isoformat(),
                'intelligence_potential': 'MEDIUM'  # Default assessment
            }

            await self.cache_api_data(api_record)

        except Exception as e:
            print(f"        ❌ API test failed: {e}")

    async def cache_page_data(self, url, page_data):
        """Cache page discovery data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO site_pages
            (url, page_type, title, description, content_preview,
             links_count, datasets_count, discovery_date, intelligence_value, screenshot_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            url,
            'dataset_page' if page_data.get('datasetCount', 0) > 0 else 'info_page',
            page_data.get('title', ''),
            page_data.get('description', ''),
            page_data.get('content', '')[:500],
            page_data.get('linksCount', 0),
            page_data.get('datasetCount', 0),
            datetime.now().isoformat(),
            page_data.get('intelligence_value', 'LOW'),
            page_data.get('screenshot_path', '')
        ))

        conn.commit()
        conn.close()

    async def cache_dataset_data(self, dataset_data):
        """Cache detailed dataset data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        dataset_id = f"datagov_{hash(dataset_data.get('title', '') + dataset_data.get('url', ''))}"

        cursor.execute('''
            INSERT OR REPLACE INTO deep_datasets
            (dataset_id, title, description, agency, tags, download_url,
             api_endpoint, metadata_json, security_relevance, abe_analysis,
             discovery_method, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            dataset_id,
            dataset_data.get('title', ''),
            dataset_data.get('description', ''),
            dataset_data.get('agency', ''),
            json.dumps(dataset_data.get('tags', [])),
            json.dumps(dataset_data.get('download_urls', [])),
            json.dumps(dataset_data.get('api_endpoints', [])),
            json.dumps(dataset_data.get('metadata', {})),
            dataset_data.get('security_relevance', ''),
            json.dumps(dataset_data.get('operational_potential', '')),
            'playwright_crawler',
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    async def cache_api_data(self, api_data):
        """Cache API endpoint data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        api_id = f"api_{hash(api_data['endpoint_url'])}"

        cursor.execute('''
            INSERT OR REPLACE INTO discovered_apis
            (api_id, endpoint_url, description, intelligence_potential, discovery_date)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            api_id,
            api_data['endpoint_url'],
            api_data.get('description', ''),
            api_data.get('intelligence_potential', 'UNKNOWN'),
            api_data['discovery_date']
        ))

        conn.commit()
        conn.close()

    async def cache_agency_data(self, agency_data):
        """Cache agency intelligence analysis"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO agency_intelligence
            (agency_name, full_name, datasets_count, security_datasets,
             intelligence_value, priority_datasets, last_analyzed)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            agency_data.get('name', ''),
            agency_data.get('description', ''),
            int(agency_data.get('dataset_count', 0)),
            len(agency_data.get('security_datasets', [])),
            agency_data.get('intelligence_value', 'LOW'),
            json.dumps(agency_data.get('security_datasets', [])),
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    async def generate_comprehensive_report(self):
        """Generate comprehensive intelligence report from crawler data"""
        print("📋 Generating Comprehensive Data.gov Intelligence Report...")

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get statistics
        cursor.execute("SELECT COUNT(*) FROM site_pages")
        pages_discovered = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM deep_datasets")
        datasets_analyzed = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM discovered_apis")
        apis_discovered = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM agency_intelligence")
        agencies_analyzed = cursor.fetchone()[0]

        # Get high-value datasets
        cursor.execute("SELECT title, agency, security_relevance FROM deep_datasets WHERE abe_analysis LIKE '%HIGH%' LIMIT 10")
        high_value_datasets = cursor.fetchall()

        conn.close()

        prompt = f"""
        Generate comprehensive Data.gov intelligence report from deep web crawling:

        Discovery Statistics:
        - Pages Explored: {pages_discovered}
        - Datasets Analyzed: {datasets_analyzed}
        - APIs Discovered: {apis_discovered}
        - Agencies Analyzed: {agencies_analyzed}

        High-Value Datasets Found: {len(high_value_datasets)}

        Create executive report covering:
        1. DATA.GOV INTELLIGENCE LANDSCAPE: What intelligence sources are available?
        2. AGENCY CAPABILITIES: Which agencies provide the most valuable intelligence data?
        3. HIDDEN INTELLIGENCE: What datasets might not be obvious but have intelligence value?
        4. API OPPORTUNITIES: What programmatic access is available?
        5. INTELLIGENCE GAPS: What intelligence needs are not being met?
        6. OPERATIONAL RECOMMENDATIONS: How to best leverage data.gov for intelligence

        Format as professional intelligence assessment.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Comprehensive report generation failed"

    async def run_deep_dive(self):
        """Execute comprehensive data.gov deep dive"""
        print("🌊 STARTING DATA.GOV DEEP DIVE WITH PLAYWRIGHT")
        print("=" * 80)

        start_time = datetime.now()

        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(
                headless=True,  # Set to False for debugging
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )

            try:
                # Phase 1: Site Structure Discovery
                print("\n[1/5] Discovering Site Structure...")
                await self.discover_site_structure(browser)

                # Phase 2: Intelligence Dataset Search
                print("\n[2/5] Searching Intelligence Datasets...")
                await self.search_intelligence_datasets(browser)

                # Phase 3: API Discovery
                print("\n[3/5] Discovering APIs...")
                await self.discover_apis(browser)

                # Phase 4: Agency Analysis
                print("\n[4/5] Analyzing Agency Intelligence...")
                await self.analyze_agency_intelligence(browser)

                # Phase 5: Generate Report
                print("\n[5/5] Generating Intelligence Report...")
                report = await self.generate_comprehensive_report()

                # Save report
                report_file = self.cache_dir / f"datagov_deep_dive_report_{datetime.now().strftime('%Y%m%d_%H%M')}.txt"
                async with aiofiles.open(report_file, 'w') as f:
                    await f.write(report)

                elapsed = datetime.now() - start_time

                print(f"\n✅ DATA.GOV DEEP DIVE COMPLETE")
                print(f"   Duration: {elapsed}")
                print(f"   Report: {report_file}")
                print(f"   Database: {self.db_path}")
                print(f"   Screenshots: {self.screenshots_dir}")

                return {
                    'report_file': report_file,
                    'database_path': self.db_path,
                    'screenshots_dir': self.screenshots_dir,
                    'duration': str(elapsed)
                }

            finally:
                await browser.close()

def main():
    """Run data.gov deep dive"""
    crawler = DataGovPlaywrightCrawler()
    result = asyncio.run(crawler.run_deep_dive())

    print(f"\n💡 DEEP DIVE CAPABILITIES:")
    print("   • Comprehensive site structure mapping")
    print("   • Intelligence-focused dataset discovery")
    print("   • Hidden API endpoint identification")
    print("   • Agency-specific intelligence analysis")
    print("   • Visual documentation with screenshots")
    print("   • ABE-powered relevance assessment")

if __name__ == "__main__":
    main()