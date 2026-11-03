import React, { useState } from 'react';
import { UserProfile, DailyMission, XPTransaction } from '../types';
import { 
  Trophy, 
  Flame, 
  Clock, 
  BookOpen, 
  Swords, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Calendar,
  Lock
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { sounds } from '../services/soundEffects';

interface ProgressProps {
  currentUser: UserProfile;
  missions: DailyMission[];
  xpTransactions: XPTransaction[];
  onClaimMission: (missionId: string) => void;
}

const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Beginner Explorer', min: 0, max: 250 },
  { level: 2, title: 'Knowledge Seeker', min: 250, max: 600 },
  { level: 3, title: 'Skill Builder', min: 600, max: 1200 },
  { level: 4, title: 'Learning Strategist', min: 1200, max: 2000 },
  { level: 5, title: 'Innovation Leader', min: 2000, max: 3200 },
  { level: 6, title: 'Infinity Scholar', min: 3200, max: 100000 }
];

const ACHIEVEMENTS_DATA = [
  { id: 'ach_1', title: 'First Light', desc: 'Completed your first university module lesson.', xp: 50, unlocked: true, icon: '🌟' },
  { id: 'ach_2', title: 'Knowledge Seeker', desc: 'Enrolled in 3 accredited course tracks.', xp: 100, unlocked: true, icon: '📚' },
  { id: 'ach_3', title: 'Arena Champion', desc: 'Achieved 100% on a Challenge Arena assessment.', xp: 150, unlocked: true, icon: '⚔️' },
  { id: 'ach_4', title: 'Prompt Engineer', desc: 'Consulted Aegis AI mentor for academic synthesis.', xp: 75, unlocked: true, icon: '🧠' },
  { id: 'ach_5', title: 'Synthesizer', desc: 'Successfully stabilized the Quantum Infrastructure simulation.', xp: 150, unlocked: false, icon: '🔬' },
  { id: 'ach_6', title: 'Syndicate Member', desc: 'Joined a collaborative research study squad.', xp: 80, unlocked: true, icon: '🤝' },
  { id: 'ach_7', title: 'Streak Master', desc: 'Maintained a 7-day continuous study streak.', xp: 200, unlocked: false, icon: '🔥' },
  { id: 'ach_8', title: 'Infinity Scholar', desc: 'Reached Level 6 and earned 3,200+ audited XP.', xp: 500, unlocked: false, icon: '👑' }
];

const WEEKLY_STUDY_DATA = [
  { day: 'Mon', minutes: 45 },
  { day: 'Tue', minutes: 60 },
  { day: 'Wed', minutes: 35 },
  { day: 'Thu', minutes: 80 },
  { day: 'Fri', minutes: 55 },
  { day: 'Sat', minutes: 90 },
  { day: 'Sun', minutes: 40 }
];

const SKILLS_BREAKDOWN = [
  { skill: 'Deep Reinforcement Learning & Transformers', level: 88, color: 'bg-cyan-400' },
  { skill: 'Quantum Superposition & Circuit Design', level: 65, color: 'bg-purple-400' },
  { skill: 'Distributed Consensus & Raft Protocols', level: 75, color: 'bg-blue-400' },
  { skill: 'Zero-Trust Cryptography & Threat Mitigation', level: 60, color: 'bg-pink-400' }
];

export const ProgressCentreView: React.FC<ProgressProps> = ({
  currentUser,
  missions,
  xpTransactions,
  onClaimMission
}) => {
  const currentLvlInfo = LEVEL_THRESHOLDS.find(l => currentUser.total_xp >= l.min && currentUser.total_xp < l.max) || LEVEL_THRESHOLDS[0];
  const nextLvlInfo = LEVEL_THRESHOLDS.find(l => l.level === currentLvlInfo.level + 1) || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  const xpInLevel = currentUser.total_xp - currentLvlInfo.min;
  const xpNeeded = nextLvlInfo.min - currentLvlInfo.min;
  const levelProgressPct = Math.min(100, Math.round((xpInLevel / (xpNeeded || 1)) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <Trophy className="w-8 h-8 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Progress Centre</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold">
                Sector 07
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Audited XP ledger, verified skill proficiencies, weekly analytics & progressive academic rank
            </p>
          </div>
        </div>

        {/* Current Level Pill */}
        <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-cyan-500/40 relative z-10 text-right">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Current Title</span>
          <div className="text-sm font-extrabold text-white">{currentLvlInfo.title}</div>
          <span className="text-xs font-mono text-slate-400">Level {currentUser.level} of 6</span>
        </div>
      </div>

      {/* Level Progression Progress Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">
            Level {currentLvlInfo.level}: {currentLvlInfo.title}
          </span>
          <span className="font-mono text-cyan-400 font-bold">
            {currentUser.total_xp} / {nextLvlInfo.min} XP ({levelProgressPct}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(0,240,255,0.5)]"
            style={{ width: `${levelProgressPct}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>{currentLvlInfo.min} XP</span>
          <span>Next Rank: Level {nextLvlInfo.level} ({nextLvlInfo.title}) at {nextLvlInfo.min} XP</span>
        </div>
      </div>

      {/* Core Verified Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <Zap className="w-4 h-4" />
            <span>Audited Total XP</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{currentUser.total_xp}</div>
          <div className="text-[11px] text-slate-500 mt-1">Verified on database ledger</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Flame className="w-4 h-4" />
            <span>Learning Streak</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{currentUser.current_streak} Days</div>
          <div className="text-[11px] text-slate-500 mt-1">Active daily study streak</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <Clock className="w-4 h-4" />
            <span>Study Time</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">14.5 Hours</div>
          <div className="text-[11px] text-slate-500 mt-1">Across enrolled modules</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Swords className="w-4 h-4" />
            <span>Quiz Pass Rate</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">92%</div>
          <div className="text-[11px] text-slate-500 mt-1">Average arena accuracy</div>
        </div>
      </div>

      {/* Weekly Activity Chart & Skills Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Bar Chart with Recharts */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Weekly Learning Activity (Minutes)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Past 7 Days</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_STUDY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E172A', borderColor: '#00F0FF', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="minutes" fill="#00F0FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Proficiencies */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Demonstrated Skill Mastery</span>
            </h3>
            <span className="text-xs text-slate-400">Evaluated</span>
          </div>

          <div className="space-y-4 pt-1">
            {SKILLS_BREAKDOWN.map((s, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{s.skill}</span>
                  <span className="font-mono text-cyan-400 font-bold">{s.level}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-500`}
                    style={{ width: `${s.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Missions System */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Daily Academic Quests</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Complete daily educational milestones to earn verified XP bonuses.</p>
          </div>
          <span className="text-xs font-mono text-purple-300 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
            Resets at 00:00 UTC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missions.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start gap-3">
                {m.is_claimed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-purple-400/50 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className={`font-bold ${m.is_claimed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {m.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{m.description}</div>
                  <div className="text-[10px] text-purple-400 font-mono font-bold mt-1">+{m.xp_reward} XP</div>
                </div>
              </div>

              {!m.is_claimed && (
                <button
                  onClick={() => onClaimMission(m.id)}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md transition-all shrink-0"
                >
                  Claim XP
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Badges Showcase */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Academic Achievement Badges</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Permanent honours unlocked through verifiable scholastic excellence.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ACHIEVEMENTS_DATA.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border text-center transition-all ${
                ach.unlocked
                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                  : 'bg-slate-950/60 border-slate-850 opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">{ach.unlocked ? ach.icon : '🔒'}</div>
              <h4 className="text-xs font-bold text-white mb-1">{ach.title}</h4>
              <p className="text-[10px] text-slate-400 leading-tight mb-3">{ach.desc}</p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
                +{ach.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audited XP Transaction Ledger */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>Audited XP Transaction Ledger</span>
        </h3>
        <p className="text-xs text-slate-400">Cryptographically sequenced activity credits awarded to {currentUser.name}.</p>

        <div className="space-y-2 pt-2">
          {xpTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-slate-200 font-medium">{tx.reason}</span>
              </div>
              <div className="flex items-center gap-4 text-right">
                <span className="font-mono text-cyan-400 font-bold">+{tx.amount} XP</span>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">{tx.created_at}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
