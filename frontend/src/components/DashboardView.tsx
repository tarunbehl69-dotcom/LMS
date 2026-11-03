import React, { useState } from 'react';
import { AppView, BuildingId, Course, DailyMission, UserProfile } from '../types';
import { 
  Compass, 
  BookOpen, 
  Brain, 
  Swords, 
  Library, 
  FlaskConical, 
  Users, 
  Trophy, 
  Play, 
  CheckCircle2, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Award,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface DashboardViewProps {
  currentUser: UserProfile;
  courses: Course[];
  missions: DailyMission[];
  onNavigate: (view: AppView) => void;
  onEnterBuilding: (buildingId: BuildingId) => void;
  onClaimMission: (missionId: string) => void;
  onOpenLesson: (courseId: string, lessonId: string) => void;
}

const SECTOR_DASHBOARD_CARDS = [
  {
    id: 'knowledge-tower' as BuildingId,
    name: 'Knowledge Tower',
    role: 'Academic Centre',
    stat: '4 Enrolled / 18 Available',
    icon: '🏛️',
    color: 'border-cyan-500/40 text-cyan-400',
    description: 'Video lessons, lecture notes, module curriculum & completion certificates.'
  },
  {
    id: 'ai-hub' as BuildingId,
    name: 'AI Innovation Hub',
    role: 'Gemini Mentorship',
    stat: 'Aegis AI Active',
    icon: '🧠',
    color: 'border-purple-500/40 text-purple-400',
    description: 'Ask doubts, summarize technical notes, generate practice quizzes & study roadmaps.'
  },
  {
    id: 'challenge-arena' as BuildingId,
    name: 'Challenge Arena',
    role: 'Assessments & Quizzes',
    stat: 'Weekly Showdown Live',
    icon: '⚔️',
    color: 'border-amber-500/40 text-amber-400',
    description: 'Timed multi-tiered assessments, instant scoring, answer explanations & leaderboards.'
  },
  {
    id: 'digital-library' as BuildingId,
    name: 'Digital Library',
    role: 'Resource Repository',
    stat: '4,500+ Papers & Docs',
    icon: '📚',
    color: 'border-emerald-500/40 text-emerald-400',
    description: 'Searchable e-books, research papers, slide decks with in-app previews.'
  },
  {
    id: 'experiment-lab' as BuildingId,
    name: 'Experiment Lab',
    role: 'Interactive Simulations',
    stat: '4 Scenarios Ready',
    icon: '🔬',
    color: 'border-pink-500/40 text-pink-400',
    description: 'Scenario-based business decisions, AI infrastructure scaling, incident defense.'
  },
  {
    id: 'collaboration-centre' as BuildingId,
    name: 'Collaboration Centre',
    role: 'Social & Team Learning',
    stat: '5 Channels / 3 Squads',
    icon: '🤝',
    color: 'border-blue-500/40 text-blue-400',
    description: 'Discussion forums, research syndicate squads, peer reviews, Kanban tasks.'
  },
  {
    id: 'progress-centre' as BuildingId,
    name: 'Progress Centre',
    role: 'Personal Analytics',
    stat: 'Audited XP Ledger',
    icon: '🏆',
    color: 'border-teal-500/40 text-teal-400',
    description: 'Learning streaks, skill proficiencies, achievement badges & weekly study charts.'
  }
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  courses,
  missions,
  onNavigate,
  onEnterBuilding,
  onClaimMission,
  onOpenLesson
}) => {
  // Find currently active course
  const activeCourse = courses.find(c => c.is_enrolled) || courses[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Quick Teleport Strip */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl border-2 border-cyan-400 object-cover shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Welcome, {currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold">
                Lvl {currentUser.level}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{currentUser.title} • {currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <button
            onClick={() => {
              sounds.playWarp();
              onNavigate('explore-3d');
            }}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-slate-950" />
            <span>Enter 3D City Mode</span>
          </button>
        </div>
      </div>

      {/* Continue Learning Active Hero Card & Daily Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Widget (2 Cols) */}
        {activeCourse && (
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-cyan-500/20 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
                <Play className="w-3.5 h-3.5 fill-cyan-400" />
                <span>Continue Learning</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                {activeCourse.code}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <img
                src={activeCourse.thumbnail}
                alt={activeCourse.title}
                className="w-full sm:w-44 h-28 rounded-2xl object-cover border border-slate-700 shadow-md"
              />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-1">{activeCourse.title}</h2>
                <p className="text-xs text-slate-300 line-clamp-2 mb-3">{activeCourse.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Instructor: {activeCourse.instructor_name}</span>
                  <span>•</span>
                  <span>{activeCourse.difficulty}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar & Resume Button */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-400">Course Completion</span>
                  <span className="text-cyan-400 font-bold">{activeCourse.user_progress || 33}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                    style={{ width: `${activeCourse.user_progress || 33}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  onEnterBuilding('knowledge-tower');
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <span>Resume Lesson</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Daily Missions Widget (1 Col) */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Daily Missions</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Today</span>
            </div>

            <div className="space-y-3">
              {missions.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    {m.is_claimed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-purple-400/60 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className={`font-semibold ${m.is_claimed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {m.title}
                      </div>
                      <div className="text-[10px] text-purple-400 font-mono font-bold">+{m.xp_reward} XP</div>
                    </div>
                  </div>

                  {!m.is_claimed && (
                    <button
                      onClick={() => onClaimMission(m.id)}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/40 text-[11px] font-bold transition-all shrink-0"
                    >
                      Claim
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onEnterBuilding('progress-centre');
            }}
            className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center justify-between"
          >
            <span>View All Missions & Progress</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* University Sector Matrix (All 7 Buildings) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>Explore Campus Sectors</span>
            <span className="text-xs text-slate-400 font-normal">(7 Functional Facilities)</span>
          </h2>
          <span className="text-xs text-cyan-400">Click any sector to enter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTOR_DASHBOARD_CARDS.map((b) => (
            <div
              key={b.id}
              onClick={() => {
                sounds.playWarp();
                onEnterBuilding(b.id);
              }}
              className={`p-5 rounded-2xl glass-panel border ${b.color} hover:border-cyan-400 cursor-pointer transition-all transform hover:-translate-y-1 group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{b.icon}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {b.role}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {b.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {b.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-cyan-400">
                <span className="font-mono text-slate-300">{b.stat}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
