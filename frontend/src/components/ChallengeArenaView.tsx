import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, LeaderboardUser } from '../types';
import { 
  Swords, 
  Timer, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Flame, 
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

interface ChallengeArenaProps {
  quizzes: Quiz[];
}

export const ChallengeArenaView: React.FC<ChallengeArenaProps> = ({ quizzes }) => {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'leaderboard' | 'history'>('quizzes');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(600);
  const [quizResults, setQuizResults] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  useEffect(() => {
    api.getLeaderboard().then(setLeaderboard);
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    if (!activeQuiz || quizResults) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, quizResults, userAnswers]);

  const handleStartQuiz = (q: Quiz) => {
    sounds.playWarp();
    setActiveQuiz(q);
    setCurrentQIndex(0);
    setUserAnswers({});
    setQuizResults(null);
    setTimeLeftSeconds(q.time_limit_minutes * 60);
  };

  const handleSelectOption = (qId: string, optionIndex: number) => {
    sounds.playClick();
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex
    }));
  };

  const handleFinishQuiz = async () => {
    if (!activeQuiz) return;
    sounds.playSuccess();
    const res = await api.submitQuiz(activeQuiz.id, userAnswers);
    setQuizResults(res);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Swords className="w-8 h-8 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Challenge Arena</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-semibold">
                Weekly Tournament
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Timed assessments, algorithmic error analysis & competitive university leaderboards
            </p>
          </div>
        </div>

        {/* Top Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 relative z-10">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('quizzes'); setActiveQuiz(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'quizzes' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quizzes & Assessments
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('leaderboard'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leaderboard' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* ACTIVE QUIZ MODE */}
      {activeQuiz ? (
        quizResults ? (
          /* Quiz Results Screen */
          <div className="glass-panel p-8 rounded-3xl border border-amber-500/30 space-y-6 max-w-4xl mx-auto animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Assessment Complete</h2>
              <p className="text-xs text-slate-400">{activeQuiz.title}</p>
            </div>

            {/* Scorecard Strip */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-2xl font-black text-cyan-400 font-mono">{quizResults.percentage}%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Final Score</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-2xl font-black text-amber-400 font-mono">+{quizResults.xp_earned} XP</div>
                <div className="text-[11px] text-slate-400 mt-0.5">XP Awarded</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className={`text-2xl font-black ${quizResults.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {quizResults.passed ? 'PASSED' : 'RETRY NEEDED'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Threshold: {activeQuiz.passing_score}%</div>
              </div>
            </div>

            {/* Detailed Per-Question Explanations */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Detailed Explanations</h3>
              {quizResults.breakdown && quizResults.breakdown.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-200">{idx + 1}. {item.question}</span>
                    {item.is_correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    <span className="font-semibold text-cyan-400">Explanation:</span> {item.explanation}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-6 py-3 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                Return to Arena Hub
              </button>
            </div>
          </div>
        ) : (
          /* Live Timed Assessment Runner */
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 max-w-4xl mx-auto space-y-6">
            {/* Top Bar: Timer & Progress */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">{activeQuiz.category}</span>
                <h2 className="text-lg font-bold text-white">{activeQuiz.title}</h2>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-mono text-sm font-bold">
                <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            </div>

            {/* Current Question */}
            {activeQuiz.questions && (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Question {currentQIndex + 1} of {activeQuiz.questions.length}</span>
                  <span>Passing Score: {activeQuiz.passing_score}%</span>
                </div>

                <div className="text-base font-bold text-white leading-relaxed">
                  {activeQuiz.questions[currentQIndex].question}
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {activeQuiz.questions[currentQIndex].options.map((opt, oIdx) => {
                    const qId = activeQuiz.questions![currentQIndex].id || `q${currentQIndex + 1}`;
                    const isSelected = userAnswers[qId] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(qId, oIdx)}
                        className={`w-full p-4 rounded-2xl text-left text-xs transition-all flex items-center justify-between border ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'glass-panel bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-[10px]">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
                    disabled={currentQIndex === 0}
                    className="px-4 py-2 rounded-xl glass-panel text-slate-300 disabled:opacity-40 text-xs font-semibold"
                  >
                    Previous
                  </button>

                  {currentQIndex === activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={handleFinishQuiz}
                      className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-all"
                    >
                      Submit Assessment
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQIndex(Math.min(activeQuiz.questions!.length - 1, currentQIndex + 1))}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      ) : activeTab === 'leaderboard' ? (
        /* Leaderboard View */
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>University Academic Leaderboard</span>
              </h2>
              <p className="text-xs text-slate-400">Ranked by audited academic XP transactions.</p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setLeaderboardTimeframe('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  leaderboardTimeframe === 'weekly' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setLeaderboardTimeframe('alltime')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  leaderboardTimeframe === 'alltime' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                }`}
              >
                All-Time
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-2xl glass-panel bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 text-xs hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold ${
                      user.rank === 1
                        ? 'bg-amber-400 text-slate-950'
                        : user.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{user.rank}
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.title}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-slate-500 uppercase">Streak</span>
                    <div className="text-amber-400 font-bold">{user.current_streak} days</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Total XP</span>
                    <div className="text-cyan-400 font-mono font-bold">{user.total_xp} XP</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Quizzes Catalogue List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((q) => (
            <div
              key={q.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-semibold">
                    {q.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Timer className="w-3.5 h-3.5 text-amber-400" />
                    <span>{q.time_limit_minutes}m</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {q.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {q.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs font-mono text-cyan-400 font-bold">
                  +{q.xp_reward} XP Reward
                </div>

                <button
                  onClick={() => handleStartQuiz(q)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Begin Challenge</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
