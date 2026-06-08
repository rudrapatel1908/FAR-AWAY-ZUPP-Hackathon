"""JWT access token and refresh token lifecycle management."""

import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt

from app.core.settings import Settings


class TokenError(Exception):
    """Raised when token creation, decoding, or validation fails."""


class TokenService:
    """Handles JWT creation and refresh-token generation.

    All time-sensitive operations use UTC to avoid timezone issues.
    """

    def __init__(self, settings: Settings) -> None:
        self._secret = settings.jwt_secret_key
        self._algorithm = settings.jwt_algorithm
        self._access_expires = timedelta(minutes=settings.access_token_expire_minutes)
        self._refresh_expires = timedelta(days=settings.refresh_token_expire_days)

    # ------------------------------------------------------------------ #
    # Access tokens
    # ------------------------------------------------------------------ #

    def create_access_token(
        self,
        subject: uuid.UUID,
        role: str,
        extra_claims: dict[str, Any] | None = None,
    ) -> str:
        """Return a signed JWT access token.

        Claims:
            sub  – user UUID (str)
            role – UserRole value
            type – "access"
            exp  – expiry timestamp
            iat  – issued-at timestamp
        """
        now = datetime.now(UTC)
        payload: dict[str, Any] = {
            "sub": str(subject),
            "role": role,
            "type": "access",
            "iat": now,
            "exp": now + self._access_expires,
            **(extra_claims or {}),
        }
        return str(jwt.encode(payload, self._secret, algorithm=self._algorithm))

    def decode_access_token(self, token: str) -> dict[str, Any]:
        """Decode and validate an access token.

        Raises:
            TokenError: on any validation failure.
        """
        try:
            payload: dict[str, Any] = jwt.decode(
                token, self._secret, algorithms=[self._algorithm]
            )
        except JWTError as exc:
            raise TokenError(f"Invalid access token: {exc}") from exc

        if payload.get("type") != "access":
            raise TokenError("Token type mismatch — expected 'access'")
        return payload

    # ------------------------------------------------------------------ #
    # Refresh tokens
    # ------------------------------------------------------------------ #

    def create_refresh_token(self) -> tuple[str, str, datetime]:
        """Generate a cryptographically random refresh token.

        Returns:
            (raw_token, token_hash, expires_at)
            – raw_token  : the opaque string returned to the client
            – token_hash : SHA-256 hex digest stored in the database
            – expires_at : UTC expiry datetime
        """
        raw = secrets.token_urlsafe(48)
        token_hash = self._hash(raw)
        expires_at = datetime.now(UTC) + self._refresh_expires
        return raw, token_hash, expires_at

    @staticmethod
    def hash_token(raw: str) -> str:
        """Compute the SHA-256 hex digest of a raw token string."""
        return hashlib.sha256(raw.encode()).hexdigest()

    # ------------------------------------------------------------------ #
    # Internal helpers
    # ------------------------------------------------------------------ #

    @staticmethod
    def _hash(value: str) -> str:
        return hashlib.sha256(value.encode()).hexdigest()
