/**
 * Сервис для управления прогрессом пользователя
 * Хранение данных в localStorage с возможностью экспорта/импорта
 */

import type {
  UserProgress,
  UserProfile,
  UserSettings,
  QuizResult,
  Certificate,
  Achievement
} from '../types';

const STORAGE_KEYS = {
  PROGRESS: 'devops_portal_progress',
  PROFILE: 'devops_portal_profile',
  SETTINGS: 'devops_portal_settings',
  VERSION: 'devops_portal_version'
};

const CURRENT_VERSION = '1.0.0';

// Достижения по умолчанию
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_lesson',
    title: 'Первый шаг',
    description: 'Пройдите первый урок',
    icon: '🎯',
    condition: { type: 'lessons_completed', threshold: 1 },
    xpReward: 50
  },
  {
    id: 'first_test',
    title: 'Экзаменатор',
    description: 'Пройдите первый тест',
    icon: '📝',
    condition: { type: 'tests_passed', threshold: 1 },
    xpReward: 100
  },
  {
    id: 'first_lab',
    title: 'Лаборант',
    description: 'Выполните первую лабораторную работу',
    icon: '🧪',
    condition: { type: 'labs_completed', threshold: 1 },
    xpReward: 150
  },
  {
    id: 'ten_lessons',
    title: 'Десятиборец',
    description: 'Пройдите 10 уроков',
    icon: '🏆',
    condition: { type: 'lessons_completed', threshold: 10 },
    xpReward: 500
  },
  {
    id: 'linux_master',
    title: 'Linux Мастер',
    description: 'Завершите модуль Linux',
    icon: '🐧',
    condition: { type: 'module_completed', threshold: 1, moduleId: 'linux-basics' },
    xpReward: 300
  },
  {
    id: 'docker_master',
    title: 'Docker Капитан',
    description: 'Завершите модуль Docker',
    icon: '🐳',
    condition: { type: 'module_completed', threshold: 1, moduleId: 'docker-basics' },
    xpReward: 300
  }
];

class ProgressService {
  /**
   * Получение текущего прогресса
   */
  getProgress(): UserProgress {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse progress:', e);
      }
    }

    // Прогресс по умолчанию
    return this.createDefaultProgress();
  }

  /**
   * Сохранение прогресса
   */
  saveProgress(progress: UserProgress): void {
    progress.lastActive = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    this.checkAchievements(progress);
  }

  /**
   * Отметка урока как пройденного
   */
  completeLesson(lessonId: string, xpReward: number): void {
    const progress = this.getProgress();
    
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      progress.xp += xpReward;
      this.updateLevel(progress);
      this.saveProgress(progress);
    }
  }

  /**
   * Добавление/удаление закладки
   */
  toggleBookmark(lessonId: string): void {
    const progress = this.getProgress();
    const index = progress.bookmarkedLessons.indexOf(lessonId);

    if (index === -1) {
      progress.bookmarkedLessons.push(lessonId);
    } else {
      progress.bookmarkedLessons.splice(index, 1);
    }

    this.saveProgress(progress);
  }

  /**
   * Проверка закладки
   */
  isBookmarked(lessonId: string): boolean {
    const progress = this.getProgress();
    return progress.bookmarkedLessons.includes(lessonId);
  }

  /**
   * Сохранение результата теста
   */
  saveQuizResult(lessonId: string, result: QuizResult): void {
    const progress = this.getProgress();
    progress.quizResults[lessonId] = result;

    if (result.passed) {
      progress.xp += Math.floor(result.percentage / 10);
      this.updateLevel(progress);
    }

    this.saveProgress(progress);
  }

  /**
   * Отметка лабораторной как выполненной
   */
  completeLab(labId: string, points: number): void {
    const progress = this.getProgress();

    if (!progress.labResults[labId]) {
      progress.labResults[labId] = true;
      progress.xp += points;
      this.updateLevel(progress);
      this.saveProgress(progress);
    }
  }

  /**
   * Проверка выполнения лабораторной
   */
  isLabCompleted(labId: string): boolean {
    const progress = this.getProgress();
    return !!progress.labResults[labId];
  }

  /**
   * Выдача сертификата
   */
  issueCertificate(moduleId: string, moduleName: string): Certificate {
    const progress = this.getProgress();
    const profile = this.getProfile();

    const certificate: Certificate = {
      id: crypto.randomUUID(),
      moduleId,
      moduleName,
      issuedAt: new Date().toISOString(),
      certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userName: profile.name || 'Студент'
    };

    progress.certificates.push(certificate);
    this.saveProgress(progress);

    return certificate;
  }

  /**
   * Получение профиля пользователя
   */
  getProfile(): UserProfile {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse profile:', e);
      }
    }

    return this.createDefaultProfile();
  }

  /**
   * Сохранение профиля
   */
  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  /**
   * Получение настроек
   */
  getSettings(): UserSettings {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }

    return {
      theme: 'system',
      gamificationEnabled: true,
      certificatesEnabled: true,
      notificationsEnabled: true
    };
  }

  /**
   * Сохранение настроек
   */
  saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Экспорт прогресса в JSON
   */
  exportProgress(): string {
    const data = {
      version: CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      progress: this.getProgress(),
      profile: this.getProfile(),
      settings: this.getSettings()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Импорт прогресса из JSON
   */
  importProgress(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.progress) {
        this.saveProgress(data.progress);
      }
      if (data.profile) {
        this.saveProfile(data.profile);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }

      return true;
    } catch (e) {
      console.error('Failed to import progress:', e);
      return false;
    }
  }

  /**
   * Сброс прогресса
   */
  resetProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }

  /**
   * Получение достижений
   */
  getAchievements(): Achievement[] {
    return DEFAULT_ACHIEVEMENTS;
  }

  /**
   * Проверка и выдача достижений
   */
  private checkAchievements(progress: UserProgress): void {
    const earnedAchievements = new Set(progress.achievements);

    for (const achievement of DEFAULT_ACHIEVEMENTS) {
      if (earnedAchievements.has(achievement.id)) continue;

      let earned = false;

      switch (achievement.condition.type) {
        case 'lessons_completed':
          earned = progress.completedLessons.length >= achievement.condition.threshold;
          break;
        case 'tests_passed':
          const passedTests = Object.values(progress.quizResults).filter(r => r.passed).length;
          earned = passedTests >= achievement.condition.threshold;
          break;
        case 'labs_completed':
          earned = Object.values(progress.labResults).filter(v => v).length >= achievement.condition.threshold;
          break;
        case 'xp_earned':
          earned = progress.xp >= achievement.condition.threshold;
          break;
        case 'module_completed':
          // Проверяется отдельно при завершении модуля
          break;
      }

      if (earned) {
        earnedAchievements.add(achievement.id);
        progress.achievements.push(achievement.id);
        progress.xp += achievement.xpReward;
      }
    }

    progress.achievements = Array.from(earnedAchievements);
  }

  /**
   * Обновление уровня пользователя
   */
  private updateLevel(progress: UserProgress): void {
    // Уровень рассчитывается по формуле: level = floor(sqrt(xp / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(progress.xp / 100)) + 1;
    if (newLevel > progress.level) {
      progress.level = newLevel;
    }
  }

  /**
   * Создание прогресса по умолчанию
   */
  private createDefaultProgress(): UserProgress {
    return {
      completedLessons: [],
      bookmarkedLessons: [],
      quizResults: {},
      labResults: {},
      xp: 0,
      level: 1,
      achievements: [],
      certificates: [],
      lastActive: new Date().toISOString()
    };
  }

  /**
   * Создание профиля по умолчанию
   */
  private createDefaultProfile(): UserProfile {
    return {
      name: 'Студент',
      joinedAt: new Date().toISOString()
    };
  }
}

// Singleton instance
export const progressService = new ProgressService();
