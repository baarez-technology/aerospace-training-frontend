// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'trainee' | 'instructor' | 'admin';
  avatar?: string;
  rank?: string;
  squadron?: string;
  base?: string;
  joinedAt: string;
  lastActive: string;
}

export interface Session {
  user: User | null;
  isAuthenticated: boolean;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  description: string;
  moduleCount: number;
  completedModules: number;
  progress: number;
  thumbnail?: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'not-started' | 'in-progress' | 'completed';
}

export type CourseCategory = 
  | 'Jet Engine Systems'
  | 'Hydraulics'
  | 'Electrical Systems'
  | 'Avionics'
  | 'Flight Control'
  | 'Weapons Systems'
  | 'Landing Gear'
  | 'Fuel Systems';

// Module Types
export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  videoStatus?: 'none' | 'processing' | 'ready' | 'error';
  documentation: string;
  procedures: Procedure[];
  diagrams: Diagram[];
  duration: string;
  order: number;
  category?: CourseCategory | 'General';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
}

export interface InstructorVideoAssignment {
  traineeId: string;
  traineeName?: string;
  assignedAt: string;
}

export interface InstructorVideo {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  videoUrl: string;
  cloudinaryPublicId: string;
  duration: string;
  category: CourseCategory | 'General';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  assignedTo: InstructorVideoAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface Procedure {
  id: string;
  step: number;
  title: string;
  description: string;
  caution?: string;
  warning?: string;
}

export interface Diagram {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

// Digital Twin Types
export interface AircraftSystem {
  id: string;
  name: string;
  category: SystemCategory;
  components: Component[];
  status: 'operational' | 'maintenance' | 'faulty';
  health: number;
}

export type SystemCategory = 
  | 'engine'
  | 'hydraulics'
  | 'electrical'
  | 'avionics'
  | 'landing-gear'
  | 'fuel-system'
  | 'weapons-integration';

export interface Component {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  status: 'operational' | 'maintenance' | 'faulty';
  health: number;
  lastMaintenance: string;
  nextMaintenance: string;
  specifications: Record<string, string>;
}

// Simulation Types
export interface Simulation {
  id: string;
  title: string;
  type: SimulationType;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  aircraft: string;
  objectives: string[];
  briefing: string;
  status: 'available' | 'in-progress' | 'completed';
}

export type SimulationType = 
  | 'maintenance'
  | 'flight-readiness'
  | 'mission-rehearsal';

// Trainee Progress Types
export interface TraineeProgress {
  traineeId: string;
  overallProgress: number;
  readinessScore: number;
  simulationHours: number;
  completedCourses: number;
  totalCourses: number;
  completedModules: number;
  totalModules: number;
  recentActivity: Activity[];
  skills: Skill[];
}

export interface Activity {
  id: string;
  type: 'course-started' | 'course-completed' | 'module-completed' | 'simulation-completed';
  title: string;
  timestamp: string;
  details?: string;
}

export interface Skill {
  name: string;
  level: number;
  maxLevel: number;
  category: string;
}

// Instructor Types
export interface TraineeOverview {
  id: string;
  name: string;
  rank: string;
  avatar?: string;
  readinessScore: number;
  progress: number;
  simulationHours: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'on-leave';
}

export interface TrainingSession {
  id: string;
  title: string;
  instructorId: string;
  date: string;
  duration: string;
  participants: string[];
  type: 'classroom' | 'simulation' | 'practical';
  status: 'scheduled' | 'in-progress' | 'completed';
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  type: SimulationType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  parameters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  userCount: number;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
  lastChecked: string;
}

// AI Assistant Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}

// Dashboard Types
export interface DashboardStats {
  totalTrainees: number;
  activeSessions: number;
  simulationsToday: number;
  averageReadiness: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// Analytics Types
export interface AnalyticsData {
  trainingCompletion: ChartData[];
  readinessTrend: ChartData[];
  simulationUsage: ChartData[];
  skillDistribution: ChartData[];
}

export interface ChartData {
  label: string;
  value: number;
  date?: string;
}

// Content Upload & Assignment Types
export interface ExtractedTopic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  confidence: number;
}

export interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: CourseCategory | 'General';
  tags: string[];
  source: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ContentUpload {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  uploadedAt: string;
  uploadedBy: string;
  extractedTopics: ExtractedTopic[];
  selectedVideos: TrainingVideo[];
  status: 'uploading' | 'extracting' | 'ready' | 'assigned';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  assignedAt: string;
  dueDate: string;
  topics: ExtractedTopic[];
  videos: TrainingVideo[];
  sourceDocument: string;
  trainees: string[];
  status: 'active' | 'completed' | 'overdue';
}

export interface TraineeAssignment extends Assignment {
  progress: number;
  completedVideos: string[];
  notes: string;
  lastAccessed?: string;
}
