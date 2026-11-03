"""
Digital Library router for LearnLoop Infinity 2.0.
Supports PPT and PDF uploads for ANY subject, text extraction, previews, downloads, and deletion.
"""
import uuid
import json
import os
import shutil
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ..database import get_db

router = APIRouter(prefix="/api/library", tags=["library"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class CreateResourceRequest(BaseModel):
    title: str
    author: str
    category: str
    file_type: str = "pdf"
    description: str
    content_preview: Optional[str] = None
    tags: List[str] = []

def extract_content_preview(file_path: str, ext: str) -> tuple[str, int]:
    """
    Extracts text preview and slide/page count from PDF or PPTX.
    Returns (preview_text, unit_count).
    """
    ext = ext.lower()
    text_preview = ""
    unit_count = 1

    try:
        if ext == "pdf":
            import pypdf
            reader = pypdf.PdfReader(file_path)
            unit_count = len(reader.pages)
            snippets = []
            for idx, p in enumerate(reader.pages[:6]):
                t = p.extract_text()
                if t:
                    snippets.append(f"--- Page {idx + 1} ---\n{t.strip()[:600]}")
            text_preview = "\n\n".join(snippets)

        elif ext in ["pptx", "ppt"]:
            import pptx
            prs = pptx.Presentation(file_path)
            unit_count = len(prs.slides)
            snippets = []
            for idx, s in enumerate(prs.slides[:6]):
                slide_texts = []
                for shape in s.shapes:
                    if shape.has_text_frame:
                        slide_texts.append(shape.text_frame.text.strip())
                if slide_texts:
                    snippets.append(f"--- Slide {idx + 1} ---\n" + "\n".join(slide_texts)[:600])
            text_preview = "\n\n".join(snippets)
    except Exception as e:
        print(f"Warning: could not deeply parse {ext} preview: {e}")

    if not text_preview:
        text_preview = f"Academic study document ({ext.upper()}). Total units: {unit_count}."

    return text_preview, unit_count

@router.get("/resources")
def list_resources(
    category: Optional[str] = None, 
    search: Optional[str] = None, 
    user_id: str = "usr_student_1",
    user_only: Optional[bool] = False
):
    conn = get_db()
    cursor = conn.cursor()
    query = """
    SELECT r.*, 
           CASE WHEN b.resource_id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked
    FROM library_resources r
    LEFT JOIN user_bookmarks b ON r.id = b.resource_id AND b.user_id = ?
    WHERE 1=1
    """
    params = [user_id]
    if category and category != "All":
        query += " AND r.category = ?"
        params.append(category)
    if user_only:
        query += " AND r.is_user_uploaded = 1"
    if search:
        query += " AND (r.title LIKE ? OR r.description LIKE ? OR r.author LIKE ? OR r.category LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])
    query += " ORDER BY r.created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    items = []
    for r in rows:
        d = dict(r)
        try:
            d["tags"] = json.loads(d.get("tags_json") or "[]")
        except:
            d["tags"] = []
        d["is_user_uploaded"] = bool(d.get("is_user_uploaded", 0))
        items.append(d)
    conn.close()
    return items

@router.post("/upload")
async def upload_resource(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(...), # Can be ANY subject!
    author: str = Form("Alex Vance"),
    description: Optional[str] = Form(None)
):
    """
    Upload a PPT or PDF of ANY subject with automatic slide/page extraction.
    """
    filename = file.filename or "uploaded_study_material"
    ext = filename.split(".")[-1].lower() if "." in filename else "pdf"

    if ext not in ["pdf", "pptx", "ppt", "doc", "docx", "txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF or PPT/PPTX file.")

    res_id = f"lib_res_{uuid.uuid4().hex[:8]}"
    saved_filename = f"{res_id}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    # Save to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size_bytes = os.path.getsize(file_path)
    size_mb = round(file_size_bytes / (1024 * 1024), 2)
    if size_mb < 0.1:
        size_mb = 0.1

    # Extract preview & unit count
    content_preview, unit_count = extract_content_preview(file_path, ext)
    unit_label = "Slides" if ext in ["pptx", "ppt"] else "Pages"

    final_desc = description or f"Uploaded study material for {category}. Contains {unit_count} {unit_label}."
    tags = [category, ext.upper(), f"{unit_count} {unit_label}", "User Material"]

    # Choose futuristic thumbnail
    if ext in ["pptx", "ppt"]:
        cover = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400"
    else:
        cover = "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400"

    download_url = f"/api/library/download/{res_id}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO library_resources (
        id, title, author, category, file_type, size_mb, download_url, 
        cover_image, tags_json, views_count, downloads_count, description, 
        content_preview, file_path, is_user_uploaded
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?, 1)
    """, (
        res_id, title, author, category, "slides" if ext in ["pptx", "ppt"] else "pdf", 
        size_mb, download_url, cover, json.dumps(tags), final_desc, content_preview, file_path
    ))

    # Award XP for upload
    xp_id = f"xp_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO xp_transactions (id, user_id, amount, reason)
    VALUES (?, 'usr_student_1', 50, ?)
    """, (xp_id, f"Uploaded study material '{title}' ({category}): +50 XP"))
    cursor.execute("UPDATE profiles SET total_xp = total_xp + 50 WHERE id = 'usr_student_1'")

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "resource_id": res_id,
        "title": title,
        "category": category,
        "file_type": ext,
        "unit_count": unit_count,
        "unit_label": unit_label,
        "size_mb": size_mb,
        "message": f"Successfully uploaded and extracted {unit_count} {unit_label} of {category}!"
    }

@router.delete("/resources/{resource_id}")
def delete_resource(resource_id: str):
    """
    Deletes an uploaded PPT or PDF material from the database and disk.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, title, file_path FROM library_resources WHERE id = ?", (resource_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Resource not found")

    file_path = row["file_path"]

    # Delete bookmarks
    cursor.execute("DELETE FROM user_bookmarks WHERE resource_id = ?", (resource_id,))
    # Delete from library table
    cursor.execute("DELETE FROM library_resources WHERE id = ?", (resource_id,))
    conn.commit()
    conn.close()

    # Clean up physical file if on disk
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Warning: could not delete file {file_path}: {e}")

    return {
        "status": "success",
        "resource_id": resource_id,
        "message": f"Successfully removed '{row['title']}' from library."
    }

@router.get("/download/{resource_id}")
def download_resource(resource_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT title, file_path, file_type FROM library_resources WHERE id = ?", (resource_id,))
    row = cursor.fetchone()
    conn.close()

    if not row or not row["file_path"] or not os.path.exists(row["file_path"]):
        raise HTTPException(status_code=404, detail="File download unavailable on server.")

    # Increment download counter
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE library_resources SET downloads_count = downloads_count + 1 WHERE id = ?", (resource_id,))
    conn.commit()
    conn.close()

    return FileResponse(
        row["file_path"],
        filename=f"{row['title']}.{row['file_type']}",
        media_type="application/octet-stream"
    )

@router.post("/resources/{resource_id}/bookmark")
def toggle_bookmark(resource_id: str, user_id: str = "usr_student_1"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM user_bookmarks WHERE user_id = ? AND resource_id = ?", (user_id, resource_id))
    existing = cursor.fetchone()
    if existing:
        cursor.execute("DELETE FROM user_bookmarks WHERE id = ?", (existing["id"],))
        bookmarked = False
    else:
        cursor.execute("INSERT INTO user_bookmarks (id, user_id, resource_id) VALUES (?, ?, ?)", (f"bm_{uuid.uuid4().hex[:8]}", user_id, resource_id))
        bookmarked = True
    conn.commit()
    conn.close()
    return {"status": "success", "is_bookmarked": bookmarked}
