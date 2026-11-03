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

def validate_magic_bytes(file_content: bytes, filename: str) -> str:
    """
    Validates file signature (magic bytes) to prevent malicious or renamed files (Section 7.2).
    Returns verified extension.
    """
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    
    # Reject dangerous executable / macro formats
    if ext in ["exe", "bat", "cmd", "sh", "pptm", "vbs", "js"]:
        raise HTTPException(status_code=400, detail=f"File extension '.{ext}' is restricted for security reasons.")
    
    # PDF magic byte check: %PDF-
    if ext == "pdf":
        if not file_content.startswith(b"%PDF-"):
            raise HTTPException(status_code=400, detail="Invalid PDF file. Signature check failed (%PDF- missing).")
        return "pdf"
    
    # PPTX is a ZIP archive beginning with PK (\x50\x4B\x03\x04 or \x50\x4B)
    elif ext == "pptx":
        if not file_content.startswith(b"PK"):
            raise HTTPException(status_code=400, detail="Invalid PPTX file. Not a valid presentation package.")
        return "pptx"
    
    # PPT OLE compound file: \xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1
    elif ext == "ppt":
        if not file_content.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"):
            raise HTTPException(status_code=400, detail="Invalid legacy PPT file. Signature check failed.")
        return "ppt"
        
    return ext or "pdf"
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
    WHERE (r.is_trashed = 0 OR r.is_trashed IS NULL)
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
    description: Optional[str] = Form(None),
    user_id: str = Form("usr_student_1")
):
    """
    Upload a PPT or PDF of ANY subject with magic bytes validation,
    storage quota accounting, and automatic slide/page extraction.
    """
    filename = file.filename or "uploaded_study_material"
    
    # Read content to validate magic bytes (Section 7.2)
    file_bytes = await file.read()
    ext = validate_magic_bytes(file_bytes, filename)
    file_size_bytes = len(file_bytes)
    
    # Check Storage Quota (1 GB limit)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT bytes_used, bytes_limit FROM storage_quotas WHERE user_id = ?", (user_id,))
    quota_row = cursor.fetchone()
    if not quota_row:
        cursor.execute("INSERT INTO storage_quotas (user_id, bytes_used, bytes_limit) VALUES (?, 0, 1073741824)", (user_id,))
        bytes_used = 0
        bytes_limit = 1073741824
    else:
        bytes_used = quota_row["bytes_used"]
        bytes_limit = quota_row["bytes_limit"]

    if bytes_used + file_size_bytes > bytes_limit:
        conn.close()
        raise HTTPException(status_code=400, detail="Storage quota exceeded (1 GB limit). Move files to Trash or delete them to free space.")

    res_id = f"lib_res_{uuid.uuid4().hex[:8]}"
    saved_filename = f"{res_id}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    # Save to disk
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    size_mb = round(file_size_bytes / (1024 * 1024), 2)
    if size_mb < 0.1:
        size_mb = 0.1

    # Extract preview & unit count
    content_preview, unit_count = extract_content_preview(file_path, ext)
    unit_label = "Slides" if ext in ["pptx", "ppt"] else "Pages"

    final_desc = description or f"Uploaded study material for {category}. Contains {unit_count} {unit_label}."
    tags = [category, ext.upper(), f"{unit_count} {unit_label}", "Verified Material"]

    # Choose futuristic thumbnail
    if ext in ["pptx", "ppt"]:
        cover = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400"
    else:
        cover = "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400"

    download_url = f"/api/library/download/{res_id}"

    cursor.execute("""
    INSERT INTO library_resources (
        id, title, author, category, file_type, size_mb, download_url, 
        cover_image, tags_json, views_count, downloads_count, description, 
        content_preview, file_path, is_user_uploaded, is_trashed
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?, 1, 0)
    """, (
        res_id, title, author, category, "slides" if ext in ["pptx", "ppt"] else "pdf", 
        size_mb, download_url, cover, json.dumps(tags), final_desc, content_preview, file_path
    ))

    # Update Quota
    cursor.execute("UPDATE storage_quotas SET bytes_used = bytes_used + ? WHERE user_id = ?", (file_size_bytes, user_id))

    # Log Document Event (Audit log)
    cursor.execute("""
    INSERT INTO document_events (id, document_id, actor_name, action, target_name)
    VALUES (?, ?, ?, 'uploaded', ?)
    """, (f"evt_{uuid.uuid4().hex[:8]}", res_id, author, category))

    # Award XP for upload
    xp_id = f"xp_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO xp_transactions (id, user_id, amount, reason)
    VALUES (?, ?, 50, ?)
    """, (xp_id, user_id, f"Uploaded verified study material '{title}' ({category}): +50 XP"))
    cursor.execute("UPDATE profiles SET total_xp = total_xp + 50 WHERE id = ?", (user_id,))

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

@router.get("/quota")
def get_user_quota(user_id: str = "usr_student_1"):
    """
    Returns user storage quota details.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT bytes_used, bytes_limit FROM storage_quotas WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        bytes_used = 184500000 # default ~184 MB seed
        bytes_limit = 1073741824 # 1 GB
    else:
        bytes_used = row["bytes_used"]
        bytes_limit = row["bytes_limit"]

    return {
        "user_id": user_id,
        "bytes_used": bytes_used,
        "bytes_limit": bytes_limit,
        "mb_used": round(bytes_used / (1024 * 1024), 1),
        "mb_limit": round(bytes_limit / (1024 * 1024), 1),
        "percent_used": round((bytes_used / bytes_limit) * 100, 1)
    }

@router.get("/trash")
def list_trash_documents(user_id: str = "usr_student_1"):
    """
    Lists documents currently in Trash (Level 2 removal - 30 days retention).
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM library_resources 
    WHERE is_trashed = 1 
    ORDER BY trashed_at DESC
    """)
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

@router.post("/resources/{resource_id}/trash")
def move_to_trash(resource_id: str, actor_name: str = "Alex Vance"):
    """
    Level 2 Removal: Hides the document everywhere, retains in Trash for 30 days.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title FROM library_resources WHERE id = ?", (resource_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")

    cursor.execute("""
    UPDATE library_resources 
    SET is_trashed = 1, trashed_at = CURRENT_TIMESTAMP 
    WHERE id = ?
    """, (resource_id,))

    cursor.execute("""
    INSERT INTO document_events (id, document_id, actor_name, action, target_name)
    VALUES (?, ?, ?, 'trashed', ?)
    """, (f"evt_{uuid.uuid4().hex[:8]}", resource_id, actor_name, row["title"]))

    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Moved '{row['title']}' to Trash (30 days retention)."}

@router.post("/resources/{resource_id}/restore")
def restore_from_trash(resource_id: str, actor_name: str = "Alex Vance"):
    """
    Restores a document from Trash back to active library & course availability.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title FROM library_resources WHERE id = ?", (resource_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")

    cursor.execute("""
    UPDATE library_resources 
    SET is_trashed = 0, trashed_at = NULL 
    WHERE id = ?
    """, (resource_id,))

    cursor.execute("""
    INSERT INTO document_events (id, document_id, actor_name, action, target_name)
    VALUES (?, ?, ?, 'restored', ?)
    """, (f"evt_{uuid.uuid4().hex[:8]}", resource_id, actor_name, row["title"]))

    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Restored '{row['title']}' from Trash."}

@router.delete("/resources/{resource_id}")
def delete_resource_permanent(resource_id: str, actor_name: str = "Alex Vance", user_id: str = "usr_student_1"):
    """
    Level 3 Removal: Permanently deletes physical file, frees storage quota, logs audit event.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, title, file_path, size_mb FROM library_resources WHERE id = ?", (resource_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Resource not found")

    file_path = row["file_path"]
    size_bytes = int(row["size_mb"] * 1024 * 1024)

    # Delete bookmarks
    cursor.execute("DELETE FROM user_bookmarks WHERE resource_id = ?", (resource_id,))
    # Delete from library table
    cursor.execute("DELETE FROM library_resources WHERE id = ?", (resource_id,))

    # Update Quota (Free storage)
    cursor.execute("UPDATE storage_quotas SET bytes_used = MAX(0, bytes_used - ?) WHERE user_id = ?", (size_bytes, user_id))

    # Audit log
    cursor.execute("""
    INSERT INTO document_events (id, document_id, actor_name, action, target_name)
    VALUES (?, ?, ?, 'deleted_permanent', ?)
    """, (f"evt_{uuid.uuid4().hex[:8]}", resource_id, actor_name, row["title"]))

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
        "message": f"Permanently removed '{row['title']}' and freed storage quota."
    }

@router.get("/audit-log")
def get_document_audit_log(limit: int = 25):
    """
    Returns document lifecycle audit log entries.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM document_events ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

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
