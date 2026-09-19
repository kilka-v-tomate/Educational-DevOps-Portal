/**
 * Сервис для работы с контентом (модули, уроки, справочник)
 * Абстракция над источниками данных - позволяет легко заменить JSON на API
 */

import { Module, Lesson, ReferenceEntry, SiteConfig } from '../types';

const CONTENT_BASE_URL = '/content';

class ContentService {
  private cache: Map<string, unknown> = new Map();

  /**
   * Загрузка конфигурации сайта
   */
  async getConfig(): Promise<SiteConfig> {
    return this.loadJSON(`${CONTENT_BASE_URL}/config.json`);
  }

  /**
   * Загрузка списка всех модулей
   */
  async getModules(): Promise<Module[]> {
    const cached = this.cache.get('modules') as Module[];
    if (cached) return cached;

    const modules = await this.loadJSON<Module[]>(`${CONTENT_BASE_URL}/modules.json`);
    this.cache.set('modules', modules);
    return modules;
  }

  /**
   * Получение модуля по slug
   */
  async getModuleBySlug(slug: string): Promise<Module | null> {
    const modules = await this.getModules();
    return modules.find(m => m.slug === slug) || null;
  }

  /**
   * Загрузка урока по slug модуля и slug урока
   */
  async getLesson(moduleSlug: string, lessonSlug: string): Promise<Lesson | null> {
    const cacheKey = `lesson:${moduleSlug}:${lessonSlug}`;
    const cached = this.cache.get(cacheKey) as Lesson;
    if (cached) return cached;

    try {
      const lesson = await this.loadJSON<Lesson>(
        `${CONTENT_BASE_URL}/modules/${moduleSlug}/${lessonSlug}.json`
      );
      this.cache.set(cacheKey, lesson);
      return lesson;
    } catch (error) {
      console.error(`Failed to load lesson ${lessonSlug} from module ${moduleSlug}`, error);
      return null;
    }
  }

  /**
   * Загрузка справочника
   */
  async getReference(): Promise<ReferenceEntry[]> {
    const cached = this.cache.get('reference') as ReferenceEntry[];
    if (cached) return cached;

    const reference = await this.loadJSON<ReferenceEntry[]>(`${CONTENT_BASE_URL}/reference.json`);
    this.cache.set('reference', reference);
    return reference;
  }

  /**
   * Поиск по справочнику
   */
  async searchReference(query: string, category?: string): Promise<ReferenceEntry[]> {
    const reference = await this.getReference();
    const searchQuery = query.toLowerCase().trim();

    let results = reference.filter(entry => {
      if (category && entry.category !== category) return false;

      if (!searchQuery) return true;

      const searchableText = [
        entry.title,
        entry.description,
        entry.content,
        ...entry.tags
      ].join(' ').toLowerCase();

      return searchableText.includes(searchQuery);
    });

    // Сортировка по релевантности
    if (searchQuery) {
      results.sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase().includes(searchQuery) ? 1 : 0;
        const bTitleMatch = b.title.toLowerCase().includes(searchQuery) ? 1 : 0;
        
        if (aTitleMatch !== bTitleMatch) return bTitleMatch - aTitleMatch;

        const aTagMatch = a.tags.some(t => t.toLowerCase().includes(searchQuery)) ? 1 : 0;
        const bTagMatch = b.tags.some(t => t.toLowerCase().includes(searchQuery)) ? 1 : 0;

        return bTagMatch - aTagMatch;
      });
    }

    return results;
  }

  /**
   * Получение категорий справочника
   */
  async getReferenceCategories(): Promise<string[]> {
    const reference = await this.getReference();
    const categories = new Set(reference.map(entry => entry.category));
    return Array.from(categories).sort();
  }

  /**
   * Загрузка JSON файла
   */
  private async loadJSON<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Очистка кэша
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Инвалидация конкретного ключа кэша
   */
  invalidateCache(key: string): void {
    this.cache.delete(key);
  }
}

// Singleton instance
export const contentService = new ContentService();
