import React, { useState } from 'react';
import { Simulation } from '../types';
import { 
  FlaskConical, 
  Activity, 
  Zap, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

interface ExperimentLabProps {
  simulations: Simulation[];
}

export const ExperimentLabView: React.FC<ExperimentLabProps> = ({ simulations }) => {
  const [activeSim, setActiveSim] = useState<Simulation | null>(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [currentMetrics, setCurrentMetrics] = useState<Record<string, number>>({});
  const [decisionHistory, setDecisionHistory] = useState<any[]>([]);
  const [simResult, setSimResult] = useState<any | null>(null);

  // Start Simulation
  const handleStartSim = (s: Simulation) => {
    sounds.playWarp();
    setActiveSim(s);
    setCurrentPhaseIndex(0);
    setDecisionHistory([]);
    setSimResult(null);
    if (s.scenario_data && s.scenario_data.initial_metrics) {
      setCurrentMetrics({ ...s.scenario_data.initial_metrics });
    } else {
      setCurrentMetrics({ latency_ms: 42, cost_per_hr: 350, thermal_celsius: 68, stability_percent: 99.2 });
    }
  };

  // Select a choice in current phase
  const handleMakeChoice = async (choice: any) => {
    sounds.playClick();
    // Update metrics
    const updated = { ...currentMetrics };
    if (choice.delta) {
      Object.entries(choice.delta).forEach(([k, v]) => {
        if (typeof updated[k] === 'number') {
          updated[k] = Math.round((updated[k] + (v as number)) * 10) / 10;
        }
      });
    }
    setCurrentMetrics(updated);

    const newHistory = [...decisionHistory, { phase: currentPhaseIndex + 1, choice: choice.text, delta: choice.delta }];
    setDecisionHistory(newHistory);

    // Advance phase or finish
    if (activeSim && activeSim.scenario_data && currentPhaseIndex < activeSim.scenario_data.phases.length - 1) {
      setCurrentPhaseIndex(currentPhaseIndex + 1);
    } else {
      // Finished simulation!
      sounds.playSuccess();
      const res = await api.submitSimulation(activeSim!.id, newHistory, updated);
      setSimResult(res);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-pink-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)]">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Experiment Lab</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-mono font-semibold">
                Simulations & Decisions
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Hands-on technical decision architectures, infrastructure stress tests & venture growth models
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE SIMULATION RUNNER */}
      {activeSim ? (
        simResult ? (
          /* Simulation Results Screen */
          <div className="glass-panel p-8 rounded-3xl border border-pink-500/30 max-w-4xl mx-auto space-y-6 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-pink-500/20 border border-pink-400 mx-auto flex items-center justify-center">
                <Award className="w-8 h-8 text-pink-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Simulation Concluded</h2>
              <p className="text-xs text-slate-400">{activeSim.title}</p>
            </div>

            {/* Score Strip */}
            <div className="grid grid-cols-2 gap-4 text-center max-w-md mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-3xl font-black text-pink-400 font-mono">{simResult.score}/100</div>
                <div className="text-xs text-slate-400 mt-0.5">Performance Score</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-3xl font-black text-cyan-400 font-mono">+{simResult.xp_awarded} XP</div>
                <div className="text-xs text-slate-400 mt-0.5">XP Earned</div>
              </div>
            </div>

            {/* Evaluation Feedback */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              <div className="font-bold text-cyan-400 mb-1">Faculty Systems Evaluation:</div>
              {simResult.feedback}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setActiveSim(null)}
                className="px-6 py-3 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                Return to Simulation Lab
              </button>
            </div>
          </div>
        ) : (
          /* Live Interactive Scenario Runner */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario Choices Area (2 Cols) */}
            <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-pink-500/20 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">{activeSim.category}</span>
                  <h2 className="text-lg font-bold text-white">{activeSim.title}</h2>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  Phase {currentPhaseIndex + 1} of {activeSim.scenario_data?.phases.length || 2}
                </span>
              </div>

              {activeSim.scenario_data && activeSim.scenario_data.phases[currentPhaseIndex] && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">
                      {activeSim.scenario_data.phases[currentPhaseIndex].name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                      {activeSim.scenario_data.phases[currentPhaseIndex].scenario}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Select Architectural Directive:
                    </div>
                    <div className="space-y-3">
                      {activeSim.scenario_data.phases[currentPhaseIndex].choices.map((choice, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleMakeChoice(choice)}
                          className="w-full p-4 rounded-2xl glass-panel bg-slate-900/80 hover:bg-pink-500/10 border border-slate-800 hover:border-pink-500/40 text-left text-xs transition-all flex items-center justify-between group"
                        >
                          <span className="text-slate-200 group-hover:text-pink-300 font-medium">
                            {choice.text}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Metrics Telemetry Panel (1 Col) */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-bold text-cyan-400 uppercase tracking-widest">
                <Activity className="w-4 h-4" />
                <span>Live System Telemetry</span>
              </div>

              <div className="space-y-4">
                {Object.entries(currentMetrics).map(([key, val]) => (
                  <div key={key} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 capitalize">
                      <span>{key.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-white font-bold">{val}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(10, val * (key.includes('percent') ? 1 : 0.2)))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleStartSim(activeSim)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-400 flex items-center justify-center gap-2 border border-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restart Simulation</span>
              </button>
            </div>
          </div>
        )
      ) : (
        /* Simulations Catalogue */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-pink-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-pink-400 font-semibold">
                    {sim.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {sim.duration_minutes} min • {sim.difficulty}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                  {sim.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {sim.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  +{sim.xp_reward} XP Reward
                </span>

                <button
                  onClick={() => handleStartSim(sim)}
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Launch Simulation</span>
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
