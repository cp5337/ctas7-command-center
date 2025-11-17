#!/usr/bin/env python3
"""Non-invasive ingestion & screening script for Markdown patent/IP detection
Reads a directory of markdown files, applies simple regex screening, extracts snippets and emits JSON for embedding.
"""
import os
import re
import json
from pathlib import Path

ROOT = Path(os.environ.get('IP_CORPUS', '~/Desktop/ABE-DropZone')).expanduser()
OUT = Path(os.environ.get('IP_OUT', './ip_search_tools/output.json')).resolve()

SCREEN_PATTERNS = [
    re.compile(r'patent', re.I),
    re.compile(r'intellectual property', re.I),
    re.compile(r'novelty', re.I),
    re.compile(r'prior art', re.I),
    re.compile(r'claim[s]?', re.I),
]

RESULTS = []

for md in ROOT.rglob('*.md'):
    try:
        txt = md.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    for p in SCREEN_PATTERNS:
        for m in p.finditer(txt):
            start = max(0, m.start()-80)
            end = min(len(txt), m.end()+80)
            snippet = txt[start:end].replace('\n', ' ')
            RESULTS.append({
                'path': str(md),
                'match': m.group(0),
                'snippet': snippet,
            })

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(RESULTS, indent=2), encoding='utf-8')
print('Wrote', OUT)
