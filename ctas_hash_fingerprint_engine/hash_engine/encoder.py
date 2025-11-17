ALPHABET = (
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    '!#$%&()*+,-./:;<=>?@[]^_`{|}~'
)

def encode_base96(value: int) -> str:
    if value == 0:
        return ALPHABET[0]
    result = []
    while value > 0:
        result.append(ALPHABET[value % 96])
        value //= 96
    return ''.join(reversed(result))