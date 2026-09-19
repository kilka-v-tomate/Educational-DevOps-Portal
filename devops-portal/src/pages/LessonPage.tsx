import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { contentService } from '../services/contentService'
import { useProgress } from '../hooks/useProgress'
import type { Lesson, ContentBlock, CodeBlock, TableData } from '../types'
import { ArrowLeft, Bookmark, CheckCircle, Copy } from 'lucide-react'
import { copyToClipboard } from '../utils/helpers'

export default function LessonPage() {
  const { moduleSlug, lessonSlug } = useParams<{ moduleSlug: string; lessonSlug: string }>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>({})
  const [quizResult, setQuizResult] = useState<{score: number; total: number; passed: boolean} | null>(null)
  const { completeLesson, toggleBookmark, isBookmarked, saveQuizResult } = useProgress()

  useEffect(() => {
    if (!moduleSlug || !lessonSlug) return
    contentService.getLesson(moduleSlug, lessonSlug).then(data => {
      setLesson(data)
      setLoading(false)
    })
  }, [moduleSlug, lessonSlug])

  const handleComplete = () => {
    if (lesson) {
      completeLesson(lesson.id, lesson.xpReward)
    }
  }

  const handleQuizSubmit = () => {
    if (!lesson?.quiz) return
    let score = 0
    let total = 0

    lesson.quiz.questions.forEach(q => {
      total += q.points
      const answer = quizAnswers[q.id]
      if (Array.isArray(q.correctAnswer)) {
        if (Array.isArray(answer) && answer.length === q.correctAnswer.length && 
            q.correctAnswer.every(a => answer.includes(a))) {
          score += q.points
        }
      } else {
        if (answer === q.correctAnswer) score += q.points
      }
    })

    const passed = (score / total) >= (lesson.quiz.passingScore / 100)
    setQuizResult({ score, total, passed })
    saveQuizResult(lesson.id, { score, totalPoints: total, answers: quizAnswers })
  }

  if (loading || !lesson) {
    return <div className="flex items-center justify-center min-h-[400px]">Загрузка...</div>
  }

  const renderBlock = (block: ContentBlock, idx: number) => {
    switch (block.type) {
      case 'heading':
        return <h2 key={idx} className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">{String(block.content)}</h2>
      case 'paragraph':
        return <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{String(block.content)}</p>
      case 'list':
        return (
          <ul key={idx} className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
            {(block.content as string[]).map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        )
      case 'code':
        const cb = block.content as CodeBlock
        return (
          <div key={idx} className="relative mb-4">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{cb.code}</code>
            </pre>
            <button onClick={() => copyToClipboard(cb.code)} className="absolute top-2 right-2 p-2 bg-gray-700 rounded hover:bg-gray-600">
              <Copy className="h-4 w-4 text-white" />
            </button>
          </div>
        )
      case 'note':
        return (
          <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-4 rounded-r">
            <p className="font-semibold text-blue-900 dark:text-blue-100">{(block as any).title}</p>
            <p className="text-blue-800 dark:text-blue-200">{String(block.content)}</p>
          </div>
        )
      case 'warning':
        return (
          <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-4 rounded-r">
            <p className="font-semibold text-yellow-900 dark:text-yellow-100">{(block as any).title}</p>
            <p className="text-yellow-800 dark:text-yellow-200">{String(block.content)}</p>
          </div>
        )
      case 'tip':
        return (
          <div key={idx} className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-4 rounded-r">
            <p className="font-semibold text-green-900 dark:text-green-100">{(block as any).title}</p>
            <p className="text-green-800 dark:text-green-200">{String(block.content)}</p>
          </div>
        )
      case 'table':
        const td = block.content as TableData
        return (
          <div key={idx} className="overflow-x-auto mb-4">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  {td.headers.map((h, i) => <th key={i} className="border p-3 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {td.rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                    {row.map((cell, ci) => <td key={ci} className="border p-3">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={`/modules/${moduleSlug}`} className="inline-flex items-center text-blue-600 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Назад к модулю
      </Link>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{lesson.title}</h1>
            {lesson.subtitle && <p className="text-gray-600 dark:text-gray-400">{lesson.subtitle}</p>}
          </div>
          <button onClick={() => toggleBookmark(lesson.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Bookmark className={`h-6 w-6 ${isBookmarked(lesson.id) ? 'fill-blue-600 text-blue-600' : 'text-gray-400'}`} />
          </button>
        </div>

        <div className="flex gap-4 mb-6 text-sm text-gray-500">
          <span>⏱ {lesson.duration} мин</span>
          <span>📈 {lesson.difficulty === 'beginner' ? 'Начинающий' : lesson.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}</span>
          <span>✨ +{lesson.xpReward} XP</span>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          {lesson.blocks.map((block, idx) => renderBlock(block, idx))}
        </div>
      </div>

      {lesson.quiz && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">{lesson.quiz.title}</h2>
          {!quizResult ? (
            <>
              {lesson.quiz.questions.map((q, idx) => (
                <div key={q.id} className="mb-6 pb-6 border-b last:border-0">
                  <p className="font-medium mb-3">{idx + 1}. {q.question}</p>
                  {q.type === 'single-choice' || q.type === 'true-false' ? (
                    <div className="space-y-2">
                      {q.options?.map((opt, oi) => (
                        <label key={oi} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name={q.id} value={opt} onChange={(e) => setQuizAnswers({...quizAnswers, [q.id]: e.target.value})} className="text-blue-600" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              <button onClick={handleQuizSubmit} className="btn btn-primary">Проверить ответы</button>
            </>
          ) : (
            <div className={`p-4 rounded ${quizResult.passed ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <p className="font-bold">Результат: {quizResult.score}/{quizResult.total} ({Math.round(quizResult.score/quizResult.total*100)}%)</p>
              <p>{quizResult.passed ? '✅ Поздравляем! Тест пройден.' : '❌ Попробуйте еще раз.'}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button onClick={handleComplete} className="btn btn-success flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" /> Отметить как пройденный
        </button>
      </div>
    </div>
  )
}
