import { useState, useEffect } from 'react'
import type { TerminalLab } from '../types'
import { terminalService } from '../services/terminalService'
import { useProgress } from '../hooks/useProgress'
import { Lightbulb, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'

export default function TerminalPage() {
  const [labs, setLabs] = useState<TerminalLab[]>([])
  const [selectedLab, setSelectedLab] = useState<TerminalLab | null>(null)
  const [currentLabIndex, setCurrentLabIndex] = useState(0)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<{ command: string; output: string }[]>([])
  const { completeLab, isLabCompleted } = useProgress()

  useEffect(() => {
    // Загружаем лабораторные работы из JSON
    fetch('/content/terminal-labs.json')
      .then(res => res.json())
      .then(data => {
        setLabs(data)
        if (data.length > 0) {
          setSelectedLab(data[0])
        }
      })
      .catch(err => console.error('Error loading labs:', err))
  }, [])

  const handleCommand = async (cmd: string) => {
    const result = terminalService.executeCommand(cmd)
    setHistory(prev => [...prev, { command: cmd, output: result.output }])
    
    // Проверка выполнения лабораторной
    if (selectedLab && !isLabCompleted(selectedLab.id)) {
      const state = terminalService.getState()
      const isCompleted = terminalService.checkLabCompletion(selectedLab, state)
      if (isCompleted) {
        completeLab(selectedLab.id, selectedLab.points)
        setHistory(prev => [...prev, { 
          command: '', 
          output: `\n✅ Задание выполнено! Вы получили ${selectedLab.points} XP\n` 
        }])
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    handleCommand(input)
    setInput('')
  }

  const nextLab = () => {
    if (currentLabIndex < labs.length - 1) {
      const nextIndex = currentLabIndex + 1
      setCurrentLabIndex(nextIndex)
      setSelectedLab(labs[nextIndex])
      setHistory([])
    }
  }

  const prevLab = () => {
    if (currentLabIndex > 0) {
      const prevIndex = currentLabIndex - 1
      setCurrentLabIndex(prevIndex)
      setSelectedLab(labs[prevIndex])
      setHistory([])
    }
  }

  if (!selectedLab) {
    return <div className="flex items-center justify-center min-h-[400px]">Загрузка...</div>
  }

  const labIsCompleted = isLabCompleted(selectedLab.id)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Тренажер терминала</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Практика командной строки Linux в безопасной среде
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Задания</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {labs.map((lab, index) => {
                const labCompleted = isLabCompleted(lab.id)
                return (
                  <button
                    key={lab.id}
                    onClick={() => {
                      setSelectedLab(lab)
                      setCurrentLabIndex(index)
                      setHistory([])
                    }}
                    className={`w-full text-left p-3 rounded flex justify-between items-center ${
                      selectedLab.id === lab.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="truncate">{lab.title}</span>
                    {labCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLab.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">{selectedLab.description}</p>
              </div>
              {labIsCompleted && (
                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> Завершено
                </span>
              )}
            </div>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Цель задания</h3>
              <p className="text-gray-700 dark:text-gray-300">{selectedLab.goal}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                Подсказки
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                {selectedLab.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>

            {/* Терминал */}
            <div className="bg-gray-900 text-green-400 font-mono text-sm rounded-lg overflow-hidden border border-gray-700">
              <div className="bg-gray-800 px-4 py-2 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="ml-4 text-gray-300">bash</span>
              </div>
              <div className="p-4 h-64 overflow-y-auto">
                {history.map((entry, index) => (
                  <div key={index} className="mb-2">
                    <div className="text-blue-400">$ {entry.command}</div>
                    <div className="whitespace-pre-wrap">{entry.output}</div>
                  </div>
                ))}
                
                <form onSubmit={handleSubmit} className="flex">
                  <span className="text-blue-400 mr-2">$</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-transparent outline-none flex-1"
                    autoFocus
                    disabled={labIsCompleted}
                  />
                </form>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={prevLab}
                disabled={currentLabIndex === 0}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Назад
              </button>
              <button
                onClick={nextLab}
                disabled={currentLabIndex === labs.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Вперед <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
