"""
Audit Logging Service Implementation.
Includes robust type sanitization for non-standard JSON types (UUIDs, Enums, Decimals, ISO datetimes)
and error-resilient action logging.
"""

import logging
from uuid import UUID
from enum import Enum
from decimal import Decimal
from datetime import datetime, date
from typing import Any, Dict, List, Optional, Union

from backend.app.schemas.audit import AuditAction, AuditLog
from backend.app.models.audit import AuditModel

logger = logging.getLogger("audit_service")


def sanitize_audit_value(v: Any) -> Any:
    """
    Recursively converts non-JSON-serializable types into primitive types.
    Handles UUIDs, Enums, Decimals, ISO-format datetimes, dates, nested dicts, and lists.
    """
    if v is None:
        return None

    if isinstance(v, (str, int, float, bool)):
        return v

    if isinstance(v, UUID):
        return str(v)

    if isinstance(v, Enum):
        return getattr(v, "value", str(v))

    if isinstance(v, Decimal):
        return float(v)

    if isinstance(v, (datetime, date)):
        return v.isoformat()

    if isinstance(v, dict):
        return {str(sanitize_audit_value(k)): sanitize_audit_value(val) for k, val in v.items()}

    if isinstance(v, (list, tuple, set)):
        return [sanitize_audit_value(item) for item in v]

    # Fallback for complex objects
    if hasattr(v, "model_dump"):
        return sanitize_audit_value(v.model_dump())
    if hasattr(v, "dict"):
        return sanitize_audit_value(v.dict())

    return str(v)


class AuditService:
    """
    Service responsible for creating, sanitizing, and querying audit log entries.
    Designed with fail-safe exception handling so audit failures never break main business operations.
    """

    @staticmethod
    def _map_to_audit_action(action: Union[str, AuditAction]) -> AuditAction:
        """Safely maps action string or Enum to AuditAction enum with fallback."""
        if isinstance(action, AuditAction):
            return action

        if isinstance(action, Enum):
            val = getattr(action, "value", str(action))
            try:
                return AuditAction(val)
            except ValueError:
                pass

        if isinstance(action, str):
            # Direct match attempt
            try:
                return AuditAction(action)
            except ValueError:
                pass

            # Uppercase lookup attempt
            upper_act = action.upper().replace(" ", "_")
            for member in AuditAction:
                if member.value == upper_act or member.name == upper_act:
                    return member

        # Fallback mechanism for non-standard action strings
        logger.warning(f"Unmapped audit action '{action}' falling back to AuditAction.SYSTEM_OTHER")
        return AuditAction.SYSTEM_OTHER

    @classmethod
    async def log_action(
        cls,
        action: Union[str, AuditAction],
        entity_type: str,
        entity_id: str,
        user_id: Optional[Union[str, UUID]] = None,
        user_email: Optional[str] = None,
        user_role: Optional[str] = None,
        organization_id: Optional[Union[str, UUID]] = None,
        clinic_id: Optional[Union[str, UUID]] = None,
        description: Optional[str] = None,
        changes: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        db: Optional[Any] = None,
    ) -> Optional[AuditLog]:
        """
        Safely logs an audit event.
        Guarantees exception resilience: any failure inside audit logging is caught and logged,
        ensuring primary business workflows continue uninterrupted.
        """
        try:
            # 1. Map action with fallback mechanism
            mapped_action = cls._map_to_audit_action(action)

            # 2. Stringify mandatory and optional identifiers
            str_entity_type = str(entity_type) if entity_type is not None else "Unknown"
            str_entity_id = str(entity_id) if entity_id is not None else "general"
            str_user_id = str(user_id) if user_id is not None else None
            str_org_id = str(organization_id) if organization_id is not None else None
            str_clinic_id = str(clinic_id) if clinic_id is not None else None

            # 3. Deep-clean changes dictionary
            cleaned_changes = sanitize_audit_value(changes) if changes else {}

            # 4. Prepare payload metadata
            payload = {
                "action": mapped_action.value,
                "entity_type": str_entity_type,
                "entity_id": str_entity_id,
                "user_id": str_user_id,
                "user_email": user_email,
                "user_role": user_role,
                "organization_id": str_org_id,
                "clinic_id": str_clinic_id,
                "description": description,
                "changes": cleaned_changes,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "created_at": datetime.utcnow(),
            }

            # 5. Persist via AuditModel database interface
            created_log = AuditModel.create(payload)
            logger.info(f"Audit log recorded successfully: {mapped_action.value} on {str_entity_type}:{str_entity_id}")
            return created_log

        except Exception as exc:
            # Catch-all exception handling to protect primary business operations
            logger.error(f"Audit logging failed silently for action '{action}': {exc}", exc_info=True)
            return None

    @classmethod
    async def get_entity_logs(cls, entity_type: str, entity_id: str, limit: int = 100) -> List[AuditLog]:
        """Retrieves audit logs for a specific entity."""
        return AuditModel.query(entity_type=entity_type, entity_id=entity_id, limit=limit)

    @classmethod
    async def get_user_logs(cls, user_id: str, limit: int = 100) -> List[AuditLog]:
        """Retrieves logs for a specific user."""
        return AuditModel.query(user_id=user_id, limit=limit)

    @classmethod
    async def get_organization_logs(cls, org_id: str, limit: int = 100) -> List[AuditLog]:
        """Retrieves organization-wide audit logs."""
        return AuditModel.query(organization_id=org_id, limit=limit)

    @classmethod
    async def get_security_logs(cls, limit: int = 100) -> List[AuditLog]:
        """Retrieves security-related audit logs."""
        return AuditModel.query(is_security_only=True, limit=limit)


# Export singleton instance
audit_service = AuditService()
