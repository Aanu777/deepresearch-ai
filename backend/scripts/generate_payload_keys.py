import base64

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def encode(value: bytes) -> str:
    return base64.b64encode(value).decode("ascii")


def main():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=3072,
    )

    private_der = private_key.private_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )

    public_der = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    print(
        "PAYLOAD_PRIVATE_KEY_B64="
        + encode(private_der)
    )

    print()

    print(
        "NEXT_PUBLIC_PAYLOAD_PUBLIC_KEY_B64="
        + encode(public_der)
    )


if __name__ == "__main__":
    main()
