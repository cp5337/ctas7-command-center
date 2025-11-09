#!/usr/bin/env python3
"""
Web Scraper - Clean Wikipedia extraction
"""

import requests
from bs4 import BeautifulSoup

class WebScraper:
    """Simple web scraper for Wikipedia and other sources"""
    
    @staticmethod
    def scrape_wikipedia(article_name: str) -> str:
        """Scrape Wikipedia article"""
        url = f"https://en.wikipedia.org/wiki/{article_name.replace(' ', '_')}"
        try:
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            content = soup.find('div', {'id': 'mw-content-text'})
            
            if content:
                # Remove references, tables, navigation
                for tag in content.find_all(['sup', 'table', 'div']):
                    tag.decompose()
                return content.get_text()
        except Exception as e:
            print(f"⚠️ Wikipedia scrape failed: {e}")
        return ""

