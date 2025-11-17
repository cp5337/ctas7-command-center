import mmh3
from .canonicalizer import canonicalize
from .encoder import encode_base96

def generate_fingerprint(shc, cuid, uuid, suffix="(λ)", version=None):
    canon = canonicalize(shc, cuid, uuid)
    if version:
        canon += f"|{version}"
    hash_int = mmh3.hash(canon, signed=False)
    encoded = encode_base96(hash_int)
    return f"{encoded}{suffix}"