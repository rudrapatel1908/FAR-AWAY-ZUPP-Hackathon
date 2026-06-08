import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


class AuditLogRepository:
    """Write-only repository for the immutable audit log table."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def record(
        self,
        event_type: str,
        *,
        user_id: uuid.UUID | None = None,
        ip_address: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AuditLog:
        entry = AuditLog(
            user_id=user_id,
            event_type=event_type,
            metadata_=metadata or {},
            ip_address=ip_address,
        )
        self.session.add(entry)
        await self.session.flush()
        return entry
