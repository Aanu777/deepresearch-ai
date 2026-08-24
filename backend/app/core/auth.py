from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jose import JWTError, jwt
import httpx

from app.core.config import settings


# ============================================================
# AUTHENTICATION SCHEME
# ============================================================

security = HTTPBearer()


# ============================================================
# AUTHENTICATED USER
# ============================================================


class AuthenticatedUser:

    def __init__(
        self,
        user_id: str,
    ):
        self.user_id = user_id


# ============================================================
# SUPABASE JWKS
# ============================================================


async def get_supabase_jwks():
    """
    Get Supabase's public JWT signing keys.

    These public keys are used to verify ES256 JWTs.
    """

    url = (
        f"{settings.SUPABASE_URL}"
        "/auth/v1/.well-known/jwks.json"
    )

    async with httpx.AsyncClient(
        timeout=10.0
    ) as client:

        response = await client.get(url)

    if response.status_code != 200:

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to retrieve Supabase "
                "JWT signing keys."
            ),
        )

    return response.json()


# ============================================================
# CURRENT USER
# ============================================================


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
) -> AuthenticatedUser:

    token = credentials.credentials

    print(
        "AUTHORIZATION HEADER RECEIVED:"
        " Bearer token present"
    )

    # ========================================================
    # READ JWT HEADER
    # ========================================================

    try:

        header = jwt.get_unverified_header(
            token
        )

        print(
            "SUPABASE JWT HEADER:",
            {
                "alg": header.get("alg"),
                "kid": header.get("kid"),
                "typ": header.get("typ"),
            },
        )

    except JWTError as exc:

        print(
            "JWT HEADER ERROR:",
            type(exc).__name__,
            str(exc),
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
        ) from exc

    # ========================================================
    # VERIFY ALGORITHM
    # ========================================================

    algorithm = header.get("alg")

    if algorithm != "ES256":

        print(
            "UNSUPPORTED JWT ALGORITHM:",
            algorithm,
        )

        raise HTTPException(
            status_code=401,
            detail="Unsupported authentication algorithm.",
        )

    # ========================================================
    # GET SUPABASE PUBLIC KEYS
    # ========================================================

    try:

        jwks = await get_supabase_jwks()

    except HTTPException:

        raise

    except Exception as exc:

        print(
            "JWKS ERROR:",
            type(exc).__name__,
            str(exc),
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to retrieve authentication "
                "verification keys."
            ),
        ) from exc

    # ========================================================
    # FIND MATCHING PUBLIC KEY
    # ========================================================

    key_id = header.get("kid")

    signing_key = None

    for key in jwks.get("keys", []):

        if key.get("kid") == key_id:

            signing_key = key
            break

    if signing_key is None:

        print(
            "JWT SIGNING KEY NOT FOUND:",
            key_id,
        )

        raise HTTPException(
            status_code=401,
            detail=(
                "Authentication signing key "
                "could not be found."
            ),
        )

    # ========================================================
    # VERIFY JWT
    # ========================================================

    try:

        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["ES256"],
            options={
                "verify_aud": False,
            },
        )

    except JWTError as exc:

        print(
            "SUPABASE JWT ERROR:",
            type(exc).__name__,
            str(exc),
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
        ) from exc

    # ========================================================
    # USER ID
    # ========================================================

    user_id = payload.get("sub")

    if not user_id:

        print(
            "SUPABASE JWT ERROR:"
            " Token does not contain 'sub'."
        )

        raise HTTPException(
            status_code=401,
            detail=(
                "Authentication token does not "
                "contain a user ID."
            ),
        )

    # ========================================================
    # SUCCESS
    # ========================================================

    print(
        "AUTHENTICATED USER:",
        user_id,
    )

    return AuthenticatedUser(
        user_id=user_id
    )