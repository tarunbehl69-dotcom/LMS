import React, { useState } from 'react';
import { Course, UserProfile } from '../types';
import { 
  Briefcase, 
  Plus, 
  BookOpen, 
  FileCheck2, 
  Users, 
  Award, 
  Check, 
  X, 
  Send, 
  MessageSquare,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

interface InstructorPortalProps {
  currentUser: UserProfile;
  courses: Course[];
  onCourseCreated: () => void;
}

interface StudentSubmission {
  id: string;
  studentName: string;
  courseTitle: string;
  assignmentTitle: string;
  submittedAt: string;
  submissionText: string;
  status: 'pending' | 'graded';
  score?: number;
  feedback?: string;
}

export const InstructorPortalView: React.FC<InstructorPortalProps> = ({
  currentUser,
  courses,
  onCourseCreated
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'submissions' | 'announcements'>('courses');
  const [showCreateCourseModal, setShowCreateCourseModal] = useState<boolean>(false);
  const [gradingSubmission, setGradingSubmission] = useState<StudentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('Comprehensive derivation and solid experimental validation.');

  // Submissions State
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([
    {
      id: 'sub_1',
      studentName: 'Alex Vance',
      courseTitle: 'Neuromorphic AI & Deep Reinforcement Learning',
      assignmentTitle: 'Project 1: Continuous PPO Inverted Pendulum Implementation',
      submittedAt: 'Today, 08:30 AM',
      submissionText: 'Implemented clipped surrogate loss function with generalized advantage estimation (GAE-lambda=0.95). Actor-critic networks trained for 500 episodes.',
      status: 'pending'
    },
    {
      id: 'sub_2',
      studentName: 'Sophia Wu',
      courseTitle: 'Quantum Computing Algorithms & Circuit Design',
      assignmentTitle: 'Problem Set 2: Multi-Qubit Grover Oracle Construction',
      submittedAt: 'Yesterday, 16:45 PM',
      submissionText: 'Constructed 4-qubit Grover oracle using phase kickback. Circuit depth evaluated on IBM Qiskit simulator with state tomography.',
      status: 'graded',
      score: 95,
      feedback: 'Flawless phase estimation and minimal gate overhead.'
    }
  ]);

  // Create Course Form State
  const [newCode, setNewCode] = useState('AI-502');
  const [newTitle, setNewTitle] = useState('Autonomous Agent Swarms & Game Theory');
  const [newCategory, setNewCategory] = useState('Artificial Intelligence');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Advanced');
  const [newDesc, setNewDesc] = useState('Study decentralized multi-agent coordination, Nash equilibria, and emergent communication protocols.');

  const handleCreateCourse = async () => {
    if (!newTitle.trim() || !newCode.trim()) return;
    sounds.playSuccess();
    await api.createCourse({
      code: newCode,
      title: newTitle,
      category: newCategory,
      difficulty: newDifficulty,
      description: newDesc,
      instructor_name: currentUser.name
    });
    setShowCreateCourseModal(false);
    onCourseCreated();
  };

  const handleSaveGrade = () => {
    if (!gradingSubmission) return;
    sounds.playSuccess();
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === gradingSubmission.id
          ? { ...sub, status: 'graded', score: gradeScore, feedback: gradeFeedback }
          : sub
      )
    );
    setGradingSubmission(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Instructor Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-mono font-semibold">
                Faculty Workspace
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Welcome, {currentUser.name} • Curriculum authoring, grading & academic oversight
            </p>
          </div>
        </div>

        <button
          onClick={() => { sounds.playClick(); setShowCreateCourseModal(true); }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 relative z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Course</span>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Active Courses Authored</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{courses.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Available in university catalogue</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Enrolled Scholars</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">1,840</div>
          <div className="text-[11px] text-slate-500 mt-1">Active learners across tracks</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>Pending Submissions</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {submissions.filter(s => s.status === 'pending').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Assignments awaiting evaluation</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
        <button
          onClick={() => { sounds.playClick(); setActiveTab('courses'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'courses' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          My Courses ({courses.length})
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveTab('submissions'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'submissions' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Assignment Grading Hub ({submissions.length})
        </button>
      </div>

      {/* TAB 1: COURSES MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-400 font-bold">
                    {c.code}
                  </span>
                  <span className="text-xs text-slate-400">{c.category}</span>
                </div>
                <h3 className="text-base font-bold text-white line-clamp-1">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{c.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">{c.enrolled_count || 1} Enrolled</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px]">
                  Published Live
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ASSIGNMENT SUBMISSIONS & GRADING */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{sub.studentName}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400">{sub.courseTitle}</span>
                </div>
                <div className="text-xs font-semibold text-cyan-400">{sub.assignmentTitle}</div>
                <p className="text-xs text-slate-300 max-w-2xl bg-slate-900/60 p-3 rounded-xl border border-slate-800 font-mono">
                  "{sub.submissionText}"
                </p>
                <span className="text-[10px] text-slate-500 block">Submitted {sub.submittedAt}</span>
              </div>

              <div className="text-right shrink-0">
                {sub.status === 'graded' ? (
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
                      Graded: {sub.score}/100
                    </span>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">"{sub.feedback}"</p>
                  </div>
                ) : (
                  <button
                    onClick={() => { sounds.playClick(); setGradingSubmission(sub); }}
                    className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md"
                  >
                    Grade & Provide Feedback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GRADING MODAL */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-blue-500/40 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Evaluate Scholar Submission</h3>
            <div className="text-xs text-slate-400">
              Student: <span className="text-white font-semibold">{gradingSubmission.studentName}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Score (0 - 100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Qualitative Feedback</label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setGradingSubmission(null)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
              <button onClick={handleSaveGrade} className="px-5 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs">Save Grade</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-blue-500/40 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Author New University Course</h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Course Code</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Quantum Computing">Quantum Computing</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Cybernetics">Cybernetics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Course Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Syllabus Overview</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCreateCourseModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
              <button onClick={handleCreateCourse} className="px-5 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs">Publish to Catalogue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
