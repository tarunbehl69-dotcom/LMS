"""
Collaboration Centre router for LearnLoop Infinity 2.0.
Discussion forums, study groups, member management, and collaborative tasks.
"""
import uuid
import json
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..database import get_db

router = APIRouter(prefix="/api/collab", tags=["collab"])

class CreateDiscussionRequest(BaseModel):
    channel: str
    title: str
    content: str
    author_id: str = "usr_student_1"
    author_name: str = "Alex Vance"
    author_role: str = "student"
    tags: List[str] = []

class ReplyDiscussionRequest(BaseModel):
    content: str
    author_id: str = "usr_student_1"
    author_name: str = "Alex Vance"
    author_role: str = "student"

class CreateStudyGroupRequest(BaseModel):
    name: str
    description: str
    category: str
    leader_id: str = "usr_student_1"
    leader_name: str = "Alex Vance"
    schedule: str
    tags: List[str] = []

class CreateKanbanTaskRequest(BaseModel):
    group_id: str
    title: str
    description: Optional[str] = None
    assignee: str
    priority: str = "medium"
    due_date: Optional[str] = None

class UpdateKanbanStatusRequest(BaseModel):
    status: str # 'todo', 'inprogress', 'review', 'completed'

@router.get("/discussions")
def list_discussions(channel: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM discussions"
    params = []
    if channel and channel != "all":
        query += " WHERE channel = ?"
        params.append(channel)
    query += " ORDER BY is_pinned DESC, created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    discussions = []
    for r in rows:
        d = dict(r)
        try:
            d["tags"] = json.loads(d.get("tags_json") or "[]")
        except:
            d["tags"] = []
        discussions.append(d)
    conn.close()
    return discussions

@router.post("/discussions")
def create_discussion(payload: CreateDiscussionRequest):
    conn = get_db()
    cursor = conn.cursor()
    disc_id = f"disc_{uuid.uuid4().hex[:8]}"
    tags_json = json.dumps(payload.tags)
    cursor.execute("""
    INSERT INTO discussions (id, channel, title, content, author_id, author_name, author_role, upvotes, replies_count, tags_json, is_pinned)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 0)
    """, (disc_id, payload.channel, payload.title, payload.content, payload.author_id, payload.author_name, payload.author_role, tags_json))
    conn.commit()
    conn.close()
    return {"status": "success", "discussion_id": disc_id}

@router.post("/discussions/{discussion_id}/upvote")
def upvote_discussion(discussion_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE discussions SET upvotes = upvotes + 1 WHERE id = ?", (discussion_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.get("/groups")
def list_study_groups(user_id: str = "usr_student_1"):
    conn = get_db()
    cursor = conn.cursor()
    query = """
    SELECT g.*, 
           CASE WHEN m.user_id IS NOT NULL THEN 1 ELSE 0 END as is_joined
    FROM study_groups g
    LEFT JOIN study_group_members m ON g.id = m.group_id AND m.user_id = ?
    ORDER BY g.created_at DESC
    """
    cursor.execute(query, (user_id,))
    rows = cursor.fetchall()
    groups = []
    for r in rows:
        d = dict(r)
        try:
            d["tags"] = json.loads(d.get("tags_json") or "[]")
        except:
            d["tags"] = []
        groups.append(d)
    conn.close()
    return groups

@router.post("/groups/{group_id}/join")
def toggle_join_group(group_id: str, user_id: str = "usr_student_1"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM study_group_members WHERE group_id = ? AND user_id = ?", (group_id, user_id))
    existing = cursor.fetchone()
    if existing:
        cursor.execute("DELETE FROM study_group_members WHERE id = ?", (existing["id"],))
        cursor.execute("UPDATE study_groups SET member_count = MAX(1, member_count - 1) WHERE id = ?", (group_id,))
        is_joined = False
    else:
        cursor.execute("INSERT INTO study_group_members (id, group_id, user_id) VALUES (?, ?, ?)", (f"gm_{uuid.uuid4().hex[:8]}", group_id, user_id))
        cursor.execute("UPDATE study_groups SET member_count = member_count + 1 WHERE id = ?", (group_id,))
        is_joined = True
    conn.commit()
    conn.close()
    return {"status": "success", "is_joined": is_joined}

@router.get("/tasks")
def list_tasks(group_id: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM kanban_tasks"
    params = []
    if group_id:
        query += " WHERE group_id = ?"
        params.append(group_id)
    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    tasks = [dict(t) for t in cursor.fetchall()]
    conn.close()
    return tasks

@router.post("/tasks")
def create_task(payload: CreateKanbanTaskRequest):
    conn = get_db()
    cursor = conn.cursor()
    task_id = f"tsk_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO kanban_tasks (id, group_id, title, description, assignee, priority, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, 'todo', ?)
    """, (task_id, payload.group_id, payload.title, payload.description, payload.assignee, payload.priority, payload.due_date))
    conn.commit()
    conn.close()
    return {"status": "success", "task_id": task_id}

@router.patch("/tasks/{task_id}")
def update_task_status(task_id: str, payload: UpdateKanbanStatusRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE kanban_tasks SET status = ? WHERE id = ?", (payload.status, task_id))
    conn.commit()
    conn.close()
    return {"status": "success"}
