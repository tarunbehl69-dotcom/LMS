import React from 'react';
import { Award, CheckCircle2, Download, Printer, Sparkles, X } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface CertificateModalProps {
  studentName: string;
  courseTitle: string;
  certificateId: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  studentName,
  courseTitle,
  certificateId,
  onClose
}) => {
  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl p-1 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_50px_rgba(0,240,255,0.4)]">
        <div className="bg-slate-950 rounded-[22px] p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Subtle Cyber Background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hologram Header */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>VERIFIED CREDENTIAL • LEARNLOOP INFINITY 2.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide uppercase mb-2">
            Certificate of Mastery
          </h1>
          <p className="text-xs text-slate-400 font-serif italic mb-6">
            This document certifies that the university scholar named below has successfully satisfied all theoretical and practical curriculum criteria.
          </p>

          {/* Recipient Name */}
          <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent py-2 border-b-2 border-cyan-400/30 max-w-md mx-auto mb-6 font-mono">
            {studentName}
          </div>

          {/* Course Title */}
          <p className="text-xs text-slate-400 mb-2">for outstanding academic excellence in</p>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-8">
            {courseTitle}
          </h2>

          {/* Certificate Seal & Verification Footer */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 text-left text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Certificate ID</span>
              <span className="font-mono text-cyan-400 font-bold">{certificateId}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Issuance Date</span>
              <span className="text-slate-300 font-mono">November 3, 2026</span>
            </div>

            <div className="sm:text-right col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Accreditation</span>
              <span className="text-emerald-400 font-bold flex items-center sm:justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
