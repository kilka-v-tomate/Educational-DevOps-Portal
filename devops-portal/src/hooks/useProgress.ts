/**
 * Хук для управления прогрессом пользователя
 */

import { useState, useEffect } from 'react';
import { progressService } from '../services/progressService';
import type { UserProgress, UserProfile, UserSettings } from '../types';

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => progressService.getProgress());
  const [profile, setProfile] = useState<UserProfile>(() => progressService.getProfile());
  const [settings, setSettings] = useState<UserSettings>(() => progressService.getSettings());

  // Подписка на изменения в localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'devops_portal_progress') {
        setProgress(progressService.getProgress());
      } else if (e.key === 'devops_portal_profile') {
        setProfile(progressService.getProfile());
      } else if (e.key === 'devops_portal_settings') {
        setSettings(progressService.getSettings());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const completeLesson = (lessonId: string, xpReward: number) => {
    progressService.completeLesson(lessonId, xpReward);
    setProgress(progressService.getProgress());
  };

  const toggleBookmark = (lessonId: string) => {
    progressService.toggleBookmark(lessonId);
    setProgress(progressService.getProgress());
  };

  const isBookmarked = (lessonId: string) => {
    return progressService.isBookmarked(lessonId);
  };

  const saveQuizResult = (lessonId: string, result: { score: number; totalPoints: number; answers: Record<string, string | string[]> }) => {
    progressService.saveQuizResult(lessonId, {
      ...result,
      percentage: Math.round((result.score / result.totalPoints) * 100),
      passed: (result.score / result.totalPoints) >= 0.7,
      completedAt: new Date().toISOString()
    });
    setProgress(progressService.getProgress());
  };

  const completeLab = (labId: string, points: number) => {
    progressService.completeLab(labId, points);
    setProgress(progressService.getProgress());
  };

  const isLabCompleted = (labId: string) => {
    return progressService.isLabCompleted(labId);
  };

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    const updated = { ...profile, ...newProfile };
    progressService.saveProfile(updated);
    setProfile(updated);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    progressService.saveSettings(updated);
    setSettings(updated);
  };

  const exportProgress = () => {
    return progressService.exportProgress();
  };

  const importProgress = (jsonString: string) => {
    const success = progressService.importProgress(jsonString);
    if (success) {
      setProgress(progressService.getProgress());
      setProfile(progressService.getProfile());
      setSettings(progressService.getSettings());
    }
    return success;
  };

  const resetProgress = () => {
    progressService.resetProgress();
    setProgress(progressService.getProgress());
    setProfile(progressService.getProfile());
    setSettings(progressService.getSettings());
  };

  return {
    progress,
    profile,
    settings,
    completeLesson,
    toggleBookmark,
    isBookmarked,
    saveQuizResult,
    completeLab,
    isLabCompleted,
    updateProfile,
    updateSettings,
    exportProgress,
    importProgress,
    resetProgress
  };
}
