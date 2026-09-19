import { useState, useEffect } from 'react'
import { contentService } from '../services/contentService'
import type { Module, Lesson } from '../types'

export function useAdmin() {
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const mods = await contentService.getModules()
      setModules(mods)
    } catch (err) {
      console.error('Error loading modules:', err)
    }
  }

  const addModule = (module: Omit<Module, 'id' | 'updatedAt'>) => {
    // В реальной реализации здесь был бы API вызов
    // Для демонстрации просто обновляем локальное состояние
    const newModule: Module = {
      ...module,
      id: `module-${Date.now()}`,
      updatedAt: new Date().toISOString()
    }
    setModules(prev => [...prev, newModule])
    alert('Модуль добавлен (демо режим - данные не сохраняются)')
  }

  const updateModule = (id: string, updatedModule: Partial<Module>) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...updatedModule } : m))
  }

  const deleteModule = (id: string) => {
    if (confirm('Вы уверены? Это удалит модуль и все связанные уроки.')) {
      setModules(prev => prev.filter(m => m.id !== id))
    }
  }

  const exportContent = () => {
    const data = JSON.stringify({ modules, lessons }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'devops-portal-content.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importContent = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const content = JSON.parse(event.target?.result as string)
            if (content.modules) setModules(content.modules)
            if (content.lessons) setLessons(content.lessons)
            alert('Контент успешно импортирован!')
          } catch (err) {
            alert('Ошибка при импорте файла')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return {
    modules,
    lessons,
    addModule,
    updateModule,
    deleteModule,
    exportContent,
    importContent
  }
}
