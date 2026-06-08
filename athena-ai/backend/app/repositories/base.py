import uuid
from datetime import UTC, datetime
from typing import Any, Generic, TypeVar, cast

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Async repository with soft-delete filtering for applicable models."""

    def __init__(self, session: AsyncSession, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    def _base_query(self, *, include_deleted: bool = False) -> Select[tuple[ModelT]]:
        query = select(self.model)
        if not include_deleted and hasattr(self.model, "deleted_at"):
            query = query.where(self.model.deleted_at.is_(None))  # type: ignore[attr-defined]
        return query

    async def get_by_id(
        self,
        entity_id: uuid.UUID,
        *,
        include_deleted: bool = False,
    ) -> ModelT | None:
        query = self._base_query(include_deleted=include_deleted).where(self.model.id == entity_id)  # type: ignore[attr-defined]
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def add(self, entity: ModelT) -> ModelT:
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return entity

    async def soft_delete(self, entity: ModelT) -> ModelT:
        if not hasattr(entity, "deleted_at"):
            msg = f"{self.model.__name__} does not support soft delete"
            raise TypeError(msg)
        cast(Any, entity).deleted_at = datetime.now(UTC)
        await self.session.flush()
        await self.session.refresh(entity)
        return entity
