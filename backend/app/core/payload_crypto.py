import base64
import json
import os
import time
import uuid

from functools import lru_cache

from cryptography.hazmat.primitives import (
    hashes,
    serialization,
)

from cryptography.hazmat.primitives.asymmetric import (
    padding,
)

from cryptography.hazmat.primitives.ciphers.aead import (
    AESGCM,
)

from fastapi import (
    HTTPException,
    Request,
)

from app.core.config import settings


FORM_PREFIX = "drenc:v1:"
MAX_CLOCK_SKEW_SECONDS = 300


def _decode_b64(
    value: str,
) -> bytes:

    try:
        return base64.b64decode(
            value,
            validate=True,
        )

    except Exception as exc:
        raise ValueError(
            "Invalid encrypted payload encoding."
        ) from exc


def _encode_b64(
    value: bytes,
) -> str:

    return base64.b64encode(
        value
    ).decode(
        "ascii"
    )


def _aad(
    kind: str,
    request_id: str,
    timestamp: str,
    field: str | None = None,
) -> bytes:

    suffix = (
        f":{field}"
        if field
        else ""
    )

    return (
        f"dr:v1:{kind}:"
        f"{request_id}:"
        f"{timestamp}"
        f"{suffix}"
    ).encode(
        "utf-8"
    )


def validate_request_metadata(
    request_id: str,
    timestamp: str,
) -> None:

    try:
        uuid.UUID(
            request_id
        )

    except Exception as exc:
        raise ValueError(
            "Invalid secure request ID."
        ) from exc

    try:
        issued_at = int(
            timestamp
        )

    except ValueError as exc:
        raise ValueError(
            "Invalid secure request timestamp."
        ) from exc

    if (
        abs(
            int(
                time.time()
            )
            - issued_at
        )
        > MAX_CLOCK_SKEW_SECONDS
    ):
        raise ValueError(
            "Secure request timestamp is outside the allowed window."
        )


@lru_cache(
    maxsize=1
)
def _private_key():

    encoded = (
        settings
        .PAYLOAD_PRIVATE_KEY_B64
        .strip()
    )

    if not encoded:
        raise RuntimeError(
            "PAYLOAD_PRIVATE_KEY_B64 is not configured."
        )

    key_bytes = (
        _decode_b64(
            encoded
        )
    )

    try:
        key = (
            serialization
            .load_der_private_key(
                key_bytes,
                password=None,
            )
        )

    except Exception as exc:
        raise RuntimeError(
            "PAYLOAD_PRIVATE_KEY_B64 is invalid."
        ) from exc

    if not hasattr(
        key,
        "decrypt",
    ):
        raise RuntimeError(
            "Payload private key is not an RSA private key."
        )

    return key


def unwrap_request_key(
    wrapped_key: str,
) -> bytes:

    key = (
        _private_key()
        .decrypt(
            _decode_b64(
                wrapped_key
            ),
            padding.OAEP(
                mgf=padding.MGF1(
                    algorithm=(
                        hashes
                        .SHA256()
                    )
                ),
                algorithm=(
                    hashes
                    .SHA256()
                ),
                label=None,
            ),
        )
    )

    if len(key) != 32:
        raise ValueError(
            "Invalid AES-256 request key."
        )

    return key


def decrypt_json_request(
    body: bytes,
    aes_key: bytes,
    request_id: str,
    timestamp: str,
) -> bytes:

    try:
        envelope = (
            json.loads(
                body.decode(
                    "utf-8"
                )
            )
        )

        if (
            envelope.get(
                "v"
            )
            != 1
        ):
            raise ValueError(
                "Unsupported secure payload version."
            )

        iv = _decode_b64(
            envelope["iv"]
        )

        ciphertext = (
            _decode_b64(
                envelope[
                    "ciphertext"
                ]
            )
        )

        return (
            AESGCM(
                aes_key
            )
            .decrypt(
                iv,
                ciphertext,
                _aad(
                    "request",
                    request_id,
                    timestamp,
                ),
            )
        )

    except ValueError:
        raise

    except Exception as exc:
        raise ValueError(
            "Unable to decrypt secure request body."
        ) from exc


def encrypt_response(
    body: bytes,
    aes_key: bytes,
    request_id: str,
    timestamp: str,
) -> bytes:

    iv = os.urandom(
        12
    )

    ciphertext = (
        AESGCM(
            aes_key
        )
        .encrypt(
            iv,
            body,
            _aad(
                "response",
                request_id,
                timestamp,
            ),
        )
    )

    return json.dumps(
        {
            "v": 1,
            "request_id":
                request_id,
            "iv":
                _encode_b64(
                    iv
                ),
            "ciphertext":
                _encode_b64(
                    ciphertext
                ),
        },
        separators=(
            ",",
            ":",
        ),
    ).encode(
        "utf-8"
    )


def decrypt_form_value(
    value: str,
    request: Request,
    field: str,
) -> str:

    if not value:
        return ""

    if not value.startswith(
        FORM_PREFIX
    ):
        if (
            settings
            .PAYLOAD_ENCRYPTION_REQUIRED
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Encrypted payload required."
                ),
            )

        return value

    parts = value.split(
        ":",
        3,
    )

    if len(parts) != 4:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid encrypted form value."
            ),
        )

    aes_key = getattr(
        request.state,
        "payload_key",
        None,
    )

    request_id = getattr(
        request.state,
        "payload_request_id",
        None,
    )

    timestamp = getattr(
        request.state,
        "payload_timestamp",
        None,
    )

    if (
        not aes_key
        or not request_id
        or not timestamp
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Secure request context is missing."
            ),
        )

    try:
        plaintext = (
            AESGCM(
                aes_key
            )
            .decrypt(
                _decode_b64(
                    parts[2]
                ),
                _decode_b64(
                    parts[3]
                ),
                _aad(
                    "form",
                    request_id,
                    timestamp,
                    field,
                ),
            )
        )

        return plaintext.decode(
            "utf-8"
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to decrypt encrypted form value."
            ),
        ) from exc
