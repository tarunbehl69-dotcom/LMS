import React, { useState } from 'react';
import { DiscussionThread, StudyGroup, KanbanTask, UserRole } from '../types';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle2, 
  Plus, 
  Tag, 
  Clock, 
  Calendar, 
  Send, 
  Share2, 
  Pin,
  ChevronRight,
  Sparkles,
  Kanban
} from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

interface CollaborationProps {
  discussions: DiscussionThread[];
  studyGroups: StudyGroup[];
  tasks: KanbanTask[];
  onUpvoteDiscussion: (threadId: string) => void;
  onToggleJoinGroup: (groupId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: KanbanTask['status']) => void;
  onAddDiscussion: (channel: string, title: string, content: string, tags: string[]) => void;
  onAddTask: (groupId: string, title: string, assignee: string, priority: KanbanTask['priority']) => void;
}

export const CollaborationCentreView: React.FC<CollaborationProps> = ({
  discussions,
  studyGroups,
  tasks,
  onUpvoteDiscussion,
  onToggleJoinGroup,
  onUpdateTaskStatus,
  onAddDiscussion,
  onAddTask
}) => {
  const [activeTab, setActiveTab] = useState<'forums' | 'groups' | 'kanban'>('forums');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [showNewThreadModal, setShowNewThreadModal] = useState<boolean>(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

  // New Thread Form
  const [threadTitle, setThreadTitle] = useState('');
  const [threadChannel, setThreadChannel] = useState('ai-research');
  const [threadContent, setThreadContent] = useState('');
  const [threadTags, setThreadTags] = useState('AI, Research');

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('Alex Vance');
  const [taskPriority, setTaskPriority] = useState<KanbanTask['priority']>('medium');

  const channels = [
    { id: 'all', label: 'All Channels' },
    { id: 'general-plaza', label: '#general-plaza' },
    { id: 'ai-research', label: '#ai-research' },
    { id: 'quantum-cloud', label: '#quantum-cloud' },
    { id: 'career-hub', label: '#career-hub' },
    { id: 'study-lounge', label: '#study-lounge' }
  ];

  const filteredDiscussions = discussions.filter(
    (d) => selectedChannel === 'all' || d.channel === selectedChannel
  );

  const handleCreateThread = () => {
    if (!threadTitle.trim() || !threadContent.trim()) return;
    sounds.playSuccess();
    const tagsArr = threadTags.split(',').map((t) => t.trim());
    onAddDiscussion(threadChannel, threadTitle, threadContent, tagsArr);
    setShowNewThreadModal(false);
    setThreadTitle('');
    setThreadContent('');
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    sounds.playClick();
    onAddTask('grp_1', taskTitle, taskAssignee, taskPriority);
    setShowNewTaskModal(false);
    setTaskTitle('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Collaboration Centre</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-mono font-semibold">
                Social Academic Hub
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Peer research forums, study syndicates & collaborative sprint Kanban task boards
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 relative z-10">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('forums'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'forums' ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Discussion Forums
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('groups'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'groups' ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Study Groups
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('kanban'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'kanban' ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kanban Board
          </button>
        </div>
      </div>

      {/* TAB 1: DISCUSSION FORUMS */}
      {activeTab === 'forums' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Channel Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedChannel === ch.id
                      ? 'bg-blue-500/20 text-blue-300 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                      : 'glass-panel text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => { sounds.playClick(); setShowNewThreadModal(true); }}
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Research Thread</span>
            </button>
          </div>

          {/* Threads List */}
          <div className="space-y-4">
            {filteredDiscussions.map((d) => (
              <div
                key={d.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-400 font-bold">
                      #{d.channel}
                    </span>
                    {d.is_pinned && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">{d.created_at}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-2">{d.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{d.content}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300">{d.author_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 capitalize">
                      {d.author_role}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onUpvoteDiscussion(d.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-slate-800 hover:border-blue-500/40 transition-all font-bold"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>{d.upvotes}</span>
                    </button>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{d.replies_count} replies</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STUDY GROUPS */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {studyGroups.map((grp) => (
            <div
              key={grp.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="text-[10px] font-mono text-blue-400 uppercase font-bold mb-1">
                  {grp.category}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {grp.name}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {grp.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>{grp.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{grp.member_count} / {grp.max_members} Scholars Enrolled</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Lead: {grp.leader_name}</span>

                <button
                  onClick={() => onToggleJoinGroup(grp.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    grp.is_joined
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-blue-500 hover:bg-blue-400 text-white shadow-md'
                  }`}
                >
                  {grp.is_joined ? 'Joined Guild' : 'Join Squad'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: KANBAN SPRINT TASK BOARD */}
      {activeTab === 'kanban' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Kanban className="w-5 h-5 text-blue-400" />
                <span>Neural Networks Syndicate: Sprint Tasks</span>
              </h2>
              <p className="text-xs text-slate-400">Collaborative task tracking for university group projects.</p>
            </div>
            <button
              onClick={() => { sounds.playClick(); setShowNewTaskModal(true); }}
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sprint Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['todo', 'inprogress', 'review', 'completed'] as KanbanTask['status'][]).map((colStatus) => {
              const colTasks = tasks.filter(t => t.status === colStatus);
              const colLabels: Record<string, string> = {
                todo: 'To Do',
                inprogress: 'In Progress',
                review: 'Peer Review',
                completed: 'Completed'
              };
              return (
                <div key={colStatus} className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-3 min-h-[400px]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{colLabels[colStatus]}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400">{colTasks.length}</span>
                  </div>

                  <div className="space-y-3">
                    {colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-3 hover:border-blue-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                              t.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                          <span className="text-[10px] text-slate-500">{t.due_date}</span>
                        </div>

                        <div className="font-bold text-white leading-snug">{t.title}</div>
                        {t.description && <div className="text-[11px] text-slate-400">{t.description}</div>}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-400">{t.assignee}</span>

                          {/* Quick Advance Status Dropdown */}
                          <select
                            value={t.status}
                            onChange={(e) => onUpdateTaskStatus(t.id, e.target.value as KanbanTask['status'])}
                            className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                          >
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Done</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NEW THREAD MODAL */}
      {showNewThreadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-blue-500/40 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create New Research Thread</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scaling laws in sparse mixture of experts"
                  value={threadTitle}
                  onChange={(e) => setThreadTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Channel</label>
                <select
                  value={threadChannel}
                  onChange={(e) => setThreadChannel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="ai-research">#ai-research</option>
                  <option value="quantum-cloud">#quantum-cloud</option>
                  <option value="general-plaza">#general-plaza</option>
                  <option value="career-hub">#career-hub</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Discussion Body</label>
                <textarea
                  rows={4}
                  placeholder="Write your research query or findings..."
                  value={threadContent}
                  onChange={(e) => setThreadContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewThreadModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
              <button onClick={handleCreateThread} className="px-5 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs">Publish</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW KANBAN TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-blue-500/40 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add Sprint Task</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Task Name</label>
                <input
                  type="text"
                  placeholder="e.g. Implement attention KV-cache benchmarking"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Assignee</label>
                <input
                  type="text"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewTaskModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
              <button onClick={handleCreateTask} className="px-5 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
