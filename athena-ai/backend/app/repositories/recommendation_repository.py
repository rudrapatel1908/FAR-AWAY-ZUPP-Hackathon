import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recommendation import Recommendation
from app.repositories.base import BaseRepository


class RecommendationRepository(BaseRepository[Recommendation]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Recommendation)

    async def list_by_event(self, event_id: uuid.UUID) -> list[Recommendation]:
        query = (
            select(Recommendation)
            .where(Recommendation.event_id == event_id)
            .order_by(Recommendation.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
