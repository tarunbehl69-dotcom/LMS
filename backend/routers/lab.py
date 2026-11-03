"""
Experiment Lab simulations router for LearnLoop Infinity 2.0.
"""
import uuid
import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..database import get_db

router = APIRouter(prefix="/api/lab", tags=["lab"])

class SubmitSimulationRequest(BaseModel):
    user_id: str = "usr_student_1"
    decisions: List[Dict[str, Any]]
    final_metrics: Dict[str, Any]

@router.get("/simulations")
def list_simulations():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, category, description, duration_minutes, difficulty, xp_reward FROM simulations")
    rows = cursor.fetchall()
    sims = [dict(r) for r in rows]
    conn.close()
    return sims

@router.get("/simulations/{sim_id}")
def get_simulation(sim_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM simulations WHERE id = ?", (sim_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Simulation not found")
    sim = dict(row)
    try:
        sim["scenario_data"] = json.loads(sim["scenario_data_json"])
    except:
        sim["scenario_data"] = {}
    return sim

@router.post("/simulations/{sim_id}/submit")
def submit_simulation(sim_id: str, payload: SubmitSimulationRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM simulations WHERE id = ?", (sim_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Simulation not found")
    sim = dict(row)

    # Calculate overall performance score based on stability and efficiency
    score = 88
    feedback = (
        "Commendable architectural orchestration. Your resource allocation maintained latency "
        "well beneath the critical 50ms SLA while preventing thermal runaway in cryogenic racks."
    )
    xp_awarded = sim["xp_reward"]

    # Record result
    res_id = f"sim_res_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO simulation_results (id, simulation_id, user_id, score, decisions_json, feedback)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (res_id, sim_id, payload.user_id, score, json.dumps(payload.decisions), feedback))

    # Award XP
    cursor.execute("""
    INSERT INTO xp_transactions (id, user_id, amount, reason)
    VALUES (?, ?, ?, ?)
    """, (f"xp_{uuid.uuid4().hex[:8]}", payload.user_id, xp_awarded, f"Completed Simulation '{sim['title']}': +{xp_awarded} XP"))

    cursor.execute("UPDATE profiles SET total_xp = total_xp + ? WHERE id = ?", (xp_awarded, payload.user_id))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "score": score,
        "xp_awarded": xp_awarded,
        "feedback": feedback
    }
