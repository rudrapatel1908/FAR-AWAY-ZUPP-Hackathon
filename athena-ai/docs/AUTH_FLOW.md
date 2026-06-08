# Authentication Flow

This document describes how clients authenticate with the Athena AI backend and how tokens are managed throughout their lifecycle.

## Overview

The system uses short-lived JWT access tokens paired with long-lived, server-persisted refresh tokens. Refresh tokens rotate on every use — issuing a new one and revoking the old one atomically. Every security event is written to the `audit_logs` table.

## Token Types

| Token | Storage | Lifetime | Purpose |
|---|---|---|---|
| Access token | Client memory (never persisted) | 30 minutes (configurable) | Authorize API requests via `Authorization: Bearer` header |
| Refresh token | Client storage + `refresh_tokens` DB table | 7 days (configurable) | Obtain a new access token without re-entering credentials |

## Registration Flow

```
Client                              Backend
  │                                    │
  │  POST /api/auth/register           │
  │  { name, email, password, role }   │
  ├──────────────────────────────────► │
  │                                    │  1. Validate request (Pydantic)
  │                                    │  2. Check for duplicate email (409 if exists)
  │                                    │  3. Hash password with bcrypt
  │                                    │  4. Insert User row
  │                                    │  5. Issue access token (JWT, HS256)
  │                                    │  6. Generate refresh token (random 48-byte URL-safe)
  │                                    │  7. Store SHA-256(refresh_token) in refresh_tokens
  │                                    │  8. Write audit_log: user_registered
  │                                    │
  │  201 { access_token, refresh_token, token_type, user }
  │ ◄──────────────────────────────────┤
```

## Login Flow

```
Client                              Backend
  │                                    │
  │  POST /api/auth/login              │
  │  { email, password }               │
  ├──────────────────────────────────► │
  │                                    │  1. Look up user by email
  │                                    │  2. bcrypt.verify(password, hash) — constant time
  │                                    │  3. Check is_active
  │                                    │  4. Issue access token
  │                                    │  5. Generate + store new refresh token
  │                                    │  6. Prune expired tokens for this user
  │                                    │  7. Write audit_log: login_success (or login_failed)
  │                                    │
  │  200 { access_token, refresh_token, token_type, user }
  │ ◄──────────────────────────────────┤
```

On failure (bad password, unknown email, inactive account), the server always returns `401` with a generic message. The audit log records the specific reason.

## Authenticated Request Flow

```
Client                              Backend
  │                                    │
  │  GET /api/auth/me                  │
  │  Authorization: Bearer <access_token>
  ├──────────────────────────────────► │
  │                                    │  1. HTTPBearer extracts token
  │                                    │  2. jose.jwt.decode() validates signature + expiry
  │                                    │  3. Verify token type == "access"
  │                                    │  4. Load user by sub claim (UUID)
  │                                    │  5. Check is_active
  │                                    │
  │  200 { user: { ... } }             │
  │ ◄──────────────────────────────────┤
```

## Refresh Token Rotation

```
Client                              Backend
  │                                    │
  │  POST /api/auth/refresh            │
  │  { refresh_token: "<raw_token>" }  │
  ├──────────────────────────────────► │
  │                                    │  1. SHA-256(raw_token) → look up in DB
  │                                    │  2. Check revoked == false
  │                                    │  3. Check expires_at > now()
  │                                    │  4. Load user, check is_active
  │                                    │  5. Revoke old token (revoked=true, replaced_by=new_hash)
  │                                    │  6. Issue new access token
  │                                    │  7. Generate + store new refresh token
  │                                    │  8. Write audit_log: token_refresh_success
  │                                    │
  │  200 { access_token, refresh_token, token_type, user }
  │ ◄──────────────────────────────────┤
```

### Reuse Detection

If a client presents a refresh token that has already been revoked (indicating possible token theft), the backend:

1. Revokes **all** refresh tokens for that user.
2. Writes `token_reuse_detected` to the audit log.
3. Returns `401`.

This forces the legitimate user to re-authenticate, invalidating any stolen tokens.

## Logout Flow

```
Client                              Backend
  │                                    │
  │  POST /api/auth/logout             │
  │  Authorization: Bearer <access_token>
  │  { refresh_token: "<raw_token>" }  │
  ├──────────────────────────────────► │
  │                                    │  1. Validate Bearer access token (get current user)
  │                                    │  2. SHA-256(raw_token) → look up in DB
  │                                    │  3. Verify token belongs to current user
  │                                    │  4. Set revoked = true
  │                                    │  5. Write audit_log: logout
  │                                    │
  │  204 No Content                    │
  │ ◄──────────────────────────────────┤
```

## RBAC

Every protected route uses one of the dependency factories from `app/api/deps.py`:

```python
# Exact role match (one of the listed roles)
Depends(require_roles(UserRole.ADMIN))

# Minimum role (that role or higher in the hierarchy)
Depends(require_min_role(UserRole.ANALYST))

# Convenience aliases
CurrentUser      # any authenticated user
AdminUser        # ADMIN only
ManagerOrAbove   # MANAGER or ADMIN
AnalystOrAbove   # ANALYST, MANAGER, or ADMIN
```

Role hierarchy (lowest to highest): `VIEWER → ANALYST → MANAGER → ADMIN`

### Example: Protecting a route

```python
from app.api.deps import AnalystOrAbove

@router.get("/events")
async def list_events(current_user: AnalystOrAbove) -> list[EventOut]:
    ...
```

## JWT Claims

Access tokens include:

```json
{
  "sub":  "<user UUID>",
  "role": "ANALYST",
  "type": "access",
  "iat":  1717123456,
  "exp":  1717125256
}
```

## Audit Events

| Event | When |
|---|---|
| `user_registered` | Successful registration |
| `login_success` | Successful login |
| `login_failed` | Bad credentials, unknown email, inactive account |
| `token_refresh_success` | Successful refresh rotation |
| `token_refresh_failed` | Expired refresh token |
| `token_reuse_detected` | Revoked token reused (all sessions cleared) |
| `logout` | Successful logout |

## Frontend Integration (Lovable.dev)

All token-issuing endpoints return the same envelope:

```json
{
  "access_token": "eyJ...",
  "refresh_token": "a7b3...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "ANALYST",
    "is_active": true,
    "created_at": "2025-06-08T00:00:00Z"
  }
}
```

Recommended client behavior:

1. Store `access_token` in memory (not `localStorage`).
2. Store `refresh_token` in an `httpOnly` cookie (preferred) or secure storage.
3. On 401, call `/api/auth/refresh` to get a new token pair.
4. On logout, call `/api/auth/logout` with the refresh token and clear local storage.
