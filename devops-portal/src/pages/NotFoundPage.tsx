import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="h-24 w-24 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Страница не найдена</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          К сожалению, страница которую вы ищете не существует или была перемещена.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="h-5 w-5 mr-2" />
          На главную
        </Link>
      </div>
    </div>
  )
}
