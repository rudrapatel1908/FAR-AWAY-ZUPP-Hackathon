"""FastAPI dependency factories for authentication and RBAC."""

import uuid
from collections.abc import Callable
from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import Settings, get_settings
from app.db.session import get_db_session
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.token_service import TokenError, TokenService

_bearer = HTTPBearer(auto_error=True)


# ------------------------------------------------------------------ #
# Service factories
# ------------------------------------------------------------------ #


def get_token_service(
    settings: Annotated[Settings, Depends(get_settings)],
) -> TokenService:
    return TokenService(settings)


# ------------------------------------------------------------------ #
# Current-user resolution
# ------------------------------------------------------------------ #


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    session: Annotated[AsyncSession, Depends(get_db_session)],
    token_service: Annotated[TokenService, Depends(get_token_service)],
) -> User:
    """Decode the Bearer JWT and return the authenticated User.

    Raises HTTP 401 on any token failure.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = token_service.decode_access_token(credentials.credentials)
        user_id = uuid.UUID(payload["sub"])
    except (TokenError, KeyError, ValueError):
        raise credentials_exception from None

    repo = UserRepository(session)
    user = await repo.get_by_id(user_id)

    if user is None or not user.is_active:
        raise credentials_exception

    return user


# ------------------------------------------------------------------ #
# RBAC guard factory
# ------------------------------------------------------------------ #

# Role hierarchy: higher index = more permissive.
_ROLE_HIERARCHY: list[UserRole] = [
    UserRole.VIEWER,
    UserRole.ANALYST,
    UserRole.MANAGER,
    UserRole.ADMIN,
]


def require_roles(*roles: UserRole) -> Callable[..., Any]:
    """Return a FastAPI dependency that enforces one of the given roles.

    Usage::

        @router.get("/admin-only")
        async def admin_endpoint(
            _: Annotated[User, Depends(require_roles(UserRole.ADMIN))],
        ) -> ...:
            ...
    """

    role_set = set(roles)

    async def _check(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in role_set:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Insufficient permissions. Required: "
                    f"{[r.value for r in roles]}, "
                    f"got: {current_user.role.value}"
                ),
            )
        return current_user

    return _check


def require_min_role(min_role: UserRole) -> Callable[..., Any]:
    """Return a dependency that allows min_role and any role above it in the hierarchy.

    E.g. require_min_role(ANALYST) allows ANALYST, MANAGER, and ADMIN.
    """
    min_index = _ROLE_HIERARCHY.index(min_role)
    allowed = {r for r in _ROLE_HIERARCHY[min_index:]}

    async def _check(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Requires at least {min_role.value} role, "
                    f"got {current_user.role.value}"
                ),
            )
        return current_user

    return _check


# ------------------------------------------------------------------ #
# Convenience type aliases
# ------------------------------------------------------------------ #

CurrentUser = Annotated[User, Depends(get_current_user)]
AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]
ManagerOrAbove = Annotated[User, Depends(require_min_role(UserRole.MANAGER))]
AnalystOrAbove = Annotated[User, Depends(require_min_role(UserRole.ANALYST))]
