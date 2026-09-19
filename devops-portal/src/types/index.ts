/**
 * Основные типы данных для образовательного DevOps-портала
 */

// Типы сложности уроков
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Типы блоков контента в уроке
export type BlockType = 
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'code'
  | 'terminal-command'
  | 'terminal-output'
  | 'note'
  | 'warning'
  | 'tip'
  | 'table'
  | 'diagram'
  | 'question'
  | 'knowledge-check';

// Блок контента урока
export interface ContentBlock {
  type: BlockType;
  content: string | string[] | CodeBlock | TableData;
  title?: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

// Вопрос теста
export interface QuizQuestion {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'true-false' | 'text-input' | 'command-input';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

// Тест/квиз для урока
export interface Quiz {
  id: string;
  title: string;
  description: string;
  passingScore: number; // процент правильных ответов для прохождения
  questions: QuizQuestion[];
  timeLimit?: number; // время в минутах, опционально
}

// Лабораторная работа в терминале
export interface TerminalLab {
  id: string;
  title: string;
  description: string;
  goal: string;
  hints: string[];
  initialCommands?: string[]; // команды для настройки начального состояния
  expectedState: {
    files?: string[]; // ожидаемые файлы
    directories?: string[]; // ожидаемые директории
    fileContents?: Record<string, string>; // ожидаемое содержимое файлов
    currentDir?: string; // ожидаемая текущая директория
    usedCommands?: string[]; // команды которые должны быть использованы
    outputContains?: string; // вывод должен содержать
  };
  points: number;
}

// Урок
export interface Lesson {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  module: string; // ID модуля
  description: string;
  duration: number; // в минутах
  difficulty: Difficulty;
  objectives: string[];
  blocks: ContentBlock[];
  quiz?: Quiz;
  terminalLabId?: string;
  relatedLessons?: string[]; // IDs связанных уроков
  updatedAt: string;
  xpReward: number;
}

// Модуль обучения
export interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
  lessons: string[]; // IDs уроков (порядок важен)
  objectives: string[];
  estimatedDuration: number; // в минутах
  difficulty: Difficulty;
  prerequisites?: string[]; // IDs prerequisite модулей
}

// Запись справочника
export interface ReferenceEntry {
  id: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  content: string;
  examples?: CodeBlock[];
  relatedEntries?: string[];
  updatedAt: string;
}

// Интервью вопрос
export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
  tags: string[];
}

// Проект для практики
export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedTime: number;
  prerequisites: string[];
  steps: ProjectStep[];
  resources: string[];
}

export interface ProjectStep {
  order: number;
  title: string;
  description: string;
  commands?: string[];
  hints?: string[];
}

// Дорожная карта
export interface RoadmapNode {
  id: string;
  title: string;
  description?: string;
  type: 'topic' | 'milestone' | 'resource';
  linksTo?: string[];
  modules?: string[];
  position: { x: number; y: number };
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
}

// Достижение пользователя
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  xpReward: number;
}

export interface AchievementCondition {
  type: 'lessons_completed' | 'tests_passed' | 'labs_completed' | 'xp_earned' | 'module_completed';
  threshold: number;
  moduleId?: string;
}

// Прогресс пользователя
export interface UserProgress {
  completedLessons: string[];
  bookmarkedLessons: string[];
  quizResults: Record<string, QuizResult>; // lessonId -> result
  labResults: Record<string, boolean>; // labId -> completed
  xp: number;
  level: number;
  achievements: string[]; // achievement IDs
  certificates: Certificate[];
  lastActive: string;
}

export interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, string | string[]>; // questionId -> answer
  completedAt: string;
}

export interface Certificate {
  id: string;
  moduleId: string;
  moduleName: string;
  issuedAt: string;
  certificateId: string; // уникальный ID
  userName: string;
}

// Профиль пользователя
export interface UserProfile {
  name: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
}

// Настройки пользователя
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  gamificationEnabled: boolean;
  certificatesEnabled: boolean;
  notificationsEnabled: boolean;
}

// Состояние терминала
export interface TerminalState {
  currentDir: string;
  homeDir: string;
  history: string[];
  historyIndex: number;
  fileSystem: FileSystemNode;
  environment: Record<string, string>;
  lastOutput: string;
  lastCommand: string;
  commandHistory: CommandHistoryEntry[];
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  permissions?: string;
  children?: FileSystemNode[];
  parent?: FileSystemNode;
}

export interface CommandHistoryEntry {
  command: string;
  output: string;
  timestamp: number;
}

// Результат выполнения команды
export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}

// Команда терминала
export interface TerminalCommand {
  name: string;
  description: string;
  usage: string;
  handler: (args: string[], state: TerminalState) => CommandResult;
  aliases?: string[];
}

// Статистика админки
export interface AdminStats {
  totalLessonsCompleted: number;
  averageQuizScore: number;
  totalLabsCompleted: number;
  totalXP: number;
  totalAchievements: number;
  activeUsers: number;
  lastUpdated: string;
}

// Конфигурация сайта
export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  defaultTheme: 'light' | 'dark';
  gamificationEnabled: boolean;
  certificatesEnabled: boolean;
  version: string;
}
