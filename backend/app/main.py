"""
FastAPI Application Entry Point.
Mounts audit logging router under /api/v1 prefix with CORS and documentation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.audit import router as audit_router

app = FastAPI(
    title="Dental AI Automation Audit Service API",
    description="Enterprise Audit Logging & Compliance API with Granular RBAC and Tenant Boundaries",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audit_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "service": "Audit Logging API", "version": "1.0.0"}
