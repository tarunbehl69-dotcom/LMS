"""
Database connection, schema, and comprehensive seed data for LearnLoop Infinity 2.0.
Supports both SQLite local persistence and seamless multi-role LMS operations.
"""
import sqlite3
import json
import os
import uuid
from typing import Any, List, Dict, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "learnloop.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Profiles & Roles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'student', -- 'student', 'instructor', 'admin'
        avatar TEXT,
        title TEXT,
        bio TEXT,
        total_xp INTEGER DEFAULT 350,
        level INTEGER DEFAULT 2,
        current_streak INTEGER DEFAULT 4,
        last_active_date TEXT,
        interests_json TEXT DEFAULT '["Artificial Intelligence", "Quantum Computing", "System Architecture"]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Courses Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced'
        duration_hours INTEGER DEFAULT 12,
        rating REAL DEFAULT 4.9,
        enrolled_count INTEGER DEFAULT 1420,
        instructor_id TEXT,
        instructor_name TEXT NOT NULL,
        description TEXT,
        thumbnail TEXT,
        is_published INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Course Enrollments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS course_enrollments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        progress_percent INTEGER DEFAULT 0,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        certificate_id TEXT,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # 4. Modules Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        description TEXT,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # 5. Lessons Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        module_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        lesson_type TEXT NOT NULL DEFAULT 'video', -- 'video', 'reading', 'interactive'
        duration_minutes INTEGER DEFAULT 25,
        video_url TEXT,
        content_markdown TEXT,
        resources_json TEXT DEFAULT '[]',
        FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # 6. User Lesson Progress Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id)
    );
    """)

    # 7. Quizzes Table (Challenge Arena)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        course_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'Intermediate', -- 'Novice', 'Intermediate', 'Master'
        time_limit_minutes INTEGER DEFAULT 10,
        passing_score INTEGER DEFAULT 70,
        xp_reward INTEGER DEFAULT 100,
        questions_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 8. Quiz Attempts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        passed INTEGER NOT NULL,
        xp_earned INTEGER DEFAULT 0,
        answers_json TEXT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
    );
    """)

    # 9. Assignments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT NOT NULL,
        max_score INTEGER DEFAULT 100,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
    """)

    # 10. Assignment Submissions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assignment_submissions (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        submission_text TEXT,
        file_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'graded'
        score INTEGER,
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        graded_at TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE
    );
    """)

    # 11. Digital Library Resources Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS library_resources (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        category TEXT NOT NULL,
        file_type TEXT NOT NULL, -- 'pdf', 'slides', 'paper', 'code'
        size_mb REAL DEFAULT 4.2,
        download_url TEXT,
        cover_image TEXT,
        tags_json TEXT DEFAULT '[]',
        views_count INTEGER DEFAULT 320,
        downloads_count INTEGER DEFAULT 95,
        description TEXT,
        content_preview TEXT,
        file_path TEXT,
        is_user_uploaded INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Ensure columns exist if table was previously created
    for col, col_type in [("file_path", "TEXT"), ("is_user_uploaded", "INTEGER DEFAULT 0")]:
        try:
            cursor.execute(f"ALTER TABLE library_resources ADD COLUMN {col} {col_type}")
        except Exception:
            pass

    # 12. Bookmarks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, resource_id)
    );
    """)

    # 13. Experiment Lab Simulations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS simulations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 15,
        difficulty TEXT DEFAULT 'Intermediate',
        xp_reward INTEGER DEFAULT 150,
        scenario_data_json TEXT NOT NULL
    );
    """)

    # 14. User Simulation Results Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS simulation_results (
        id TEXT PRIMARY KEY,
        simulation_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        decisions_json TEXT,
        feedback TEXT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 15. Discussions Table (Collaboration Centre)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS discussions (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_role TEXT NOT NULL DEFAULT 'student',
        upvotes INTEGER DEFAULT 0,
        replies_count INTEGER DEFAULT 0,
        tags_json TEXT DEFAULT '[]',
        is_pinned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 16. Discussion Replies Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS discussion_replies (
        id TEXT PRIMARY KEY,
        discussion_id TEXT NOT NULL,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_role TEXT NOT NULL DEFAULT 'student',
        content TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (discussion_id) REFERENCES discussions (id) ON DELETE CASCADE
    );
    """)

    # 17. Study Groups Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS study_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        leader_id TEXT NOT NULL,
        leader_name TEXT NOT NULL,
        member_count INTEGER DEFAULT 1,
        max_members INTEGER DEFAULT 10,
        schedule TEXT NOT NULL,
        tags_json TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 18. Study Group Memberships Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS study_group_members (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, user_id)
    );
    """)

    # 19. Collaborative Kanban Tasks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kanban_tasks (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        assignee TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
        status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'inprogress', 'review', 'completed'
        due_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 20. XP Transactions & Gamification Ledger
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS xp_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 21. Daily Missions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS daily_missions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        xp_reward INTEGER DEFAULT 50,
        target_count INTEGER DEFAULT 1,
        current_count INTEGER DEFAULT 0,
        is_claimed INTEGER DEFAULT 0,
        mission_date TEXT NOT NULL
    );
    """)

    # 22. AI Mentor Conversations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL, -- 'user', 'assistant'
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 23. System Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        id TEXT PRIMARY KEY DEFAULT 'global_settings',
        gemini_api_key TEXT DEFAULT '',
        active_model TEXT DEFAULT 'gemini-1.5-flash',
        maintenance_mode INTEGER DEFAULT 0,
        xp_multiplier REAL DEFAULT 1.0,
        registration_open INTEGER DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 24. Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        actor_id TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT DEFAULT '127.0.0.1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    seed_initial_data(conn)
    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()

    # Seed Default Profiles if empty
    cursor.execute("SELECT COUNT(*) as count FROM profiles")
    if cursor.fetchone()["count"] == 0:
        # Default Student
        cursor.execute("""
        INSERT INTO profiles (id, name, email, role, avatar, title, bio, total_xp, level, current_streak, last_active_date)
        VALUES (
            'usr_student_1',
            'Alex Vance',
            'alex.vance@learnloop.edu',
            'student',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            'Cybernetics & AI Scholar',
            'Passionate about quantum neural networks and distributed autonomous systems.',
            420,
            2,
            5,
            date('now')
        )
        """)

        # Default Instructor
        cursor.execute("""
        INSERT INTO profiles (id, name, email, role, avatar, title, bio, total_xp, level, current_streak, last_active_date)
        VALUES (
            'usr_instructor_1',
            'Dr. Aris Thorne',
            'dr.thorne@learnloop.edu',
            'instructor',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            'Chair of Artificial Intelligence',
            'Leading researcher in neuromorphic computing and deep reinforcement architectures.',
            3200,
            6,
            18,
            date('now')
        )
        """)

        # Default Admin
        cursor.execute("""
        INSERT INTO profiles (id, name, email, role, avatar, title, bio, total_xp, level, current_streak, last_active_date)
        VALUES (
            'usr_admin_1',
            'Director Elena Rostova',
            'elena.rostova@learnloop.edu',
            'admin',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
            'Dean of Virtual Academic Operations',
            'Overseeing platform governance, syllabus accreditation, and virtual university infrastructure.',
            5400,
            6,
            42,
            date('now')
        )
        """)

    # Seed System Settings if not exists
    cursor.execute("SELECT id FROM system_settings WHERE id = 'global_settings'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO system_settings (id, gemini_api_key, active_model, maintenance_mode, xp_multiplier, registration_open)
        VALUES ('global_settings', '', 'gemini-1.5-flash', 0, 1.0, 1)
        """)

    # Seed Courses if empty
    cursor.execute("SELECT COUNT(*) as count FROM courses")
    if cursor.fetchone()["count"] == 0:
        courses = [
            (
                'crs_ai_core',
                'AI-401',
                'Neuromorphic AI & Deep Reinforcement Learning',
                'Artificial Intelligence',
                'Advanced',
                18,
                4.95,
                1840,
                'usr_instructor_1',
                'Dr. Aris Thorne',
                'Master next-generation neuromorphic architectures, self-supervised representation learning, and autonomous policy gradient systems in robotic environments.',
                'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800'
            ),
            (
                'crs_quantum_sys',
                'QC-302',
                'Quantum Computing Algorithms & Circuit Design',
                'Quantum Computing',
                'Intermediate',
                14,
                4.88,
                1290,
                'usr_instructor_1',
                'Prof. Mira Chen',
                'Explore quantum superposition, entanglement, Grover & Shor algorithms, and implement quantum circuits on Qiskit and IonQ backends.',
                'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800'
            ),
            (
                'crs_distributed_arch',
                'CS-505',
                'Distributed Hyper-Scale Systems Architecture',
                'Computer Science',
                'Advanced',
                22,
                4.92,
                2100,
                'usr_instructor_1',
                'Eng. Marcus Brody',
                'Design fault-tolerant event streams, Raft consensus protocols, multi-region database sharding, and ultra-low latency microservices.',
                'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'
            ),
            (
                'crs_cyber_defense',
                'SEC-204',
                'Zero-Trust Cryptography & Threat Mitigation',
                'Cybernetics',
                'Intermediate',
                10,
                4.86,
                980,
                'usr_instructor_1',
                'Dr. Sarah Lin',
                'Defend critical cyber infrastructure against zero-day exploit chains, quantum decryption threats, and automated botnet incursions.',
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800'
            ),
            (
                'crs_space_nav',
                'SP-101',
                'Orbital Mechanics & Autonomous Spacecraft Navigation',
                'Space Systems',
                'Beginner',
                8,
                4.91,
                1560,
                'usr_instructor_1',
                'Dr. Neil Armstrong Vance',
                'Learn Keplerian orbital mechanics, interplanetary Hohmann transfer trajectories, and sensor fusion for deep-space autonomous probes.',
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
            )
        ]
        cursor.executemany("""
        INSERT INTO courses (id, code, title, category, difficulty, duration_hours, rating, enrolled_count, instructor_id, instructor_name, description, thumbnail)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, courses)

        # Seed Modules & Lessons for AI-401
        modules = [
            ('mod_ai_1', 'crs_ai_core', 'Module 1: Foundations of Deep Representation Learning', 1, 'Core mathematical principles of high-dimensional latent manifolds.'),
            ('mod_ai_2', 'crs_ai_core', 'Module 2: Policy Gradients & Deep Q-Learning', 2, 'Action-value optimization and Bellman equation solvers.'),
            ('mod_ai_3', 'crs_ai_core', 'Module 3: Neuromorphic Spike-Timing Dynamics', 3, 'Bio-inspired spiking neural networks and synaptic plasticity.')
        ]
        cursor.executemany("""
        INSERT INTO modules (id, course_id, title, order_index, description)
        VALUES (?, ?, ?, ?, ?)
        """, modules)

        lessons = [
            (
                'lsn_ai_101',
                'mod_ai_1',
                'crs_ai_core',
                '1.1 Latent Space Geometry and Manifold Hypotheses',
                1,
                'video',
                24,
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                '## Mathematical Foundations of Latent Manifolds\n\nHigh-dimensional data points $x \\in \\mathbb{R}^D$ rarely occupy the ambient space uniformly. Instead, real-world data distributions concentrate near low-dimensional non-linear sub-manifolds $\\mathcal{M} \\subset \\mathbb{R}^D$.\n\n### Key Concepts\n- **Intrinsic Dimensionality**: How degrees of freedom contract under neural compression.\n- **Tangent Space Estimation**: Utilizing Jacobian matrices $\\mathbf{J} = \\frac{\\partial f(x)}{\\partial x}$ to model local geometric variations.\n- **Geodesic Distances**: Calculating minimum length curves over curved manifolds rather than Euclidean distances.',
                json.dumps([{"title": "Lecture Slides PDF", "url": "#"}, {"title": "Jupyter Notebook (PyTorch)", "url": "#"}])
            ),
            (
                'lsn_ai_102',
                'mod_ai_1',
                'crs_ai_core',
                '1.2 Attention Mechanisms & Transformer Scaling Laws',
                2,
                'video',
                32,
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                '## The Anatomy of Scaled Dot-Product Attention\n\nScaled dot-product attention computes interactions across input tokens through dynamic routing:\n\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$\n\n### Empirical Scaling Laws (Chinchilla & Kaplan)\nModern transformer architectures display power-law loss reduction as compute $C$, dataset size $D$, and parameter count $N$ scale in tandem.',
                json.dumps([{"title": "Attention Paper Annotated", "url": "#"}])
            ),
            (
                'lsn_ai_103',
                'mod_ai_2',
                'crs_ai_core',
                '2.1 Proximal Policy Optimization (PPO) in Continuous Control',
                1,
                'interactive',
                28,
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                '## Constrained Policy Iteration with PPO\n\nPPO prevents catastrophic policy collapse by clipping the probability ratio $r_t(\\theta)$:\n\n$$L^{CLIP}(\\theta) = \\hat{\\mathbb{E}}_t \\left[ \\min(r_t(\\theta)\\hat{A}_t, \\text{clip}(r_t(\\theta), 1-\\epsilon, 1+\\epsilon)\\hat{A}_t) \\right]$$\n\nThis formulation ensures monotonically improving policies in complex robotic simulations.',
                json.dumps([{"title": "OpenAI Gym Environment Guide", "url": "#"}])
            )
        ]
        cursor.executemany("""
        INSERT INTO lessons (id, module_id, course_id, title, order_index, lesson_type, duration_minutes, video_url, content_markdown, resources_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, lessons)

        # Seed Student Enrollment
        cursor.execute("""
        INSERT INTO course_enrollments (id, user_id, course_id, progress_percent, enrolled_at)
        VALUES ('enr_student_ai', 'usr_student_1', 'crs_ai_core', 33, datetime('now', '-3 days'))
        """)

        cursor.execute("""
        INSERT INTO user_lesson_progress (id, user_id, course_id, lesson_id, is_completed)
        VALUES ('prog_1', 'usr_student_1', 'crs_ai_core', 'lsn_ai_101', 1)
        """)

    # Seed Quizzes (Challenge Arena) if empty
    cursor.execute("SELECT COUNT(*) as count FROM quizzes")
    if cursor.fetchone()["count"] == 0:
        quizzes = [
            (
                'q_ai_neural',
                'crs_ai_core',
                'Neural Attention & Latent Dynamics Assessment',
                'Evaluate your mastery over Transformer attention math, manifold hypotheses, and loss gradients.',
                'Artificial Intelligence',
                'Intermediate',
                12,
                75,
                120,
                json.dumps([
                    {
                        "id": "q1",
                        "question": "Why is the dot-product in Scaled Dot-Product Attention divided by sqrt(d_k)?",
                        "options": [
                            "To reduce computational time complexity from quadratic to linear",
                            "To prevent the dot products from growing excessively large for large dimensions, which would push softmax into regions with vanishing gradients",
                            "To enforce orthogonal normalization across query and key eigenvectors",
                            "To satisfy the Lipschitz continuity condition of the feedforward layer"
                        ],
                        "correct_index": 1,
                        "explanation": "For large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients. Dividing by sqrt(d_k) counteracts this effect."
                    },
                    {
                        "id": "q2",
                        "question": "In the Manifold Hypothesis, how is high-dimensional real-world data structured?",
                        "options": [
                            "It uniformly fills the entire ambient dimensional volume",
                            "It forms discrete Gaussian clusters with zero topological variance",
                            "It concentrates near a low-dimensional non-linear sub-manifold embedded within the ambient space",
                            "It exclusively aligns along the first principal component axis"
                        ],
                        "correct_index": 2,
                        "explanation": "The manifold hypothesis states that natural high-dimensional data (images, speech, text) concentrates near low-dimensional sub-manifolds embedded within the high-dimensional ambient space."
                    },
                    {
                        "id": "q3",
                        "question": "What is the primary objective of clipping the probability ratio r_t(θ) in PPO?",
                        "options": [
                            "To enforce zero reward variance across randomized episodes",
                            "To penalize the agent for taking actions that deviate too drastically from the previous policy iteration, avoiding destructive updates",
                            "To eliminate the need for an Advantage function estimator",
                            "To convert a continuous action space into a discrete probability distribution"
                        ],
                        "correct_index": 1,
                        "explanation": "PPO uses clipped surrogate objectives to constrain policy changes, preventing overly large steps that could degrade performance destructively."
                    },
                    {
                        "id": "q4",
                        "question": "True or False: Spiking Neural Networks (SNNs) process information using continuous real-valued activation functions across every time step.",
                        "options": [
                            "True",
                            "False"
                        ],
                        "correct_index": 1,
                        "explanation": "False. Spiking Neural Networks transmit information via discrete temporal events called action potentials or spikes, mimicking biological synaptic mechanics."
                    }
                ])
            ),
            (
                'q_quantum_super',
                'crs_quantum_sys',
                'Quantum Superposition & Grover Search Arena',
                'Test your intuition on unitary state transitions, phase inversions, and quantum oracle gates.',
                'Quantum Computing',
                'Advanced',
                15,
                80,
                150,
                json.dumps([
                    {
                        "id": "qc1",
                        "question": "What is the operational effect of applying a Hadamard (H) gate to a pure |0⟩ qubit state?",
                        "options": [
                            "It flips the state deterministically to |1⟩",
                            "It creates the equal superposition state (|0⟩ + |1⟩) / sqrt(2)",
                            "It collapses the state onto the Bloch sphere equator at angle π/4",
                            "It performs a phase shift of e^(iπ/2)"
                        ],
                        "correct_index": 1,
                        "explanation": "The Hadamard gate maps |0⟩ to (|0⟩ + |1⟩)/sqrt(2) and |1⟩ to (|0⟩ - |1⟩)/sqrt(2), creating unbiased superposition."
                    },
                    {
                        "id": "qc2",
                        "question": "What is the quadratic speedup complexity achieved by Grover's Search Algorithm on an unsorted database of N elements?",
                        "options": [
                            "O(log N)",
                            "O(sqrt(N))",
                            "O(N / 2)",
                            "O(1)"
                        ],
                        "correct_index": 1,
                        "explanation": "Classical linear search requires O(N) operations; Grover's algorithm finds the target in O(sqrt(N)) oracle evaluations."
                    }
                ])
            )
        ]
        cursor.executemany("""
        INSERT INTO quizzes (id, course_id, title, description, category, difficulty, time_limit_minutes, passing_score, xp_reward, questions_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, quizzes)

    # Seed Digital Library Resources if empty
    cursor.execute("SELECT COUNT(*) as count FROM library_resources")
    if cursor.fetchone()["count"] == 0:
        resources = [
            (
                'lib_res_1',
                'Principia Neuromorphica: Foundations of Spiking Brain-Compute Interfaces',
                'Dr. Aris Thorne & Institute of Quantum Cognition',
                'Artificial Intelligence',
                'pdf',
                14.2,
                '#',
                'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400',
                json.dumps(['Neuromorphic', 'SNN', 'Spike Plasticity', 'Deep Learning']),
                1420,
                480,
                'Comprehensive treatise exploring biological synapse simulation, memristive hardware dynamics, and continuous spike-timing dependent plasticity (STDP).',
                'CHAPTER 1: SYNAPTIC TRANSMISSION OVER RESISTIVE SUBSTRATES\n\nBiological computation operates at energy efficiencies orders of magnitude beyond modern von Neumann silicon architectures. In this volume, we formalize the mathematics of event-driven temporal computing.'
            ),
            (
                'lib_res_2',
                'Quantum State Tomography & Error Mitigation Handbook',
                'Prof. Mira Chen, MIT Q-Labs',
                'Quantum Computing',
                'paper',
                8.7,
                '#',
                'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
                json.dumps(['Quantum', 'Qubits', 'Error Mitigation', 'Hamiltonian']),
                980,
                310,
                'Standard protocols for reconstructing multi-qubit density matrices and suppressing dephasing noise in Noisy Intermediate-Scale Quantum (NISQ) processors.',
                'ABSTRACT: High-fidelity quantum computing requires rigorous characterization of density matrices ρ. We demonstrate randomized benchmarking and zero-noise extrapolation across 127-qubit superconducting lattices.'
            ),
            (
                'lib_res_3',
                'Autonomous Distributed Systems at Petabyte Scale',
                'Marcus Brody, Infrastructure Architect',
                'Computer Science',
                'slides',
                22.1,
                '#',
                'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
                json.dumps(['Distributed Systems', 'Raft', 'Consensus', 'Zero-Latency']),
                2450,
                890,
                'Deep architectural blueprint of global multi-cloud consensus algorithms, zero-copy socket buffers, and decentralized failure detection pipelines.',
                'SLIDE DECK: 45 Architecture diagrams covering Raft leader election, gossip membership protocols, write-ahead log replication, and edge cache invalidation.'
            ),
            (
                'lib_res_4',
                'Cryptographic Primitives for Quantum-Resistant Networks',
                'Dr. Sarah Lin, Cyber Defense Bureau',
                'Cybernetics',
                'pdf',
                11.4,
                '#',
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
                json.dumps(['Cryptography', 'Lattice-Based', 'Zero-Trust', 'Post-Quantum']),
                1120,
                385,
                'Implementation guide for CRYSTALS-Kyber key encapsulation and Dilithium digital signatures against Shor algorithm attacks.',
                'SECTION 1: THE COLLAPSE OF RSA UNDER FAULT-TOLERANT QUANTUM COMPUTING\nShor algorithm reduces prime factorization to polynomial time O((log N)^3). Transitioning to Learning With Errors (LWE) over module lattices is now mandatory.'
            )
        ]
        cursor.executemany("""
        INSERT INTO library_resources (id, title, author, category, file_type, size_mb, download_url, cover_image, tags_json, views_count, downloads_count, description, content_preview)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, resources)

    # Seed Simulations (Experiment Lab) if empty
    cursor.execute("SELECT COUNT(*) as count FROM simulations")
    if cursor.fetchone()["count"] == 0:
        simulations = [
            (
                'sim_quantum_infra',
                'Quantum AI Infrastructure Cluster Scaler',
                'Infrastructure & Systems',
                'Operate a mission-critical hybrid AI supercluster. Balance GPU compute clusters, liquid cryogenic cooling, and optical network bandwidth to sustain 250,000 requests/sec under strict power and thermal constraints.',
                15,
                'Intermediate',
                150,
                json.dumps({
                    "initial_metrics": {"latency_ms": 42, "cost_per_hr": 350, "thermal_celsius": 68, "stability_percent": 99.2},
                    "phases": [
                        {
                            "name": "Phase 1: Traffic Spike Influx",
                            "scenario": "A flash flood of global inference queries arrives. Compute load jumps by 300%.",
                            "choices": [
                                {"text": "Spin up 64 High-Throughput H100 Tensor Nodes (+Latency down, +Cost high)", "delta": {"latency_ms": -18, "cost_per_hr": 220, "thermal_celsius": 12, "stability_percent": 0.5}},
                                {"text": "Deploy Quantized 4-bit Speculative Decoding at Edge (+Moderate cost, Slight precision dip)", "delta": {"latency_ms": -12, "cost_per_hr": 60, "thermal_celsius": 4, "stability_percent": -0.2}},
                                {"text": "Throttle non-priority batch jobs and shed background queue traffic", "delta": {"latency_ms": -5, "cost_per_hr": -20, "thermal_celsius": -2, "stability_percent": -1.5}}
                            ]
                        },
                        {
                            "name": "Phase 2: Thermal Throttling Incident",
                            "scenario": "Cooling rack zone B experiences liquid pump pressure drop. Server temps climb to 84°C.",
                            "choices": [
                                {"text": "Activate Secondary Cryogenic Immersion Subsystem", "delta": {"latency_ms": 0, "cost_per_hr": 110, "thermal_celsius": -22, "stability_percent": 0.8}},
                                {"text": "Dynamically re-route active inference jobs to Zurich & Tokyo satellite nodes", "delta": {"latency_ms": 14, "cost_per_hr": 40, "thermal_celsius": -15, "stability_percent": 0.2}},
                                {"text": "Underclock GPU core clocks by 25%", "delta": {"latency_ms": 28, "cost_per_hr": -40, "thermal_celsius": -18, "stability_percent": -2.0}}
                            ]
                        }
                    ]
                })
            ),
            (
                'sim_venture_strategy',
                'Autonomous Tech Venture Strategy & Scale',
                'Business & Tech Innovation',
                'Direct a high-growth deep tech university spinout across 4 fiscal quarters. Balance engineering R&D, market positioning, and capital runway to achieve unicorn velocity.',
                20,
                'Master',
                200,
                json.dumps({
                    "initial_metrics": {"cash_runway_months": 18, "mrr_usd": 45000, "market_share_percent": 3.8, "tech_moat_score": 74},
                    "phases": [
                        {
                            "name": "Quarter 1: Enterprise Market Entry",
                            "scenario": "Two Fortune 500 enterprises propose multi-year contracts but demand custom on-premise air-gapped deployments.",
                            "choices": [
                                {"text": "Accept contracts and fork core codebase into custom enterprise builds", "delta": {"cash_runway_months": 12, "mrr_usd": 65000, "market_share_percent": 2.2, "tech_moat_score": -8}},
                                {"text": "Decline custom forks; offer standardized sovereign containerized deployments with SLA guarantees", "delta": {"cash_runway_months": 4, "mrr_usd": 38000, "market_share_percent": 1.4, "tech_moat_score": 12}},
                                {"text": "Raise a Series A bridge round ($10M) to fund a specialized enterprise deployment engineering squadron", "delta": {"cash_runway_months": 24, "mrr_usd": 25000, "market_share_percent": 3.0, "tech_moat_score": 6}}
                            ]
                        }
                    ]
                })
            )
        ]
        cursor.executemany("""
        INSERT INTO simulations (id, title, category, description, duration_minutes, difficulty, xp_reward, scenario_data_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, simulations)

    # Seed Discussions (Collaboration Centre) if empty
    cursor.execute("SELECT COUNT(*) as count FROM discussions")
    if cursor.fetchone()["count"] == 0:
        discussions = [
            (
                'disc_1',
                'ai-research',
                'Emergent Behavior in 500B+ Dense vs Sparse Mixture-of-Experts Models',
                'Has anyone benchmarked routing collapse in MoE routers when scaling top-k expert selections past k=4? In our lab runs, expert load balancing auxiliary losses introduce gradient interference with the main causal language modeling objective.',
                'usr_student_1',
                'Alex Vance',
                'student',
                19,
                4,
                json.dumps(['MoE', 'Transformers', 'Sparsity', 'Deep Learning']),
                1
            ),
            (
                'disc_2',
                'quantum-cloud',
                'Implementing Grover Oracles for Graph 3-Coloring on Noisy Hardware',
                'We built an automated circuit synthesizer for quadratic boolean satisfiability. However, two-qubit CNOT depth exceeds coherence time T2 on current quantum processors. Suggestions for uncomputation optimization?',
                'usr_instructor_1',
                'Prof. Mira Chen',
                'instructor',
                34,
                7,
                json.dumps(['Quantum', 'Grover', 'Algorithms', 'Qiskit']),
                0
            ),
            (
                'disc_3',
                'general-plaza',
                'Welcome to LearnLoop Infinity 2.0: University Virtual Plaza Orientation',
                'Greetings Scholars and Researchers! Explore the seven learning sectors across our virtual campus. Check out the Challenge Arena for the weekly leaderboard showdown!',
                'usr_admin_1',
                'Director Elena Rostova',
                'admin',
                58,
                12,
                json.dumps(['Campus', 'Announcements', 'Welcome']),
                1
            )
        ]
        cursor.executemany("""
        INSERT INTO discussions (id, channel, title, content, author_id, author_name, author_role, upvotes, replies_count, tags_json, is_pinned)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, discussions)

    # Seed Study Groups if empty
    cursor.execute("SELECT COUNT(*) as count FROM study_groups")
    if cursor.fetchone()["count"] == 0:
        groups = [
            ('grp_1', 'Neural Networks Syndicate', 'Deep dive research into multi-modal vision-language transformers and embodied AI agents.', 'Artificial Intelligence', 'usr_student_1', 'Alex Vance', 8, 12, 'Tuesdays & Thursdays 18:00 UTC', json.dumps(['AI', 'PyTorch', 'Research'])),
            ('grp_2', 'Quantum Algorithms Guild', 'Collaborative programming and algorithmic design for NISQ and fault-tolerant quantum processors.', 'Quantum Computing', 'usr_instructor_1', 'Prof. Mira Chen', 11, 15, 'Wednesdays 17:00 UTC', json.dumps(['Quantum', 'Algorithms', 'Simulations'])),
            ('grp_3', 'Cloud Systems & Micro-Kernel Guild', 'Building ultra-low-latency distributed consensus engines in Rust and C++.', 'Computer Science', 'usr_instructor_1', 'Eng. Marcus Brody', 6, 10, 'Fridays 19:00 UTC', json.dumps(['Distributed Systems', 'Rust', 'Networking']))
        ]
        cursor.executemany("""
        INSERT INTO study_groups (id, name, description, category, leader_id, leader_name, member_count, max_members, schedule, tags_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, groups)

    # Seed Daily Missions if empty
    today_str = "2026-11-03"
    cursor.execute("SELECT COUNT(*) as count FROM daily_missions WHERE user_id = 'usr_student_1'")
    if cursor.fetchone()["count"] == 0:
        missions = [
            ('mis_1', 'usr_student_1', 'Academic Frontier: Complete 1 Lesson', 'Finish any pending video or interactive reading module in your enrolled courses.', 50, 1, 1, 0, today_str),
            ('mis_2', 'usr_student_1', 'Arena Challenge: Score 80%+ on a Quiz', 'Demonstrate conceptual mastery in the Challenge Arena assessments.', 75, 1, 0, 0, today_str),
            ('mis_3', 'usr_student_1', 'AI Mentor Consultation', 'Ask Aegis AI a complex academic question or summarize a research document.', 40, 1, 1, 1, today_str),
            ('mis_4', 'usr_student_1', 'Library Scholarship: Inspect a Resource', 'Open and review an e-book or research paper in the Digital Library.', 35, 1, 1, 0, today_str),
            ('mis_5', 'usr_student_1', 'Collaborative Voice: Upvote a Discussion', 'Participate in peer research forums in the Collaboration Centre.', 30, 1, 0, 0, today_str)
        ]
        cursor.executemany("""
        INSERT INTO daily_missions (id, user_id, title, description, xp_reward, target_count, current_count, is_claimed, mission_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, missions)

    # Seed XP Transactions for student
    cursor.execute("SELECT COUNT(*) as count FROM xp_transactions WHERE user_id = 'usr_student_1'")
    if cursor.fetchone()["count"] == 0:
        transactions = [
            ('xp_1', 'usr_student_1', 100, 'Welcome to LearnLoop Infinity: Profile Activation', '2026-11-01 10:00:00'),
            ('xp_2', 'usr_student_1', 150, 'Completed Lesson 1.1 in Neuromorphic AI & Deep Reinforcement Learning', '2026-11-02 14:30:00'),
            ('xp_3', 'usr_student_1', 130, 'Achieved 100% on Neural Attention & Latent Dynamics Quiz', '2026-11-02 16:15:00'),
            ('xp_4', 'usr_student_1', 40, 'Claimed Daily Mission: AI Mentor Consultation', '2026-11-03 01:20:00')
        ]
        cursor.executemany("""
        INSERT INTO xp_transactions (id, user_id, amount, reason, created_at)
        VALUES (?, ?, ?, ?, ?)
        """, transactions)

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("LearnLoop Infinity 2.0 database initialized and seeded successfully.")
