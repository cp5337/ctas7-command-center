#!/usr/bin/env python3
"""
Quick Archaeological Code Recycler Test
Focuses on a smaller subset for faster validation
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict, Counter
import time

def quick_archaeological_scan():
    """Quick scan of a limited set of files"""
    print("🏛️ Quick Archaeological Code Recycler Test")
    print("=" * 50)

    base_path = Path("/Users/cp5337/Developer/ctas7-command-center")

    # Look for specific test files
    test_patterns = [
        "**/*test*.py",
        "**/*example*.py",
        "**/test*.rs",
        "**/*demo*.py"
    ]

    found_files = []

    print("🔍 Scanning for test/example files...")
    for pattern in test_patterns:
        files = list(base_path.glob(pattern))
        found_files.extend(files[:5])  # Max 5 per pattern

    print(f"📦 Found {len(found_files)} files to analyze")

    # Quick analysis
    results = {
        'total_files': len(found_files),
        'total_lines': 0,
        'recyclable_files': 0,
        'file_details': []
    }

    for file_path in found_files:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            lines = len([l for l in content.split('\n') if l.strip()])
            functions = len(re.findall(r'def \w+|fn \w+', content))

            # Simple quality score
            quality = 50.0
            if lines > 20:
                quality += 20
            if functions > 2:
                quality += 15
            if 'test' in content.lower():
                quality += 10

            recyclable = quality >= 70

            results['total_lines'] += lines
            if recyclable:
                results['recyclable_files'] += 1

            results['file_details'].append({
                'name': file_path.name,
                'path': str(file_path),
                'lines': lines,
                'functions': functions,
                'quality': quality,
                'recyclable': recyclable
            })

            print(f"  ✓ {file_path.name}: {lines} lines, {functions} functions, Q:{quality:.0f}")

        except Exception as e:
            print(f"  ✗ {file_path.name}: Error - {e}")

    # Summary
    print("\n" + "=" * 50)
    print("📊 QUICK ARCHAEOLOGICAL SUMMARY")
    print("=" * 50)
    print(f"Files Analyzed: {results['total_files']}")
    print(f"Total Lines: {results['total_lines']}")
    print(f"Recyclable Files: {results['recyclable_files']}")

    if results['total_files'] > 0:
        recycling_rate = (results['recyclable_files'] / results['total_files']) * 100
        print(f"Recycling Success Rate: {recycling_rate:.1f}%")

    # Top candidates
    recyclable = [f for f in results['file_details'] if f['recyclable']]
    if recyclable:
        print(f"\n🏆 Top Recycling Candidates:")
        top_5 = sorted(recyclable, key=lambda x: x['quality'], reverse=True)[:5]
        for i, candidate in enumerate(top_5, 1):
            print(f"  {i}. {candidate['name']} (Q:{candidate['quality']:.0f}, {candidate['lines']} lines)")

    return results

if __name__ == "__main__":
    quick_archaeological_scan()