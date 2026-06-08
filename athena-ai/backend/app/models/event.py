import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Enum, ForeignKey, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import SoftDeleteMixin, TimestampMixin
from app.models.enums import EventSeverity, EventStatus

if TYPE_CHECKING:
    from app.models.decision import Decision
    from app.models.investigation import Investigation
    from app.models.prediction import Prediction
    from app.models.recommendation import Recommendation
    from app.models.report import Report
    from app.models.user import User


class Event(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "events"
    __table_args__ = (
        Index("ix_events_status", "status"),
        Index("ix_events_severity", "severity"),
        Index("ix_events_created_by", "created_by"),
        Index("ix_events_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[EventSeverity] = mapped_column(
        Enum(EventSeverity, name="event_severity", native_enum=True),
        nullable=False,
    )
    status: Mapped[EventStatus] = mapped_column(
        Enum(EventStatus, name="event_status", native_enum=True),
        nullable=False,
        default=EventStatus.NEW,
    )
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    event_metadata: Mapped[dict[str, Any]] = mapped_column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    creator: Mapped["User"] = relationship("User", back_populates="events", lazy="selectin")
    investigations: Mapped[list["Investigation"]] = relationship(
        "Investigation",
        back_populates="event",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    predictions: Mapped[list["Prediction"]] = relationship(
        "Prediction",
        back_populates="event",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    recommendations: Mapped[list["Recommendation"]] = relationship(
        "Recommendation",
        back_populates="event",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    decisions: Mapped[list["Decision"]] = relationship(
        "Decision",
        back_populates="event",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    reports: Mapped[list["Report"]] = relationship(
        "Report",
        back_populates="event",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
