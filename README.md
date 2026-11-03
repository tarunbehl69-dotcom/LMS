# 🌐 LearnLoop Infinity 2.0 — Futuristic 3D Virtual University LMS
> **Your Learning Journey. A Whole New Universe.**

LearnLoop Infinity 2.0 is a complete, production-oriented, next-generation Learning Management System (LMS) combining an explorable 3D cyberpunk campus, a distraction-free academic engine, personal Google Gemini AI mentorship, collaborative research syndicates, and audited educational gamification.

---

## 🏛️ The 7 University Campus Sectors

| Sector | Architectural Identity | Core Academic Capability |
| :--- | :--- | :--- |
| **1. Knowledge Tower** | Concentric cyber skyscraper with helical beacon | Enrolled courses, video modules, lecture notes, resource downloads, and verifiable completion certificates. |
| **2. AI Innovation Hub** | Geodesic dome with pulsing violet plasma core | Powered by Google Gemini 1.5. Conceptual doubt solver, document summarizer, quiz generator & flashcards. |
| **3. Challenge Arena** | Neon octagonal colosseum with energy pylons | Timed assessments, instant error feedback, answer explanations, and campus-wide leaderboards. |
| **4. Digital Library** | Hypercube matrix archive with glowing data streams | Searchable technical papers, slide decks, and e-books with an in-app interactive document reader. |
| **5. Experiment Lab** | High-tech science module with cryogenic reactors | Hands-on simulations: Quantum Infrastructure Scaler, Tech Venture Strategy, Cybersecurity Incident Defense. |
| **6. Collaboration Centre** | Twin cyber towers with glowing glass skybridge | Channel-based research forums, study syndicates, peer reviews, announcements, and Kanban sprint boards. |
| **7. Progress Centre** | Quantum crystalline obelisk with tiered energy rings | Real verified statistics, weekly study time charts (Recharts), skills proficiencies, and audited XP transaction ledger. |

---

## 🎭 Three Role-Based Portals (RBAC)

1. **Student Portal**:
   - 3D Virtual City Exploration with third-person cyber scholar avatar.
   - Enrolled courses catalogue with real-time lesson progress tracking.
   - Interactive timed quizzes, homework submissions, and AI mentorship.
   - Digital library previews, study squad memberships, and gamified XP progression.

2. **Instructor Studio**:
   - Course Studio: Author and publish new courses with modules and lessons.
   - Assessment Studio: Create custom challenge quizzes with passing marks and explanations.
   - Homework Grading Hub: Review student submissions, assign numerical grades, and provide qualitative feedback.

3. **Admin Console**:
   - Institutional oversight: Total registered scholars, active tracks, and platform metrics.
   - User Governance: Real-time role promotion/demotion between Student, Instructor, and Admin.
   - System Settings: Configure Google Gemini API keys, select LLM models, and set XP multipliers.
   - Security Audit Log: Cryptographically sequenced event records.

---

## 🚀 Quick Start Guide

### 1. Launch with One-Click Batch Script (Windows)
Double-click `start.bat` in the root folder. It starts the server and opens your browser at:
```
http://127.0.0.1:8000
```

### 2. Launch with Python
```powershell
backend\venv\Scripts\python.exe run.py
```

### 3. Frontend Development Server (Optional)
```powershell
cd frontend
npm run dev
```

---

## ⚙️ Google Gemini AI Integration

1. In the application, open the **Admin Console** or click the **AI Mentor** tab.
2. Enter your `GEMINI_API_KEY`.
3. Alternatively, create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. If no API key is provided, the platform automatically operates in **Grounded Pedagogical Fallback Mode**, providing pre-computed academic derivations for all core university topics.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti.
- **3D City Environment**: Three.js (WebGL, custom procedural architecture, third-person camera, collision detection, radar minimap).
- **Backend**: FastAPI (Python 3.12), SQLite with thread-safe pooling, REST API endpoints.
- **Resilience**: Dual-mode storage architecture (FastAPI REST backend with instant local-first persistence fallback).

---

## 📜 Verifiable Credentials

Upon reaching 100% completion in any enrolled course track, LearnLoop Infinity 2.0 generates a verifiable **Certificate of Mastery** complete with:
- Student Name
- Course Title & Category
- Cryptographic Verification Hash (`CERT-LL2-XXXX`)
- Formal Faculty Accreditation
- One-Click Print / PDF Export
