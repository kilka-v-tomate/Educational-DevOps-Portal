import { Link } from 'react-router-dom'
import { BookOpen, Terminal, Book, Award, ArrowRight } from 'lucide-react'
import { useProgress } from '../hooks/useProgress'

export default function HomePage() {
  const { progress, profile } = useProgress()

  const features = [
    {
      icon: BookOpen,
      title: 'Обучение',
      description: 'Полноценные модули от основ Linux до Kubernetes и CI/CD',
      link: '/modules'
    },
    {
      icon: Terminal,
      title: 'Тренажер терминала',
      description: 'Практикуйте команды Linux в интерактивном симуляторе',
      link: '/terminal'
    },
    {
      icon: Book,
      title: 'Справочник',
      description: 'Быстрый поиск по командам, терминам и концепциям',
      link: '/reference'
    },
    {
      icon: Award,
      title: 'Прогресс и достижения',
      description: 'Отслеживайте свой прогресс и получайте сертификаты',
      link: '/profile'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Образовательный DevOps Портал
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            От специалиста техподдержки до Junior DevOps инженера
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/modules"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Начать обучение
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/terminal"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Тренажер терминала
            </Link>
          </div>
        </div>
      </section>

      {/* Progress Summary */}
      {progress.completedLessons.length > 0 && (
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{progress.completedLessons.length}</div>
                <div className="text-gray-600 dark:text-gray-400">Уроков пройдено</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{progress.xp}</div>
                <div className="text-gray-600 dark:text-gray-400">XP очков</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{progress.level}</div>
                <div className="text-gray-600 dark:text-gray-400">Уровень</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{progress.achievements.length}</div>
                <div className="text-gray-600 dark:text-gray-400">Достижений</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Возможности портала
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.title}
                  to={feature.link}
                  className="card hover:shadow-lg transition-shadow group"
                >
                  <Icon className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Welcome Message */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Добро пожаловать{profile.name !== 'Студент' ? `, ${profile.name}` : ''}!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Этот портал создан для того, чтобы помочь вам освоить навыки DevOps инженера.
            Здесь вы найдете теоретические материалы, практические задания и интерактивный тренажер терминала.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
              С чего начать?
            </h3>
            <ol className="text-left space-y-3 text-blue-800 dark:text-blue-200">
              <li>1. Пройдите модуль <strong>"Основы Linux"</strong></li>
              <li>2. Практикуйтесь в <strong>тренажере терминала</strong></li>
              <li>3. Используйте <strong>справочник</strong> для поиска информации</li>
              <li>4. Отслеживайте прогресс в <strong>профиле</strong></li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
