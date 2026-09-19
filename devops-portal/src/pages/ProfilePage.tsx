import { useState } from 'react'
import { useProgress } from '../hooks/useProgress'
import { User, Save, Download, Upload, Trash2 } from 'lucide-react'

export default function ProfilePage() {
  const { progress, profile, settings, updateProfile, updateSettings, exportProgress, importProgress, resetProgress } = useProgress()
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio || '')
  const [importData, setImportData] = useState('')

  const handleSaveProfile = () => {
    updateProfile({ name, bio })
  }

  const handleExport = () => {
    const data = exportProgress()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'devops-portal-progress.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    if (importData) {
      importProgress(importData)
      setImportData('')
      alert('Прогресс успешно импортирован!')
    }
  }

  const handleReset = () => {
    if (confirm('Вы уверены? Весь прогресс будет удален.')) {
      resetProgress()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Личный кабинет</h1>
        <p className="text-gray-600 dark:text-gray-400">Управление профилем и прогрессом обучения</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Профиль */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Профиль
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">О себе</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Статистика</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Уровень</span>
              <span className="font-bold text-blue-600">{progress.level}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Опыт (XP)</span>
              <span className="font-bold text-green-600">{progress.xp}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Пройдено уроков</span>
              <span className="font-bold">{progress.completedLessons.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Закладки</span>
              <span className="font-bold">{progress.bookmarkedLessons.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Сертификаты</span>
              <span className="font-bold">{progress.certificates.length}</span>
            </div>
          </div>
        </div>

        {/* Настройки */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Настройки</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Геймификация</span>
              <input
                type="checkbox"
                checked={settings.gamificationEnabled}
                onChange={(e) => updateSettings({ gamificationEnabled: e.target.checked })}
                className="toggle-checkbox"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Сертификаты</span>
              <input
                type="checkbox"
                checked={settings.certificatesEnabled}
                onChange={(e) => updateSettings({ certificatesEnabled: e.target.checked })}
                className="toggle-checkbox"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Тема</span>
              <select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="light">Светлая</option>
                <option value="dark">Тёмная</option>
                <option value="system">Системная</option>
              </select>
            </div>
          </div>
        </div>

        {/* Экспорт/Импорт */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Данные</h2>

          <div className="space-y-4">
            <button
              onClick={handleExport}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт прогресса
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Импорт прогресса (JSON)</label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={3}
                placeholder='Вставьте JSON данные...'
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={handleImport}
                disabled={!importData}
                className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Импорт
              </button>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Сбросить прогресс
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
