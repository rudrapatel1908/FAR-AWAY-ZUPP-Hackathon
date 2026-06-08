import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.investigation import Investigation
from app.repositories.base import BaseRepository


class InvestigationRepository(BaseRepository[Investigation]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Investigation)

    async def list_by_event(self, event_id: uuid.UUID) -> list[Investigation]:
        query = (
            select(Investigation)
            .where(Investigation.event_id == event_id)
            .order_by(Investigation.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
