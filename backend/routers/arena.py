"""
Challenge Arena router for LearnLoop Infinity 2.0.
Quizzes, assessments, real-time leaderboard, and attempt scoring.
"""
import uuid
import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..database import get_db

router = APIRouter(prefix="/api/arena", tags=["arena"])

class SubmitQuizRequest(BaseModel):
    user_id: str = "usr_student_1"
    answers: Dict[str, int] # question_id -> chosen_index
    time_spent_seconds: int = 120

@router.get("/quizzes")
def list_quizzes(category: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT id, course_id, title, description, category, difficulty, time_limit_minutes, passing_score, xp_reward FROM quizzes"
    params = []
    if category and category != "All":
        query += " WHERE category = ?"
        params.append(category)
    cursor.execute(query, params)
    quizzes = [dict(q) for q in cursor.fetchall()]
    conn.close()
    return quizzes

@router.get("/quizzes/{quiz_id}")
def get_quiz(quiz_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM quizzes WHERE id = ?", (quiz_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Quiz not found")
    quiz = dict(row)
    try:
        quiz["questions"] = json.loads(quiz["questions_json"])
    except:
        quiz["questions"] = []
    return quiz

@router.post("/quizzes/{quiz_id}/submit")
def submit_quiz(quiz_id: str, payload: SubmitQuizRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM quizzes WHERE id = ?", (quiz_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz = dict(row)
    questions = json.loads(quiz["questions_json"])
    total_q = len(questions)
    correct_count = 0

    results = []
    for idx, q in enumerate(questions):
        qid = q.get("id", f"q{idx+1}")
        user_choice = payload.answers.get(qid)
        is_correct = (user_choice == q.get("correct_index"))
        if is_correct:
            correct_count += 1
        results.append({
            "question_id": qid,
            "question": q["question"],
            "options": q["options"],
            "user_choice": user_choice,
            "correct_choice": q.get("correct_index"),
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    score_pct = int((correct_count / total_q) * 100) if total_q > 0 else 0
    passed = 1 if score_pct >= quiz["passing_score"] else 0
    xp_earned = quiz["xp_reward"] if passed else 25

    # Record attempt
    attempt_id = f"att_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO quiz_attempts (id, quiz_id, user_id, score, total_questions, percentage, passed, xp_earned, answers_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (attempt_id, quiz_id, payload.user_id, correct_count, total_q, score_pct, passed, xp_earned, json.dumps(payload.answers)))

    # Award XP
    cursor.execute("""
    INSERT INTO xp_transactions (id, user_id, amount, reason)
    VALUES (?, ?, ?, ?)
    """, (f"xp_{uuid.uuid4().hex[:8]}", payload.user_id, xp_earned, f"Completed Arena Quiz '{quiz['title']}': +{xp_earned} XP"))

    cursor.execute("UPDATE profiles SET total_xp = total_xp + ? WHERE id = ?", (xp_earned, payload.user_id))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "attempt_id": attempt_id,
        "score": correct_count,
        "total_questions": total_q,
        "percentage": score_pct,
        "passed": bool(passed),
        "xp_earned": xp_earned,
        "breakdown": results
    }

@router.get("/leaderboard")
def get_leaderboard(timeframe: str = "weekly"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, name, role, avatar, title, total_xp, level, current_streak
    FROM profiles
    ORDER BY total_xp DESC
    LIMIT 10
    """)
    rows = cursor.fetchall()
    leaders = []
    for rank, r in enumerate(rows, start=1):
        d = dict(r)
        d["rank"] = rank
        leaders.append(d)
    conn.close()
    return leaders
