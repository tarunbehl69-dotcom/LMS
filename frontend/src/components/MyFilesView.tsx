import React, { useState, useEffect, useRef } from 'react';
import { LibraryResource, UserProfile } from '../types';
import { 
  Folder, 
  FileText, 
  Presentation, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  HardDrive, 
  Clock, 
  ShieldCheck, 
  Plus, 
  X, 
  FileUp,
  Search,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

interface MyFilesViewProps {
  currentUser: UserProfile;
  resources: LibraryResource[];
  onRefreshData: () => void;
  onOpenViewer?: (resource: LibraryResource) => void;
}

export const MyFilesView: React.FC<MyFilesViewProps> = ({
  currentUser,
  resources,
  onRefreshData,
  onOpenViewer
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'trash' | 'audit'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quota, setQuota] = useState<{ mb_used: number; mb_limit: number; percent_used: number }>({
    mb_used: 176.0,
    mb_limit: 1024.0,
    percent_used: 17.2
  });
  const [trashedDocs, setTrashedDocs] = useState<LibraryResource[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('Artificial Intelligence');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Undo Toast State (10-second undo for Detach)
  const [undoToast, setUndoToast] = useState<{ message: string; docId: string } | null>(null);
  const undoTimeoutRef = useRef<any>(null);

  // Permanent Delete Modal
  const [permanentTarget, setPermanentTarget] = useState<LibraryResource | null>(null);
  const [isDeletingPermanent, setIsDeletingPermanent] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load quota, trash, and audit logs
  const loadAuxData = async () => {
    try {
      const [qData, tData, aData] = await Promise.all([
        api.getStorageQuota(currentUser.id),
        api.getTrashDocuments(),
        api.getDocumentAuditLog()
      ]);
      setQuota(qData);
      setTrashedDocs(tData);
      setAuditLog(aData);
    } catch (e) {
      console.warn('Could not load aux files data', e);
    }
  };

  useEffect(() => {
    loadAuxData();
  }, [currentUser.id]);

  // Filter user's active files
  const activeUserFiles = resources.filter(r => {
    const isUserDoc = r.is_user_uploaded || r.author === currentUser.name;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return isUserDoc && matchesSearch;
  });

  // Handle Drag & Drop
  const handleFileSelect = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'pptx', 'ppt'].includes(ext || '')) {
      setUploadError('Only PDF and PowerPoint (.ppt, .pptx) files are supported.');
      return;
    }
    setUploadError(null);
    setUploadFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadProgress(25);
    sounds.playClick();

    try {
      setUploadProgress(60);
      const res = await api.uploadResource(
        uploadFile,
        uploadTitle,
        uploadCategory,
        currentUser.name,
        uploadDescription
      );
      setUploadProgress(100);
      sounds.playSuccess();
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      onRefreshData();
      loadAuxData();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please check file format.');
    } finally {
      setIsUploading(false);
    }
  };

  // Level 1: Detach (shows 10s undo toast)
  const handleDetach = (doc: LibraryResource) => {
    sounds.playClick();
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setUndoToast({ message: `Detached '${doc.title}' from current context.`, docId: doc.id });
    undoTimeoutRef.current = setTimeout(() => {
      setUndoToast(null);
    }, 10000);
  };

  // Level 2: Move to Trash
  const handleMoveToTrash = async (doc: LibraryResource) => {
    sounds.playClick();
    await api.moveToTrash(doc.id);
    onRefreshData();
    loadAuxData();
  };

  // Restore from Trash
  const handleRestore = async (doc: LibraryResource) => {
    sounds.playSuccess();
    await api.restoreFromTrash(doc.id);
    onRefreshData();
    loadAuxData();
  };

  // Level 3: Permanent Delete
  const handleConfirmPermanentDelete = async () => {
    if (!permanentTarget) return;
    setIsDeletingPermanent(true);
    sounds.playClick();
    try {
      await api.deletePermanent(permanentTarget.id);
      setPermanentTarget(null);
      onRefreshData();
      loadAuxData();
    } finally {
      setIsDeletingPermanent(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Storage Quota Meter */}
      <div className="glass-panel p-6 mb-8 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#2EC4B6]/15 border border-[#2EC4B6]/30">
                <Folder className="w-6 h-6 text-[#2EC4B6]" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#EEF2F5]">My Academic Files</h1>
                <p className="text-sm text-[#9AA7B2]">Central document system for verified PDFs & PowerPoint presentations</p>
              </div>
            </div>
          </div>

          {/* Storage Quota Gauge (Section 7.2) */}
          <div className="glass-panel-teal p-4 rounded-xl flex flex-col gap-2 min-w-[280px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#EEF2F5] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#2EC4B6]" strokeWidth={1.5} />
                Storage Quota
              </span>
              <span className="font-mono text-[#2EC4B6]">{quota.mb_used} MB / {quota.mb_limit} MB</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  quota.percent_used > 85 ? 'bg-[#FF6B5E]' : 'bg-[#2EC4B6]'
                }`}
                style={{ width: `${Math.min(100, quota.percent_used)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#9AA7B2]">
              <span>{quota.percent_used}% Allocated</span>
              <span>1 GB Default</span>
            </div>
          </div>

          {/* Add Files Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowUploadModal(true);
            }}
            className="btn-teal px-5 py-3 flex items-center gap-2 shadow-[0_0_15px_rgba(46,196,182,0.3)] shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Add PDF or PPT</span>
          </button>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('active'); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40'
                  : 'text-[#9AA7B2] hover:text-[#EEF2F5]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Active Documents ({activeUserFiles.length})</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); setActiveTab('trash'); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'trash'
                  ? 'bg-[#FF6B5E]/20 text-[#FF6B5E] border border-[#FF6B5E]/40'
                  : 'text-[#9AA7B2] hover:text-[#EEF2F5]'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Trash ({trashedDocs.length})</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); setActiveTab('audit'); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-[#F2A541]/20 text-[#F2A541] border border-[#F2A541]/40'
                  : 'text-[#9AA7B2] hover:text-[#EEF2F5]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Audit Log</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#9AA7B2] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#0A0E13] border border-white/10 text-xs text-[#EEF2F5] focus:outline-none focus:border-[#2EC4B6]"
            />
          </div>
        </div>
      </div>

      {/* 10-Second Undo Toast for Detach Flow */}
      {undoToast && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel-amber p-4 rounded-xl flex items-center gap-4 shadow-2xl animate-fade-in border border-[#F2A541]/40">
          <Clock className="w-5 h-5 text-[#F2A541]" strokeWidth={1.5} />
          <div className="text-xs text-[#EEF2F5] font-medium">{undoToast.message}</div>
          <button
            onClick={() => {
              sounds.playSuccess();
              if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
              setUndoToast(null);
            }}
            className="px-3 py-1 rounded bg-[#F2A541] text-[#0A0E13] font-bold text-xs hover:bg-[#ffb454]"
          >
            Undo (10s)
          </button>
        </div>
      )}

      {/* TAB 1: ACTIVE DOCUMENTS */}
      {activeTab === 'active' && (
        <div>
          {activeUserFiles.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/10">
              <FileUp className="w-12 h-12 text-[#9AA7B2] mx-auto mb-3 opacity-50" strokeWidth={1.5} />
              <h3 className="text-lg font-bold text-[#EEF2F5] mb-1">No uploaded files found</h3>
              <p className="text-sm text-[#9AA7B2] max-w-md mx-auto mb-6">
                Upload your course lecture slides (PPTX) or research papers (PDF) to access them anywhere in Infinity City.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-teal px-5 py-2 text-xs font-semibold"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeUserFiles.map((doc) => (
                <div
                  key={doc.id}
                  className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#2EC4B6]/40 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-white/5">
                        {doc.file_type === 'slides' ? (
                          <Presentation className="w-6 h-6 text-[#F2A541]" strokeWidth={1.5} />
                        ) : (
                          <FileText className="w-6 h-6 text-[#2EC4B6]" strokeWidth={1.5} />
                        )}
                      </div>
                      <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white/5 text-[#9AA7B2] border border-white/10">
                        {doc.size_mb} MB
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#EEF2F5] mb-1 group-hover:text-[#2EC4B6] transition-colors line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-[#9AA7B2] mb-3 line-clamp-2">
                      {doc.description || `Academic study material for ${doc.category}.`}
                    </p>

                    {/* "Where this file is used" chips (Section 7.6) */}
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-semibold text-[#9AA7B2] tracking-wider block mb-1">
                        Active In:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#2EC4B6]/10 text-[#2EC4B6] border border-[#2EC4B6]/20">
                          Digital Library
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#F2A541]/10 text-[#F2A541] border border-[#F2A541]/20">
                          AI Hub Mentorship
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-[#9AA7B2]">
                          {doc.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View, Detach, Move to Trash */}
                  <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenViewer?.(doc)}
                      className="btn-outline-teal px-3 py-1.5 text-xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Open Viewer</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDetach(doc)}
                        className="p-1.5 rounded-lg text-[#9AA7B2] hover:text-[#F2A541] hover:bg-white/5 transition-colors"
                        title="Detach (remove from current view only)"
                      >
                        <Layers className="w-4 h-4" strokeWidth={1.5} />
                      </button>

                      <button
                        onClick={() => handleMoveToTrash(doc)}
                        className="p-1.5 rounded-lg text-[#9AA7B2] hover:text-[#FF6B5E] hover:bg-white/5 transition-colors"
                        title="Move to Trash (Level 2 Removal - 30 days retention)"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRASH (30-day retention, restore, permanent delete) */}
      {activeTab === 'trash' && (
        <div>
          <div className="p-4 rounded-xl bg-[#FF6B5E]/10 border border-[#FF6B5E]/20 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF6B5E] shrink-0" strokeWidth={1.5} />
            <div className="text-xs text-[#EEF2F5]">
              Items in Trash are hidden everywhere in Infinity City. They are retained for <strong>30 days</strong> before automatic permanent deletion. You can restore them anytime or delete permanently now to immediately free storage quota.
            </div>
          </div>

          {trashedDocs.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/10">
              <CheckCircle2 className="w-12 h-12 text-[#7BD389] mx-auto mb-3 opacity-60" strokeWidth={1.5} />
              <h3 className="text-base font-bold text-[#EEF2F5] mb-1">Trash is empty</h3>
              <p className="text-xs text-[#9AA7B2]">No documents are currently scheduled for deletion.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trashedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-800 text-[#9AA7B2]">
                      {doc.file_type === 'slides' ? (
                        <Presentation className="w-5 h-5" strokeWidth={1.5} />
                      ) : (
                        <FileText className="w-5 h-5" strokeWidth={1.5} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#EEF2F5]">{doc.title}</h4>
                      <div className="text-[11px] text-[#9AA7B2] flex items-center gap-3 mt-0.5">
                        <span>{doc.category}</span>
                        <span>•</span>
                        <span>{doc.size_mb} MB</span>
                        <span>•</span>
                        <span className="text-[#FF6B5E]">Expires in 29 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestore(doc)}
                      className="px-3 py-1.5 rounded-lg bg-[#7BD389]/15 text-[#7BD389] hover:bg-[#7BD389]/25 text-xs font-semibold border border-[#7BD389]/30 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Restore</span>
                    </button>

                    <button
                      onClick={() => setPermanentTarget(doc)}
                      className="px-3 py-1.5 rounded-lg bg-[#FF6B5E]/15 text-[#FF6B5E] hover:bg-[#FF6B5E]/25 text-xs font-semibold border border-[#FF6B5E]/30 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Delete Forever</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIT LOG (Document Lifecycle Audits) */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="text-base font-bold text-[#EEF2F5] mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2EC4B6]" strokeWidth={1.5} />
            Cryptographic Document Lifecycle Audit Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#9AA7B2]">
              <thead className="border-b border-white/10 text-[#EEF2F5] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Target Document / Subject</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {auditLog.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#9AA7B2]">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLog.map((log, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                          log.action === 'uploaded' ? 'bg-[#7BD389]/20 text-[#7BD389]' :
                          log.action === 'trashed' ? 'bg-[#F2A541]/20 text-[#F2A541]' :
                          log.action === 'restored' ? 'bg-[#2EC4B6]/20 text-[#2EC4B6]' :
                          'bg-[#FF6B5E]/20 text-[#FF6B5E]'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#EEF2F5]">{log.target_name || log.document_id}</td>
                      <td className="py-3 px-4 text-[#9AA7B2] font-sans">{log.actor_name}</td>
                      <td className="py-3 px-4 text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-lg border border-white/20 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-[#2EC4B6]" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-[#EEF2F5]">Add Document (PDF or PPT)</h3>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-[#9AA7B2] hover:text-[#EEF2F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2EC4B6]/40 hover:border-[#2EC4B6] rounded-xl p-6 text-center cursor-pointer bg-slate-900/40 hover:bg-[#2EC4B6]/5 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <Upload className="w-8 h-8 text-[#2EC4B6] mx-auto mb-2 opacity-80" strokeWidth={1.5} />
                {uploadFile ? (
                  <div className="text-xs">
                    <span className="font-bold text-[#EEF2F5]">{uploadFile.name}</span>
                    <span className="text-[#9AA7B2] block mt-1">({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-semibold text-[#2EC4B6] block">Click to select or drag and drop</span>
                    <span className="text-[11px] text-[#9AA7B2]">Supported: PDF, PPTX, PPT (Up to 50 MB)</span>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-[#FF6B5E]/15 border border-[#FF6B5E]/30 text-xs text-[#FF6B5E]">
                  {uploadError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#EEF2F5] mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Neuromorphic Architecture Slide Deck"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E13] border border-white/10 text-xs text-[#EEF2F5] focus:outline-none focus:border-[#2EC4B6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#EEF2F5] mb-1">Academic Subject / Category</label>
                <input
                  type="text"
                  required
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Robotics, Law"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E13] border border-white/10 text-xs text-[#EEF2F5] focus:outline-none focus:border-[#2EC4B6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#EEF2F5] mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Summary of topics covered..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E13] border border-white/10 text-xs text-[#EEF2F5] focus:outline-none focus:border-[#2EC4B6]"
                />
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#2EC4B6]">
                    <span>Validating signature & extracting text...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-[#2EC4B6] transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-[#9AA7B2] hover:text-[#EEF2F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="btn-teal px-5 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  {isUploading ? 'Processing...' : 'Upload & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      {permanentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-md border border-[#FF6B5E]/30 animate-scale-in">
            <div className="flex items-center gap-3 text-[#FF6B5E] mb-3">
              <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />
              <h3 className="text-base font-bold text-[#EEF2F5]">Permanently Delete File?</h3>
            </div>
            <p className="text-xs text-[#9AA7B2] mb-4">
              This will permanently delete <strong>{permanentTarget.title}</strong> from server storage, remove all cached slide embeddings, and immediately free <strong>{permanentTarget.size_mb} MB</strong> from your quota. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPermanentTarget(null)}
                className="px-4 py-2 rounded-lg text-xs text-[#9AA7B2] hover:text-[#EEF2F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                disabled={isDeletingPermanent}
                className="px-4 py-2 rounded-lg bg-[#FF6B5E] hover:bg-[#e05649] text-white text-xs font-bold transition-all"
              >
                {isDeletingPermanent ? 'Purging...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
