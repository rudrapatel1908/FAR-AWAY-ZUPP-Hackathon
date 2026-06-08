import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report
from app.repositories.base import BaseRepository


class ReportRepository(BaseRepository[Report]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Report)

    async def list_by_event(self, event_id: uuid.UUID) -> list[Report]:
        query = (
            select(Report)
            .where(Report.event_id == event_id)
            .order_by(Report.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
