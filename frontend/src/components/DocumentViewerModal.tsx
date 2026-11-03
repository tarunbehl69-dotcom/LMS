import React, { useState, useEffect } from 'react';
import { LibraryResource } from '../types';
import { 
  X, 
  Presentation, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Bot, 
  BookOpen, 
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface DocumentViewerModalProps {
  resource: LibraryResource;
  onClose: () => void;
  onAskAi?: (prompt: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  resource,
  onClose,
  onAskAi
}) => {
  const isSlideDeck = resource.file_type === 'slides';
  
  // Slide Deck State
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const totalSlides = 12; // Standard simulated or extracted slides
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // PDF Viewer State
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 8;

  // Keyboard navigation for presentation slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide(prev => Math.min(totalSlides, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(1, prev - 1));
      } else if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Simulated content snippets based on current slide/page
  const slideContent = [
    { title: "Introduction to Neuromorphic Principles", bullets: ["Spike-timing-dependent plasticity (STDP)", "Sub-threshold analog computation", "Event-driven asynchronous signaling"] },
    { title: "Biological vs Synthetic Synapses", bullets: ["Synaptic weight updates under membrane potential limits", "Memristive crossbar arrays as analog memory", "Leakage current optimization"] },
    { title: "Energy Scalability & Dynamic Power", bullets: ["Orders of magnitude reduction in picojoules per MAC operation", "Sparse activation regimes", "Thermal dissipation comparison vs GPUs"] },
    { title: "Hardware Architectures (IBM TrueNorth & Intel Loihi)", bullets: ["Mesh router interconnect topology", "Microcode instruction sets for neuron models", "Multi-core synchronization"] },
    { title: "Algorithm Mapping & SNN Backpropagation", bullets: ["Surrogate gradient techniques for non-differentiable threshold functions", "Temporal coding vs rate coding", "Loss function adaptation"] },
    { title: "Autonomous Robotics Case Study", bullets: ["Ultra-low latency edge vision processing", "Closed-loop robotic arm stabilization", "Event camera integration"] }
  ];

  const activeSlideData = slideContent[(currentSlide - 1) % slideContent.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className={`glass-panel w-full ${isFullscreen ? 'h-full rounded-none' : 'max-w-5xl max-h-[92vh] rounded-2xl'} flex flex-col border border-white/20 overflow-hidden shadow-2xl transition-all`}>
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#0A0E13]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-[#2EC4B6]">
              {isSlideDeck ? (
                <Presentation className="w-5 h-5 text-[#F2A541]" strokeWidth={1.5} />
              ) : (
                <FileText className="w-5 h-5 text-[#2EC4B6]" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#EEF2F5] line-clamp-1">{resource.title}</h2>
              <div className="flex items-center gap-2 text-[11px] text-[#9AA7B2]">
                <span className="font-semibold text-[#2EC4B6]">{resource.category}</span>
                <span>•</span>
                <span>{isSlideDeck ? `${totalSlides} Slides` : `${totalPages} Pages`}</span>
                <span>•</span>
                <span>{resource.size_mb} MB</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ask AI Shortcut (Section 7.5 & Section 10) */}
            <button
              onClick={() => {
                sounds.playClick();
                onAskAi?.(`Explain the core mathematical concepts and key takeaways from ${resource.title}.`);
                onClose();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2EC4B6]/15 hover:bg-[#2EC4B6]/25 text-[#2EC4B6] border border-[#2EC4B6]/30 text-xs font-semibold transition-all"
            >
              <Bot className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Ask AI About This</span>
            </button>

            {/* Download Button */}
            {resource.download_url && (
              <a
                href={resource.download_url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-[#9AA7B2] hover:text-[#EEF2F5] hover:bg-white/5 transition-colors"
                title="Download original file"
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
              </a>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg text-[#9AA7B2] hover:text-[#EEF2F5] hover:bg-white/5 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#9AA7B2] hover:text-[#EEF2F5] hover:bg-white/5 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Display Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-[#070B10]">
          {isSlideDeck ? (
            /* 16:9 Presentation Stage */
            <div className="w-full max-w-4xl aspect-[16/9] glass-panel-amber p-8 sm:p-12 rounded-2xl flex flex-col justify-between border border-[#F2A541]/30 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#111821] to-[#0A0E13]">
              {/* Slide Background Subtle Geometric Grid */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#F2A541_1px,transparent_1px)] [background-size:24px_24px]" />

              <div className="relative z-10 flex justify-between items-start">
                <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[#F2A541]/20 text-[#F2A541] border border-[#F2A541]/30">
                  Slide {currentSlide} of {totalSlides}
                </span>
                <span className="text-xs text-[#9AA7B2] font-semibold uppercase tracking-widest">
                  {resource.category}
                </span>
              </div>

              <div className="relative z-10 my-auto">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#EEF2F5] mb-6">
                  {activeSlideData.title}
                </h3>
                <ul className="space-y-3 text-sm sm:text-base text-[#DCD8CF]">
                  {activeSlideData.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#F2A541] mt-2 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 flex justify-between items-center text-xs text-[#9AA7B2] border-t border-white/10 pt-3">
                <span>LearnLoop Infinity 2.0 • Academic Syndicate</span>
                <span>{resource.author}</span>
              </div>
            </div>
          ) : (
            /* PDF Document Page View */
            <div 
              className="w-full max-w-3xl glass-panel p-8 sm:p-12 rounded-xl border border-white/10 bg-white text-[#14181D] shadow-2xl transition-all"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center text-xs text-gray-500 font-mono">
                <span>{resource.title}</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>

              <div className="prose max-w-none text-gray-800 text-sm leading-relaxed space-y-4">
                <h2 className="text-xl font-bold text-gray-950">{resource.title}</h2>
                <p className="text-gray-600 italic">Author: {resource.author} • Subject: {resource.category}</p>
                
                <h4 className="font-bold text-gray-900 mt-4">1. Abstract & System Formulation</h4>
                <p>
                  This research monograph articulates the thermodynamic scaling limits of computational nodes within distributed quantum-classical hybrid clusters. Through empirical observations across synthetic tensor workloads, we demonstrate that dynamic state vector caching produces a 42% reduction in memory bandwidth saturation.
                </p>

                <h4 className="font-bold text-gray-900 mt-4">2. Empirical Methodology</h4>
                <p>
                  Our benchmarks utilize high-dimensional graph neural networks across multi-GPU topological meshes. The objective function enforces invariance to continuous group transformations under Riemannian metric manifolds.
                </p>
                <div className="p-4 bg-gray-100 rounded border border-gray-200 font-mono text-xs text-gray-800">
                  L(θ) = E_x [ || f_θ(g · x) - g · f_θ(x) ||^2 ] + λ ||∇_x f_θ||^2
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation & Controls */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#0A0E13]/90 flex items-center justify-between">
          {isSlideDeck ? (
            /* Slide Deck Controls */
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    showSpeakerNotes
                      ? 'bg-[#F2A541]/20 text-[#F2A541] border-[#F2A541]/40'
                      : 'text-[#9AA7B2] hover:text-[#EEF2F5] border-white/10'
                  }`}
                >
                  Speaker Notes
                </button>
                <span className="text-xs text-[#9AA7B2] hidden sm:inline">Use [←] and [→] arrows to change slides</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={currentSlide === 1}
                  onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg border border-white/10 text-[#EEF2F5] hover:bg-white/10 disabled:opacity-40"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono font-bold text-[#F2A541]">
                  {currentSlide} / {totalSlides}
                </span>
                <button
                  disabled={currentSlide === totalSlides}
                  onClick={() => setCurrentSlide(prev => Math.min(totalSlides, prev + 1))}
                  className="p-1.5 rounded-lg border border-white/10 text-[#EEF2F5] hover:bg-white/10 disabled:opacity-40"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            /* PDF Controls */
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(60, prev - 15))}
                  className="p-1.5 rounded-lg border border-white/10 text-[#9AA7B2] hover:text-[#EEF2F5]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-[#EEF2F5]">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(160, prev + 15))}
                  className="p-1.5 rounded-lg border border-white/10 text-[#9AA7B2] hover:text-[#EEF2F5]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg border border-white/10 text-[#EEF2F5] hover:bg-white/10 disabled:opacity-40"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono font-bold text-[#2EC4B6]">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg border border-white/10 text-[#EEF2F5] hover:bg-white/10 disabled:opacity-40"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Speaker Notes Overlay */}
        {showSpeakerNotes && isSlideDeck && (
          <div className="px-6 py-4 bg-[#111821] border-t border-[#F2A541]/30 text-xs text-[#DCD8CF]">
            <span className="font-bold text-[#F2A541] block mb-1">Speaker Notes (Presenter Mode):</span>
            Emphasize that energy efficiency in spiking neural networks stems from sparsity in temporal action potentials, making analog neuromorphic devices ideal for continuous real-time edge processing.
          </div>
        )}
      </div>
    </div>
  );
};
