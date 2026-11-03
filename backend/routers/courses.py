"""
Courses router for LearnLoop Infinity 2.0.
"""
import uuid
import json
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..database import get_db

router = APIRouter(prefix="/api/courses", tags=["courses"])

class CreateCourseRequest(BaseModel):
    code: str
    title: str
    category: str
    difficulty: str = "Intermediate"
    duration_hours: int = 10
    instructor_name: str
    description: str
    thumbnail: Optional[str] = None

class CreateLessonRequest(BaseModel):
    module_id: str
    title: str
    lesson_type: str = "video"
    duration_minutes: int = 20
    video_url: Optional[str] = None
    content_markdown: str

@router.get("")
def list_courses(category: Optional[str] = None, search: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM courses WHERE is_published = 1"
    params = []
    if category and category != "All":
        query += " AND category = ?"
        params.append(category)
    if search:
        query += " AND (title LIKE ? OR description LIKE ? OR code LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])
    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    courses = [dict(r) for r in rows]
    conn.close()
    return courses

@router.get("/{course_id}")
def get_course_detail(course_id: str, user_id: str = "usr_student_1"):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    course_row = cursor.fetchone()
    if not course_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found")
    
    course = dict(course_row)

    # Fetch modules
    cursor.execute("SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC", (course_id,))
    modules = [dict(m) for m in cursor.fetchall()]

    # Fetch lessons and map under modules
    cursor.execute("""
    SELECT l.*, 
           COALESCE(p.is_completed, 0) as is_completed
    FROM lessons l
    LEFT JOIN user_lesson_progress p ON l.id = p.lesson_id AND p.user_id = ?
    WHERE l.course_id = ?
    ORDER BY l.order_index ASC
    """, (user_id, course_id))
    all_lessons = [dict(l) for l in cursor.fetchall()]

    for l in all_lessons:
        try:
            l["resources"] = json.loads(l.get("resources_json") or "[]")
        except:
            l["resources"] = []

    for mod in modules:
        mod["lessons"] = [l for l in all_lessons if l["module_id"] == mod["id"]]

    course["modules"] = modules

    # Check user enrollment
    cursor.execute("SELECT * FROM course_enrollments WHERE user_id = ? AND course_id = ?", (user_id, course_id))
    enr_row = cursor.fetchone()
    course["is_enrolled"] = bool(enr_row)
    course["user_progress"] = enr_row["progress_percent"] if enr_row else 0
    course["certificate_id"] = enr_row["certificate_id"] if enr_row else None

    conn.close()
    return course

@router.post("")
def create_course(payload: CreateCourseRequest, user_id: str = "usr_instructor_1"):
    conn = get_db()
    cursor = conn.cursor()
    course_id = f"crs_{uuid.uuid4().hex[:8]}"
    thumb = payload.thumbnail or "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"

    cursor.execute("""
    INSERT INTO courses (id, code, title, category, difficulty, duration_hours, rating, enrolled_count, instructor_id, instructor_name, description, thumbnail)
    VALUES (?, ?, ?, ?, ?, ?, 5.0, 1, ?, ?, ?, ?)
    """, (course_id, payload.code, payload.title, payload.category, payload.difficulty, payload.duration_hours, user_id, payload.instructor_name, payload.description, thumb))

    # Create default Module 1
    mod_id = f"mod_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO modules (id, course_id, title, order_index, description)
    VALUES (?, ?, 'Module 1: Orientation & Foundations', 1, 'Introduction and theoretical fundamentals.')
    """, (mod_id, course_id))

    # Create default Lesson 1
    lsn_id = f"lsn_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO lessons (id, module_id, course_id, title, order_index, lesson_type, duration_minutes, video_url, content_markdown, resources_json)
    VALUES (?, ?, ?, '1.1 Core Syllabus & Architectural Overview', 1, 'video', 20, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '# Welcome to the Course\n\nReview this introductory lesson to begin your mastery journey.', '[]')
    """, (lsn_id, mod_id, course_id))

    conn.commit()
    conn.close()
    return {"status": "success", "course_id": course_id, "message": "Course created successfully"}

@router.post("/{course_id}/enroll")
def enroll_course(course_id: str, user_id: str = "usr_student_1"):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM course_enrollments WHERE user_id = ? AND course_id = ?", (user_id, course_id))
    if cursor.fetchone():
        conn.close()
        return {"status": "already_enrolled", "message": "User is already enrolled in this course"}

    enr_id = f"enr_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO course_enrollments (id, user_id, course_id, progress_percent)
    VALUES (?, ?, ?, 0)
    """, (enr_id, user_id, course_id))

    cursor.execute("UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?", (course_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Enrolled successfully in course", "enrollment_id": enr_id}

@router.post("/{course_id}/lessons/{lesson_id}/complete")
def complete_lesson(course_id: str, lesson_id: str, user_id: str = "usr_student_1"):
    conn = get_db()
    cursor = conn.cursor()

    # Record lesson completion
    prog_id = f"prog_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO user_lesson_progress (id, user_id, course_id, lesson_id, is_completed)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET is_completed = 1, completed_at = CURRENT_TIMESTAMP
    """, (prog_id, user_id, course_id, lesson_id))

    # Calculate overall progress
    cursor.execute("SELECT COUNT(*) as total FROM lessons WHERE course_id = ?", (course_id,))
    total_lessons = cursor.fetchone()["total"] or 1

    cursor.execute("SELECT COUNT(*) as completed FROM user_lesson_progress WHERE user_id = ? AND course_id = ? AND is_completed = 1", (user_id, course_id))
    completed_lessons = cursor.fetchone()["completed"] or 0

    new_percent = min(100, int((completed_lessons / total_lessons) * 100))

    cert_id = None
    if new_percent == 100:
        cert_id = f"CERT-LL2-{uuid.uuid4().hex[:6].upper()}"
        cursor.execute("""
        UPDATE course_enrollments 
        SET progress_percent = ?, completed_at = CURRENT_TIMESTAMP, certificate_id = ?
        WHERE user_id = ? AND course_id = ?
        """, (new_percent, cert_id, user_id, course_id))
    else:
        cursor.execute("""
        UPDATE course_enrollments 
        SET progress_percent = ?
        WHERE user_id = ? AND course_id = ?
        """, (new_percent, user_id, course_id))

    # Award XP
    xp_awarded = 25
    xp_id = f"xp_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO xp_transactions (id, user_id, amount, reason)
    VALUES (?, ?, ?, 'Completed Lesson: +25 XP')
    """, (xp_id, user_id, xp_awarded))

    cursor.execute("UPDATE profiles SET total_xp = total_xp + ? WHERE id = ?", (xp_awarded, user_id))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "progress_percent": new_percent,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "xp_awarded": xp_awarded,
        "certificate_id": cert_id
    }
