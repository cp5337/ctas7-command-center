import json
import time
from datetime import datetime
from typing import Dict, List, Any

def generate_cuid(filepath: str, section_id: str = "001") -> str:
    """
    Generate CUID component in proper format.
    Format: path/doc_id/section_id|ISO8601_timestamp
    """
    # Normalize path separators
    normalized_path = filepath.replace('\\', '/')
    # Get current UTC timestamp
    timestamp = datetime.utcnow().isoformat() + 'Z'
    # Zero-pad section ID
    section_padded = section_id.zfill(3)

    return f"{normalized_path}/sec{section_padded}|{timestamp}"

def generate_uuid(doc_id: str, version: str = "1", section_id: str = "001") -> str:
    """
    Generate UUID component in proper format.
    Format: DOCID-vVER-SEC###
    """
    section_padded = section_id.zfill(3)
    return f"{doc_id}-v{version}-SEC{section_padded}"

def save_fingerprints(fingerprints: List[Dict], filepath: str):
    """Save fingerprint results to JSON file."""
    with open(filepath, 'w') as f:
        json.dump(fingerprints, f, indent=2)

def load_fingerprints(filepath: str) -> List[Dict]:
    """Load fingerprint results from JSON file."""
    with open(filepath, 'r') as f:
        return json.load(f)

def benchmark_time(func):
    """Decorator to benchmark function execution time."""
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

def operator_suffix_map():
    """Mapping of SHC symbols to Lisp-style suffixes."""
    return {
        'λ': '(λ)',
        'Ξ': '(Ξ)',
        '∂': '(∂)',
        'Φ': '(Φ)',
        'Ψ': '(Ψ)',
        'Ω': '(Ω)',
        'α': '(α)',
        'β': '(β)',
        'γ': '(γ)',
        'δ': '(δ)',
        'ε': '(ε)',
        'ζ': '(ζ)',
        'η': '(η)',
        'θ': '(θ)'
    }