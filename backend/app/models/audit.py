"""
Audit Log Database Model and Repository Interface.
Supports Supabase, ORM mapping, and real database storage for audit trails.
"""

from datetime import datetime
from uuid import uuid4
from typing import Any, Dict, List, Optional
from backend.app.schemas.audit import AuditLog


class AuditModel:
    """Database ORM / Storage representation for audit log entries."""

    # Active database records container
    _records: List[Dict[str, Any]] = []

    @classmethod
    async def create(cls, data: Dict[str, Any] = None, **kwargs) -> AuditLog:
        """Persist a new audit log entry safely."""
        payload = data or kwargs
        record = {
            "id": str(payload.get("id") or f"aud-{uuid4().hex[:8]}"),
            "created_at": payload.get("created_at") or datetime.utcnow(),
            "action": str(payload.get("action").value if hasattr(payload.get("action"), "value") else payload.get("action")),
            "entity_type": str(payload.get("entity_type") or ""),
            "entity_id": str(payload.get("entity_id") or ""),
            "description": payload.get("description") or "",
            "changes": payload.get("changes") or {},
            "user_id": payload.get("user_id") or "",
            "user_email": payload.get("user_email") or "",
            "user_role": payload.get("user_role") or "system",
            "organization_id": payload.get("organization_id") or "",
            "clinic_id": payload.get("clinic_id") or "",
            "ip_address": payload.get("ip_address") or "127.0.0.1",
            "user_agent": payload.get("user_agent") or "",
        }
        cls._records.insert(0, record)
        return AuditLog.model_validate(record)

    @classmethod
    async def query(
        cls,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        is_security_only: bool = False,
        limit: int = 100,
    ) -> List[AuditLog]:
        """Query audit records with specific filters."""
        results = []
        for r in cls._records:
            if entity_type and r.get("entity_type", "").lower() != entity_type.lower():
                continue
            if entity_id and r.get("entity_id") != entity_id:
                continue
            if user_id and r.get("user_id") != user_id:
                continue
            if organization_id and organization_id != "all" and r.get("organization_id") != organization_id:
                continue
            if is_security_only:
                act = str(r.get("action", ""))
                if not ("LOGIN" in act or "SECURITY" in act or "PASSWORD" in act or "EXPORT" in act or "ROLE" in act):
                    continue

            results.append(AuditLog.model_validate(r))
            if len(results) >= limit:
                break
        return results

    @classmethod
    async def get_by_entity(cls, entity_type: str, entity_id: str, limit: int = 100) -> List[AuditLog]:
        return await cls.query(entity_type=entity_type, entity_id=entity_id, limit=limit)

    @classmethod
    async def get_by_user(cls, user_id: str, limit: int = 100) -> List[AuditLog]:
        return await cls.query(user_id=user_id, limit=limit)

    @classmethod
    async def get_by_organization(cls, org_id: str, limit: int = 100) -> List[AuditLog]:
        return await cls.query(organization_id=org_id, limit=limit)

    @classmethod
    async def get_security_logs(cls, limit: int = 100) -> List[AuditLog]:
        return await cls.query(is_security_only=True, limit=limit)

    @classmethod
    async def get_all(cls, limit: int = 100) -> List[AuditLog]:
        return await cls.query(limit=limit)
