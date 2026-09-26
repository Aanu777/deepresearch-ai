from collections.abc import (
    Awaitable,
    Callable,
)

from typing import Any

from app.core.config import (
    settings,
)

from app.core.payload_crypto import (
    decrypt_json_request,
    encrypt_response,
    unwrap_request_key,
    validate_request_metadata,
)


TARGET_PREFIXES = (
    "/api/v1/conversations",
    "/api/v1/research",
    "/api/v1/memory",
)

ENCRYPTED_JSON_TYPE = (
    "application/vnd.deepresearch.encrypted+json"
)


def _header_map(
    scope: dict[
        str,
        Any,
    ]
):
    return {
        key.decode(
            "latin-1"
        ).lower():
            value.decode(
                "latin-1"
            )
        for (
            key,
            value,
        )
        in scope.get(
            "headers",
            []
        )
    }


def _replace_header(
    headers: list[
        tuple[
            bytes,
            bytes,
        ]
    ],
    name: str,
    value: str,
):
    encoded_name = (
        name.lower()
        .encode(
            "latin-1"
        )
    )

    filtered = [
        (
            key,
            item,
        )
        for (
            key,
            item,
        )
        in headers
        if (
            key.lower()
            != encoded_name
        )
    ]

    filtered.append(
        (
            encoded_name,
            value.encode(
                "latin-1"
            ),
        )
    )

    return filtered


def _remove_header(
    headers: list[
        tuple[
            bytes,
            bytes,
        ]
    ],
    name: str,
):
    encoded_name = (
        name.lower()
        .encode(
            "latin-1"
        )
    )

    return [
        (
            key,
            value,
        )
        for (
            key,
            value,
        )
        in headers
        if (
            key.lower()
            != encoded_name
        )
    ]


async def _read_body(
    receive: Callable[
        [],
        Awaitable[
            dict[
                str,
                Any,
            ]
        ],
    ],
):
    chunks: list[
        bytes
    ] = []

    while True:
        message = (
            await receive()
        )

        chunks.append(
            message.get(
                "body",
                b"",
            )
        )

        if not message.get(
            "more_body",
            False,
        ):
            break

    return b"".join(
        chunks
    )


def _body_receiver(
    body: bytes,
):
    sent = False

    async def receive():
        nonlocal sent

        if sent:
            return {
                "type":
                    "http.request",
                "body":
                    b"",
                "more_body":
                    False,
            }

        sent = True

        return {
            "type":
                "http.request",
            "body":
                body,
            "more_body":
                False,
        }

    return receive


async def _send_json_error(
    send,
    status_code: int,
    message: str,
):
    import json

    body = json.dumps(
        {
            "detail":
                message
        }
    ).encode(
        "utf-8"
    )

    await send(
        {
            "type":
                "http.response.start",
            "status":
                status_code,
            "headers": [
                (
                    b"content-type",
                    b"application/json",
                ),
                (
                    b"content-length",
                    str(
                        len(
                            body
                        )
                    ).encode(
                        "ascii"
                    ),
                ),
            ],
        }
    )

    await send(
        {
            "type":
                "http.response.body",
            "body":
                body,
            "more_body":
                False,
        }
    )


class PayloadEncryptionMiddleware:

    def __init__(
        self,
        app,
    ):
        self.app = app

    async def __call__(
        self,
        scope,
        receive,
        send,
    ):
        if (
            scope.get(
                "type"
            )
            != "http"
        ):
            await self.app(
                scope,
                receive,
                send,
            )

            return

        path = scope.get(
            "path",
            "",
        )

        method = (
            scope.get(
                "method",
                "GET",
            )
            .upper()
        )

        protected = any(
            path.startswith(
                prefix
            )
            for prefix
            in TARGET_PREFIXES
        )

        if (
            not protected
            or method
            == "OPTIONS"
        ):
            await self.app(
                scope,
                receive,
                send,
            )

            return

        headers = (
            _header_map(
                scope
            )
        )

        encrypted_version = (
            headers.get(
                "x-dr-encrypted"
            )
        )

        if (
            encrypted_version
            != "v1"
        ):
            if (
                settings
                .PAYLOAD_ENCRYPTION_REQUIRED
            ):
                await _send_json_error(
                    send,
                    400,
                    "Encrypted payload required.",
                )

                return

            await self.app(
                scope,
                receive,
                send,
            )

            return

        wrapped_key = (
            headers.get(
                "x-dr-wrapped-key",
                "",
            )
        )

        request_id = (
            headers.get(
                "x-dr-request-id",
                "",
            )
        )

        timestamp = (
            headers.get(
                "x-dr-timestamp",
                "",
            )
        )

        try:
            validate_request_metadata(
                request_id,
                timestamp,
            )

            aes_key = (
                unwrap_request_key(
                    wrapped_key
                )
            )

        except Exception:
            await _send_json_error(
                send,
                400,
                "Invalid secure request envelope.",
            )

            return

        state = (
            scope.setdefault(
                "state",
                {},
            )
        )

        state[
            "payload_key"
        ] = aes_key

        state[
            "payload_request_id"
        ] = request_id

        state[
            "payload_timestamp"
        ] = timestamp

        content_type = (
            headers.get(
                "content-type",
                "",
            )
            .split(
                ";",
                1,
            )[0]
            .strip()
            .lower()
        )

        if (
            content_type
            == ENCRYPTED_JSON_TYPE
        ):
            encrypted_body = (
                await _read_body(
                    receive
                )
            )

            try:
                plaintext_body = (
                    decrypt_json_request(
                        encrypted_body,
                        aes_key,
                        request_id,
                        timestamp,
                    )
                )

            except Exception:
                await _send_json_error(
                    send,
                    400,
                    "Unable to decrypt request.",
                )

                return

            original_type = (
                headers.get(
                    "x-dr-original-content-type",
                    "application/json",
                )
            )

            raw_headers = list(
                scope.get(
                    "headers",
                    []
                )
            )

            raw_headers = (
                _replace_header(
                    raw_headers,
                    "content-type",
                    original_type,
                )
            )

            raw_headers = (
                _replace_header(
                    raw_headers,
                    "content-length",
                    str(
                        len(
                            plaintext_body
                        )
                    ),
                )
            )

            scope[
                "headers"
            ] = raw_headers

            receive = (
                _body_receiver(
                    plaintext_body
                )
            )

        start_message = None

        response_chunks: list[
            bytes
        ] = []

        async def secure_send(
            message,
        ):
            nonlocal start_message

            message_type = (
                message.get(
                    "type"
                )
            )

            if (
                message_type
                == "http.response.start"
            ):
                start_message = (
                    message
                )

                return

            if (
                message_type
                != "http.response.body"
            ):
                await send(
                    message
                )

                return

            response_chunks.append(
                message.get(
                    "body",
                    b"",
                )
            )

            if message.get(
                "more_body",
                False,
            ):
                return

            body = b"".join(
                response_chunks
            )

            if (
                start_message
                is None
            ):
                return

            status = (
                start_message[
                    "status"
                ]
            )

            if (
                not body
                or status
                in {
                    204,
                    304,
                }
            ):
                await send(
                    start_message
                )

                await send(
                    {
                        "type":
                            "http.response.body",
                        "body":
                            body,
                        "more_body":
                            False,
                    }
                )

                return

            encrypted_body = (
                encrypt_response(
                    body,
                    aes_key,
                    request_id,
                    timestamp,
                )
            )

            raw_headers = list(
                start_message.get(
                    "headers",
                    []
                )
            )

            response_headers = {
                key.decode(
                    "latin-1"
                ).lower():
                    value.decode(
                        "latin-1"
                    )
                for (
                    key,
                    value,
                )
                in raw_headers
            }

            original_type = (
                response_headers.get(
                    "content-type",
                    "application/octet-stream",
                )
            )

            raw_headers = (
                _remove_header(
                    raw_headers,
                    "content-length",
                )
            )

            raw_headers = (
                _replace_header(
                    raw_headers,
                    "content-type",
                    ENCRYPTED_JSON_TYPE,
                )
            )

            raw_headers = (
                _replace_header(
                    raw_headers,
                    "content-length",
                    str(
                        len(
                            encrypted_body
                        )
                    ),
                )
            )

            raw_headers = (
                _replace_header(
                    raw_headers,
                    "x-dr-encrypted-response",
                    "v1",
                )
            )

            raw_headers = (
                _replace_header(
                    raw_headers,
                    "x-dr-original-content-type",
                    original_type,
                )
            )

            start_message[
                "headers"
            ] = raw_headers

            await send(
                start_message
            )

            await send(
                {
                    "type":
                        "http.response.body",
                    "body":
                        encrypted_body,
                    "more_body":
                        False,
                }
            )

        await self.app(
            scope,
            receive,
            secure_send,
        )
