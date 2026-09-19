import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Форматирование даты
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Форматирование длительности в минуты в читаемый формат
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} ч`;
  }
  return `${hours} ч ${mins} мин`;
}

/**
 * Получение уровня сложности
 */
export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый'
  };
  return labels[difficulty] || difficulty;
}

/**
 * Получение цвета для уровня сложности
 */
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    beginner: 'text-green-600 dark:text-green-400',
    intermediate: 'text-yellow-600 dark:text-yellow-400',
    advanced: 'text-red-600 dark:text-red-400'
  };
  return colors[difficulty] || 'text-gray-600';
}

/**
 * Генерация уникального ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Копирование текста в буфер обмена
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Расчет процента выполнения
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Получение названия уровня пользователя
 */
export function getLevelTitle(level: number): string {
  if (level < 5) return 'Новичок';
  if (level < 10) return 'Изучающий';
  if (level < 15) return 'Практик';
  if (level < 20) return 'Специалист';
  if (level < 30) return 'Эксперт';
  return 'Мастер DevOps';
}

/**
 * XP до следующего уровня
 */
export function xpToNextLevel(level: number): number {
  // Формула: XP для уровня = level^2 * 100
  const currentLevelXP = Math.pow(level, 2) * 100;
  const nextLevelXP = Math.pow(level + 1, 2) * 100;
  return nextLevelXP - currentLevelXP;
}
