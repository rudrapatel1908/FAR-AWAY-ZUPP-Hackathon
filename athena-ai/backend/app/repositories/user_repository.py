from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, User)

    async def get_by_email(self, email: str, *, include_deleted: bool = False) -> User | None:
        query = self._base_query(include_deleted=include_deleted).where(User.email == email)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_active(self) -> list[User]:
        query = (
            select(User)
            .where(User.deleted_at.is_(None))
            .where(User.is_active.is_(True))
            .order_by(User.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
