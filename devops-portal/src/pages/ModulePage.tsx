import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { contentService } from '../services/contentService'
import { useProgress } from '../hooks/useProgress'
import type { Module, Lesson } from '../types'
import { ArrowLeft, CheckCircle, Circle, Clock } from 'lucide-react'

export default function ModulePage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>()
  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const { progress } = useProgress()

  useEffect(() => {
    if (!moduleSlug) return
    
    Promise.all([
      contentService.getModuleBySlug(moduleSlug),
      loadLessons(moduleSlug)
    ]).then(([mod, less]) => {
      setModule(mod)
      setLessons(less)
      setLoading(false)
    })
  }, [moduleSlug])

  async function loadLessons(slug: string) {
    const mod = await contentService.getModuleBySlug(slug)
    if (!mod) return []
    
    const lessonPromises = mod.lessons.map(lessonSlug =>
      contentService.getLesson(slug, lessonSlug)
    )
    const results = await Promise.all(lessonPromises)
    return results.filter((l): l is Lesson => l !== null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Загрузка...</div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Модуль не найден
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link to="/modules" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад к модулям
      </Link>

      {/* Module Header */}
      <div className="card mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {module.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{module.description}</p>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Clock className="h-5 w-5" />
            <span>{module.estimatedDuration} минут</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <span>Уроков: {module.lessons.length}</span>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const isCompleted = progress.completedLessons.includes(lesson.id)
          
          return (
            <Link
              key={lesson.id}
              to={`/modules/${moduleSlug}/${lesson.slug}`}
              className="card hover:shadow-lg transition-all block"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-blue-600">Урок {index + 1}</span>
                      <span className={`badge ${
                        lesson.difficulty === 'beginner' ? 'badge-success' :
                        lesson.difficulty === 'intermediate' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {lesson.difficulty === 'beginner' ? 'Начинающий' :
                         lesson.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{lesson.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {lesson.duration} мин
                  </span>
                  <div className="text-sm font-medium text-blue-600 mt-1">
                    +{lesson.xpReward} XP
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
