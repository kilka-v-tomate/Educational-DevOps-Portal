import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { contentService } from '../services/contentService'
import { useProgress } from '../hooks/useProgress'
import type { Module } from '../types'
import { Book, Clock, TrendingUp } from 'lucide-react'

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const { progress } = useProgress()

  useEffect(() => {
    contentService.getModules().then(data => {
      setModules(data.sort((a, b) => a.order - b.order))
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Загрузка модулей...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Модули обучения
      </h1>

      <div className="grid gap-6">
        {modules.map((module) => {
          const completedLessons = module.lessons.filter(l => 
            progress.completedLessons.includes(l)
          ).length
          const totalLessons = module.lessons.length
          const progressPercent = Math.round((completedLessons / totalLessons) * 100)

          return (
            <Link
              key={module.id}
              to={`/modules/${module.slug}`}
              className="card hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Book className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {module.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
                <span className={`badge ${
                  module.difficulty === 'beginner' ? 'badge-success' :
                  module.difficulty === 'intermediate' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {module.difficulty === 'beginner' ? 'Начинающий' :
                   module.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {module.estimatedDuration} мин
                </span>
                <span className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {module.lessons.length} уроков
                </span>
              </div>

              {/* Progress bar */}
              <div className="progress-bar mb-2">
                <div 
                  className="progress-bar-fill bg-blue-600"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Прогресс: {completedLessons}/{totalLessons} ({progressPercent}%)
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
