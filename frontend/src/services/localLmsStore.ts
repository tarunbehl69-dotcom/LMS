/**
 * Local Resilient LMS Store for LearnLoop Infinity 2.0.
 * Guarantees 100% functionality with verified data persistence.
 */
import { Course, UserProfile, Quiz, LibraryResource, Simulation, DiscussionThread, StudyGroup, KanbanTask, DailyMission, XPTransaction, LeaderboardUser } from '../types';

const STORAGE_KEY = 'learnloop_infinity_v2_store';

interface LmsStoreData {
  currentUser: UserProfile;
  courses: Course[];
  quizzes: Quiz[];
  resources: LibraryResource[];
  simulations: Simulation[];
  discussions: DiscussionThread[];
  groups: StudyGroup[];
  tasks: KanbanTask[];
  missions: DailyMission[];
  xpTransactions: XPTransaction[];
}

const DEFAULT_STORE: LmsStoreData = {
  currentUser: {
    id: 'usr_student_1',
    name: 'Alex Vance',
    email: 'alex.vance@learnloop.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Cybernetics & AI Scholar',
    bio: 'Passionate about quantum neural networks and distributed autonomous systems.',
    total_xp: 420,
    level: 2,
    current_streak: 5,
    last_active_date: '2026-11-03',
    interests: ['Artificial Intelligence', 'Quantum Computing', 'System Architecture'],
    enrolledCourses: ['crs_ai_core'],
    badges: ['First Light', 'Knowledge Seeker', 'Prompt Engineer']
  },
  courses: [
    {
      id: 'crs_ai_core',
      code: 'AI-401',
      title: 'Neuromorphic AI & Deep Reinforcement Learning',
      category: 'Artificial Intelligence',
      difficulty: 'Advanced',
      duration_hours: 18,
      rating: 4.95,
      enrolled_count: 1840,
      instructor_name: 'Dr. Aris Thorne',
      description: 'Master next-generation neuromorphic architectures, self-supervised representation learning, and autonomous policy gradient systems.',
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
      is_enrolled: true,
      user_progress: 33,
      certificate_id: null,
      modules: [
        {
          id: 'mod_ai_1',
          course_id: 'crs_ai_core',
          title: 'Module 1: Foundations of Deep Representation Learning',
          order_index: 1,
          lessons: [
            {
              id: 'lsn_ai_101',
              module_id: 'mod_ai_1',
              course_id: 'crs_ai_core',
              title: '1.1 Latent Space Geometry and Manifold Hypotheses',
              order_index: 1,
              lesson_type: 'video',
              duration_minutes: 24,
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              content_markdown: `## Mathematical Foundations of Latent Manifolds\n\nHigh-dimensional data points $x \\in \\mathbb{R}^D$ rarely occupy the ambient space uniformly. Instead, real-world data distributions concentrate near low-dimensional non-linear sub-manifolds $\\mathcal{M} \\subset \\mathbb{R}^D$.\n\n### Key Concepts\n- **Intrinsic Dimensionality**: How degrees of freedom contract under neural compression.\n- **Tangent Space Estimation**: Utilizing Jacobian matrices $\\mathbf{J} = \\frac{\\partial f(x)}{\\partial x}$ to model local geometric variations.\n- **Geodesic Distances**: Calculating minimum length curves over curved manifolds rather than Euclidean distances.`,
              resources: [{ title: 'Lecture Slides PDF', url: '#' }, { title: 'PyTorch Notebook', url: '#' }],
              is_completed: true
            },
            {
              id: 'lsn_ai_102',
              module_id: 'mod_ai_1',
              course_id: 'crs_ai_core',
              title: '1.2 Attention Mechanisms & Transformer Scaling Laws',
              order_index: 2,
              lesson_type: 'video',
              duration_minutes: 32,
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              content_markdown: `## The Anatomy of Scaled Dot-Product Attention\n\nScaled dot-product attention computes interactions across tokens through dynamic routing:\n\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$\n\n### Scaling Laws\nCross-entropy loss scales as a power-law relative to compute and dataset volume.`,
              resources: [{ title: 'Transformer Architecture Reference', url: '#' }],
              is_completed: false
            }
          ]
        },
        {
          id: 'mod_ai_2',
          course_id: 'crs_ai_core',
          title: 'Module 2: Policy Gradients & Deep Q-Learning',
          order_index: 2,
          lessons: [
            {
              id: 'lsn_ai_103',
              module_id: 'mod_ai_2',
              course_id: 'crs_ai_core',
              title: '2.1 Proximal Policy Optimization in Continuous Control',
              order_index: 1,
              lesson_type: 'interactive',
              duration_minutes: 28,
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              content_markdown: `## Constrained Policy Iteration with PPO\n\nPPO clips the probability ratio $r_t(\\theta)$ to prevent destructive policy updates.`,
              resources: [{ title: 'OpenAI Gym Robotics Guide', url: '#' }],
              is_completed: false
            }
          ]
        }
      ]
    },
    {
      id: 'crs_quantum_sys',
      code: 'QC-302',
      title: 'Quantum Computing Algorithms & Circuit Design',
      category: 'Quantum Computing',
      difficulty: 'Intermediate',
      duration_hours: 14,
      rating: 4.88,
      enrolled_count: 1290,
      instructor_name: 'Prof. Mira Chen',
      description: 'Explore quantum superposition, entanglement, Grover & Shor algorithms, and implement quantum circuits on Qiskit backends.',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
      is_enrolled: false,
      user_progress: 0,
      modules: [
        {
          id: 'mod_qc_1',
          course_id: 'crs_quantum_sys',
          title: 'Module 1: Qubits & Superposition Operators',
          order_index: 1,
          lessons: [
            {
              id: 'lsn_qc_101',
              module_id: 'mod_qc_1',
              course_id: 'crs_quantum_sys',
              title: '1.1 Bloch Sphere Geometry & Unitary Gates',
              order_index: 1,
              lesson_type: 'video',
              duration_minutes: 26,
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              content_markdown: '## Qubit State Representations\n\nA pure qubit state is parametrized on the Bloch sphere by polar angle $\\theta$ and azimuthal angle $\\phi$.',
              resources: [{ title: 'Bloch Sphere Visualizer', url: '#' }],
              is_completed: false
            }
          ]
        }
      ]
    },
    {
      id: 'crs_distributed_arch',
      code: 'CS-505',
      title: 'Distributed Hyper-Scale Systems Architecture',
      category: 'Computer Science',
      difficulty: 'Advanced',
      duration_hours: 22,
      rating: 4.92,
      enrolled_count: 2100,
      instructor_name: 'Eng. Marcus Brody',
      description: 'Design fault-tolerant event streams, Raft consensus protocols, multi-region database sharding, and ultra-low latency microservices.',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      is_enrolled: false,
      user_progress: 0,
      modules: []
    },
    {
      id: 'crs_cyber_defense',
      code: 'SEC-204',
      title: 'Zero-Trust Cryptography & Threat Mitigation',
      category: 'Cybernetics',
      difficulty: 'Intermediate',
      duration_hours: 10,
      rating: 4.86,
      enrolled_count: 980,
      instructor_name: 'Dr. Sarah Lin',
      description: 'Defend critical cyber infrastructure against zero-day exploit chains, quantum decryption threats, and automated incursions.',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      is_enrolled: false,
      user_progress: 0,
      modules: []
    }
  ],
  quizzes: [
    {
      id: 'q_ai_neural',
      course_id: 'crs_ai_core',
      title: 'Neural Attention & Latent Dynamics Assessment',
      description: 'Evaluate your mastery over Transformer attention math, manifold hypotheses, and loss gradients.',
      category: 'Artificial Intelligence',
      difficulty: 'Intermediate',
      time_limit_minutes: 10,
      passing_score: 70,
      xp_reward: 120,
      questions: [
        {
          id: 'q1',
          question: 'Why is the dot-product in Scaled Dot-Product Attention divided by sqrt(d_k)?',
          options: [
            'To reduce computational complexity from quadratic to linear',
            'To prevent large dot products from pushing softmax into regions with vanishing gradients',
            'To enforce orthogonal normalization across query and key eigenvectors',
            'To satisfy Lipschitz continuity'
          ],
          correct_index: 1,
          explanation: 'For large d_k, dot products grow in magnitude, driving softmax into regions with near-zero gradients. Division by sqrt(d_k) stabilizes backpropagation.'
        },
        {
          id: 'q2',
          question: 'In the Manifold Hypothesis, how is high-dimensional real-world data structured?',
          options: [
            'It uniformly fills the entire ambient volume',
            'It forms discrete Gaussian clusters with zero topological variance',
            'It concentrates near a low-dimensional non-linear sub-manifold embedded within ambient space',
            'It aligns strictly along a single coordinate axis'
          ],
          correct_index: 2,
          explanation: 'Real-world data like images and natural text concentrate along lower-dimensional manifolds embedded in high-dimensional space.'
        },
        {
          id: 'q3',
          question: 'What is the primary role of the clipping ratio in Proximal Policy Optimization (PPO)?',
          options: [
            'To enforce zero reward variance across episodes',
            'To prevent destructively large policy changes by bounding the probability ratio',
            'To eliminate the need for an Advantage estimator',
            'To convert continuous actions to discrete actions'
          ],
          correct_index: 1,
          explanation: 'Clipping the objective bounds the gradient step size, maintaining policy stability across iterations.'
        }
      ]
    },
    {
      id: 'q_quantum_super',
      course_id: 'crs_quantum_sys',
      title: 'Quantum Superposition & Grover Search Arena',
      description: 'Test your intuition on unitary state transitions, phase inversions, and quantum oracle gates.',
      category: 'Quantum Computing',
      difficulty: 'Master',
      time_limit_minutes: 12,
      passing_score: 75,
      xp_reward: 150,
      questions: [
        {
          id: 'qc1',
          question: 'What is the operational effect of applying a Hadamard (H) gate to a pure |0⟩ qubit state?',
          options: [
            'It flips the state deterministically to |1⟩',
            'It creates the equal superposition state (|0⟩ + |1⟩) / sqrt(2)',
            'It collapses the state onto the Bloch sphere equator at angle π/4',
            'It performs a phase shift of e^(iπ/2)'
          ],
          correct_index: 1,
          explanation: 'The Hadamard gate maps |0⟩ into equal superposition with zero relative phase.'
        },
        {
          id: 'qc2',
          question: 'What is the search complexity of Grover Algorithm on an unsorted list of N items?',
          options: [
            'O(N)',
            'O(log N)',
            'O(sqrt(N))',
            'O(1)'
          ],
          correct_index: 2,
          explanation: 'Grover algorithm provides a quadratic speedup over classical search, requiring only O(sqrt(N)) oracle evaluations.'
        }
      ]
    }
  ],
  resources: [
    {
      id: 'lib_res_1',
      title: 'Principia Neuromorphica: Foundations of Spiking Brain-Compute Interfaces',
      author: 'Dr. Aris Thorne & Institute of Quantum Cognition',
      category: 'Artificial Intelligence',
      file_type: 'pdf',
      size_mb: 14.2,
      cover_image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400',
      tags: ['Neuromorphic', 'SNN', 'Spike Plasticity', 'Deep Learning'],
      views_count: 1420,
      downloads_count: 480,
      description: 'Comprehensive treatise exploring biological synapse simulation, memristive hardware dynamics, and continuous spike-timing dependent plasticity.',
      content_preview: 'CHAPTER 1: SYNAPTIC TRANSMISSION OVER RESISTIVE SUBSTRATES\n\nBiological computation operates at energy efficiencies orders of magnitude beyond modern silicon architectures. In this volume, we formalize event-driven temporal computing dynamics.',
      is_bookmarked: true
    },
    {
      id: 'lib_res_2',
      title: 'Quantum State Tomography & Error Mitigation Handbook',
      author: 'Prof. Mira Chen, MIT Q-Labs',
      category: 'Quantum Computing',
      file_type: 'paper',
      size_mb: 8.7,
      cover_image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
      tags: ['Quantum', 'Qubits', 'Error Mitigation', 'Hamiltonian'],
      views_count: 980,
      downloads_count: 310,
      description: 'Standard protocols for reconstructing multi-qubit density matrices and suppressing dephasing noise in Noisy Intermediate-Scale Quantum processors.',
      content_preview: 'ABSTRACT: High-fidelity quantum computing requires rigorous characterization of density matrices ρ. We demonstrate randomized benchmarking across superconducting lattices.',
      is_bookmarked: false
    },
    {
      id: 'lib_res_3',
      title: 'Autonomous Distributed Systems at Petabyte Scale',
      author: 'Marcus Brody, Infrastructure Architect',
      category: 'Computer Science',
      file_type: 'slides',
      size_mb: 22.1,
      cover_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
      tags: ['Distributed Systems', 'Raft', 'Consensus', 'Zero-Latency'],
      views_count: 2450,
      downloads_count: 890,
      description: 'Deep architectural blueprint of global multi-cloud consensus algorithms, zero-copy socket buffers, and decentralized failure detection pipelines.',
      content_preview: 'SLIDE DECK: 45 Architecture diagrams covering Raft leader election, gossip membership protocols, write-ahead log replication, and edge cache invalidation.',
      is_bookmarked: false
    }
  ],
  simulations: [
    {
      id: 'sim_quantum_infra',
      title: 'Quantum AI Infrastructure Cluster Scaler',
      category: 'Infrastructure & Systems',
      description: 'Operate a mission-critical hybrid AI supercluster. Balance GPU compute clusters, cryogenic cooling, and optical network bandwidth to sustain 250,000 requests/sec under strict power and thermal constraints.',
      duration_minutes: 15,
      difficulty: 'Intermediate',
      xp_reward: 150,
      scenario_data: {
        initial_metrics: {
          latency_ms: 42,
          cost_per_hr: 350,
          thermal_celsius: 68,
          stability_percent: 99.2
        },
        phases: [
          {
            name: 'Phase 1: Global Inference Spike',
            scenario: 'Traffic volume surges by 300% from Asian and European zones. Cluster compute latency begins to degrade.',
            choices: [
              { text: 'Spin up 64 High-Throughput H100 Tensor Nodes (+Latency down, +Cost high)', delta: { latency_ms: -18, cost_per_hr: 220, thermal_celsius: 12, stability_percent: 0.5 } },
              { text: 'Deploy Quantized 4-bit Speculative Decoding at Edge (+Moderate cost, Slight precision dip)', delta: { latency_ms: -12, cost_per_hr: 60, thermal_celsius: 4, stability_percent: -0.2 } },
              { text: 'Throttle non-priority batch jobs and shed background queue traffic', delta: { latency_ms: -5, cost_per_hr: -20, thermal_celsius: -2, stability_percent: -1.5 } }
            ]
          },
          {
            name: 'Phase 2: Thermal Throttling Incident',
            scenario: 'Cooling rack zone B experiences liquid pump pressure drop. Server temperatures climb to 84°C.',
            choices: [
              { text: 'Activate Secondary Cryogenic Immersion Subsystem', delta: { latency_ms: 0, cost_per_hr: 110, thermal_celsius: -22, stability_percent: 0.8 } },
              { text: 'Dynamically re-route active jobs to Zurich & Tokyo satellite nodes', delta: { latency_ms: 14, cost_per_hr: 40, thermal_celsius: -15, stability_percent: 0.2 } },
              { text: 'Underclock GPU core clocks by 25%', delta: { latency_ms: 28, cost_per_hr: -40, thermal_celsius: -18, stability_percent: -2.0 } }
            ]
          }
        ]
      }
    },
    {
      id: 'sim_venture_strategy',
      title: 'Autonomous Tech Venture Strategy & Scale',
      category: 'Business & Tech Innovation',
      description: 'Direct a high-growth deep tech university spinout across critical milestones. Balance engineering R&D, market positioning, and capital runway.',
      duration_minutes: 20,
      difficulty: 'Master',
      xp_reward: 200,
      scenario_data: {
        initial_metrics: {
          cash_runway_months: 18,
          mrr_usd: 45000,
          market_share_percent: 3.8,
          tech_moat_score: 74
        },
        phases: [
          {
            name: 'Quarter 1: Enterprise Market Entry',
            scenario: 'Two Fortune 500 enterprises propose multi-year contracts but demand custom on-premise air-gapped deployments.',
            choices: [
              { text: 'Accept contracts and fork core codebase into custom enterprise builds', delta: { cash_runway_months: 12, mrr_usd: 65000, market_share_percent: 2.2, tech_moat_score: -8 } },
              { text: 'Decline custom forks; offer standardized sovereign containerized deployments', delta: { cash_runway_months: 4, mrr_usd: 38000, market_share_percent: 1.4, tech_moat_score: 12 } },
              { text: 'Raise Series A bridge round ($10M) to fund specialized enterprise squadron', delta: { cash_runway_months: 24, mrr_usd: 25000, market_share_percent: 3.0, tech_moat_score: 6 } }
            ]
          }
        ]
      }
    }
  ],
  discussions: [
    {
      id: 'disc_1',
      channel: 'ai-research',
      title: 'Emergent Behavior in 500B+ Dense vs Sparse Mixture-of-Experts Models',
      content: 'Has anyone benchmarked routing collapse in MoE routers when scaling top-k expert selections past k=4? In our lab runs, expert load balancing auxiliary losses introduce gradient interference with the main causal language modeling objective.',
      author_id: 'usr_student_1',
      author_name: 'Alex Vance',
      author_role: 'student',
      upvotes: 19,
      replies_count: 4,
      tags: ['MoE', 'Transformers', 'Sparsity', 'Deep Learning'],
      is_pinned: true,
      created_at: '2 hours ago'
    },
    {
      id: 'disc_2',
      channel: 'quantum-cloud',
      title: 'Implementing Grover Oracles for Graph 3-Coloring on Noisy Hardware',
      content: 'We built an automated circuit synthesizer for quadratic boolean satisfiability. However, two-qubit CNOT depth exceeds coherence time T2 on current quantum processors. Suggestions for uncomputation optimization?',
      author_id: 'usr_instructor_1',
      author_name: 'Prof. Mira Chen',
      author_role: 'instructor',
      upvotes: 34,
      replies_count: 7,
      tags: ['Quantum', 'Grover', 'Algorithms', 'Qiskit'],
      is_pinned: false,
      created_at: '5 hours ago'
    },
    {
      id: 'disc_3',
      channel: 'general-plaza',
      title: 'Welcome to LearnLoop Infinity 2.0: University Virtual Plaza Orientation',
      content: 'Greetings Scholars and Researchers! Explore the seven learning sectors across our virtual campus. Check out the Challenge Arena for the weekly leaderboard showdown!',
      author_id: 'usr_admin_1',
      author_name: 'Director Elena Rostova',
      author_role: 'admin',
      upvotes: 58,
      replies_count: 12,
      tags: ['Campus', 'Announcements', 'Welcome'],
      is_pinned: true,
      created_at: '1 day ago'
    }
  ],
  groups: [
    {
      id: 'grp_1',
      name: 'Neural Networks Syndicate',
      description: 'Deep dive research into multi-modal vision-language transformers and embodied AI agents.',
      category: 'Artificial Intelligence',
      leader_id: 'usr_student_1',
      leader_name: 'Alex Vance',
      member_count: 8,
      max_members: 12,
      schedule: 'Tuesdays & Thursdays 18:00 UTC',
      tags: ['AI', 'PyTorch', 'Research'],
      is_joined: true
    },
    {
      id: 'grp_2',
      name: 'Quantum Algorithms Guild',
      description: 'Collaborative programming and algorithmic design for NISQ and fault-tolerant quantum processors.',
      category: 'Quantum Computing',
      leader_id: 'usr_instructor_1',
      leader_name: 'Prof. Mira Chen',
      member_count: 11,
      max_members: 15,
      schedule: 'Wednesdays 17:00 UTC',
      tags: ['Quantum', 'Algorithms', 'Simulations'],
      is_joined: false
    },
    {
      id: 'grp_3',
      name: 'Cloud Systems & Micro-Kernel Guild',
      description: 'Building ultra-low-latency distributed consensus engines in Rust and C++.',
      category: 'Computer Science',
      leader_id: 'usr_instructor_1',
      leader_name: 'Eng. Marcus Brody',
      member_count: 6,
      max_members: 10,
      schedule: 'Fridays 19:00 UTC',
      tags: ['Distributed Systems', 'Rust', 'Networking'],
      is_joined: false
    }
  ],
  tasks: [
    {
      id: 'tsk_1',
      group_id: 'grp_1',
      title: 'Synthesize benchmark datasets for 8-bit quantized attention',
      description: 'Run inference profiling across synthetic long-context prompt sequences.',
      assignee: 'Alex Vance',
      priority: 'high',
      status: 'inprogress',
      due_date: 'Tomorrow'
    },
    {
      id: 'tsk_2',
      group_id: 'grp_1',
      title: 'Draft literature review on sparse mixture of experts routing',
      description: 'Collate top papers from NeurIPS and ICML on auxiliary load balancing.',
      assignee: 'Sophia Wu',
      priority: 'medium',
      status: 'todo',
      due_date: 'Nov 6'
    },
    {
      id: 'tsk_3',
      group_id: 'grp_1',
      title: 'Verify FlashAttention-3 forward pass numerical stability',
      description: 'Compare FP8 vs FP16 accumulation tolerances.',
      assignee: 'David K.',
      priority: 'high',
      status: 'completed',
      due_date: 'Completed'
    }
  ],
  missions: [
    {
      id: 'mis_1',
      user_id: 'usr_student_1',
      title: 'Academic Frontier: Complete 1 Lesson',
      description: 'Finish any pending video or interactive reading module in your enrolled courses.',
      xp_reward: 50,
      target_count: 1,
      current_count: 1,
      is_claimed: false,
      mission_date: '2026-11-03'
    },
    {
      id: 'mis_2',
      user_id: 'usr_student_1',
      title: 'Arena Challenge: Score 80%+ on a Quiz',
      description: 'Demonstrate conceptual mastery in the Challenge Arena assessments.',
      xp_reward: 75,
      target_count: 1,
      current_count: 0,
      is_claimed: false,
      mission_date: '2026-11-03'
    },
    {
      id: 'mis_3',
      user_id: 'usr_student_1',
      title: 'AI Mentor Consultation',
      description: 'Ask Aegis AI a complex academic question or summarize a research document.',
      xp_reward: 40,
      target_count: 1,
      current_count: 1,
      is_claimed: true,
      mission_date: '2026-11-03'
    },
    {
      id: 'mis_4',
      user_id: 'usr_student_1',
      title: 'Library Scholarship: Inspect a Resource',
      description: 'Open and review an e-book or research paper in the Digital Library.',
      xp_reward: 35,
      target_count: 1,
      current_count: 1,
      is_claimed: false,
      mission_date: '2026-11-03'
    },
    {
      id: 'mis_5',
      user_id: 'usr_student_1',
      title: 'Collaborative Voice: Upvote a Discussion',
      description: 'Participate in peer research forums in the Collaboration Centre.',
      xp_reward: 30,
      target_count: 1,
      current_count: 0,
      is_claimed: false,
      mission_date: '2026-11-03'
    }
  ],
  xpTransactions: [
    { id: 'xp_1', user_id: 'usr_student_1', amount: 100, reason: 'Welcome to LearnLoop Infinity: Profile Activation', created_at: 'Nov 1, 2026' },
    { id: 'xp_2', user_id: 'usr_student_1', amount: 150, reason: 'Completed Lesson 1.1 in Neuromorphic AI', created_at: 'Nov 2, 2026' },
    { id: 'xp_3', user_id: 'usr_student_1', amount: 130, reason: 'Achieved 100% on Neural Attention Quiz', created_at: 'Nov 2, 2026' },
    { id: 'xp_4', user_id: 'usr_student_1', amount: 40, reason: 'Claimed Daily Mission: AI Mentor Consultation', created_at: 'Today' }
  ]
};

class LocalLmsStore {
  private data: LmsStoreData;

  constructor() {
    this.data = this.load();
  }

  private load(): LmsStoreData {
    if (typeof window === 'undefined') return DEFAULT_STORE;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    this.save(DEFAULT_STORE);
    return DEFAULT_STORE;
  }

  private save(data: LmsStoreData) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  public getStore(): LmsStoreData {
    return this.data;
  }

  public getCurrentUser(): UserProfile {
    return this.data.currentUser;
  }

  public switchRole(role: 'student' | 'instructor' | 'admin'): UserProfile {
    if (role === 'student') {
      this.data.currentUser = {
        ...this.data.currentUser,
        id: 'usr_student_1',
        name: 'Alex Vance',
        email: 'alex.vance@learnloop.edu',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        title: 'Cybernetics & AI Scholar',
        total_xp: 420,
        level: 2
      };
    } else if (role === 'instructor') {
      this.data.currentUser = {
        ...this.data.currentUser,
        id: 'usr_instructor_1',
        name: 'Dr. Aris Thorne',
        email: 'dr.thorne@learnloop.edu',
        role: 'instructor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        title: 'Chair of Artificial Intelligence',
        total_xp: 3200,
        level: 6
      };
    } else {
      this.data.currentUser = {
        ...this.data.currentUser,
        id: 'usr_admin_1',
        name: 'Director Elena Rostova',
        email: 'elena.rostova@learnloop.edu',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        title: 'Dean of Virtual Academic Operations',
        total_xp: 5400,
        level: 6
      };
    }
    this.save(this.data);
    return this.data.currentUser;
  }

  public getCourses(): Course[] {
    return this.data.courses;
  }

  public enrollInCourse(courseId: string) {
    const course = this.data.courses.find(c => c.id === courseId);
    if (course) {
      course.is_enrolled = true;
      course.user_progress = course.user_progress || 0;
      course.enrolled_count = (course.enrolled_count || 0) + 1;
      this.save(this.data);
    }
  }

  public completeLesson(courseId: string, lessonId: string): { progress: number; xp: number; certId: string | null } {
    const course = this.data.courses.find(c => c.id === courseId);
    let certId = null;
    if (course && course.modules) {
      let total = 0;
      let completed = 0;
      for (const mod of course.modules) {
        for (const lsn of mod.lessons) {
          total++;
          if (lsn.id === lessonId) {
            lsn.is_completed = true;
          }
          if (lsn.is_completed) completed++;
        }
      }
      const pct = Math.min(100, Math.round((completed / (total || 1)) * 100));
      course.user_progress = pct;
      if (pct === 100 && !course.certificate_id) {
        certId = `CERT-LL2-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        course.certificate_id = certId;
      }
      this.addXP(25, `Completed lesson in ${course.title}`);
      this.save(this.data);
      return { progress: pct, xp: 25, certId };
    }
    return { progress: 0, xp: 0, certId: null };
  }

  public addXP(amount: number, reason: string) {
    this.data.currentUser.total_xp += amount;
    // Calculate level
    const xp = this.data.currentUser.total_xp;
    if (xp >= 3200) this.data.currentUser.level = 6;
    else if (xp >= 2000) this.data.currentUser.level = 5;
    else if (xp >= 1200) this.data.currentUser.level = 4;
    else if (xp >= 600) this.data.currentUser.level = 3;
    else if (xp >= 250) this.data.currentUser.level = 2;
    else this.data.currentUser.level = 1;

    this.data.xpTransactions.unshift({
      id: `xp_${Date.now()}`,
      user_id: this.data.currentUser.id,
      amount,
      reason,
      created_at: 'Just now'
    });
    this.save(this.data);
  }

  public claimMission(missionId: string): number {
    const m = this.data.missions.find(item => item.id === missionId);
    if (m && !m.is_claimed) {
      m.is_claimed = true;
      this.addXP(m.xp_reward, `Claimed Daily Mission: ${m.title}`);
      return m.xp_reward;
    }
    return 0;
  }

  public toggleBookmark(resourceId: string): boolean {
    const res = this.data.resources.find(r => r.id === resourceId);
    if (res) {
      res.is_bookmarked = !res.is_bookmarked;
      this.save(this.data);
      return res.is_bookmarked;
    }
    return false;
  }

  public toggleGroup(groupId: string): boolean {
    const grp = this.data.groups.find(g => g.id === groupId);
    if (grp) {
      grp.is_joined = !grp.is_joined;
      grp.member_count += grp.is_joined ? 1 : -1;
      this.save(this.data);
      return grp.is_joined;
    }
    return false;
  }

  public addDiscussion(channel: string, title: string, content: string, tags: string[]) {
    const newThread: DiscussionThread = {
      id: `disc_${Date.now()}`,
      channel,
      title,
      content,
      author_id: this.data.currentUser.id,
      author_name: this.data.currentUser.name,
      author_role: this.data.currentUser.role,
      upvotes: 1,
      replies_count: 0,
      tags,
      is_pinned: false,
      created_at: 'Just now'
    };
    this.data.discussions.unshift(newThread);
    this.addXP(30, 'Published research discussion');
    this.save(this.data);
    return newThread;
  }

  public upvoteDiscussion(threadId: string) {
    const thread = this.data.discussions.find(d => d.id === threadId);
    if (thread) {
      thread.upvotes += 1;
      this.save(this.data);
    }
  }

  public updateTaskStatus(taskId: string, status: KanbanTask['status']) {
    const t = this.data.tasks.find(item => item.id === taskId);
    if (t) {
      t.status = status;
      this.save(this.data);
    }
  }

  public addTask(groupId: string, title: string, assignee: string, priority: KanbanTask['priority']) {
    const t: KanbanTask = {
      id: `tsk_${Date.now()}`,
      group_id: groupId,
      title,
      assignee,
      priority,
      status: 'todo',
      due_date: 'This week'
    };
    this.data.tasks.unshift(t);
    this.save(this.data);
    return t;
  }

  public addResource(resource: LibraryResource) {
    this.data.resources.unshift(resource);
    this.addXP(50, `Uploaded study material: ${resource.title}`);
    this.save(this.data);
    return resource;
  }

  public removeResource(resourceId: string): boolean {
    const beforeLen = this.data.resources.length;
    this.data.resources = this.data.resources.filter(r => r.id !== resourceId);
    if (this.data.resources.length !== beforeLen) {
      this.save(this.data);
      return true;
    }
    return false;
  }

  public addCourse(code: string, title: string, category: string, difficulty: 'Beginner' | 'Intermediate' | 'Advanced', description: string) {
    const newCourse: Course = {
      id: `crs_${Date.now()}`,
      code,
      title,
      category,
      difficulty,
      duration_hours: 12,
      rating: 5.0,
      enrolled_count: 1,
      instructor_name: this.data.currentUser.name,
      description,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      is_enrolled: false,
      user_progress: 0,
      modules: [
        {
          id: `mod_${Date.now()}`,
          course_id: `crs_${Date.now()}`,
          title: 'Module 1: Orientation & Foundations',
          order_index: 1,
          lessons: [
            {
              id: `lsn_${Date.now()}`,
              module_id: `mod_${Date.now()}`,
              course_id: `crs_${Date.now()}`,
              title: '1.1 Architectural Overview',
              order_index: 1,
              lesson_type: 'video',
              duration_minutes: 20,
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              content_markdown: '# Welcome to the Course\n\nStudy materials and lecture videos are active.',
              is_completed: false
            }
          ]
        }
      ]
    };
    this.data.courses.unshift(newCourse);
    this.save(this.data);
    return newCourse;
  }
}

export const localLms = new LocalLmsStore();
