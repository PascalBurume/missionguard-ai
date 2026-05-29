"""Dependency: verify JWT and attach org context."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from missionguard_api.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)

_ANON_USER = {"sub": "anonymous", "org_id": None}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """Validate a JWT signed with SECRET_KEY and return the decoded payload.

    In development mode (APP_ENV=development), requests without a token are
    treated as an anonymous/guest user so the frontend can work without an
    auth layer wired up.
    """
    if credentials is None:
        if settings.APP_ENV == "development":
            return _ANON_USER
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        ) from exc
    return payload
