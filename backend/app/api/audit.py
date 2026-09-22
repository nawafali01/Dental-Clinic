"""
FastAPI APIRouter for Audit Logging System.
Defines secured compliance endpoints with dependency injection, strict authorization,
and limit parameter validation (1 <= limit <= 1000).
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.app.schemas.audit import AuditLog
from backend.app.services.audit import AuditService
from backend.app.core.dependencies import get_current_user, UserAuthContext

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get(
    "/entity/{entity_type}/{entity_id}",
    response_model=List[AuditLog],
    summary="Get entity audit logs",
    description="Retrieves audit logs for a specific entity. Restricted to Super Admins and Org Admins.",
)
async def get_entity_audit_logs(
    entity_type: str,
    entity_id: str,
    limit: int = Query(default=100, ge=1, le=1000, description="Maximum number of logs to return (1-1000)"),
    current_user: UserAuthContext = Depends(get_current_user),
) -> List[AuditLog]:
    """Retrieves audit logs for a specific entity, restricted to Super Admins and Org Admins."""
    if current_user.role not in ("super_admin", "org_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Super Admin or Org Admin role required to view entity logs.",
        )

    logs = await AuditService.get_entity_logs(
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit,
    )
    return logs


@router.get(
    "/user/{user_id}",
    response_model=List[AuditLog],
    summary="Get user audit logs",
    description="Retrieves logs for a specific user. Users can view their own logs; Admins can view any user logs.",
)
async def get_user_audit_logs(
    user_id: str,
    limit: int = Query(default=100, ge=1, le=1000, description="Maximum number of logs to return (1-1000)"),
    current_user: UserAuthContext = Depends(get_current_user),
) -> List[AuditLog]:
    """Retrieves logs for a specific user with role-based access validation."""
    is_self = current_user.id == user_id
    is_admin = current_user.role in ("super_admin", "org_admin")

    if not (is_self or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You are only authorized to view your own audit logs.",
        )

    logs = await AuditService.get_user_logs(
        user_id=user_id,
        limit=limit,
    )
    return logs


@router.get(
    "/organization/{org_id}",
    response_model=List[AuditLog],
    summary="Get organization audit logs",
    description="Retrieves organization-wide logs. Org Admins can only view logs for their own organization.",
)
async def get_organization_audit_logs(
    org_id: str,
    limit: int = Query(default=100, ge=1, le=1000, description="Maximum number of logs to return (1-1000)"),
    current_user: UserAuthContext = Depends(get_current_user),
) -> List[AuditLog]:
    """Retrieves organization-wide logs with tenant boundaries validation."""
    if current_user.role not in ("super_admin", "org_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Super Admin or Org Admin role required.",
        )

    # Validate that Org Admins cannot inspect other organizations
    if current_user.role == "org_admin" and current_user.organization_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot access audit trail for a different organization.",
        )

    logs = await AuditService.get_organization_logs(
        org_id=org_id,
        limit=limit,
    )
    return logs


@router.get(
    "/security",
    response_model=List[AuditLog],
    summary="Get security audit logs",
    description="Retrieves security-related audit logs. Strictly restricted to Super Admins only.",
)
async def get_security_audit_logs(
    limit: int = Query(default=100, ge=1, le=1000, description="Maximum number of logs to return (1-1000)"),
    current_user: UserAuthContext = Depends(get_current_user),
) -> List[AuditLog]:
    """Retrieves security-related audit logs strictly restricted to Super Admins."""
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Security audit logs are strictly restricted to Super Admins.",
        )

    logs = await AuditService.get_security_logs(limit=limit)
    return logs
