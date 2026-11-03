import React, { useState } from 'react';
import { AppView, BuildingId, UserProfile, UserRole } from '../types';
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
  Bell, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  ChevronDown,
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  currentUser: UserProfile;
  onSwitchRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onSwitchRole
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const notifications = [
    { id: 1, text: 'New lesson unlocked in Neuromorphic AI', time: '10m ago', unread: true },
    { id: 2, text: 'Weekly Challenge Arena Leaderboard resets in 2 days', time: '1h ago', unread: true },
    { id: 3, text: 'Alex, you earned +150 XP from Simulation completion!', time: '2h ago', unread: false }
  ];

  const handleNavClick = (view: AppView) => {
    sounds.playClick();
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 glass-panel border-b border-cyan-500/20 bg-slate-950/90 flex items-center justify-between px-4 lg:px-6">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 text-left group transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 text-slate-950 fill-white" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wider bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-1.5">
              <span>LEARNLOOP</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                2.0
              </span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-tight hidden sm:block">
              Your Learning Journey. A Whole New Universe.
            </div>
          </div>
        </button>
      </div>

      {/* Main Sector Navigation Links (Desktop) */}
      <nav className="hidden xl:flex items-center gap-1">
        <button
          onClick={() => handleNavClick('explore-3d')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'explore-3d'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>3D City</span>
        </button>

        <button
          onClick={() => handleNavClick('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'dashboard'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-blue-400" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleNavClick('knowledge-tower')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'knowledge-tower'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Courses</span>
        </button>

        <button
          onClick={() => handleNavClick('ai-hub')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'ai-hub'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
              : 'text-slate-300 hover:text-purple-300 hover:bg-slate-800/60'
          }`}
        >
          <Brain className="w-4 h-4 text-purple-400" />
          <span>AI Mentor</span>
        </button>

        <button
          onClick={() => handleNavClick('challenge-arena')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'challenge-arena'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
          }`}
        >
          <Swords className="w-4 h-4 text-amber-400" />
          <span>Arena</span>
        </button>

        <button
          onClick={() => handleNavClick('digital-library')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'digital-library'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60'
          }`}
        >
          <Library className="w-4 h-4 text-emerald-400" />
          <span>Library</span>
        </button>

        <button
          onClick={() => handleNavClick('experiment-lab')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'experiment-lab'
              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.2)]'
              : 'text-slate-300 hover:text-pink-300 hover:bg-slate-800/60'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-pink-400" />
          <span>Simulations</span>
        </button>

        <button
          onClick={() => handleNavClick('collaboration-centre')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'collaboration-centre'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
              : 'text-slate-300 hover:text-blue-300 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4 text-blue-400" />
          <span>Collab</span>
        </button>

        <button
          onClick={() => handleNavClick('progress-centre')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'progress-centre'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
          }`}
        >
          <Trophy className="w-4 h-4 text-cyan-400" />
          <span>Progress</span>
        </button>
      </nav>

      {/* Right Controls: Role Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Streak Counter */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold" title="Current Study Streak">
          <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
          <span>{currentUser.current_streak}d</span>
        </div>

        {/* Level & XP Chip */}
        <div 
          onClick={() => handleNavClick('progress-centre')}
          className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 transition-all text-xs"
        >
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-cyan-400 font-semibold uppercase">Lvl {currentUser.level}</span>
            <span className="font-mono text-white font-bold">{currentUser.total_xp} XP</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
        </div>

        {/* Role Switcher Pill (Student / Instructor / Admin) */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playClick();
              setShowRoleDropdown(!showRoleDropdown);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/40 hover:border-purple-400 text-xs font-medium text-purple-300 transition-all shadow-[0_0_10px_rgba(139,92,246,0.15)]"
          >
            {currentUser.role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />}
            {currentUser.role === 'instructor' && <Briefcase className="w-3.5 h-3.5 text-blue-400" />}
            {currentUser.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />}
            <span className="capitalize font-semibold">{currentUser.role} View</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl glass-panel-purple border border-purple-500/30 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] text-slate-400 font-semibold px-2 py-1 uppercase tracking-wider">
                Switch Active Role
              </div>
              <button
                onClick={() => {
                  onSwitchRole('student');
                  setShowRoleDropdown(false);
                  onNavigate('explore-3d');
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-left transition-all ${
                  currentUser.role === 'student' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span>Student Portal</span>
                </div>
                {currentUser.role === 'student' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              <button
                onClick={() => {
                  onSwitchRole('instructor');
                  setShowRoleDropdown(false);
                  onNavigate('instructor-portal');
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-left transition-all ${
                  currentUser.role === 'instructor' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span>Instructor Studio</span>
                </div>
                {currentUser.role === 'instructor' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
              </button>

              <button
                onClick={() => {
                  onSwitchRole('admin');
                  setShowRoleDropdown(false);
                  onNavigate('admin-portal');
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-left transition-all ${
                  currentUser.role === 'admin' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Admin Console</span>
                </div>
                {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playClick();
              setShowNotifications(!showNotifications);
            }}
            className="p-2 rounded-xl glass-panel text-slate-300 hover:text-cyan-300 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl glass-panel-glow border border-cyan-500/30 p-3 shadow-2xl z-50">
              <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>Campus Alerts</span>
                <span className="text-[10px] text-cyan-400">Mark all read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                    <p className="text-slate-200">{n.text}</p>
                    <span className="text-[10px] text-slate-500">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div 
          onClick={() => handleNavClick('progress-centre')}
          className="cursor-pointer relative"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full border-2 border-cyan-400/80 object-cover shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          />
        </div>
      </div>
    </header>
  );
};
