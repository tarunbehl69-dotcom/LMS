import React, { useState } from 'react';
import { Course, CourseModule, Lesson } from '../types';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Play, 
  CheckCircle2, 
  Clock, 
  Star, 
  Award, 
  Download, 
  ChevronRight, 
  ArrowLeft,
  FileText,
  Volume2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface KnowledgeTowerProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  onCompleteLesson: (courseId: string, lessonId: string) => void;
  onViewCertificate: (courseTitle: string, certId: string) => void;
}

export const KnowledgeTowerView: React.FC<KnowledgeTowerProps> = ({
  courses,
  onEnroll,
  onCompleteLesson,
  onViewCertificate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('all');

  const categories = ['All', 'Artificial Intelligence', 'Quantum Computing', 'Computer Science', 'Cybernetics', 'Space Systems'];

  // Filter Courses
  const filteredCourses = courses.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'enrolled' && c.is_enrolled);
    return matchesCat && matchesSearch && matchesTab;
  });

  // Handler: Open Course Curriculum View
  const handleOpenCourse = (c: Course) => {
    sounds.playClick();
    setActiveCourse(c);
    // Find first lesson if available
    if (c.modules && c.modules.length > 0 && c.modules[0].lessons.length > 0) {
      setActiveLesson(c.modules[0].lessons[0]);
    } else {
      setActiveLesson(null);
    }
  };

  // Handler: Complete current lesson
  const handleCompleteCurrentLesson = () => {
    if (!activeCourse || !activeLesson) return;
    sounds.playSuccess();
    onCompleteLesson(activeCourse.id, activeLesson.id);
    activeLesson.is_completed = true;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* If inside an active lesson viewer (Distraction-Free Academic Mode) */}
      {activeCourse && activeLesson ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-cyan-500/20">
            <button
              onClick={() => setActiveCourse(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-semibold text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course Catalogue</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-cyan-400 font-bold">{activeCourse.code}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-200 font-medium hidden sm:inline">{activeCourse.title}</span>
            </div>

            {activeCourse.certificate_id && (
              <button
                onClick={() => onViewCertificate(activeCourse.title, activeCourse.certificate_id!)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all"
              >
                <Award className="w-4 h-4 text-cyan-400" />
                <span>View Certificate</span>
              </button>
            )}
          </div>

          {/* Lesson Main Grid: Video/Reader (Left 2 cols) & Module Curriculum Drawer (Right 1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Academic Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player or Interactive Simulation Frame */}
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-panel border border-cyan-500/30 bg-slate-950 flex flex-col justify-end shadow-2xl">
                {activeLesson.video_url ? (
                  <video
                    src={activeLesson.video_url}
                    controls
                    className="w-full h-full object-cover"
                    poster={activeCourse.thumbnail}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-900 to-slate-950">
                    <BookOpen className="w-16 h-16 text-cyan-400 mb-4 animate-pulse-subtle" />
                    <h3 className="text-xl font-bold text-white mb-2">{activeLesson.title}</h3>
                    <p className="text-xs text-slate-400 max-w-md">
                      Interactive deep reading and theoretical analysis module.
                    </p>
                  </div>
                )}
              </div>

              {/* Lesson Text, Formulas & Mathematical Notes */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                      {activeLesson.lesson_type} Lecture • {activeLesson.duration_minutes} min
                    </span>
                    <h1 className="text-2xl font-black text-white mt-1">{activeLesson.title}</h1>
                  </div>

                  <button
                    onClick={handleCompleteCurrentLesson}
                    disabled={activeLesson.is_completed}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      activeLesson.is_completed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{activeLesson.is_completed ? 'Completed (+25 XP Awarded)' : 'Mark Lesson Complete'}</span>
                  </button>
                </div>

                {/* Formatted Reading Material */}
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {activeLesson.content_markdown}
                </div>

                {/* Downloadable Resources */}
                {activeLesson.resources && activeLesson.resources.length > 0 && (
                  <div className="pt-6 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                      Downloadable Lesson Materials
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {activeLesson.resources.map((res, idx) => (
                        <a
                          key={idx}
                          href={res.url}
                          download
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{res.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Curriculum Module Sidebar */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 h-fit">
              <div>
                <h3 className="text-sm font-bold text-white">Course Curriculum</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Completion: {activeCourse.user_progress || 0}%
                </p>
                <div className="w-full h-1.5 rounded-full bg-slate-900 mt-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${activeCourse.user_progress || 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {activeCourse.modules && activeCourse.modules.map((mod) => (
                  <div key={mod.id} className="space-y-2">
                    <div className="text-xs font-bold text-slate-300">{mod.title}</div>
                    <div className="space-y-1.5">
                      {mod.lessons.map((lsn) => (
                        <button
                          key={lsn.id}
                          onClick={() => {
                            sounds.playClick();
                            setActiveLesson(lsn);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between gap-2 transition-all ${
                            activeLesson.id === lsn.id
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {lsn.is_completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className="truncate">{lsn.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {lsn.duration_minutes}m
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Course Catalogue & Directory View */
        <div className="space-y-8 animate-in fade-in">
          {/* Header Strip */}
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Sector 01: Knowledge Tower</span>
              </div>
              <h1 className="text-3xl font-black text-white">Academic Course Catalogue</h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Accredited deep-tech curriculums across AI, Quantum Mechanics, Distributed Systems, and Cybernetics.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Courses ({courses.length})
              </button>
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'enrolled'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My Enrolled ({courses.filter(c => c.is_enrolled).length})
              </button>
            </div>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by course title, code (e.g. AI-401), or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl glass-panel bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'glass-panel text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="glass-panel rounded-3xl border border-slate-800 hover:border-cyan-500/40 overflow-hidden flex flex-col justify-between transition-all group hover:-translate-y-1"
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                        {c.code}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-700 text-[10px] font-medium">
                        {c.difficulty}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{c.duration_hours}h duration</span>
                      </span>
                      <span className="flex items-center gap-1 text-amber-300 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{c.rating}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-6">
                    <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                      {c.category}
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                    <div className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800">
                      Instructor: <span className="text-slate-200 font-medium">{c.instructor_name}</span>
                    </div>
                  </div>
                </div>

                {/* Enrollment / Enter Actions */}
                <div className="p-6 pt-0">
                  {c.is_enrolled ? (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-cyan-400 font-bold">{c.user_progress || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                            style={{ width: `${c.user_progress || 0}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenCourse(c)}
                        className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Continue Lessons</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playSuccess();
                        onEnroll(c.id);
                      }}
                      className="w-full py-2.5 rounded-xl glass-panel-glow border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs transition-all flex items-center justify-center gap-2 hover:bg-cyan-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Enroll in Course</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
