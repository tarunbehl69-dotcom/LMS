"""
Admin & Instructor Operations router for LearnLoop Infinity 2.0.
RBAC validation, platform metrics, user directory, assignment grading, and audit logs.
"""
import uuid
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])

class UpdateUserRoleRequest(BaseModel):
    role: str # 'student', 'instructor', 'admin'

class GradeSubmissionRequest(BaseModel):
    score: int
    feedback: str
    graded_by: str = "Dr. Aris Thorne"

class UpdateSettingsRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    active_model: Optional[str] = None
    maintenance_mode: Optional[int] = None
    xp_multiplier: Optional[float] = None

@router.get("/metrics")
def get_platform_metrics():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM profiles")
    total_users = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM courses WHERE is_published = 1")
    total_courses = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM quiz_attempts")
    total_quiz_attempts = cursor.fetchone()["count"]

    cursor.execute("SELECT SUM(total_xp) as total FROM profiles")
    total_xp_awarded = cursor.fetchone()["total"] or 0

    cursor.execute("SELECT COUNT(*) as count FROM library_resources")
    total_resources = cursor.fetchone()["count"]

    conn.close()
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_quiz_attempts": total_quiz_attempts,
        "total_xp_awarded": total_xp_awarded,
        "total_resources": total_resources,
        "system_status": "Operational",
        "active_version": "2.0.4-quantum"
    }

@router.get("/users")
def list_users(role: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT id, name, email, role, avatar, title, total_xp, level, current_streak, created_at FROM profiles"
    params = []
    if role and role != "all":
        query += " WHERE role = ?"
        params.append(role)
    query += " ORDER BY total_xp DESC"
    cursor.execute(query, params)
    users = [dict(u) for u in cursor.fetchall()]
    conn.close()
    return users

@router.patch("/users/{user_id}/role")
def update_user_role(user_id: str, payload: UpdateUserRoleRequest):
    if payload.role not in ["student", "instructor", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE profiles SET role = ? WHERE id = ?", (payload.role, user_id))

    # Log audit entry
    cursor.execute("""
    INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, details)
    VALUES (?, 'usr_admin_1', 'Director Elena Rostova', 'admin', 'Update User Role', ?)
    """, (f"aud_{uuid.uuid4().hex[:8]}", f"Changed role of user {user_id} to {payload.role}"))

    conn.commit()
    conn.close()
    return {"status": "success", "new_role": payload.role}

@router.get("/audit-logs")
def get_audit_logs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 30")
    logs = [dict(l) for l in cursor.fetchall()]
    conn.close()
    return logs

@router.get("/settings")
def get_system_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM system_settings WHERE id = 'global_settings'")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"maintenance_mode": 0, "xp_multiplier": 1.0, "active_model": "gemini-1.5-flash", "gemini_configured": False}
    d = dict(row)
    d["gemini_configured"] = bool(d.get("gemini_api_key"))
    # Mask API key for security
    if d.get("gemini_api_key"):
        d["gemini_api_key"] = d["gemini_api_key"][:4] + "••••••••" + d["gemini_api_key"][-4:]
    return d

@router.post("/settings")
def update_system_settings(payload: UpdateSettingsRequest):
    conn = get_db()
    cursor = conn.cursor()
    if payload.gemini_api_key is not None:
        cursor.execute("UPDATE system_settings SET gemini_api_key = ? WHERE id = 'global_settings'", (payload.gemini_api_key,))
    if payload.active_model is not None:
        cursor.execute("UPDATE system_settings SET active_model = ? WHERE id = 'global_settings'", (payload.active_model,))
    if payload.maintenance_mode is not None:
        cursor.execute("UPDATE system_settings SET maintenance_mode = ? WHERE id = 'global_settings'", (payload.maintenance_mode,))
    if payload.xp_multiplier is not None:
        cursor.execute("UPDATE system_settings SET xp_multiplier = ? WHERE id = 'global_settings'", (payload.xp_multiplier,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Settings updated"}
