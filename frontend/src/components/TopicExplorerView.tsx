import React, { useState } from 'react';
import { TopicConcept, UserProfile } from '../types';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  Brain, 
  Layers, 
  Zap, 
  ChevronRight, 
  RotateCcw, 
  Award, 
  Bot, 
  HelpCircle, 
  X, 
  Flame, 
  Compass,
  ArrowRight,
  Lightbulb,
  Check,
  Atom
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface TopicExplorerViewProps {
  currentUser: UserProfile;
  onAskAi: (prompt: string) => void;
  onAddXp?: (amount: number, reason: string) => void;
}

const CURRICULUM_TOPICS: TopicConcept[] = [
  {
    id: 'top_latent_manifolds',
    title: 'Latent Space Geometry & Manifold Hypothesis',
    category: 'Artificial Intelligence',
    difficulty: 'Core',
    estimatedMinutes: 8,
    summary: 'Real-world high-dimensional data concentrates near low-dimensional non-linear sub-manifolds embedded within ambient Euclidean space.',
    keyTakeaways: [
      'Intrinsic dimensionality is significantly smaller than ambient feature dimensions.',
      'Tangent space estimation models local variations through Jacobian matrices.',
      'Geodesic distances over curved Riemannian manifolds preserve semantic relationships better than Euclidean distances.',
      'Variational autoencoders enforce continuous probabilistic topological mappings.'
    ],
    formulaOrRule: 'J = \\frac{\\partial f(x)}{\\partial x} \\quad \\text{where} \\quad d_\\mathcal{M}(x, y) = \\inf_\\gamma \\int_0^1 \\|\\dot{\\gamma}(t)\\| dt',
    flashcards: [
      { question: 'What is the central premise of the Manifold Hypothesis?', answer: 'Real-world data (e.g. images, audio) lies on or near a lower-dimensional non-linear manifold within the higher-dimensional ambient space.' },
      { question: 'Why does Euclidean distance fail in high-dimensional latent spaces?', answer: 'Euclidean distance cuts through empty space outside the manifold, whereas geodesic distance measures path length along the true data manifold.' }
    ],
    diagnosticQuiz: [
      {
        question: 'Under the Manifold Hypothesis, intrinsic dimensionality is typically:',
        options: ['Far smaller than the ambient dimension', 'Equal to ambient dimension', 'Infinite', 'Unbounded and random'],
        correctIndex: 0,
        explanation: 'Data degrees of freedom are constrained by physical laws, so intrinsic dimensionality is far smaller than raw pixel or feature counts.'
      },
      {
        question: 'What mathematical construct models local tangent space in neural manifolds?',
        options: ['The Jacobian matrix', 'The Fourier coefficient', 'The Laplace transform', 'Poisson ratio'],
        correctIndex: 0,
        explanation: 'The Jacobian captures first-order partial derivatives representing the local tangent plane of the learned transformation.'
      }
    ],
    masteryStatus: 'mastered'
  },
  {
    id: 'top_transformers',
    title: 'Attention Routing & Transformer Scaling Laws',
    category: 'Artificial Intelligence',
    difficulty: 'Advanced',
    estimatedMinutes: 10,
    summary: 'Dynamic query-key-value routing allows all tokens to attend to each other simultaneously, governed by compute and parameter power-law scaling.',
    keyTakeaways: [
      'Scaled dot-product attention computes softmax weights over key-value matrices.',
      'Quadratic complexity O(N^2) in sequence length can be alleviated via FlashAttention or sparse routing.',
      'Chinchilla scaling laws state compute-optimal training requires doubling tokens proportionally with model parameters.',
      'Multi-head attention projects inputs into multiple distinct representation subspaces.'
    ],
    formulaOrRule: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
    flashcards: [
      { question: 'Why is the dot product divided by sqrt(d_k)?', answer: 'To prevent large values from pushing the softmax function into regions with extremely small gradients (vanishing gradient problem).' },
      { question: 'What are Chinchilla scaling laws?', answer: 'Empirical laws demonstrating that model size and training tokens should be scaled in equal proportion for optimal cross-entropy compute efficiency.' }
    ],
    diagnosticQuiz: [
      {
        question: 'What is the computational complexity of standard self-attention over sequence length N?',
        options: ['O(N^2)', 'O(N log N)', 'O(N)', 'O(2^N)'],
        correctIndex: 0,
        explanation: 'Standard all-to-all attention requires computing an N x N dot product matrix between every pair of tokens.'
      }
    ],
    masteryStatus: 'learning'
  },
  {
    id: 'top_quantum_entanglement',
    title: 'Quantum Superposition & Bell State Entanglement',
    category: 'Quantum Computing',
    difficulty: 'Foundation',
    estimatedMinutes: 6,
    summary: 'Quantum qubits exist in linear combinations of orthonormal basis states |0⟩ and |1⟩, enabling non-local quantum correlations and Bell pairs.',
    keyTakeaways: [
      'State vector |ψ⟩ = α|0⟩ + β|1⟩ with probability normalization |α|^2 + |β|^2 = 1.',
      'Hadamard gates transform basis states into equal-probability superposition states.',
      'CNOT gate combined with Hadamard generates maximally entangled Bell states.',
      'Measurement irreversibly collapses the wavefunction into an eigenstate.'
    ],
    formulaOrRule: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
    flashcards: [
      { question: 'What gate creates equal superposition from |0⟩?', answer: 'The Hadamard gate (H gate), which maps |0⟩ to (|0⟩ + |1⟩) / √2.' },
      { question: 'Can quantum entanglement transmit information faster than light?', answer: 'No. The No-Communication Theorem proves that local measurement outcomes remain random without a classical communication channel.' }
    ],
    diagnosticQuiz: [
      {
        question: 'If a qubit is in state (|0⟩ + |1⟩)/√2, what is the probability of measuring |0⟩?',
        options: ['50% (1/2)', '100%', '25%', '0%'],
        correctIndex: 0,
        explanation: 'The probability is the square of the amplitude magnitude: |1/√2|^2 = 1/2 = 50%.'
      }
    ],
    masteryStatus: 'unstarted'
  },
  {
    id: 'top_neuromorphic_spiking',
    title: 'Spiking Neural Networks & STDP Plasticity',
    category: 'Cybernetics & Robotics',
    difficulty: 'Advanced',
    estimatedMinutes: 9,
    summary: 'Third-generation biological neural models compute with temporal event spikes and sub-threshold membrane potentials rather than continuous activations.',
    keyTakeaways: [
      'Leaky Integrate-and-Fire (LIF) models accumulate charge until reaching threshold V_th.',
      'Spike-Timing-Dependent Plasticity (STDP) modifies synaptic weights based on pre- and post-synaptic spike arrival times.',
      'Ultra-sparse energy consumption: energy is expended only during active voltage spikes (picojoules/op).',
      'Surrogate gradient descent overcomes non-differentiable step functions during backpropagation.'
    ],
    formulaOrRule: '\\tau_m \\frac{dV}{dt} = -(V - V_{\\text{rest}}) + R \\cdot I(t)',
    flashcards: [
      { question: 'What does STDP stand for?', answer: 'Spike-Timing-Dependent Plasticity: a biological learning rule where synapses strengthen if the pre-synaptic neuron fires before the post-synaptic neuron.' },
      { question: 'Why are Spiking Neural Networks ultra energy-efficient?', answer: 'They communicate asynchronously using sparse binary impulses (spikes); when neurons are idle, zero dynamic power is consumed.' }
    ],
    diagnosticQuiz: [
      {
        question: 'In STDP, if neuron A fires immediately BEFORE neuron B, the synapse from A to B is:',
        options: ['Strengthened (Long-Term Potentiation)', 'Depressed / Weakened', 'Destroyed', 'Inverted'],
        correctIndex: 0,
        explanation: 'Pre-before-post firing indicates causality and induces Long-Term Potentiation (LTP).'
      }
    ],
    masteryStatus: 'unstarted'
  },
  {
    id: 'top_bellman_rl',
    title: 'Markov Decision Processes & Bellman Equations',
    category: 'Artificial Intelligence',
    difficulty: 'Core',
    estimatedMinutes: 7,
    summary: 'Reinforcement learning formalizes sequential decision making under uncertainty through state-action value functions and dynamic programming.',
    keyTakeaways: [
      'The Markov Property states that future transitions depend solely on the current state and action.',
      'Bellman Optimality Equation defines the optimal value recursively as immediate reward plus discounted maximum future value.',
      'Policy gradient methods optimize parameters directly through the REINFORCE theorem.',
      'Q-learning updates state-action values off-policy using temporal difference error.'
    ],
    formulaOrRule: 'Q^*(s, a) = R(s, a) + \\gamma \\sum_{s\'} P(s\' | s, a) \\max_{a\'} Q^*(s\', a\')',
    flashcards: [
      { question: 'What role does discount factor γ (gamma) play in RL?', answer: 'It weights the importance of immediate rewards versus future long-term rewards (0 ≤ γ < 1).' },
      { question: 'What distinguishes on-policy from off-policy algorithms?', answer: 'On-policy (e.g. SARSA) evaluates and improves the policy used to collect data; off-policy (e.g. Q-learning) learns the optimal policy regardless of the exploration policy.' }
    ],
    diagnosticQuiz: [
      {
        question: 'What does a discount factor γ = 0 mean in RL?',
        options: ['The agent cares only about immediate reward', 'The agent plans infinitely far ahead', 'All rewards become negative', 'The agent cannot learn'],
        correctIndex: 0,
        explanation: 'When γ = 0, all future rewards are discounted to zero, making the agent completely myopic.'
      }
    ],
    masteryStatus: 'learning'
  },
  {
    id: 'top_discrete_graphs',
    title: 'Spectral Graph Theory & Laplacian Eigenmaps',
    category: 'Mathematics & Discrete Calculus',
    difficulty: 'Advanced',
    estimatedMinutes: 11,
    summary: 'Analyzing graph properties via the eigenvalues and eigenvectors of adjacency and graph Laplacian matrices, underpinning Graph Neural Networks.',
    keyTakeaways: [
      'Unnormalized Graph Laplacian is defined as L = D - A (Degree minus Adjacency).',
      'The number of connected components equals the multiplicity of zero eigenvalues in L.',
      'Fiedler vector (second smallest eigenvector) provides optimal spectral bi-partitioning.',
      'Graph convolution operates as polynomial filtering in the Laplacian spectral domain.'
    ],
    formulaOrRule: 'L = D - A, \\quad \\tilde{L} = D^{-1/2} (D - A) D^{-1/2}',
    flashcards: [
      { question: 'What is the Graph Laplacian matrix?', answer: 'L = D - A, where D is the diagonal degree matrix and A is the adjacency matrix.' },
      { question: 'What does the Fiedler vector represent?', answer: 'The eigenvector corresponding to the second smallest eigenvalue of L, used for optimal spectral graph clustering and graph partitioning.' }
    ],
    diagnosticQuiz: [
      {
        question: 'If a graph has 3 disconnected subgraphs, what is the multiplicity of eigenvalue 0 in its Laplacian?',
        options: ['3', '0', '1', '6'],
        correctIndex: 0,
        explanation: 'The algebraic multiplicity of eigenvalue 0 in the Graph Laplacian strictly equals the number of connected components.'
      }
    ],
    masteryStatus: 'unstarted'
  }
];

export const TopicExplorerView: React.FC<TopicExplorerViewProps> = ({
  currentUser,
  onAskAi,
  onAddXp
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTopic, setActiveTopic] = useState<TopicConcept | null>(null);
  
  // Interactive Topic Study Sub-Views
  const [studyTab, setStudyTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary');
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  
  // Diagnostic Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [topicsState, setTopicsState] = useState<TopicConcept[]>(CURRICULUM_TOPICS);

  const categories = ['All', ...Array.from(new Set(topicsState.map(t => t.category)))];

  const filteredTopics = topicsState.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const masteredCount = topicsState.filter(t => t.masteryStatus === 'mastered').length;
  const learningCount = topicsState.filter(t => t.masteryStatus === 'learning').length;
  const totalCount = topicsState.length;
  const progressPercent = Math.round((masteredCount / totalCount) * 100);

  // Handle Diagnostic Quiz Submission
  const handleQuizSubmit = (topic: TopicConcept) => {
    sounds.playSuccess();
    setQuizSubmitted(true);
    
    // Check if passed
    const correctCount = topic.diagnosticQuiz.reduce((acc, q, idx) => {
      return acc + (quizAnswers[idx] === q.correctIndex ? 1 : 0);
    }, 0);

    if (correctCount === topic.diagnosticQuiz.length) {
      // Mark as mastered
      setTopicsState(prev => prev.map(t => t.id === topic.id ? { ...t, masteryStatus: 'mastered' } : t));
      onAddXp?.(50, `Mastered Topic: ${topic.title}`);
    } else {
      setTopicsState(prev => prev.map(t => t.id === topic.id ? { ...t, masteryStatus: 'learning' } : t));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Galaxy Header Banner */}
      <div className="glass-panel-galaxy p-6 sm:p-8 mb-8 relative overflow-hidden border border-cyan-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/40 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                <Atom className="w-7 h-7 text-cyan-300 animate-spin-slow" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display glow-galaxy">
                  Curriculum Galaxy & Topic Atlas
                </h1>
                <p className="text-sm text-slate-300">
                  Comprehensive concept explorer, rapid revisions, mathematical foundations & diagnostic mastery checks.
                </p>
              </div>
            </div>
          </div>

          {/* Mastery Progress Gauge */}
          <div className="glass-panel p-4 rounded-2xl min-w-[280px] border border-purple-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Syllabus Mastery
              </span>
              <span className="font-mono text-cyan-300 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-700" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="text-emerald-400">{masteredCount} Mastered</span>
              <span className="text-amber-400">{learningCount} In Progress</span>
              <span>{totalCount - masteredCount - learningCount} Remaining</span>
            </div>
          </div>
        </div>

        {/* Search & Subject Category Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, formulas, topics..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Grid of Interactive Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-400/50 transition-all group flex flex-col justify-between hover:shadow-[0_0_25px_rgba(56,189,248,0.15)] relative overflow-hidden"
          >
            <div>
              {/* Top Badge Row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  {topic.category}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    topic.difficulty === 'Foundation' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    topic.difficulty === 'Core' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {topic.difficulty}
                  </span>

                  <span className={`w-2 h-2 rounded-full ${
                    topic.masteryStatus === 'mastered' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' :
                    topic.masteryStatus === 'learning' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' :
                    'bg-slate-700'
                  }`} title={`Status: ${topic.masteryStatus}`} />
                </div>
              </div>

              {/* Title & Summary */}
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 line-clamp-1">
                {topic.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">
                {topic.summary}
              </p>

              {/* High-Yield Key Points Preview */}
              <div className="space-y-1.5 mb-4">
                {topic.keyTakeaways.slice(0, 2).map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="line-clamp-1">{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-mono">
                ~{topic.estimatedMinutes} min read
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onAskAi(`Explain the concept of "${topic.title}" with mathematical intuition and a real-world application.`);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                  title="Ask AI Mentor"
                >
                  <Bot className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    sounds.playWarp();
                    setActiveTopic(topic);
                    setStudyTab('summary');
                    setFlippedCards({});
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="btn-galaxy px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Study Topic</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULL TOPIC STUDY SHEET MODAL */}
      {activeTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="glass-panel-galaxy w-full max-w-4xl max-h-[92vh] rounded-3xl border border-cyan-400/40 flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                  <BookOpen className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase font-bold text-cyan-400">
                    {activeTopic.category} • {activeTopic.difficulty}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{activeTopic.title}</h2>
                </div>
              </div>

              <button
                onClick={() => setActiveTopic(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs: Key Summary vs Interactive Flashcards vs Diagnostic Test */}
            <div className="px-6 py-2 border-b border-white/10 bg-slate-900/60 flex items-center gap-2">
              <button
                onClick={() => { sounds.playClick(); setStudyTab('summary'); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  studyTab === 'summary'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                <span>Executive Summary & Formulas</span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setStudyTab('flashcards'); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  studyTab === 'flashcards'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Interactive Flashcards ({activeTopic.flashcards.length})</span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setStudyTab('quiz'); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  studyTab === 'quiz'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Test Mastery (Quiz)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* TAB 1: EXECUTIVE SUMMARY & FORMULAS */}
              {studyTab === 'summary' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                      Core Concept Overview
                    </h3>
                    <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/70 p-4 rounded-xl border border-white/5">
                      {activeTopic.summary}
                    </p>
                  </div>

                  {/* Mathematical Foundations / Formula */}
                  {activeTopic.formulaOrRule && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                        Mathematical Formulation & Core Axiom
                      </h3>
                      <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 text-center font-mono text-cyan-300 text-sm shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]">
                        {activeTopic.formulaOrRule}
                      </div>
                    </div>
                  )}

                  {/* High-Yield Key Takeaways */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                      High-Yield Exam Takeaways
                    </h3>
                    <div className="space-y-2.5">
                      {activeTopic.keyTakeaways.map((pt, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-200">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INTERACTIVE FLASHCARDS */}
              {studyTab === 'flashcards' && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-slate-400">
                    Click any card to flip between the conceptual challenge and verified academic explanation.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTopic.flashcards.map((fc, idx) => {
                      const isFlipped = flippedCards[idx] || false;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            sounds.playClick();
                            setFlippedCards(prev => ({ ...prev, [idx]: !isFlipped }));
                          }}
                          className={`cursor-pointer p-6 rounded-2xl min-h-[160px] flex flex-col justify-between border transition-all duration-300 ${
                            isFlipped
                              ? 'bg-purple-950/60 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                              : 'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-400'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2">
                            <span>CARD #{idx + 1}</span>
                            <span className="text-cyan-400 font-bold">{isFlipped ? 'REVERSE (EXPLANATION)' : 'FRONT (QUESTION)'}</span>
                          </div>

                          <div className="my-auto text-sm font-semibold text-white">
                            {isFlipped ? fc.answer : fc.question}
                          </div>

                          <div className="text-[10px] text-slate-500 text-right mt-3">
                            Click to flip ↷
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: DIAGNOSTIC MASTERY TEST */}
              {studyTab === 'quiz' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Diagnostic Mastery Assessment</h3>
                      <p className="text-xs text-slate-400">Answer correctly to achieve verified topic mastery (+50 XP).</p>
                    </div>
                    {activeTopic.masteryStatus === 'mastered' && (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        Mastered
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    {activeTopic.diagnosticQuiz.map((q, qIdx) => (
                      <div key={qIdx} className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                        <div className="text-xs font-bold text-white">
                          {qIdx + 1}. {q.question}
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[qIdx] === optIdx;
                            let style = 'bg-slate-950 border-white/10 text-slate-300 hover:border-cyan-400/50';
                            
                            if (quizSubmitted) {
                              if (optIdx === q.correctIndex) {
                                style = 'bg-emerald-950/60 border-emerald-400 text-emerald-200';
                              } else if (isSelected && optIdx !== q.correctIndex) {
                                style = 'bg-rose-950/60 border-rose-400 text-rose-200';
                              }
                            } else if (isSelected) {
                              style = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={quizSubmitted}
                                onClick={() => {
                                  sounds.playClick();
                                  setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                                }}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${style}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && optIdx === q.correctIndex && (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 mt-2">
                            <span className="font-bold text-cyan-400 block mb-0.5">Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={() => handleQuizSubmit(activeTopic)}
                      disabled={Object.keys(quizAnswers).length < activeTopic.diagnosticQuiz.length}
                      className="btn-galaxy w-full py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                    >
                      Submit Diagnostic Evaluation (+50 XP)
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                      }}
                      className="btn-outline-teal w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Diagnostic</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-950/90 flex items-center justify-between">
              <button
                onClick={() => {
                  sounds.playClick();
                  onAskAi(`Give me an advanced challenge question and step-by-step breakdown on ${activeTopic.title}.`);
                  setActiveTopic(null);
                }}
                className="btn-outline-teal px-4 py-2 text-xs flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>Deep Dive with AI Mentor</span>
              </button>

              <button
                onClick={() => setActiveTopic(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold"
              >
                Close Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
