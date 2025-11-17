def canonicalize(shc, cuid, uuid):
    """
    Creates canonical string for trivariate hashing.
    Format: SHC|CUID|UUID
    Ensures deterministic representation with proper delimiters.
    """
    # Remove any whitespace around components
    shc = str(shc).strip()
    cuid = str(cuid).strip()
    uuid = str(uuid).strip()

    # Combine with pipe delimiters
    canonical = f"{shc}|{cuid}|{uuid}"

    return canonical

def validate_components(shc, cuid, uuid):
    """
    Validates trivariate hash components according to CTAS-HASH v1.0 spec.
    """
    # SHC validation - must be from validated dictionary
    valid_shc = ['λ', 'Ξ', '∂', 'Φ', 'Ψ', 'Ω', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ']
    if shc not in valid_shc:
        raise ValueError(f"Invalid SHC '{shc}'. Must be from validated dictionary: {valid_shc}")

    # CUID validation - should contain path, section, timestamp
    if '|' not in cuid:
        raise ValueError("CUID must contain timestamp separated by '|'")

    # UUID validation - should follow DOCID-vVER-SEC### format
    if not uuid.count('-') >= 2:
        raise ValueError("UUID must follow format: DOCID-vVER-SEC###")

    return True