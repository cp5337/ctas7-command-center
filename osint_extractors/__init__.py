"""OSINT Extractors - Modular, clean, reusable"""

from .base_extractor import BaseOSINTExtractor
from .pattern_matcher import PatternMatcher
from .web_scraper import WebScraper

__all__ = ['BaseOSINTExtractor', 'PatternMatcher', 'WebScraper']

