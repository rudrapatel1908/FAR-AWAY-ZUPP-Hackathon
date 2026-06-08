"""Auth request and response schemas — frontend-compatible."""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

# ------------------------------------------------------------------ #
# Nested user representation (included in token responses)
# ------------------------------------------------------------------ #


class UserOut(BaseModel):
    """Public user representation returned in auth responses."""

    id: uuid.UUID
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ------------------------------------------------------------------ #
# Requests
# ------------------------------------------------------------------ #


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="VIEWER")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {"ADMIN", "MANAGER", "ANALYST", "VIEWER"}
        upper = v.upper()
        if upper not in allowed:
            raise ValueError(f"role must be one of {sorted(allowed)}")
        return upper

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c.isalpha() for c in v):
            raise ValueError("Password must contain at least one letter")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)


class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)


# ------------------------------------------------------------------ #
# Responses
# ------------------------------------------------------------------ #


class TokenResponse(BaseModel):
    """Lovable.dev-compatible token response envelope."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class MeResponse(BaseModel):
    user: UserOut
