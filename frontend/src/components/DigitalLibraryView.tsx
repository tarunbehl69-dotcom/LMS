import React, { useState, useRef } from 'react';
import { LibraryResource } from '../types';
import { 
  Library, 
  Search, 
  BookMarked, 
  Download, 
  Eye, 
  FileText, 
  Sparkles, 
  Plus, 
  X, 
  Check, 
  Bookmark, 
  Trash2,
  Upload,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Presentation,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

interface DigitalLibraryProps {
  resources: LibraryResource[];
  onToggleBookmark: (resourceId: string) => void;
  onRefreshData?: () => void;
}

const COMMON_SUBJECTS = [
  'Artificial Intelligence',
  'Quantum Computing',
  'Computer Science',
  'Cybernetics',
  'Space Systems',
  'Mathematics & Calculus',
  'Physics & Thermodynamics',
  'Biotechnology & Genetics',
  'Business & Venture Strategy',
  'Robotics & Automation',
  'Neuroscience',
  'Law & Cyber Ethics'
];

export const DigitalLibraryView: React.FC<DigitalLibraryProps> = ({ 
  resources, 
  onToggleBookmark,
  onRefreshData 
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTab, setSelectedTab] = useState<'all' | 'my-uploads' | 'ppts' | 'pdfs' | 'bookmarked'>('all');
  const [previewResource, setPreviewResource] = useState<LibraryResource | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('Artificial Intelligence');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Delete Confirmation State
  const [resourceToDelete, setResourceToDelete] = useState<LibraryResource | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived list of unique categories across all current resources
  const allCategories = ['All', ...Array.from(new Set([
    ...COMMON_SUBJECTS,
    ...resources.map(r => r.category)
  ]))];

  const filteredResources = resources.filter((r) => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    
    let matchesTab = true;
    if (selectedTab === 'my-uploads') {
      matchesTab = Boolean(r.is_user_uploaded);
    } else if (selectedTab === 'ppts') {
      matchesTab = r.file_type === 'slides';
    } else if (selectedTab === 'pdfs') {
      matchesTab = r.file_type === 'pdf' || r.file_type === 'paper';
    } else if (selectedTab === 'bookmarked') {
      matchesTab = Boolean(r.is_bookmarked);
    }

    return matchesSearch && matchesCat && matchesTab;
  });

  const handleOpenPreview = (r: LibraryResource) => {
    sounds.playClick();
    setPreviewResource(r);
    setPreviewZoom(100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-populate title if empty
      if (!uploadTitle.trim()) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setUploadTitle(nameWithoutExt.replace(/[_-]/g, ' '));
      }
    }
  };

  const handleExecuteUpload = async () => {
    if (!selectedFile) return;
    const finalSubject = (uploadCategory === 'CUSTOM' ? customCategory.trim() : uploadCategory) || 'General Studies';
    if (!uploadTitle.trim()) return;

    sounds.playClick();
    setIsUploading(true);

    try {
      const res = await api.uploadResource(
        selectedFile,
        uploadTitle.trim(),
        finalSubject,
        'Alex Vance',
        uploadDescription.trim() || undefined
      );
      sounds.playSuccess();
      setUploadSuccessMessage(`Successfully uploaded ${uploadTitle} (${finalSubject})!`);
      setSelectedFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setCustomCategory('');
      if (onRefreshData) onRefreshData();
      setTimeout(() => {
        setUploadSuccessMessage(null);
        setShowUploadModal(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to upload material', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    sounds.playClick();
    setIsDeleting(true);
    try {
      await api.deleteResource(resourceToDelete.id);
      sounds.playSuccess();
      setResourceToDelete(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to delete resource', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Library className="w-8 h-8 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Digital Library</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold">
                Central Repository
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Upload, preview, download, and manage PPT presentations and PDFs across any academic subject.
            </p>
          </div>
        </div>

        {/* Action Button: Upload PPT / PDF */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => { sounds.playClick(); setShowUploadModal(true); }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <Upload className="w-4 h-4 text-slate-950" />
            <span>Upload PPT / PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar (All Materials / My Uploads / PPTs / PDFs / Bookmarks) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => { sounds.playClick(); setSelectedTab('all'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'all' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Materials ({resources.length})
        </button>

        <button
          onClick={() => { sounds.playClick(); setSelectedTab('my-uploads'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedTab === 'my-uploads' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>My Uploaded Materials ({resources.filter(r => r.is_user_uploaded).length})</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); setSelectedTab('ppts'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedTab === 'ppts' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Presentation className="w-3.5 h-3.5 text-amber-400" />
          <span>Presentations (PPT/PPTX) ({resources.filter(r => r.file_type === 'slides').length})</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); setSelectedTab('pdfs'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedTab === 'pdfs' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-rose-400" />
          <span>PDF Documents ({resources.filter(r => r.file_type === 'pdf' || r.file_type === 'paper').length})</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); setSelectedTab('bookmarked'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedTab === 'bookmarked' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-cyan-400 fill-current" />
          <span>Saved Bookmarks ({resources.filter(r => r.is_bookmarked).length})</span>
        </button>
      </div>

      {/* Search Input & Dynamic Category Filter Pills */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search manuscripts by title, author, subject, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl glass-panel bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
          />
        </div>

        {/* Category Pills (Supports ANY subject!) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 max-w-full">
          {allCategories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'glass-panel text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      {filteredResources.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <Library className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Study Materials Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No manuscripts match the selected filter. Click "Upload PPT / PDF" to add presentations and documents for any subject.
          </p>
          <button
            onClick={() => { sounds.playClick(); setShowUploadModal(true); }}
            className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Upload Study Material Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const isPPT = res.file_type === 'slides';
            return (
              <div
                key={res.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Top Badges & Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md border font-bold uppercase flex items-center gap-1 ${
                          isPPT
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {isPPT ? <Presentation className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        <span>{isPPT ? 'PPT / Slides' : 'PDF Document'}</span>
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        {res.size_mb} MB
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Bookmark Button */}
                      <button
                        onClick={() => onToggleBookmark(res.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          res.is_bookmarked
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400'
                            : 'text-slate-400 border-slate-800 hover:text-white'
                        }`}
                        title={res.is_bookmarked ? 'Saved to Bookmarks' : 'Save to Bookmarks'}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Remove / Delete Button (for uploaded items or user materials) */}
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setResourceToDelete(res);
                        }}
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all"
                        title="Remove uploaded material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subject Tag */}
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    {res.category}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {res.title}
                  </h3>

                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>By {res.author}</span>
                    {res.is_user_uploaded && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                        Your Upload
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Tags */}
                  {res.tags && res.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {res.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {res.views_count} views
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPreview(res)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Read & Preview</span>
                    </button>

                    <a
                      href={res.download_url && res.download_url !== '#' ? `http://localhost:8000${res.download_url}` : '#'}
                      onClick={(e) => {
                        if (!res.download_url || res.download_url === '#') {
                          e.preventDefault();
                          sounds.playSuccess();
                        }
                      }}
                      download
                      className="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 transition-all"
                      title="Download PPT / PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD PPT & PDF MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel-glow w-full max-w-xl rounded-3xl border border-emerald-500/40 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload PPT or PDF Material</h3>
                  <p className="text-xs text-slate-400">Add presentation slides or study documents of ANY subject.</p>
                </div>
              </div>

              <button
                onClick={() => { if (!isUploading) setShowUploadModal(false); }}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadSuccessMessage ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">{uploadSuccessMessage}</h4>
                <p className="text-xs text-emerald-300 font-mono">+50 XP awarded to your scholarship ledger!</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* File Dropzone */}
                <div>
                  <label className="text-slate-300 font-semibold mb-1.5 block">Select File (PPT, PPTX, or PDF)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.pptx,.ppt,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      selectedFile
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : 'border-slate-700 hover:border-emerald-500/50 bg-slate-900/60'
                    }`}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        {selectedFile.name.endsWith('.ppt') || selectedFile.name.endsWith('.pptx') ? (
                          <Presentation className="w-8 h-8 text-amber-400 shrink-0" />
                        ) : (
                          <FileText className="w-8 h-8 text-rose-400 shrink-0" />
                        )}
                        <div className="text-left">
                          <div className="font-bold text-white text-sm truncate max-w-xs">{selectedFile.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload & extract
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <span className="text-sm font-semibold text-slate-200 block">
                          Click to browse or drag & drop PPT / PDF file
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Supports Microsoft PowerPoint (.pptx, .ppt) and Adobe PDF (.pdf)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject / Category Selector (Allows ANY subject!) */}
                <div>
                  <label className="text-slate-300 font-semibold mb-1.5 block flex items-center justify-between">
                    <span>Subject / Category</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-normal">Supports Any Subject</span>
                  </label>

                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 mb-2"
                  >
                    {COMMON_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="CUSTOM">+ Enter Custom Subject (Type Your Own)</option>
                  </select>

                  {uploadCategory === 'CUSTOM' && (
                    <input
                      type="text"
                      placeholder="Type any custom subject name (e.g. Cognitive Psychology, Macroeconomics, Astrophysics)..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/50 text-white placeholder-slate-500 focus:outline-none animate-in fade-in"
                    />
                  )}
                </div>

                {/* Document Title */}
                <div>
                  <label className="text-slate-300 font-semibold mb-1.5 block">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lecture 4: Hamiltonian Operators & Grover Algorithms"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Optional Description */}
                <div>
                  <label className="text-slate-300 font-semibold mb-1.5 block">Overview Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Key concepts covered in this presentation or document..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Awards +50 XP upon upload</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowUploadModal(false)}
                      disabled={isUploading}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteUpload}
                      disabled={!selectedFile || !uploadTitle.trim() || isUploading}
                      className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Extracting & Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Publish to Library</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REMOVE / DELETE CONFIRMATION MODAL */}
      {resourceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-rose-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Remove Study Material?</h3>
                <p className="text-xs text-slate-400">This action will delete the file from the campus library.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="font-bold text-white">{resourceToDelete.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Subject: {resourceToDelete.category} • {resourceToDelete.size_mb} MB</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResourceToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <span>Removing...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Remove</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel-glow w-full max-w-4xl max-h-[90vh] rounded-3xl border border-emerald-500/40 flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Top Bar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {previewResource.file_type === 'slides' ? (
                  <Presentation className="w-5 h-5 text-amber-400" />
                ) : (
                  <FileText className="w-5 h-5 text-emerald-400" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-lg">{previewResource.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Subject: {previewResource.category} • Author: {previewResource.author}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs">
                  <button onClick={() => setPreviewZoom(Math.max(70, previewZoom - 10))} title="Zoom Out">
                    <ZoomOut className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                  </button>
                  <span className="font-mono text-slate-300 px-1 text-[11px]">{previewZoom}%</span>
                  <button onClick={() => setPreviewZoom(Math.min(160, previewZoom + 10))} title="Zoom In">
                    <ZoomIn className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                  </button>
                </div>

                <a
                  href={previewResource.download_url && previewResource.download_url !== '#' ? `http://localhost:8000${previewResource.download_url}` : '#'}
                  download
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <button
                  onClick={() => setPreviewResource(null)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Reader Canvas */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-950/95 text-slate-200">
              <div
                style={{ fontSize: `${(previewZoom / 100) * 13}px` }}
                className="max-w-2xl mx-auto space-y-6 leading-relaxed font-sans"
              >
                <div className="text-center pb-6 border-b border-slate-800">
                  <div className="text-xs uppercase font-mono text-emerald-400 mb-2">
                    {previewResource.file_type === 'slides' ? 'Extracted Slide Deck' : 'Academic Manuscript'}
                  </div>
                  <h1 className="text-xl font-black text-white">{previewResource.title}</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Subject: <span className="text-emerald-400 font-semibold">{previewResource.category}</span> • {previewResource.author}
                  </p>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed font-mono text-xs bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
                  {previewResource.content_preview || previewResource.description}
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Interactive document extractor active.</span>
                  <span className="font-mono text-emerald-400">{previewResource.file_type.toUpperCase()} verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
