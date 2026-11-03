import React from 'react';
import { AppView, BuildingId } from '../types';
import { 
  Compass, 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  Swords, 
  Library, 
  FlaskConical, 
  Users, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  onEnterBuilding: (buildingId: BuildingId) => void;
}

const SECTOR_CARDS: {
  id: BuildingId;
  name: string;
  category: string;
  description: string;
  icon: string;
  badge: string;
  color: string;
}[] = [
  {
    id: 'knowledge-tower',
    name: 'Knowledge Tower',
    category: 'Core Academic LMS',
    description: 'Enrolled courses, high-definition video modules, interactive reading materials, and verifiable completion certificates.',
    icon: '🏛️',
    badge: '18 Active Courses',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300'
  },
  {
    id: 'ai-hub',
    name: 'AI Innovation Hub',
    category: 'Personal Academic Mentor',
    description: 'Powered by Google Gemini. Clarify doubts, summarize technical papers, generate personalized study roadmaps, and generate flashcards.',
    icon: '🧠',
    badge: 'Gemini 1.5 Integrated',
    color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300'
  },
  {
    id: 'challenge-arena',
    name: 'Challenge Arena',
    category: 'Assessments & Competitions',
    description: 'Timed multi-tiered assessments, instant mathematical error feedback, answer explanations, and campus-wide leaderboards.',
    icon: '⚔️',
    badge: 'Weekly Showdown',
    color: 'from-amber-500/20 to-rose-500/10 border-amber-500/30 text-amber-300'
  },
  {
    id: 'digital-library',
    name: 'Digital Library',
    category: 'Central Resource Repository',
    description: 'Searchable academic library of technical e-books, slide decks, research papers, and code repositories with in-app document previews.',
    icon: '📚',
    badge: '4,500+ Papers',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300'
  },
  {
    id: 'experiment-lab',
    name: 'Experiment Lab',
    category: 'Interactive Simulations',
    description: 'Case studies and dynamic systems simulations: manage quantum computing superclusters, tech startups, and incident defense.',
    icon: '🔬',
    badge: 'Scenario-Based',
    color: 'from-pink-500/20 to-purple-500/10 border-pink-500/30 text-pink-300'
  },
  {
    id: 'collaboration-centre',
    name: 'Collaboration Centre',
    category: 'Social Learning Community',
    description: 'Channel-based discussion forums, study squads, peer reviews, announcements, and live collaborative Kanban task tracking.',
    icon: '🤝',
    badge: 'Guild Squads Active',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-300'
  },
  {
    id: 'progress-centre',
    name: 'Progress Centre',
    category: 'Analytics & Gamification',
    description: 'Verified real-time learning metrics, weekly study charts, skill radar matrices, level progression, and XP transaction logs.',
    icon: '🏆',
    badge: 'XP Engine Audited',
    color: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30 text-cyan-300'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onEnterBuilding }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Generation Virtual University LMS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-slate-400 font-mono">v2.0-Quantum</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Your Learning Journey.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent glow-cyan">
              A Whole New Universe.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed">
            Explore a smarter way to learn through an explorable 3D university campus, personalized Gemini AI guidance, collaborative research syndicate squads, and an experiential gamified world designed entirely around your academic growth.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                sounds.playWarp();
                onNavigate('explore-3d');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-base shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
            >
              <Compass className="w-5 h-5 text-slate-950" />
              <span>Enter 3D Virtual City</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigate('dashboard');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel-glow text-white font-semibold text-base border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center justify-center gap-3"
            >
              <LayoutDashboard className="w-5 h-5 text-cyan-400" />
              <span>Launch 2D Dashboard</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl glass-panel border border-slate-800">
              <div className="text-2xl font-black text-cyan-400 font-mono">7</div>
              <div className="text-xs font-semibold text-white mt-1">Interactive Sectors</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Explorable 3D buildings</div>
            </div>
            <div className="p-4 rounded-xl glass-panel border border-slate-800">
              <div className="text-2xl font-black text-purple-400 font-mono">Gemini 1.5</div>
              <div className="text-xs font-semibold text-white mt-1">AI Academic Mentor</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Step-by-step doubt solver</div>
            </div>
            <div className="p-4 rounded-xl glass-panel border border-slate-800">
              <div className="text-2xl font-black text-emerald-400 font-mono">100%</div>
              <div className="text-xs font-semibold text-white mt-1">Verifiable Certificates</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Cryptographic credentials</div>
            </div>
            <div className="p-4 rounded-xl glass-panel border border-slate-800">
              <div className="text-2xl font-black text-amber-400 font-mono">Audited XP</div>
              <div className="text-xs font-semibold text-white mt-1">Gamification Engine</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Real verified progression</div>
            </div>
          </div>
        </div>
      </section>

      {/* The 7 University Sectors Showcase */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-2">
              Architectural Zones
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Seven Dedicated Learning Sectors
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-3">
              Every building in the virtual city serves an essential academic mission, seamlessly bridging 3D exploration and high-focus study modes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTOR_CARDS.map((sector) => (
              <div
                key={sector.id}
                onClick={() => {
                  sounds.playWarp();
                  onEnterBuilding(sector.id);
                }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${sector.color} glass-panel border hover:border-cyan-400 cursor-pointer transition-all transform hover:-translate-y-1 group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{sector.icon}</span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 font-semibold">
                      {sector.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {sector.name}
                  </h3>
                  <div className="text-xs font-medium text-slate-400 mb-2">
                    {sector.category}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {sector.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Sector</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tri-Portal RBAC Showcase */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Role-Based University Portals
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Engineered for complete institutional operation across students, educators, and university leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Student Portal</h3>
              <p className="text-xs text-slate-400 mb-4">
                Explore the 3D campus, view lessons, take timed quizzes, submit homework, and consult the AI mentor.
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  onNavigate('explore-3d');
                }}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Launch Student Experience</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-blue-500/30">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Instructor Studio</h3>
              <p className="text-xs text-slate-400 mb-4">
                Author courses, structure module lessons, create quizzes, review student submissions, and award grades.
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  onNavigate('instructor-portal');
                }}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Open Instructor Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-purple-500/30">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Admin Console</h3>
              <p className="text-xs text-slate-400 mb-4">
                Platform-wide metrics, RBAC user governance, course accreditation, audit logging, and system configurations.
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  onNavigate('admin-portal');
                }}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>Open Admin Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full mt-auto py-8 border-t border-slate-800/80 bg-slate-950 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">LearnLoop Infinity 2.0</span>
            <span>—</span>
            <span>Your Learning Journey. A Whole New Universe.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Production LMS Architecture</span>
            <span>•</span>
            <span>FastAPI & SQLite Persistent</span>
            <span>•</span>
            <span>Three.js WebGL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
