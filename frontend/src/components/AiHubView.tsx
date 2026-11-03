import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, 
  Send, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  Calendar, 
  Layers, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  Key, 
  ShieldCheck, 
  Sliders,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

interface Message {
  id: string;
  sender: 'user' | 'aegis';
  text: string;
  timestamp: string;
  source?: string;
}

export const AiHubView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'chat' | 'summarize' | 'quiz' | 'flashcards' | 'roadmap'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'aegis',
      text: "Greetings, Scholar. I am Aegis AI, your Infinity Academic Mentor. I can explain complex technical phenomena, summarize study manuscripts, synthesize assessments, or formulate adaptive study schedules. How may I accelerate your mastery today?",
      timestamp: '10:00 AM',
      source: 'gemini-1.5'
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tool 2: Document Summarizer State
  const [docText, setDocText] = useState<string>('');
  const [docSummary, setDocSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  // Tool 3: Quiz Generator State
  const [quizTopic, setQuizTopic] = useState<string>('Quantum Error Correction');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);

  // Tool 4: Flashcards State
  const [flashcards, setFlashcards] = useState([
    { id: 1, front: 'What is the physical meaning of Bloch Sphere coordinates (θ, φ)?', back: 'θ specifies the relative probability amplitude between |0⟩ and |1⟩, while φ defines the relative quantum phase.', flipped: false },
    { id: 2, front: 'Why does PPO enforce clipped probability ratios?', back: 'To prevent large parameter updates that push policy trajectories into non-recoverable performance collapses.', flipped: false },
    { id: 3, front: 'How does Raft guarantee State Machine Safety?', back: 'By mandating that leaders contain all committed entries and only committing entries from their current term by quorum.', flipped: false }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const suggestedPrompts = [
    'Explain Quantum Superposition with an intuitive metaphor',
    'What is the mathematical justification for sqrt(d_k) in Attention?',
    'Summarize Raft consensus leader election rules',
    'How do Spiking Neural Networks differ from classical DNNs?'
  ];

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    sounds.playClick();
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const resp = await api.chatWithMentor(text);
      sounds.playSuccess();
      const botMsg: Message = {
        id: `a_${Date.now()}`,
        sender: 'aegis',
        text: resp.reply,
        timestamp: 'Just now',
        source: resp.source
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      // Fallback
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Summarizer Action
  const handleSummarize = async () => {
    if (!docText.trim()) return;
    sounds.playClick();
    setIsSummarizing(true);
    try {
      const res = await api.summarizeText(docText);
      setDocSummary(res.summary);
      sounds.playSuccess();
    } catch {}
    setIsSummarizing(false);
  };

  // Quiz Generator Action
  const handleGenerateQuiz = async () => {
    sounds.playClick();
    setIsGeneratingQuiz(true);
    try {
      const res = await api.generateAiQuiz(quizTopic);
      setGeneratedQuestions(res.questions || []);
      sounds.playSuccess();
    } catch {}
    setIsGeneratingQuiz(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">AI Innovation Hub</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold">
                Aegis AI Core
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Powered by Google Gemini 1.5 • Step-by-step conceptual mastery & study synthesis
            </p>
          </div>
        </div>

        {/* Feature Tool Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 relative z-10 flex-wrap">
          <button
            onClick={() => { sounds.playClick(); setActiveTool('chat'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTool === 'chat' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Mentor Chat
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTool('summarize'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTool === 'summarize' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Summarizer
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTool('quiz'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTool === 'quiz' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quiz Creator
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTool('flashcards'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTool === 'flashcards' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Flashcards
          </button>
        </div>
      </div>

      {/* TOOL 1: CHAT INTERFACE */}
      {activeTool === 'chat' && (
        <div className="glass-panel rounded-3xl border border-purple-500/20 flex flex-col h-[650px] overflow-hidden shadow-2xl">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {msg.sender === 'user' ? <Sparkles className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                </div>

                <div
                  className={`p-5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-100 rounded-tr-none'
                      : 'glass-panel bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="font-bold text-slate-400 text-[10px]">
                      {msg.sender === 'user' ? 'You (Scholar)' : 'Aegis Academic Mentor'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      {msg.sender === 'aegis' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="text-slate-400 hover:text-white transition-colors"
                          title="Copy Response"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-md">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Brain className="w-4 h-4 animate-spin" />
                </div>
                <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-slate-800 text-xs text-purple-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span>Aegis is formulating an academic proof...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Strip */}
          <div className="px-6 py-2.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Prompts:</span>
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-400/50 text-[11px] text-slate-300 hover:text-purple-300 whitespace-nowrap transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-purple-500/20 bg-slate-950 flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask Aegis AI any conceptual doubt, formula derivation, or exam question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 px-4 py-3 rounded-xl glass-panel bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="px-5 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Aegis</span>
            </button>
          </div>
        </div>
      )}

      {/* TOOL 2: DOCUMENT SUMMARIZER */}
      {activeTool === 'summarize' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Input Study Text or Syllabus</span>
            </h3>
            <textarea
              rows={12}
              placeholder="Paste raw lecture transcripts, research paper abstracts, or textbook chapters here..."
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              className="w-full p-4 rounded-2xl glass-panel bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none font-mono"
            />
            <div className="flex justify-between items-center">
              <button
                onClick={() => setDocText("The Transformer architecture dispenses with recurrence and convolutions entirely, relying solely on an attention mechanism to draw global dependencies between input and output. Scaled dot-product attention maps queries and keys of dimension d_k to values of dimension d_v. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.")}
                className="text-[11px] text-purple-400 hover:underline"
              >
                Insert Sample Text
              </button>
              <button
                onClick={handleSummarize}
                disabled={!docText.trim() || isSummarizing}
                className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                {isSummarizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isSummarizing ? 'Synthesizing...' : 'Generate Executive Summary'}</span>
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <h3 className="text-base font-bold text-white">Structured Output</h3>
            {docSummary ? (
              <div className="prose prose-invert max-w-none text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {docSummary}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <FileText className="w-12 h-12 text-slate-700 mb-2" />
                <span>Executive summary will generate here with key formulas and exam focus points.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 3: QUIZ CREATOR */}
      {activeTool === 'quiz' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Instant AI Assessment Synthesizer</h2>
              <p className="text-xs text-slate-400">Generate custom practice quizzes on any subject with full answer explanations.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="Enter topic..."
                className="px-3 py-2 rounded-xl glass-panel bg-slate-900 border border-slate-700 text-xs text-white"
              />
              <button
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-2"
              >
                {isGeneratingQuiz ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generate Quiz</span>
              </button>
            </div>
          </div>

          {generatedQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              {generatedQuestions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-white">{idx + 1}. {q.question}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {q.options.map((opt: string, oIdx: number) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border ${
                          oIdx === q.correct_index
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span className="font-semibold text-purple-400">Explanation:</span> {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: FLASHCARDS */}
      {activeTool === 'flashcards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Interactive Concept Flashcards</h2>
            <span className="text-xs text-slate-400">Click any card to flip</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flashcards.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  sounds.playClick();
                  setFlashcards(flashcards.map(c => c.id === card.id ? { ...c, flipped: !c.flipped } : c));
                }}
                className="h-64 rounded-3xl p-6 glass-panel border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-all transform hover:-translate-y-1 flex flex-col justify-between select-none"
              >
                <div className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                  {card.flipped ? 'Reverse Solution' : 'Prompt / Concept'}
                </div>
                <div className="text-sm font-semibold text-center text-white leading-relaxed">
                  {card.flipped ? card.back : card.front}
                </div>
                <div className="text-[10px] text-center text-slate-500">
                  Tap to flip
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
