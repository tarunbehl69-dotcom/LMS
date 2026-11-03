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
  CheckCircle2,
  Folder
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
    { id: 1, text: 'New lesson unlocked in Neuromorphic AI & Deep Reinforcement Learning', time: '10m ago', unread: true },
    { id: 2, text: 'Weekly Challenge Arena Leaderboard resets in 2 days', time: '1h ago', unread: true },
    { id: 3, text: 'Alex, you earned +150 XP from Simulation completion!', time: '2h ago', unread: false }
  ];

  const handleNavClick = (view: AppView) => {
    sounds.playClick();
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 glass-panel border-b border-white/10 bg-[#0A0E13]/95 flex items-center justify-between px-4 lg:px-6">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 text-left group transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2EC4B6]/15 border border-[#2EC4B6]/30 flex items-center justify-center shadow-[0_0_15px_rgba(46,196,182,0.25)] group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 text-[#2EC4B6]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wider text-[#EEF2F5] flex items-center gap-1.5 font-display">
              <span>LEARNLOOP</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40 font-mono">
                2.0
              </span>
            </div>
            <div className="text-[10px] text-[#9AA7B2] tracking-tight hidden sm:block">
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
              ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40 shadow-[0_0_12px_rgba(46,196,182,0.2)]'
              : 'text-[#9AA7B2] hover:text-[#2EC4B6] hover:bg-white/5'
          }`}
        >
          <Compass className="w-4 h-4 text-[#2EC4B6]" strokeWidth={1.5} />
          <span>Infinity City</span>
        </button>

        <button
          onClick={() => handleNavClick('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'dashboard'
              ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40 shadow-[0_0_12px_rgba(46,196,182,0.2)]'
              : 'text-[#9AA7B2] hover:text-[#2EC4B6] hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-[#F2A541]" strokeWidth={1.5} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleNavClick('knowledge-tower')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'knowledge-tower'
              ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40 shadow-[0_0_12px_rgba(46,196,182,0.2)]'
              : 'text-[#9AA7B2] hover:text-[#2EC4B6] hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#2EC4B6]" strokeWidth={1.5} />
          <span>Courses</span>
        </button>

        <button
          onClick={() => handleNavClick('ai-hub')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'ai-hub'
              ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40 shadow-[0_0_12px_rgba(46,196,182,0.2)]'
              : 'text-[#9AA7B2] hover:text-[#2EC4B6] hover:bg-white/5'
          }`}
        >
          <Brain className="w-4 h-4 text-[#3EE1D2]" strokeWidth={1.5} />
          <span>AI Mentor</span>
        </button>

        <button
          onClick={() => handleNavClick('challenge-arena')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'challenge-arena'
              ? 'bg-[#F2A541]/20 text-[#F2A541] border border-[#F2A541]/40 shadow-[0_0_12px_rgba(242,165,65,0.2)]'
              : 'text-[#9AA7B2] hover:text-[#F2A541] hover:bg-white/5'
          }`}
        >
          <Swords className="w-4 h-4 text-[#F2A541]" strokeWidth={1.5} />
          <span>Arena</span>
        </button>

        <button
          onClick={() => handleNavClick('digital-library')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'digital-library'
              ? 'bg-[#7BD389]/20 text-[#7BD389] border border-[#7BD389]/40 shadow-[0_0_12px_rgba(123,211,137,0.2)]'
              : 'text-[#9AA7B2] hover:text-[#7BD389] hover:bg-white/5'
          }`}
        >
          <Library className="w-4 h-4 text-[#7BD389]" strokeWidth={1.5} />
          <span>Library</span>
        </button>

        {/* Section 7.1: Dedicated "My Files" Navigation */}
        <button
          onClick={() => handleNavClick('my-files')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'my-files'
              ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40 shadow-[0_0_12px_rgba(46,196,182,0.2)]'
              : 'text-[#9AA7B2] hover:text-[#2EC4B6] hover:bg-white/5'
          }`}
        >
          <Folder className="w-4 h-4 text-[#2EC4B6]" strokeWidth={1.5} />
          <span>My Files</span>
        </button>

        <button
          onClick={() => handleNavClick('experiment-lab')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'experiment-lab'
              ? 'bg-[#F2A541]/20 text-[#F2A541] border border-[#F2A541]/40 shadow-[0_0_12px_rgba(242,165,65,0.2)]'
              : 'text-[#9AA7B2] hover:text-[#F2A541] hover:bg-white/5'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-[#F2A541]" strokeWidth={1.5} />
          <span>Simulations</span>
        </button>

        <button
          onClick={() => handleNavClick('collaboration-centre')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'collaboration-centre'
              ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40 shadow-[0_0_12px_rgba(46,196,182,0.2)]'
              : 'text-[#9AA7B2] hover:text-[#2EC4B6] hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4 text-[#2EC4B6]" strokeWidth={1.5} />
          <span>Collab</span>
        </button>

        <button
          onClick={() => handleNavClick('progress-centre')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'progress-centre'
              ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40 shadow-[0_0_12px_rgba(46,196,182,0.2)]'
              : 'text-[#9AA7B2] hover:text-[#2EC4B6] hover:bg-white/5'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#2EC4B6]" strokeWidth={1.5} />
          <span>Progress</span>
        </button>
      </nav>

      {/* Right Controls: Role Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Streak Counter */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F2A541]/10 border border-[#F2A541]/30 text-[#F2A541] text-xs font-bold" title="Current Study Streak">
          <Flame className="w-4 h-4 fill-[#F2A541] text-[#F2A541]" strokeWidth={1.5} />
          <span>{currentUser.current_streak}d</span>
        </div>

        {/* Level & XP Chip */}
        <div 
          onClick={() => handleNavClick('progress-centre')}
          className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-white/10 hover:border-[#2EC4B6]/40 transition-all text-xs"
        >
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[#2EC4B6] font-semibold uppercase">Lvl {currentUser.level}</span>
            <span className="font-mono text-[#EEF2F5] font-bold">{currentUser.total_xp} XP</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#2EC4B6]" />
        </div>

        {/* Role Switcher Pill (Student / Instructor / Admin) */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playClick();
              setShowRoleDropdown(!showRoleDropdown);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-[#2EC4B6] text-xs font-semibold text-[#EEF2F5] transition-all"
          >
            {currentUser.role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-[#2EC4B6]" strokeWidth={1.5} />}
            {currentUser.role === 'instructor' && <Briefcase className="w-3.5 h-3.5 text-[#F2A541]" strokeWidth={1.5} />}
            {currentUser.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#7BD389]" strokeWidth={1.5} />}
            <span className="capitalize">{currentUser.role} Portal</span>
            <ChevronDown className="w-3 h-3 text-[#9AA7B2]" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl glass-panel border border-white/15 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] text-[#9AA7B2] font-semibold px-2 py-1 uppercase tracking-wider">
                Switch Role Mode
              </div>
              <button
                onClick={() => {
                  onSwitchRole('student');
                  setShowRoleDropdown(false);
                  onNavigate('explore-3d');
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-left transition-all ${
                  currentUser.role === 'student' ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] font-bold' : 'text-[#EEF2F5] hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#2EC4B6]" strokeWidth={1.5} />
                  <span>Student Portal</span>
                </div>
                {currentUser.role === 'student' && <CheckCircle2 className="w-3.5 h-3.5 text-[#2EC4B6]" strokeWidth={1.5} />}
              </button>

              <button
                onClick={() => {
                  onSwitchRole('instructor');
                  setShowRoleDropdown(false);
                  onNavigate('instructor-portal');
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-left transition-all ${
                  currentUser.role === 'instructor' ? 'bg-[#F2A541]/20 text-[#F2A541] font-bold' : 'text-[#EEF2F5] hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#F2A541]" strokeWidth={1.5} />
                  <span>Instructor Studio</span>
                </div>
                {currentUser.role === 'instructor' && <CheckCircle2 className="w-3.5 h-3.5 text-[#F2A541]" strokeWidth={1.5} />}
              </button>

              <button
                onClick={() => {
                  onSwitchRole('admin');
                  setShowRoleDropdown(false);
                  onNavigate('admin-portal');
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-left transition-all ${
                  currentUser.role === 'admin' ? 'bg-[#7BD389]/20 text-[#7BD389] font-bold' : 'text-[#EEF2F5] hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#7BD389]" strokeWidth={1.5} />
                  <span>Admin Console</span>
                </div>
                {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-[#7BD389]" strokeWidth={1.5} />}
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
            className="p-2 rounded-xl glass-panel text-[#9AA7B2] hover:text-[#2EC4B6] transition-all relative border-white/10"
          >
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#2EC4B6]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl glass-panel border border-white/15 p-3 shadow-2xl z-50">
              <div className="text-xs font-bold text-[#EEF2F5] mb-2 flex items-center justify-between">
                <span>Campus Alerts</span>
                <span className="text-[10px] text-[#2EC4B6] cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-900/80 border border-white/5 text-xs">
                    <p className="text-[#EEF2F5]">{n.text}</p>
                    <span className="text-[10px] text-[#9AA7B2]">{n.time}</span>
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
            className="w-8 h-8 rounded-full border border-[#2EC4B6]/60 object-cover"
          />
        </div>
      </div>
    </header>
  );
};
