import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.decision import Decision
from app.repositories.base import BaseRepository


class DecisionRepository(BaseRepository[Decision]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Decision)

    async def list_by_event(self, event_id: uuid.UUID) -> list[Decision]:
        query = (
            select(Decision)
            .where(Decision.event_id == event_id)
            .order_by(Decision.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
