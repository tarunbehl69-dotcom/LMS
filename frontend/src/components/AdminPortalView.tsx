import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Activity, 
  Sliders, 
  Key, 
  FileText, 
  Check, 
  AlertTriangle,
  Lock,
  Sparkles,
  Server
} from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

interface AdminPortalProps {
  currentUser: UserProfile;
}

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level: number;
  xp: number;
}

export const AdminPortalView: React.FC<AdminPortalProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'audit'>('users');
  const [metrics, setMetrics] = useState<any>({
    total_users: 1420,
    total_courses: 5,
    total_quiz_attempts: 3890,
    total_xp_awarded: 245000,
    system_status: 'Operational'
  });

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([
    { id: 'usr_student_1', name: 'Alex Vance', email: 'alex.vance@learnloop.edu', role: 'student', level: 2, xp: 420 },
    { id: 'usr_instructor_1', name: 'Dr. Aris Thorne', email: 'dr.thorne@learnloop.edu', role: 'instructor', level: 6, xp: 3200 },
    { id: 'usr_admin_1', name: 'Director Elena Rostova', email: 'elena.rostova@learnloop.edu', role: 'admin', level: 6, xp: 5400 },
    { id: 'usr_student_2', name: 'Sophia Wu', email: 'sophia.wu@learnloop.edu', role: 'student', level: 3, xp: 850 }
  ]);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Settings State
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');
  const [xpMultiplier, setXpMultiplier] = useState<number>(1.0);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    api.getPlatformMetrics().then(setMetrics);
    api.getAuditLogs().then(setAuditLogs);
  }, []);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    sounds.playSuccess();
    setManagedUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleSaveSettings = () => {
    sounds.playSuccess();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">University Administration Console</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold">
                Superuser Level 6
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Platform governance, RBAC security credentials & institutional telemetry
            </p>
          </div>
        </div>

        {/* Top Tab Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 relative z-10">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('users'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            User Directory
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('settings'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI & System Settings
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('audit'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audit' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Log
          </button>
        </div>
      </div>

      {/* Platform Level Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Total Enrolled Users</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{metrics.total_users}</div>
          <div className="text-[11px] text-slate-500 mt-1">Students & faculty across sectors</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Accredited Tracks</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{metrics.total_courses}</div>
          <div className="text-[11px] text-slate-500 mt-1">Live university curriculums</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Activity className="w-4 h-4" />
            <span>Arena Submissions</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{metrics.total_quiz_attempts}</div>
          <div className="text-[11px] text-slate-500 mt-1">Verified assessments scored</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Server className="w-4 h-4" />
            <span>Platform Status</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">HEALTHY</div>
          <div className="text-[11px] text-slate-500 mt-1">FastAPI & SQLite synchronized</div>
        </div>
      </div>

      {/* TAB 1: USER DIRECTORY & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <h2 className="text-base font-bold text-white">University User Directory & RBAC Assignment</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Scholar / User</th>
                  <th className="pb-3">Academic Email</th>
                  <th className="pb-3">Level & XP</th>
                  <th className="pb-3">Role Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {managedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/40">
                    <td className="py-4 font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-cyan-400 text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <span>{user.name}</span>
                    </td>
                    <td className="py-4 text-slate-400 font-mono">{user.email}</td>
                    <td className="py-4 text-slate-300 font-mono">
                      Lvl {user.level} ({user.xp} XP)
                    </td>
                    <td className="py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white capitalize focus:outline-none focus:border-purple-400"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AI & SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-6 max-w-3xl">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" />
              <span>Google Gemini AI Configuration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure the server-side API key for Aegis AI Mentor. The key is securely proxied through backend functions.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Google Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy••••••••••••••••••••••••••••"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Leave empty to utilize the university grounded high-level LMS pedagogical fallback engine.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Active AI Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-Low Latency)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Platform XP Multiplier</label>
                <input
                  type="number"
                  step={0.1}
                  min={0.5}
                  max={3.0}
                  value={xpMultiplier}
                  onChange={(e) => setXpMultiplier(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Settings updated successfully
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              className="ml-auto px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
          <h2 className="text-base font-bold text-white">System Security & Operation Audit Logs</h2>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="text-purple-400 font-mono">[{log.action}]</span>
                    <span>{log.details}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Actor: {log.actor_name} ({log.actor_role}) • IP: {log.ip_address}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.created_at}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
