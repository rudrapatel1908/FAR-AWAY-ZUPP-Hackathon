import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.refresh_token import RefreshToken
from app.repositories.base import BaseRepository


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, RefreshToken)

    async def get_by_hash(self, token_hash: str) -> RefreshToken | None:
        """Retrieve a token record by its SHA-256 hash."""
        query = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def revoke(self, token: RefreshToken, *, replaced_by: str | None = None) -> RefreshToken:
        """Mark a token as revoked, optionally recording the successor token hash."""
        token.revoked = True
        token.replaced_by = replaced_by
        await self.session.flush()
        await self.session.refresh(token)
        return token

    async def revoke_all_for_user(self, user_id: uuid.UUID) -> int:
        """Revoke every active refresh token for a user (used on logout-all / security events).
        Returns the count of tokens revoked.
        """
        query = select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked.is_(False),
        )
        result = await self.session.execute(query)
        tokens = list(result.scalars().all())
        for token in tokens:
            token.revoked = True
        if tokens:
            await self.session.flush()
        return len(tokens)

    async def prune_expired(self, user_id: uuid.UUID) -> None:
        """Delete expired tokens for a user to keep the table lean."""
        now = datetime.now(UTC)
        query = select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.expires_at < now,
        )
        result = await self.session.execute(query)
        for token in result.scalars().all():
            await self.session.delete(token)
        await self.session.flush()
