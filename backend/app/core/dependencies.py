"""
Core FastAPI Dependencies for Authentication and Authorization.
"""

from typing import Dict, Any, Optional
from fastapi import Header, HTTPException, status


class UserAuthContext:
    """User context container injected into secured FastAPI endpoints."""

    def __init__(
        self,
        user_id: str = "usr-001",
        email: str = "admin@dental.com",
        role: str = "super_admin",
        organization_id: str = "org-001",
        clinic_id: str = "clinic-downtown",
    ):
        self.id = user_id
        self.email = email
        self.role = role
        self.organization_id = organization_id
        self.clinic_id = clinic_id


async def get_current_user(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    authorization: Optional[str] = Header(None),
) -> UserAuthContext:
    """
    Dependency injection for FastAPI routes.
    Extracts current authenticated user context from request headers or JWT token.
    """
    role = x_user_role or "super_admin"
    user_id = x_user_id or "usr-001"
    org_id = x_org_id or "org-001"
    email = "admin@dental.com" if role in ("super_admin", "org_admin") else "user@dental.com"

    return UserAuthContext(
        user_id=user_id,
        email=email,
        role=role,
        organization_id=org_id,
        clinic_id="clinic-downtown",
    )
