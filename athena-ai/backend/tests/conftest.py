import asyncio
import sys
from collections.abc import AsyncGenerator

import pytest
from alembic.config import Config
from sqlalchemy.ext.asyncio import AsyncSession

from alembic import command
from app.core.settings import get_settings
from app.db.session import dispose_engine, get_session_factory, reset_engine_state

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


@pytest.fixture(scope="session", autouse=True)
def apply_migrations() -> None:
    settings = get_settings()
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
    command.upgrade(alembic_cfg, "head")


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    reset_engine_state()
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            yield session
        finally:
            await session.rollback()
    await dispose_engine()
    reset_engine_state()
