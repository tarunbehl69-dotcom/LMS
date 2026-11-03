import React, { useState, useEffect } from 'react';
import { 
  AppView, 
  BuildingId, 
  Course, 
  DailyMission, 
  DiscussionThread, 
  KanbanTask, 
  LibraryResource, 
  Quiz, 
  Simulation, 
  StudyGroup, 
  UserProfile, 
  UserRole, 
  XPTransaction 
} from './types';
import { api } from './services/api';
import { localLms } from './services/localLmsStore';
import { sounds } from './services/soundEffects';

// Core Components
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ThreeCityScene } from './components/ThreeCityScene';
import { DashboardView } from './components/DashboardView';
import { KnowledgeTowerView } from './components/KnowledgeTowerView';
import { AiHubView } from './components/AiHubView';
import { ChallengeArenaView } from './components/ChallengeArenaView';
import { DigitalLibraryView } from './components/DigitalLibraryView';
import { ExperimentLabView } from './components/ExperimentLabView';
import { CollaborationCentreView } from './components/CollaborationCentreView';
import { ProgressCentreView } from './components/ProgressCentreView';
import { InstructorPortalView } from './components/InstructorPortalView';
import { AdminPortalView } from './components/AdminPortalView';
import { CertificateModal } from './components/CertificateModal';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => localLms.getCurrentUser());

  // Platform Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [xpTransactions, setXpTransactions] = useState<XPTransaction[]>([]);

  // Certificate Modal State
  const [certificateData, setCertificateData] = useState<{ courseTitle: string; certId: string } | null>(null);

  // Load all platform state
  const loadPlatformData = async () => {
    try {
      const [
        profileData,
        coursesData,
        quizzesData,
        resourcesData,
        simsData,
        discData,
        groupsData,
        tasksData,
        missionsData,
        txsData
      ] = await Promise.all([
        api.getCurrentProfile(currentUser.id),
        api.getCourses(),
        api.getQuizzes(),
        api.getLibraryResources(),
        api.getSimulations(),
        api.getDiscussions(),
        api.getStudyGroups(),
        api.getKanbanTasks(),
        api.getDailyMissions(),
        api.getXpTransactions()
      ]);

      setCurrentUser(profileData);
      setCourses(coursesData);
      setQuizzes(quizzesData);
      setResources(resourcesData);
      setSimulations(simsData);
      setDiscussions(discData);
      setStudyGroups(groupsData);
      setTasks(tasksData);
      setMissions(missionsData);
      setXpTransactions(txsData);
    } catch (e) {
      console.warn('Backend loading in fallback mode', e);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, [currentUser.id]);

  // Handler: Role Switcher (Student / Instructor / Admin)
  const handleSwitchRole = (newRole: UserRole) => {
    sounds.playSuccess();
    const updatedUser = api.switchRole(newRole);
    setCurrentUser(updatedUser);
  };

  // Handler: Entering any building from 3D scene or Dashboard
  const handleEnterBuilding = (buildingId: BuildingId) => {
    sounds.playWarp();
    setCurrentView(buildingId);
  };

  // Handler: Enrolling in course
  const handleEnrollCourse = async (courseId: string) => {
    await api.enrollInCourse(courseId);
    await loadPlatformData();
  };

  // Handler: Completing a lesson
  const handleCompleteLesson = async (courseId: string, lessonId: string) => {
    const res = await api.completeLesson(courseId, lessonId);
    if (res.certId) {
      const course = courses.find(c => c.id === courseId);
      setCertificateData({
        courseTitle: course ? course.title : 'Course Track',
        certId: res.certId
      });
    }
    await loadPlatformData();
  };

  // Handler: Claiming a daily mission
  const handleClaimMission = async (missionId: string) => {
    sounds.playSuccess();
    await api.claimMission(missionId);
    await loadPlatformData();
  };

  // Handler: Bookmark toggling
  const handleToggleBookmark = async (resourceId: string) => {
    sounds.playClick();
    await api.toggleBookmark(resourceId);
    await loadPlatformData();
  };

  // Handler: Join study group
  const handleToggleJoinGroup = async (groupId: string) => {
    sounds.playClick();
    await api.toggleJoinGroup(groupId);
    await loadPlatformData();
  };

  // Handler: Upvote discussion
  const handleUpvoteDiscussion = async (threadId: string) => {
    sounds.playClick();
    await api.upvoteDiscussion(threadId);
    await loadPlatformData();
  };

  // Handler: Add discussion
  const handleAddDiscussion = async (channel: string, title: string, content: string, tags: string[]) => {
    await api.createDiscussion(channel, title, content, tags);
    await loadPlatformData();
  };

  // Handler: Add Kanban Task
  const handleAddTask = async (groupId: string, title: string, assignee: string, priority: KanbanTask['priority']) => {
    await api.createTask(groupId, title, assignee, priority);
    await loadPlatformData();
  };

  // Handler: Update Kanban Task Status
  const handleUpdateTaskStatus = async (taskId: string, status: KanbanTask['status']) => {
    sounds.playClick();
    await api.updateTaskStatus(taskId, status);
    await loadPlatformData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Futuristic Navigation Bar (Present across all views except landing hero) */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={(view) => setCurrentView(view)}
            onEnterBuilding={handleEnterBuilding}
          />
        )}

        {currentView === 'explore-3d' && (
          <ThreeCityScene
            onEnterBuilding={handleEnterBuilding}
            onSwitchToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            courses={courses}
            missions={missions}
            onNavigate={(view) => setCurrentView(view)}
            onEnterBuilding={handleEnterBuilding}
            onClaimMission={handleClaimMission}
            onOpenLesson={(courseId) => {
              setCurrentView('knowledge-tower');
            }}
          />
        )}

        {currentView === 'knowledge-tower' && (
          <KnowledgeTowerView
            courses={courses}
            onEnroll={handleEnrollCourse}
            onCompleteLesson={handleCompleteLesson}
            onViewCertificate={(courseTitle, certId) => setCertificateData({ courseTitle, certId })}
          />
        )}

        {currentView === 'ai-hub' && <AiHubView />}

        {currentView === 'challenge-arena' && <ChallengeArenaView quizzes={quizzes} />}

        {currentView === 'digital-library' && (
          <DigitalLibraryView
            resources={resources}
            onToggleBookmark={handleToggleBookmark}
            onRefreshData={loadPlatformData}
          />
        )}

        {currentView === 'experiment-lab' && <ExperimentLabView simulations={simulations} />}

        {currentView === 'collaboration-centre' && (
          <CollaborationCentreView
            discussions={discussions}
            studyGroups={studyGroups}
            tasks={tasks}
            onUpvoteDiscussion={handleUpvoteDiscussion}
            onToggleJoinGroup={handleToggleJoinGroup}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddDiscussion={handleAddDiscussion}
            onAddTask={handleAddTask}
          />
        )}

        {currentView === 'progress-centre' && (
          <ProgressCentreView
            currentUser={currentUser}
            missions={missions}
            xpTransactions={xpTransactions}
            onClaimMission={handleClaimMission}
          />
        )}

        {currentView === 'instructor-portal' && (
          <InstructorPortalView
            currentUser={currentUser}
            courses={courses}
            onCourseCreated={loadPlatformData}
          />
        )}

        {currentView === 'admin-portal' && (
          <AdminPortalView currentUser={currentUser} />
        )}
      </main>

      {/* Verifiable Certificate Modal */}
      {certificateData && (
        <CertificateModal
          studentName={currentUser.name}
          courseTitle={certificateData.courseTitle}
          certificateId={certificateData.certId}
          onClose={() => setCertificateData(null)}
        />
      )}
    </div>
  );
};
