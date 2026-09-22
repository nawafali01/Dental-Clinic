"""
Audit Logging System Pydantic Schemas and Enums.
Provides strict type-hints, domain-categorized action enums, and ORM-compatible Pydantic models.
"""

from enum import Enum
from typing import Any, Dict, Optional, Union
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AuditAction(str, Enum):
    """Enumeration of system actions categorized by domain."""

    # User domain
    USER_CREATED = "USER_CREATED"
    USER_UPDATED = "USER_UPDATED"
    USER_DELETED = "USER_DELETED"
    USER_ROLE_UPDATED = "USER_ROLE_UPDATED"

    # Organization domain
    ORGANIZATION_CREATED = "ORGANIZATION_CREATED"
    ORGANIZATION_UPDATED = "ORGANIZATION_UPDATED"

    # Clinic domain
    CLINIC_CREATED = "CLINIC_CREATED"
    CLINIC_UPDATED = "CLINIC_UPDATED"
    CLINIC_BRANCH_UPDATED = "CLINIC_BRANCH_UPDATED"

    # Lead domain
    LEAD_CREATED = "LEAD_CREATED"
    LEAD_UPDATED = "LEAD_UPDATED"
    LEAD_STATUS_CHANGED = "LEAD_STATUS_CHANGED"

    # Appointment domain
    APPOINTMENT_CREATED = "APPOINTMENT_CREATED"
    APPOINTMENT_UPDATED = "APPOINTMENT_UPDATED"
    APPOINTMENT_RESCHEDULED = "APPOINTMENT_RESCHEDULED"
    PATIENT_CHECKED_IN = "PATIENT_CHECKED_IN"

    # Revenue domain
    PAYMENT_RECORDED = "PAYMENT_RECORDED"
    REFUND_PROCESSED = "REFUND_PROCESSED"

    # Call domain
    CALL_LOGGED = "CALL_LOGGED"
    CALL_RECORDING_ACCESSED = "CALL_RECORDING_ACCESSED"

    # Note domain
    NOTE_CREATED = "NOTE_CREATED"
    NOTE_DELETED = "NOTE_DELETED"

    # Task domain
    TASK_CREATED = "TASK_CREATED"
    TASK_COMPLETED = "TASK_COMPLETED"

    # Security domain
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    FAILED_LOGIN_ATTEMPT = "FAILED_LOGIN_ATTEMPT"
    PASSWORD_RESET = "PASSWORD_RESET"
    AUDIT_EXPORT_GENERATED = "AUDIT_EXPORT_GENERATED"

    # System domain
    SYSTEM_CONFIG_CHANGED = "SYSTEM_CONFIG_CHANGED"
    SYSTEM_OTHER = "SYSTEM_OTHER"


class AuditLogBase(BaseModel):
    """Base Pydantic schema for audit log entries."""

    action: Union[AuditAction, str] = Field(..., description="Action performed")
    entity_type: str = Field(..., description="Target entity type (e.g., User, Appointment, Lead)")
    entity_id: str = Field(..., description="Unique identifier of the entity")
    description: Optional[str] = Field(None, description="Human-readable summary of action")
    changes: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Before/after state changes")
    ip_address: Optional[str] = Field(None, description="Client IP address")
    user_agent: Optional[str] = Field(None, description="HTTP User Agent header")


class AuditLogCreate(AuditLogBase):
    """Payload for creating a new audit log record."""

    user_id: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    organization_id: Optional[str] = None
    clinic_id: Optional[str] = None


class AuditLog(AuditLogBase):
    """Full Audit Log response model compatible with ORM and Supabase records."""

    id: str = Field(..., description="Unique audit record identifier")
    user_id: Optional[str] = Field(None, description="ID of user performing action")
    user_email: Optional[str] = Field(None, description="Email of user performing action")
    user_role: Optional[str] = Field(None, description="Role of user performing action")
    organization_id: Optional[str] = Field(None, description="Scope Organization ID")
    clinic_id: Optional[str] = Field(None, description="Scope Clinic ID")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of event execution")

    model_config = ConfigDict(from_attributes=True)
