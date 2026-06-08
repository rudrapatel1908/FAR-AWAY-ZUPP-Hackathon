# Security Architecture

## Threat Model

| Threat | Mitigation |
|---|---|
| Password brute-force | bcrypt with cost factor 12; constant-time comparison |
| Credential stuffing | Generic error messages on login failure; audit logging |
| JWT forgery | HS256 with a server-side secret; token type claim validation |
| Token theft (access) | Short expiry (30 min default); tokens are stateless — revocation requires waiting for expiry |
| Token theft (refresh) | Server-side storage + SHA-256 hash; reuse detection triggers full session revocation |
| Replay attacks | Refresh token rotation — each token is single-use |
| Privilege escalation | RBAC enforced at the FastAPI dependency level; role stored in DB and re-validated per request |
| Timing attacks on login | Dummy hash verification always runs even when user is not found |
| Enumeration via error messages | Identical 401 response for bad password and unknown email |
| SQL injection | Parameterized queries via SQLAlchemy ORM |

## Password Security

- **Algorithm**: bcrypt via `passlib` with `rounds=12` (the passlib default).
- **Storage**: only the hash is stored; the plaintext is never logged or persisted.
- **Verification**: `passlib.context.CryptContext.verify()` is timing-safe.
- **Complexity**: minimum 8 characters, at least one letter and one digit (enforced by Pydantic validator).

## JWT Configuration

- **Algorithm**: HS256 (symmetric). Consider migrating to RS256 for multi-service environments.
- **Secret**: loaded from `JWT_SECRET_KEY` environment variable. Must be at least 32 characters of random data. Use a secret manager in production.
- **Access token lifetime**: 30 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).
- **Claims validated**: `exp`, `iat`, `type` (must equal `"access"`), `sub` (must be a valid UUID), signature.

## Refresh Token Security

- Raw tokens are `secrets.token_urlsafe(48)` — 48 bytes of OS-provided entropy, URL-safe encoded.
- Only the SHA-256 hex digest is stored in the database. A database compromise does not expose usable tokens.
- Single-use: every refresh call revokes the old token and issues a new one.
- Reuse detection: a revoked token being presented triggers revocation of **all** sessions for that user, mitigating the stolen-token scenario.
- Expiry: enforced at the database level via `expires_at`; expired tokens are pruned on login.

## RBAC

- Roles: `VIEWER`, `ANALYST`, `MANAGER`, `ADMIN` (defined in `UserRole` enum).
- Enforced via FastAPI dependency injection at the route level — not via middleware.
- The role is stored in the database and fetched fresh on each request; it is also included in the JWT as a convenience claim but the DB value is authoritative.
- Hierarchy is encoded in `deps.py`; `require_min_role` allows coarse permission levels, `require_roles` allows exact role matching.

## Audit Logging

- All security-relevant events are written to the `audit_logs` table with a timestamp, optional `user_id`, `event_type`, `ip_address`, and a JSONB metadata blob.
- The table is append-only by convention; application code never deletes or updates rows.
- IP address is extracted from `X-Forwarded-For` (first hop) if present, falling back to the direct connection IP.

## Transport Security

- TLS must be terminated at the load balancer or reverse proxy in production.
- The backend sets `allow_credentials=True` in CORS middleware — restrict `BACKEND_CORS_ORIGINS` to your actual frontend origin in production.
- `Authorization` headers are not logged.

## Production Hardening Checklist

- [ ] Set `JWT_SECRET_KEY` to a cryptographically random 32+ character string via a secret manager (e.g., AWS Secrets Manager, HashiCorp Vault).
- [ ] Set `ATHENA_ENV=production` — disable debug modes and verbose error responses.
- [ ] Restrict `BACKEND_CORS_ORIGINS` to your exact frontend URL.
- [ ] Terminate TLS at a reverse proxy or load balancer.
- [ ] Configure PostgreSQL connection over TLS.
- [ ] Store refresh tokens in `httpOnly` cookies on the client side to prevent XSS exfiltration.
- [ ] Add rate limiting (e.g., via nginx or a FastAPI middleware) to `/api/auth/login` and `/api/auth/register`.
- [ ] Set up alerting on `login_failed` and `token_reuse_detected` audit events.
- [ ] Rotate `JWT_SECRET_KEY` on a schedule; implement key-ID (`kid`) claim if graceful rotation is needed.
- [ ] Consider migrating from HS256 to RS256 if multiple services need to verify tokens independently.
- [ ] Review and tighten password complexity requirements for your user population.

## Dependency Versions

| Package | Version | Purpose |
|---|---|---|
| `passlib[bcrypt]` | 1.7.4 | Password hashing |
| `bcrypt` | 4.0.1 | bcrypt backend for passlib |
| `python-jose[cryptography]` | 3.3.0 | JWT encode/decode |
| `cryptography` | 48.0.0 (transitive) | RSA/EC key support |
| `python-multipart` | ≥0.0.9 | Form data parsing |

Pin these versions and audit for CVEs before production deployment.
