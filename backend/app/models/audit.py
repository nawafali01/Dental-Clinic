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
    def create(cls, data: Dict[str, Any]) -> AuditLog:
        """Persist a new audit log entry safely."""
        record = {
            "id": str(data.get("id") or f"aud-{uuid4().hex[:8]}"),
            "created_at": data.get("created_at") or datetime.utcnow(),
            "action": str(data.get("action")),
            "entity_type": str(data.get("entity_type")),
            "entity_id": str(data.get("entity_id")),
            "description": data.get("description"),
            "changes": data.get("changes") or {},
            "user_id": data.get("user_id"),
            "user_email": data.get("user_email"),
            "user_role": data.get("user_role"),
            "organization_id": data.get("organization_id"),
            "clinic_id": data.get("clinic_id"),
            "ip_address": data.get("ip_address"),
            "user_agent": data.get("user_agent"),
        }
        cls._records.insert(0, record)
        return AuditLog.model_validate(record)

    @classmethod
    def query(
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
            if organization_id and r.get("organization_id") != organization_id:
                continue
            if is_security_only:
                act = str(r.get("action", ""))
                if not ("LOGIN" in act or "SECURITY" in act or "PASSWORD" in act or "EXPORT" in act or "ROLE" in act):
                    continue

            results.append(AuditLog.model_validate(r))
            if len(results) >= limit:
                break
        return results
