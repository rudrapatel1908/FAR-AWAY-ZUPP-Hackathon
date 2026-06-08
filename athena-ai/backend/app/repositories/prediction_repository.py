import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prediction import Prediction
from app.repositories.base import BaseRepository


class PredictionRepository(BaseRepository[Prediction]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Prediction)

    async def list_by_event(self, event_id: uuid.UUID) -> list[Prediction]:
        query = (
            select(Prediction)
            .where(Prediction.event_id == event_id)
            .order_by(Prediction.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
