/**
 * TypeScript Type Definitions for LearnLoop Infinity 2.0.
 * Full type coverage across 3D navigation, 7 university sectors, gamification, and role-based portals.
 */

export type UserRole = 'student' | 'instructor' | 'admin';

export type AppView = 
  | 'landing'
  | 'explore-3d'
  | 'dashboard'
  | 'knowledge-tower'
  | 'ai-hub'
  | 'challenge-arena'
  | 'digital-library'
  | 'experiment-lab'
  | 'collaboration-centre'
  | 'progress-centre'
  | 'instructor-portal'
  | 'admin-portal';

export type BuildingId = 
  | 'knowledge-tower'
  | 'ai-hub'
  | 'challenge-arena'
  | 'digital-library'
  | 'experiment-lab'
  | 'collaboration-centre'
  | 'progress-centre';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  bio: string;
  total_xp: number;
  level: number;
  current_streak: number;
  last_active_date?: string;
  interests?: string[];
  enrolledCourses?: string[];
  badges?: string[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_hours: number;
  rating: number;
  enrolled_count: number;
  instructor_id?: string;
  instructor_name: string;
  description: string;
  thumbnail: string;
  is_published?: number | boolean;
  is_enrolled?: boolean;
  user_progress?: number;
  certificate_id?: string | null;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  description?: string;
  lessons: Lesson[];
}

export interface LessonResource {
  title: string;
  url: string;
  type?: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  order_index: number;
  lesson_type: 'video' | 'reading' | 'interactive';
  duration_minutes: number;
  video_url?: string;
  content_markdown: string;
  resources?: LessonResource[];
  is_completed?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  course_id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Novice' | 'Intermediate' | 'Master';
  time_limit_minutes: number;
  passing_score: number;
  xp_reward: number;
  questions?: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  xp_earned: number;
  completed_at: string;
  breakdown?: any[];
}

export interface LeaderboardUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
  title: string;
  total_xp: number;
  level: number;
  current_streak: number;
  rank: number;
}

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  category: string;
  file_type: 'pdf' | 'slides' | 'paper' | 'code' | 'video';
  size_mb: number;
  download_url?: string;
  cover_image: string;
  tags: string[];
  views_count: number;
  downloads_count: number;
  description: string;
  content_preview?: string;
  is_bookmarked?: boolean;
  is_user_uploaded?: boolean;
  file_path?: string;
}

export interface SimulationPhaseChoice {
  text: string;
  delta: Record<string, number>;
}

export interface SimulationPhase {
  name: string;
  scenario: string;
  choices: SimulationPhaseChoice[];
}

export interface SimulationScenarioData {
  initial_metrics: Record<string, number>;
  phases: SimulationPhase[];
}

export interface Simulation {
  id: string;
  title: string;
  category: string;
  description: string;
  duration_minutes: number;
  difficulty: string;
  xp_reward: number;
  scenario_data?: SimulationScenarioData;
}

export interface DiscussionThread {
  id: string;
  channel: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  upvotes: number;
  replies_count: number;
  tags: string[];
  is_pinned?: number | boolean;
  created_at: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  leader_id: string;
  leader_name: string;
  member_count: number;
  max_members: number;
  schedule: string;
  tags: string[];
  is_joined?: boolean;
}

export interface KanbanTask {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inprogress' | 'review' | 'completed';
  due_date?: string;
  created_at?: string;
}

export interface DailyMission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  xp_reward: number;
  target_count: number;
  current_count: number;
  is_claimed: boolean | number;
  mission_date: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xp_value: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  requirement: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface PlatformMetrics {
  total_users: number;
  total_courses: number;
  total_quiz_attempts: number;
  total_xp_awarded: number;
  total_resources: number;
  system_status: string;
  active_version: string;
}
