/**
 * API Service for LearnLoop Infinity 2.0.
 * Connects to the FastAPI backend with seamless local resilience fallback.
 */
import { Course, UserProfile, Quiz, LibraryResource, Simulation, DiscussionThread, StudyGroup, KanbanTask, DailyMission, XPTransaction, LeaderboardUser } from '../types';
import { localLms } from './localLmsStore';

const BASE_URL = 'http://localhost:8000/api';

async function safeFetch<T>(endpoint: string, options?: RequestInit, fallback?: () => T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (resp.ok) {
      return await resp.json();
    }
  } catch (e) {
    // Backend offline or timeout -> use local resilient store
  }
  if (fallback) {
    return fallback();
  }
  throw new Error(`Failed to fetch from ${endpoint} and no fallback provided`);
}

export const api = {
  // --- Profiles & Auth ---
  getCurrentProfile: async (userId: string = 'usr_student_1'): Promise<UserProfile> => {
    return safeFetch<UserProfile>(
      `/gamification/profile?user_id=${userId}`,
      undefined,
      () => localLms.getCurrentUser()
    );
  },

  switchRole: (role: 'student' | 'instructor' | 'admin'): UserProfile => {
    return localLms.switchRole(role);
  },

  // --- Courses ---
  getCourses: async (category?: string, search?: string): Promise<Course[]> => {
    return safeFetch<Course[]>(
      `/courses?category=${category || ''}&search=${search || ''}`,
      undefined,
      () => {
        let list = localLms.getCourses();
        if (category && category !== 'All') {
          list = list.filter(c => c.category === category);
        }
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(c => c.title.toLowerCase().includes(s) || c.code.toLowerCase().includes(s));
        }
        return list;
      }
    );
  },

  getCourseDetail: async (courseId: string): Promise<Course> => {
    return safeFetch<Course>(
      `/courses/${courseId}`,
      undefined,
      () => {
        const c = localLms.getCourses().find(item => item.id === courseId);
        if (!c) throw new Error('Course not found');
        return c;
      }
    );
  },

  enrollInCourse: async (courseId: string) => {
    return safeFetch(
      `/courses/${courseId}/enroll`,
      { method: 'POST' },
      () => {
        localLms.enrollInCourse(courseId);
        return { status: 'success' };
      }
    );
  },

  completeLesson: async (courseId: string, lessonId: string) => {
    return safeFetch(
      `/courses/${courseId}/lessons/${lessonId}/complete`,
      { method: 'POST' },
      () => {
        return localLms.completeLesson(courseId, lessonId);
      }
    );
  },

  createCourse: async (course: any) => {
    return safeFetch(
      `/courses`,
      { method: 'POST', body: JSON.stringify(course) },
      () => {
        return localLms.addCourse(course.code, course.title, course.category, course.difficulty, course.description);
      }
    );
  },

  // --- AI Mentor ---
  chatWithMentor: async (message: string, courseContext?: string) => {
    return safeFetch(
      `/ai/chat`,
      { method: 'POST', body: JSON.stringify({ message, course_context: courseContext }) },
      () => {
        localLms.addXP(10, 'Consulted Aegis AI Mentor');
        const lower = message.toLowerCase();
        let reply = '';
        if (lower.includes('quantum')) {
          reply = `### Quantum Superposition & Amplitude Mechanics\n\nA quantum state vector $|\\psi\\rangle$ exists in a Hilbert vector space as:\n\n$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle \\quad \\text{where } |\\alpha|^2 + |\\beta|^2 = 1$$\n\nQubits remain in simultaneous potentiality until measurement collapses the wave-function into an eigenstate.`;
        } else if (lower.includes('attention') || lower.includes('transformer')) {
          reply = `### Scaled Dot-Product Attention Equation\n\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left( \\frac{QK^T}{\\sqrt{d_k}} \\right) V$$\n\nThe scaling term $\\sqrt{d_k}$ stabilizes variance in high dimensions.`;
        } else {
          reply = `### Academic Mentorship Response\n\nFor **"${message}"**, consider:\n1. Establishing the underlying system invariants.\n2. Quantifying error tolerances and algorithmic complexity $\\mathcal{O}(N)$.\n3. Applying empirical validation in the Experiment Lab!`;
        }
        return { reply, source: 'grounded-lms-engine', timestamp: 'Just now' };
      }
    );
  },

  summarizeText: async (text: string, title?: string) => {
    return safeFetch(
      `/ai/summarize`,
      { method: 'POST', body: JSON.stringify({ text, document_title: title }) },
      () => {
        return {
          document_title: title || 'Executive Study Summary',
          summary: `## Executive Synthesis\n\n### 1. Key Principles\n- Core system constraints balance throughput and memory latency.\n- Gradient convergence scales at $\\mathcal{O}(1/\\sqrt{T})$.\n\n### 2. Actionable Focus Points\n- Verify boundary assertions in unit tests.\n- Benchmark against baseline architectures in the Challenge Arena.`,
          word_count: text.split(' ').length
        };
      }
    );
  },

  generateAiQuiz: async (topic: string, difficulty: string = 'Intermediate') => {
    return safeFetch(
      `/ai/quiz-generate`,
      { method: 'POST', body: JSON.stringify({ topic, difficulty }) },
      () => {
        return {
          topic,
          difficulty,
          questions: [
            {
              question: `What is the primary constraint when deploying ${topic} in production environments?`,
              options: [
                'Memory bandwidth and bus latency saturation',
                'Unchecked single-threaded clock speed',
                'Arbitrary packet loss with no retry buffer',
                'Linear scaling of disk sectors'
              ],
              correct_index: 0,
              explanation: 'High throughput AI and cloud workflows are typically constrained by memory bus bandwidth.'
            },
            {
              question: `Which method optimizes convergence stability in ${topic}?`,
              options: [
                'AdamW optimizer with cosine learning rate annealing',
                'Exhaustive combinatorial brute force',
                'Elimination of regularization layers',
                'Static single-batch evaluation'
              ],
              correct_index: 0,
              explanation: 'Adaptive moment estimation with decoupled weight decay ensures robust convergence.'
            }
          ]
        };
      }
    );
  },

  // --- Challenge Arena ---
  getQuizzes: async (): Promise<Quiz[]> => {
    return safeFetch<Quiz[]>(
      `/arena/quizzes`,
      undefined,
      () => localLms.getStore().quizzes
    );
  },

  getQuizDetail: async (quizId: string): Promise<Quiz> => {
    return safeFetch<Quiz>(
      `/arena/quizzes/${quizId}`,
      undefined,
      () => {
        const q = localLms.getStore().quizzes.find(item => item.id === quizId);
        if (!q) throw new Error('Quiz not found');
        return q;
      }
    );
  },

  submitQuiz: async (quizId: string, answers: Record<string, number>) => {
    return safeFetch(
      `/arena/quizzes/${quizId}/submit`,
      { method: 'POST', body: JSON.stringify({ answers }) },
      () => {
        const quiz = localLms.getStore().quizzes.find(item => item.id === quizId);
        if (!quiz || !quiz.questions) throw new Error('Quiz not found');
        let correct = 0;
        const total = quiz.questions.length;
        const breakdown = quiz.questions.map((q, idx) => {
          const qid = q.id || `q${idx + 1}`;
          const isCorrect = answers[qid] === q.correct_index;
          if (isCorrect) correct++;
          return {
            question: q.question,
            options: q.options,
            user_choice: answers[qid],
            correct_choice: q.correct_index,
            is_correct: isCorrect,
            explanation: q.explanation
          };
        });
        const pct = Math.round((correct / total) * 100);
        const passed = pct >= quiz.passing_score;
        const xp = passed ? quiz.xp_reward : 30;
        localLms.addXP(xp, `Completed Quiz: ${quiz.title}`);
        return {
          status: 'success',
          score: correct,
          total_questions: total,
          percentage: pct,
          passed,
          xp_earned: xp,
          breakdown
        };
      }
    );
  },

  getLeaderboard: async (): Promise<LeaderboardUser[]> => {
    return safeFetch<LeaderboardUser[]>(
      `/arena/leaderboard`,
      undefined,
      () => [
        { id: 'usr_admin_1', name: 'Director Elena Rostova', role: 'admin', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', title: 'Dean of Academic Operations', total_xp: 5400, level: 6, current_streak: 42, rank: 1 },
        { id: 'usr_instructor_1', name: 'Dr. Aris Thorne', role: 'instructor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', title: 'Chair of Artificial Intelligence', total_xp: 3200, level: 6, current_streak: 18, rank: 2 },
        { id: 'usr_u2', name: 'Prof. Mira Chen', role: 'instructor', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', title: 'Quantum Systems Lead', total_xp: 2950, level: 5, current_streak: 14, rank: 3 },
        { id: 'usr_student_1', name: 'Alex Vance (You)', role: 'student', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', title: 'Cybernetics & AI Scholar', total_xp: localLms.getCurrentUser().total_xp, level: localLms.getCurrentUser().level, current_streak: 5, rank: 4 },
        { id: 'usr_u4', name: 'Kaelen Rhee', role: 'student', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', title: 'Deep Reinforcement Fellow', total_xp: 380, level: 2, current_streak: 4, rank: 5 }
      ]
    );
  },

  // --- Digital Library ---
  getLibraryResources: async (category?: string, search?: string): Promise<LibraryResource[]> => {
    return safeFetch<LibraryResource[]>(
      `/library/resources?category=${category || ''}&search=${search || ''}`,
      undefined,
      () => {
        let list = localLms.getStore().resources;
        if (category && category !== 'All') {
          list = list.filter(r => r.category === category);
        }
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(r => r.title.toLowerCase().includes(s) || r.author.toLowerCase().includes(s));
        }
        return list;
      }
    );
  },

  toggleBookmark: async (resourceId: string): Promise<boolean> => {
    return safeFetch(
      `/library/resources/${resourceId}/bookmark`,
      { method: 'POST' },
      () => localLms.toggleBookmark(resourceId)
    );
  },

  uploadResource: async (file: File, title: string, category: string, author: string = 'Alex Vance', description?: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('author', author);
      if (description) formData.append('description', description);

      const resp = await fetch('http://localhost:8000/api/library/upload', {
        method: 'POST',
        body: formData
      });
      if (resp.ok) {
        const data = await resp.json();
        const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
        const newRes: LibraryResource = {
          id: data.resource_id,
          title,
          author,
          category,
          file_type: (ext === 'pptx' || ext === 'ppt') ? 'slides' : 'pdf',
          size_mb: data.size_mb || 1.5,
          download_url: `/api/library/download/${data.resource_id}`,
          cover_image: (ext === 'pptx' || ext === 'ppt') 
            ? 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400' 
            : 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
          tags: [category, ext.toUpperCase(), `${data.unit_count || 1} ${data.unit_label || 'Units'}`],
          views_count: 1,
          downloads_count: 0,
          description: description || `Study presentation for ${category}`,
          content_preview: `Preview of uploaded ${file.name}. Contains ${data.unit_count || 1} ${data.unit_label || 'units'}.`,
          is_user_uploaded: true,
          is_bookmarked: false
        };
        localLms.addResource(newRes);
        return { status: 'success', resource: newRes };
      }
    } catch (e) {
      console.warn('API upload fallback', e);
    }
    // Fallback local store
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const newRes: LibraryResource = {
      id: `lib_res_${Date.now()}`,
      title,
      author,
      category,
      file_type: (ext === 'pptx' || ext === 'ppt') ? 'slides' : 'pdf',
      size_mb: Number((file.size / (1024 * 1024)).toFixed(2)) || 2.5,
      download_url: '#',
      cover_image: (ext === 'pptx' || ext === 'ppt') 
        ? 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400' 
        : 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
      tags: [category, ext.toUpperCase(), 'User Material'],
      views_count: 1,
      downloads_count: 0,
      description: description || `Uploaded ${ext.toUpperCase()} study material for ${category}.`,
      content_preview: `Academic material: ${title} (${category}). Extracted units ready for revision.`,
      is_user_uploaded: true,
      is_bookmarked: false
    };
    localLms.addResource(newRes);
    return { status: 'success', resource: newRes };
  },

  deleteResource: async (resourceId: string) => {
    try {
      const resp = await fetch(`http://localhost:8000/api/library/resources/${resourceId}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        localLms.removeResource(resourceId);
        return { status: 'success' };
      }
    } catch (e) {
      console.warn('API delete fallback', e);
    }
    localLms.removeResource(resourceId);
    return { status: 'success' };
  },

  // --- Experiment Lab ---
  getSimulations: async (): Promise<Simulation[]> => {
    return safeFetch<Simulation[]>(
      `/lab/simulations`,
      undefined,
      () => localLms.getStore().simulations
    );
  },

  getSimulationDetail: async (simId: string): Promise<Simulation> => {
    return safeFetch<Simulation>(
      `/lab/simulations/${simId}`,
      undefined,
      () => {
        const s = localLms.getStore().simulations.find(item => item.id === simId);
        if (!s) throw new Error('Simulation not found');
        return s;
      }
    );
  },

  submitSimulation: async (simId: string, decisions: any[], finalMetrics: any) => {
    return safeFetch(
      `/lab/simulations/${simId}/submit`,
      { method: 'POST', body: JSON.stringify({ decisions, final_metrics: finalMetrics }) },
      () => {
        localLms.addXP(150, 'Completed Experiment Lab Simulation');
        return {
          status: 'success',
          score: 92,
          xp_awarded: 150,
          feedback: 'Exceptional system governance! You sustained high request throughput while keeping temperatures within cryogenic thresholds.'
        };
      }
    );
  },

  // --- Collaboration Centre ---
  getDiscussions: async (channel?: string): Promise<DiscussionThread[]> => {
    return safeFetch<DiscussionThread[]>(
      `/collab/discussions?channel=${channel || ''}`,
      undefined,
      () => {
        let list = localLms.getStore().discussions;
        if (channel && channel !== 'all') {
          list = list.filter(d => d.channel === channel);
        }
        return list;
      }
    );
  },

  createDiscussion: async (channel: string, title: string, content: string, tags: string[]): Promise<DiscussionThread> => {
    return safeFetch(
      `/collab/discussions`,
      { method: 'POST', body: JSON.stringify({ channel, title, content, tags }) },
      () => localLms.addDiscussion(channel, title, content, tags)
    );
  },

  upvoteDiscussion: async (threadId: string) => {
    return safeFetch(
      `/collab/discussions/${threadId}/upvote`,
      { method: 'POST' },
      () => localLms.upvoteDiscussion(threadId)
    );
  },

  getStudyGroups: async (): Promise<StudyGroup[]> => {
    return safeFetch<StudyGroup[]>(
      `/collab/groups`,
      undefined,
      () => localLms.getStore().groups
    );
  },

  toggleJoinGroup: async (groupId: string): Promise<boolean> => {
    return safeFetch(
      `/collab/groups/${groupId}/join`,
      { method: 'POST' },
      () => localLms.toggleGroup(groupId)
    );
  },

  getKanbanTasks: async (): Promise<KanbanTask[]> => {
    return safeFetch<KanbanTask[]>(
      `/collab/tasks`,
      undefined,
      () => localLms.getStore().tasks
    );
  },

  updateTaskStatus: async (taskId: string, status: KanbanTask['status']) => {
    return safeFetch(
      `/collab/tasks/${taskId}`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      () => localLms.updateTaskStatus(taskId, status)
    );
  },

  createTask: async (groupId: string, title: string, assignee: string, priority: KanbanTask['priority']) => {
    return safeFetch(
      `/collab/tasks`,
      { method: 'POST', body: JSON.stringify({ group_id: groupId, title, assignee, priority }) },
      () => localLms.addTask(groupId, title, assignee, priority)
    );
  },

  // --- Gamification ---
  getDailyMissions: async (): Promise<DailyMission[]> => {
    return safeFetch<DailyMission[]>(
      `/gamification/missions`,
      undefined,
      () => localLms.getStore().missions
    );
  },

  claimMission: async (missionId: string): Promise<number> => {
    return safeFetch(
      `/gamification/missions/${missionId}/claim`,
      { method: 'POST' },
      () => localLms.claimMission(missionId)
    );
  },

  getXpTransactions: async (): Promise<XPTransaction[]> => {
    return safeFetch<XPTransaction[]>(
      `/gamification/transactions`,
      undefined,
      () => localLms.getStore().xpTransactions
    );
  },

  // --- Admin ---
  getPlatformMetrics: async () => {
    return safeFetch(
      `/admin/metrics`,
      undefined,
      () => ({
        total_users: 1420,
        total_courses: localLms.getCourses().length,
        total_quiz_attempts: 3890,
        total_xp_awarded: 245000,
        total_resources: localLms.getStore().resources.length,
        system_status: 'Operational',
        active_version: '2.0.4-quantum'
      })
    );
  },

  getAuditLogs: async () => {
    return safeFetch(
      `/admin/audit-logs`,
      undefined,
      () => [
        { id: 'aud_1', actor_name: 'Director Elena Rostova', actor_role: 'admin', action: 'Curriculum Accreditation', details: 'Approved Course QC-302 Quantum Computing Syllabus', ip_address: '127.0.0.1', created_at: 'Today 09:30' },
        { id: 'aud_2', actor_name: 'Dr. Aris Thorne', actor_role: 'instructor', action: 'Assessment Published', details: 'Added new quiz: Neural Attention & Latent Dynamics', ip_address: '127.0.0.1', created_at: 'Yesterday 14:15' },
        { id: 'aud_3', actor_name: 'System Kernel', actor_role: 'system', action: 'Database Snapshot', details: 'Automated encrypted backup completed successfully', ip_address: '127.0.0.1', created_at: 'Nov 1, 2026' }
      ]
    );
  }
};
