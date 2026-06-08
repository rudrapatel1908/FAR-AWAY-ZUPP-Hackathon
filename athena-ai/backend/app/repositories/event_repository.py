import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.enums import EventStatus
from app.models.event import Event
from app.repositories.base import BaseRepository


class EventRepository(BaseRepository[Event]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Event)

    async def get_with_relations(self, event_id: uuid.UUID) -> Event | None:
        query = (
            select(Event)
            .where(Event.id == event_id)
            .where(Event.deleted_at.is_(None))
            .options(
                selectinload(Event.creator),
                selectinload(Event.investigations),
                selectinload(Event.predictions),
                selectinload(Event.recommendations),
                selectinload(Event.decisions),
                selectinload(Event.reports),
            )
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_by_status(self, status: EventStatus) -> list[Event]:
        query = (
            select(Event)
            .where(Event.deleted_at.is_(None))
            .where(Event.status == status)
            .order_by(Event.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
