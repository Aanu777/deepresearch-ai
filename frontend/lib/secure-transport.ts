"use client";

const PUBLIC_KEY_B64 =
  process.env
    .NEXT_PUBLIC_PAYLOAD_PUBLIC_KEY_B64 ??
  "";

const encoder =
  new TextEncoder();

let publicKeyPromise:
  Promise<CryptoKey> | null =
  null;

type EncryptedEnvelope = {
  v: 1;
  iv: string;
  ciphertext: string;
  request_id?: string;
};

function bytesToBase64(
  value: ArrayBuffer | Uint8Array
) {
  const bytes =
    value instanceof Uint8Array
      ? value
      : new Uint8Array(value);

  let binary = "";

  const chunkSize =
    0x8000;

  for (
    let offset = 0;
    offset < bytes.length;
    offset += chunkSize
  ) {
    binary +=
      String.fromCharCode(
        ...bytes.subarray(
          offset,
          Math.min(
            offset + chunkSize,
            bytes.length
          )
        )
      );
  }

  return btoa(binary);
}

function base64ToBytes(
  value: string
) {
  const binary =
    atob(
      value.replace(
        /\s+/g,
        ""
      )
    );

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let index = 0;
    index < binary.length;
    index += 1
  ) {
    bytes[index] =
      binary.charCodeAt(
        index
      );
  }

  return bytes;
}

async function getPublicKey() {
  if (!PUBLIC_KEY_B64) {
    throw new Error(
      "Secure AI transport is not configured."
    );
  }

  if (!crypto?.subtle) {
    throw new Error(
      "Secure AI transport is not supported in this browser."
    );
  }

  if (!publicKeyPromise) {
    publicKeyPromise =
      crypto.subtle.importKey(
        "spki",
        base64ToBytes(
          PUBLIC_KEY_B64
        ),
        {
          name:
            "RSA-OAEP",
          hash:
            "SHA-256",
        },
        false,
        [
          "wrapKey",
        ]
      );
  }

  return publicKeyPromise;
}

function aad(
  kind:
    | "request"
    | "response"
    | "form",
  requestId: string,
  timestamp: string,
  field?: string
) {
  const suffix =
    field
      ? `:${field}`
      : "";

  return encoder.encode(
    `dr:v1:${kind}:${requestId}:${timestamp}${suffix}`
  );
}

async function encryptBytes(
  key: CryptoKey,
  plaintext: Uint8Array,
  additionalData:
    Uint8Array
) {
  const iv =
    crypto.getRandomValues(
      new Uint8Array(12)
    );

  const ciphertext =
    await crypto.subtle.encrypt(
      {
        name:
          "AES-GCM",
        iv,
        additionalData,
        tagLength:
          128,
      },
      key,
      plaintext
    );

  return {
    iv:
      bytesToBase64(iv),
    ciphertext:
      bytesToBase64(
        ciphertext
      ),
  };
}

async function decryptBytes(
  key: CryptoKey,
  envelope:
    EncryptedEnvelope,
  additionalData:
    Uint8Array
) {
  const plaintext =
    await crypto.subtle.decrypt(
      {
        name:
          "AES-GCM",
        iv:
          base64ToBytes(
            envelope.iv
          ),
        additionalData,
        tagLength:
          128,
      },
      key,
      base64ToBytes(
        envelope.ciphertext
      )
    );

  return new Uint8Array(
    plaintext
  );
}

async function prepareFormData(
  formData: FormData,
  key: CryptoKey,
  requestId: string,
  timestamp: string
) {
  const encrypted =
    new FormData();

  for (
    const [
      field,
      value,
    ] of formData.entries()
  ) {
    if (
      typeof value ===
      "string"
    ) {
      if (!value) {
        encrypted.append(
          field,
          ""
        );

        continue;
      }

      const envelope =
        await encryptBytes(
          key,
          encoder.encode(
            value
          ),
          aad(
            "form",
            requestId,
            timestamp,
            field
          )
        );

      encrypted.append(
        field,
        [
          "drenc",
          "v1",
          envelope.iv,
          envelope.ciphertext,
        ].join(":")
      );

      continue;
    }

    // Binary uploads remain protected by HTTPS/TLS.
    // The text fields in the same multipart request are
    // application-encrypted.
    encrypted.append(
      field,
      value,
      value.name
    );
  }

  return encrypted;
}

export async function secureFetch(
  input:
    RequestInfo | URL,
  init:
    RequestInit = {}
) {
  const publicKey =
    await getPublicKey();

  const requestId =
    crypto.randomUUID();

  const timestamp =
    Math.floor(
      Date.now() /
      1000
    ).toString();

  const aesKey =
    await crypto.subtle.generateKey(
      {
        name:
          "AES-GCM",
        length:
          256,
      },
      true,
      [
        "encrypt",
        "decrypt",
      ]
    );

  const wrappedKey =
    await crypto.subtle.wrapKey(
      "raw",
      aesKey,
      publicKey,
      {
        name:
          "RSA-OAEP",
      }
    );

  const headers =
    new Headers(
      init.headers
    );

  headers.set(
    "X-DR-Encrypted",
    "v1"
  );

  headers.set(
    "X-DR-Wrapped-Key",
    bytesToBase64(
      wrappedKey
    )
  );

  headers.set(
    "X-DR-Request-ID",
    requestId
  );

  headers.set(
    "X-DR-Timestamp",
    timestamp
  );

  let body =
    init.body;

  if (
    typeof body ===
    "string"
  ) {
    const originalType =
      headers.get(
        "Content-Type"
      ) ??
      "application/json";

    const envelope =
      await encryptBytes(
        aesKey,
        encoder.encode(
          body
        ),
        aad(
          "request",
          requestId,
          timestamp
        )
      );

    body =
      JSON.stringify({
        v: 1,
        ...envelope,
      });

    headers.set(
      "Content-Type",
      "application/vnd.deepresearch.encrypted+json"
    );

    headers.set(
      "X-DR-Original-Content-Type",
      originalType
    );
  } else if (
    body instanceof
    FormData
  ) {
    body =
      await prepareFormData(
        body,
        aesKey,
        requestId,
        timestamp
      );

    // Let the browser generate the multipart boundary.
    headers.delete(
      "Content-Type"
    );
  }

  const response =
    await fetch(
      input,
      {
        ...init,
        headers,
        body,
      }
    );

  if (
    response.status ===
      204 ||
    response.status ===
      304
  ) {
    return response;
  }

  if (
    response.headers.get(
      "X-DR-Encrypted-Response"
    ) !== "v1"
  ) {
    throw new Error(
      "Secure AI transport response was not encrypted."
    );
  }

  const envelope =
    (
      await response.json()
    ) as EncryptedEnvelope;

  if (
    envelope.request_id &&
    envelope.request_id !==
      requestId
  ) {
    throw new Error(
      "Secure AI transport response did not match the request."
    );
  }

  const plaintext =
    await decryptBytes(
      aesKey,
      envelope,
      aad(
        "response",
        requestId,
        timestamp
      )
    );

  const responseHeaders =
    new Headers(
      response.headers
    );

  const originalType =
    responseHeaders.get(
      "X-DR-Original-Content-Type"
    );

  responseHeaders.delete(
    "Content-Length"
  );

  responseHeaders.delete(
    "X-DR-Encrypted-Response"
  );

  responseHeaders.delete(
    "X-DR-Original-Content-Type"
  );

  if (originalType) {
    responseHeaders.set(
      "Content-Type",
      originalType
    );
  }

  const responseBody =
    plaintext.buffer.slice(
      plaintext.byteOffset,
      plaintext.byteOffset +
        plaintext.byteLength
    );

  return new Response(
    responseBody,
    {
      status:
        response.status,
      statusText:
        response.statusText,
      headers:
        responseHeaders,
    }
  );
}
