from collections import defaultdict

_fingerprint_counts = defaultdict(int)
_lineage_map = {}

def compute_novelty_score(fingerprint, lineage_depth=0, entropy=1.0, age_factor=1.0):
    _fingerprint_counts[fingerprint] += 1
    freq = _fingerprint_counts[fingerprint]
    novelty = (1 / freq) + entropy * 0.4 + (1 / (lineage_depth + 1)) * 0.2 + age_factor * 0.1
    return round(novelty, 4)

def link_lineage(current, parent):
    _lineage_map[current] = parent

def get_lineage_depth(fingerprint):
    """Calculate lineage depth by traversing parent chain."""
    depth = 0
    current = fingerprint
    while current in _lineage_map:
        depth += 1
        current = _lineage_map[current]
        # Prevent infinite loops
        if depth > 100:
            break
    return depth

def get_fingerprint_frequency(fingerprint):
    """Get how many times a fingerprint has been seen."""
    return _fingerprint_counts.get(fingerprint, 0)

def reset_tracking():
    """Reset all tracking data - useful for testing."""
    global _fingerprint_counts, _lineage_map
    _fingerprint_counts.clear()
    _lineage_map.clear()