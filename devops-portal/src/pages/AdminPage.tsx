import { useState } from 'react'
import { useAdmin } from '../hooks/useAdmin'
import type { Module } from '../types'
import { Upload, Download } from 'lucide-react'

export default function AdminPage() {
  const { modules, lessons, addModule, deleteModule, exportContent, importContent } = useAdmin()
  const [activeTab, setActiveTab] = useState<'modules' | 'lessons'>('modules')
  
  const [newModuleSlug, setNewModuleSlug] = useState('')
  const [newModuleTitle, setNewModuleTitle] = useState('')

  const handleAddModule = () => {
    if (!newModuleSlug || !newModuleTitle) return
    addModule({
      slug: newModuleSlug,
      title: newModuleTitle,
      description: '',
      objectives: [],
      lessons: [],
      prerequisites: [],
      xpReward: 100
    })
    setNewModuleSlug('')
    setNewModuleTitle('')
  }

  const handleExport = () => {
    exportContent()
  }

  const handleImport = () => {
    importContent()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Админ-панель</h1>
        <p className="text-gray-600 dark:text-gray-400">Управление контентом образовательного портала</p>
      </div>

      <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-6">
        <p className="text-yellow-800 dark:text-yellow-200">
          <strong>Внимание:</strong> Это тестовая админ-панель. Данные хранятся только в памяти браузера.
        </p>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'modules'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Модули
        </button>
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'lessons'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Уроки
        </button>
      </div>

      {activeTab === 'modules' && (
        <div className="space-y-6">
          {/* Форма добавления модуля */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Добавить модуль</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Slug (например: linux-basics)"
                value={newModuleSlug}
                onChange={(e) => setNewModuleSlug(e.target.value)}
                className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="text"
                placeholder="Название"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <button
              onClick={handleAddModule}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Добавить модуль
            </button>
          </div>

          {/* Список модулей */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Список модулей</h2>
            <div className="space-y-2">
              {modules.map(module => (
                <div key={module.id} className="p-4 border rounded flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{module.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{module.slug}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingModule(module)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => deleteModule(module.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Экспорт/Импорт */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Управление данными</h2>
            <div className="flex space-x-4">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Импорт
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Уроки</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Управление уроками будет добавлено в следующей версии.
          </p>
          <div className="mt-4 space-y-2">
            {lessons.slice(0, 5).map(lesson => (
              <div key={lesson.id} className="p-3 border rounded">
                <h3 className="font-bold">{lesson.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Модуль: {lesson.module} • Длительность: {lesson.duration} мин
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
