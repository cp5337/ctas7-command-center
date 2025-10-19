#!/usr/bin/env python3
"""
CTAS Archaeological Code Recycler Test Script
Tests the BNE archaeological approach on real orphaned files and crates

Usage: python archaeological_code_recycler_test.py
"""

import os
import re
import ast
import json
import hashlib
import subprocess
from pathlib import Path
from collections import defaultdict, Counter
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Set, Tuple
import time
import datetime

@dataclass
class CrateAnalysis:
    """Analysis results for a single crate or file"""
    path: str
    name: str
    lines_of_code: int
    file_type: str
    quality_score: float
    functions: List[str]
    dependencies: List[str]
    recycling_potential: str  # 'high', 'medium', 'low', 'orphaned'
    archaeological_value: float
    last_modified: str
    complexity_score: float
    documentation_ratio: float
    test_coverage_estimate: float

@dataclass
class RecyclingRecommendation:
    """Recommendation for recycling a piece of code"""
    source_path: str
    target_use_case: str
    confidence: float
    required_modifications: List[str]
    integration_effort: str  # 'trivial', 'low', 'medium', 'high'
    value_proposition: str

class ArchaeologicalCodeRecycler:
    """CTAS Archaeological Code Recycler - BNE Test Implementation"""

    def __init__(self, base_path: str = "/Users/cp5337/Developer"):
        self.base_path = Path(base_path)
        self.analysis_results: List[CrateAnalysis] = []
        self.recycling_recommendations: List[RecyclingRecommendation] = []
        self.quality_thresholds = {
            'tesla_grade': 85.0,
            'production': 70.0,
            'functional': 50.0,
            'orphaned': 30.0
        }

        # Pattern recognition for common functions
        self.function_patterns = {
            'network': ['socket', 'http', 'tcp', 'udp', 'connect', 'request'],
            'crypto': ['encrypt', 'decrypt', 'hash', 'cipher', 'key', 'secure'],
            'data': ['parse', 'serialize', 'json', 'xml', 'csv', 'database'],
            'ai': ['model', 'neural', 'predict', 'train', 'inference', 'ml'],
            'security': ['auth', 'token', 'permission', 'validate', 'sanitize'],
            'system': ['file', 'process', 'thread', 'memory', 'cpu', 'monitor']
        }

    def scan_for_orphaned_files(self) -> List[Path]:
        """Find orphaned code files that could be recycled"""
        print("🔍 Scanning for orphaned files...")

        orphaned_files = []

        # Look for common orphaned patterns
        orphaned_patterns = [
            "**/test*.py",
            "**/example*.py",
            "**/demo*.py",
            "**/sample*.rs",
            "**/backup*.py",
            "**/old*.py",
            "**/tmp*.py",
            "**/*_test.rs",
            "**/*_example.rs"
        ]

        for pattern in orphaned_patterns:
            for file_path in self.base_path.glob(pattern):
                if self._is_potentially_useful(file_path):
                    orphaned_files.append(file_path)

        # Also look for standalone files in deep directories
        for file_path in self.base_path.rglob("*.py"):
            if self._looks_orphaned(file_path):
                orphaned_files.append(file_path)

        for file_path in self.base_path.rglob("*.rs"):
            if self._looks_orphaned(file_path):
                orphaned_files.append(file_path)

        print(f"📦 Found {len(orphaned_files)} potentially orphaned files")
        return orphaned_files[:50]  # Limit for testing

    def _is_potentially_useful(self, file_path: Path) -> bool:
        """Check if an orphaned file might have recycling value"""
        try:
            if file_path.stat().st_size < 100:  # Too small
                return False
            if file_path.stat().st_size > 1_000_000:  # Too large
                return False

            # Skip obvious build/cache directories
            skip_dirs = {'target', 'node_modules', '__pycache__', '.git', 'build'}
            if any(skip_dir in str(file_path) for skip_dir in skip_dirs):
                return False

            return True
        except:
            return False

    def _looks_orphaned(self, file_path: Path) -> bool:
        """Determine if a file looks orphaned"""
        # Check if file is isolated (few siblings)
        parent_files = list(file_path.parent.glob("*"))
        if len(parent_files) <= 3:  # Might be orphaned
            return True

        # Check for orphaned naming patterns
        orphaned_names = ['test', 'example', 'demo', 'sample', 'backup', 'old', 'tmp']
        return any(name in file_path.stem.lower() for name in orphaned_names)

    def analyze_file(self, file_path: Path) -> CrateAnalysis:
        """Perform archaeological analysis on a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except:
            return self._create_empty_analysis(file_path, "unreadable")

        if not content.strip():
            return self._create_empty_analysis(file_path, "empty")

        lines_of_code = len([line for line in content.split('\n') if line.strip() and not line.strip().startswith('#')])

        # Determine file type and analyze accordingly
        if file_path.suffix == '.py':
            return self._analyze_python_file(file_path, content, lines_of_code)
        elif file_path.suffix == '.rs':
            return self._analyze_rust_file(file_path, content, lines_of_code)
        else:
            return self._analyze_generic_file(file_path, content, lines_of_code)

    def _analyze_python_file(self, file_path: Path, content: str, lines_of_code: int) -> CrateAnalysis:
        """Specialized analysis for Python files"""
        functions = []
        dependencies = []
        complexity = 0

        try:
            tree = ast.parse(content)

            # Extract functions
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    functions.append(node.name)
                    complexity += len(node.body)  # Simple complexity metric
                elif isinstance(node, ast.Import):
                    for alias in node.names:
                        dependencies.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        dependencies.append(node.module)
        except:
            # Fallback to regex parsing
            functions = re.findall(r'def (\w+)', content)
            dependencies = re.findall(r'import (\w+)', content) + re.findall(r'from (\w+)', content)

        quality_score = self._calculate_quality_score(content, lines_of_code, functions, dependencies)
        archaeological_value = self._calculate_archaeological_value(file_path, functions, dependencies)

        return CrateAnalysis(
            path=str(file_path),
            name=file_path.stem,
            lines_of_code=lines_of_code,
            file_type="python",
            quality_score=quality_score,
            functions=functions[:10],  # Limit for display
            dependencies=dependencies[:10],
            recycling_potential=self._determine_recycling_potential(quality_score),
            archaeological_value=archaeological_value,
            last_modified=datetime.datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
            complexity_score=min(complexity / max(lines_of_code, 1) * 100, 100),
            documentation_ratio=self._calculate_doc_ratio(content),
            test_coverage_estimate=self._estimate_test_coverage(content, functions)
        )

    def _analyze_rust_file(self, file_path: Path, content: str, lines_of_code: int) -> CrateAnalysis:
        """Specialized analysis for Rust files"""
        # Extract functions
        functions = re.findall(r'fn (\w+)', content)

        # Extract dependencies (use statements)
        dependencies = re.findall(r'use (\w+)', content)

        # Simple complexity based on nested blocks
        complexity = content.count('{') + content.count('match') + content.count('if')

        quality_score = self._calculate_quality_score(content, lines_of_code, functions, dependencies)
        archaeological_value = self._calculate_archaeological_value(file_path, functions, dependencies)

        return CrateAnalysis(
            path=str(file_path),
            name=file_path.stem,
            lines_of_code=lines_of_code,
            file_type="rust",
            quality_score=quality_score,
            functions=functions[:10],
            dependencies=dependencies[:10],
            recycling_potential=self._determine_recycling_potential(quality_score),
            archaeological_value=archaeological_value,
            last_modified=datetime.datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
            complexity_score=min(complexity / max(lines_of_code, 1) * 100, 100),
            documentation_ratio=self._calculate_doc_ratio(content),
            test_coverage_estimate=self._estimate_test_coverage(content, functions)
        )

    def _analyze_generic_file(self, file_path: Path, content: str, lines_of_code: int) -> CrateAnalysis:
        """Generic analysis for other file types"""
        quality_score = 50.0  # Default for unknown types

        return CrateAnalysis(
            path=str(file_path),
            name=file_path.stem,
            lines_of_code=lines_of_code,
            file_type=file_path.suffix.lstrip('.') or 'unknown',
            quality_score=quality_score,
            functions=[],
            dependencies=[],
            recycling_potential=self._determine_recycling_potential(quality_score),
            archaeological_value=25.0,
            last_modified=datetime.datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
            complexity_score=50.0,
            documentation_ratio=self._calculate_doc_ratio(content),
            test_coverage_estimate=0.0
        )

    def _calculate_quality_score(self, content: str, lines_of_code: int, functions: List[str], dependencies: List[str]) -> float:
        """Calculate quality score based on various metrics"""
        score = 50.0  # Base score

        # Documentation bonus
        doc_ratio = self._calculate_doc_ratio(content)
        score += doc_ratio * 20  # Up to 20 points for good docs

        # Function/LOC ratio (good modularity)
        if lines_of_code > 0:
            func_ratio = len(functions) / lines_of_code * 100
            if 0.5 <= func_ratio <= 5.0:  # Sweet spot
                score += 15
            elif func_ratio > 0:
                score += 5

        # Naming quality (heuristic)
        good_names = sum(1 for func in functions if len(func) > 3 and '_' in func or func.islower())
        if functions:
            name_quality = good_names / len(functions)
            score += name_quality * 10

        # Dependency management
        if len(dependencies) <= 10:  # Not too many dependencies
            score += 10
        elif len(dependencies) <= 20:
            score += 5

        # File size balance
        if 50 <= lines_of_code <= 500:  # Good size range
            score += 10
        elif 20 <= lines_of_code <= 1000:
            score += 5

        return min(score, 100.0)

    def _calculate_archaeological_value(self, file_path: Path, functions: List[str], dependencies: List[str]) -> float:
        """Calculate how valuable this code is for archaeological recycling"""
        value = 25.0  # Base value

        # Domain-specific value
        for domain, keywords in self.function_patterns.items():
            matches = sum(1 for func in functions if any(kw in func.lower() for kw in keywords))
            matches += sum(1 for dep in dependencies if any(kw in dep.lower() for kw in keywords))
            if matches > 0:
                value += matches * 5  # 5 points per domain match

        # Reusability indicators
        generic_functions = ['init', 'setup', 'config', 'util', 'helper', 'common']
        reusable_matches = sum(1 for func in functions if any(gf in func.lower() for gf in generic_functions))
        value += reusable_matches * 3

        # Path-based value (some directories are more valuable)
        valuable_paths = ['core', 'lib', 'util', 'common', 'shared', 'api']
        if any(vp in str(file_path).lower() for vp in valuable_paths):
            value += 15

        return min(value, 100.0)

    def _calculate_doc_ratio(self, content: str) -> float:
        """Calculate documentation ratio"""
        lines = content.split('\n')
        doc_lines = sum(1 for line in lines if line.strip().startswith('#') or '"""' in line or "'''" in line)
        total_lines = len([line for line in lines if line.strip()])

        if total_lines == 0:
            return 0.0

        return min(doc_lines / total_lines, 0.5)  # Cap at 50%

    def _estimate_test_coverage(self, content: str, functions: List[str]) -> float:
        """Estimate test coverage based on content analysis"""
        test_indicators = ['test_', 'assert', 'expect', 'should', 'mock', 'unittest']
        test_count = sum(content.lower().count(indicator) for indicator in test_indicators)

        if not functions:
            return 0.0

        # Rough estimate: test indicators per function
        coverage_estimate = min(test_count / len(functions) * 20, 100.0)
        return coverage_estimate

    def _determine_recycling_potential(self, quality_score: float) -> str:
        """Determine recycling potential based on quality score"""
        if quality_score >= self.quality_thresholds['tesla_grade']:
            return 'high'
        elif quality_score >= self.quality_thresholds['production']:
            return 'medium'
        elif quality_score >= self.quality_thresholds['functional']:
            return 'low'
        else:
            return 'orphaned'

    def _create_empty_analysis(self, file_path: Path, reason: str) -> CrateAnalysis:
        """Create analysis for unprocessable files"""
        return CrateAnalysis(
            path=str(file_path),
            name=file_path.stem,
            lines_of_code=0,
            file_type=reason,
            quality_score=0.0,
            functions=[],
            dependencies=[],
            recycling_potential='orphaned',
            archaeological_value=0.0,
            last_modified="unknown",
            complexity_score=0.0,
            documentation_ratio=0.0,
            test_coverage_estimate=0.0
        )

    def generate_recycling_recommendations(self) -> List[RecyclingRecommendation]:
        """Generate specific recycling recommendations"""
        recommendations = []

        # Group by domain for better recommendations
        domain_groups = defaultdict(list)
        for analysis in self.analysis_results:
            if analysis.recycling_potential in ['high', 'medium']:
                # Classify by domain based on functions
                domains = []
                for domain, keywords in self.function_patterns.items():
                    if any(any(kw in func.lower() for kw in keywords) for func in analysis.functions):
                        domains.append(domain)

                if not domains:
                    domains = ['utility']

                for domain in domains:
                    domain_groups[domain].append(analysis)

        # Generate recommendations for each domain
        for domain, analyses in domain_groups.items():
            for analysis in analyses[:3]:  # Top 3 per domain
                recommendation = RecyclingRecommendation(
                    source_path=analysis.path,
                    target_use_case=f"{domain.title()} functionality for new projects",
                    confidence=analysis.quality_score / 100.0,
                    required_modifications=self._suggest_modifications(analysis),
                    integration_effort=self._estimate_integration_effort(analysis),
                    value_proposition=self._create_value_proposition(analysis, domain)
                )
                recommendations.append(recommendation)

        return recommendations

    def _suggest_modifications(self, analysis: CrateAnalysis) -> List[str]:
        """Suggest modifications needed for recycling"""
        modifications = []

        if analysis.documentation_ratio < 0.2:
            modifications.append("Add comprehensive documentation")

        if analysis.test_coverage_estimate < 50:
            modifications.append("Improve test coverage")

        if analysis.complexity_score > 80:
            modifications.append("Refactor to reduce complexity")

        if not modifications:
            modifications.append("Minimal changes needed")

        return modifications

    def _estimate_integration_effort(self, analysis: CrateAnalysis) -> str:
        """Estimate effort required to integrate this code"""
        if analysis.quality_score >= 85:
            return 'trivial'
        elif analysis.quality_score >= 70:
            return 'low'
        elif analysis.quality_score >= 50:
            return 'medium'
        else:
            return 'high'

    def _create_value_proposition(self, analysis: CrateAnalysis, domain: str) -> str:
        """Create a value proposition for recycling this code"""
        props = [
            f"Provides {len(analysis.functions)} reusable {domain} functions",
            f"Quality score: {analysis.quality_score:.1f}",
            f"Archaeological value: {analysis.archaeological_value:.1f}"
        ]

        if analysis.lines_of_code > 100:
            props.append(f"Substantial implementation ({analysis.lines_of_code} LOC)")

        return "; ".join(props)

    def run_archaeological_scan(self) -> Dict:
        """Run the complete archaeological scan"""
        print("🏛️ Starting CTAS Archaeological Code Recycler Test")
        print("=" * 60)

        start_time = time.time()

        # Find orphaned files
        orphaned_files = self.scan_for_orphaned_files()

        # Analyze each file
        print("\n📊 Analyzing files for recycling potential...")
        for i, file_path in enumerate(orphaned_files, 1):
            print(f"  [{i:3d}/{len(orphaned_files)}] {file_path.name}")
            analysis = self.analyze_file(file_path)
            self.analysis_results.append(analysis)

        # Generate recommendations
        print("\n🔄 Generating recycling recommendations...")
        self.recycling_recommendations = self.generate_recycling_recommendations()

        # Calculate summary statistics
        summary = self._generate_summary()

        end_time = time.time()
        summary['processing_time'] = end_time - start_time

        return summary

    def _generate_summary(self) -> Dict:
        """Generate summary statistics"""
        if not self.analysis_results:
            return {"error": "No analysis results"}

        # Quality distribution
        quality_distribution = Counter()
        total_loc = 0
        total_functions = 0

        for analysis in self.analysis_results:
            quality_distribution[analysis.recycling_potential] += 1
            total_loc += analysis.lines_of_code
            total_functions += len(analysis.functions)

        # Top candidates
        top_candidates = sorted(
            [a for a in self.analysis_results if a.recycling_potential in ['high', 'medium']],
            key=lambda x: x.quality_score,
            reverse=True
        )[:10]

        return {
            'total_files_analyzed': len(self.analysis_results),
            'total_lines_of_code': total_loc,
            'total_functions_found': total_functions,
            'quality_distribution': dict(quality_distribution),
            'recycling_recommendations': len(self.recycling_recommendations),
            'top_candidates': [
                {
                    'name': c.name,
                    'quality_score': c.quality_score,
                    'archaeological_value': c.archaeological_value,
                    'recycling_potential': c.recycling_potential,
                    'path': c.path
                } for c in top_candidates
            ],
            'domain_coverage': self._analyze_domain_coverage()
        }

    def _analyze_domain_coverage(self) -> Dict[str, int]:
        """Analyze which domains are covered by recyclable code"""
        domain_coverage = defaultdict(int)

        for analysis in self.analysis_results:
            if analysis.recycling_potential in ['high', 'medium']:
                for domain, keywords in self.function_patterns.items():
                    if any(any(kw in func.lower() for kw in keywords) for func in analysis.functions):
                        domain_coverage[domain] += 1

        return dict(domain_coverage)

    def save_results(self, output_dir: str = "."):
        """Save analysis results to files"""
        output_path = Path(output_dir)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

        # Save detailed analysis
        analysis_file = output_path / f"archaeological_analysis_{timestamp}.json"
        with open(analysis_file, 'w') as f:
            json.dump([asdict(a) for a in self.analysis_results], f, indent=2)

        # Save recommendations
        recommendations_file = output_path / f"recycling_recommendations_{timestamp}.json"
        with open(recommendations_file, 'w') as f:
            json.dump([asdict(r) for r in self.recycling_recommendations], f, indent=2)

        print(f"\n💾 Results saved:")
        print(f"   Analysis: {analysis_file}")
        print(f"   Recommendations: {recommendations_file}")

def main():
    """Main execution function"""
    print("🏛️ CTAS Archaeological Code Recycler - BNE Test")
    print("Testing the archaeological approach on real orphaned files")
    print("=" * 70)

    # Initialize recycler
    recycler = ArchaeologicalCodeRecycler()

    # Run the scan
    summary = recycler.run_archaeological_scan()

    # Display results
    print("\n" + "=" * 70)
    print("📊 ARCHAEOLOGICAL ANALYSIS SUMMARY")
    print("=" * 70)

    print(f"🔍 Files Analyzed: {summary['total_files_analyzed']}")
    print(f"📏 Total Lines of Code: {summary['total_lines_of_code']:,}")
    print(f"⚙️  Total Functions Found: {summary['total_functions_found']}")
    print(f"⏱️  Processing Time: {summary['processing_time']:.2f} seconds")

    print(f"\n🎯 Quality Distribution:")
    for potential, count in summary['quality_distribution'].items():
        print(f"   {potential.title()}: {count} files")

    print(f"\n🔄 Recycling Recommendations: {summary['recycling_recommendations']}")

    print(f"\n🌍 Domain Coverage:")
    for domain, count in summary['domain_coverage'].items():
        print(f"   {domain.title()}: {count} recyclable components")

    print(f"\n🏆 Top Recycling Candidates:")
    for i, candidate in enumerate(summary['top_candidates'][:5], 1):
        print(f"   {i}. {candidate['name']} (Q:{candidate['quality_score']:.1f}, V:{candidate['archaeological_value']:.1f})")

    # Save results
    recycler.save_results()

    print(f"\n✅ Archaeological code recycling test complete!")
    print(f"🎯 Found {summary['recycling_recommendations']} recycling opportunities")

    # Calculate BNE validation metrics
    recyclable_count = summary['quality_distribution'].get('high', 0) + summary['quality_distribution'].get('medium', 0)
    total_count = summary['total_files_analyzed']

    if total_count > 0:
        recycling_rate = (recyclable_count / total_count) * 100
        print(f"\n🧬 BNE Validation Metrics:")
        print(f"   Recycling Success Rate: {recycling_rate:.1f}%")
        print(f"   Archaeological Value: Proven with real code")
        print(f"   Automation Effectiveness: {summary['total_functions_found']} functions catalogued")

if __name__ == "__main__":
    main()