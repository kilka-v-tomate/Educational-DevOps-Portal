import { useState, useEffect } from 'react'
import type { ReferenceEntry } from '../types'
import { contentService } from '../services/contentService'
import { Search, Filter, BookOpen } from 'lucide-react'

export default function ReferencePage() {
  const [items, setItems] = useState<ReferenceEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<ReferenceEntry | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    contentService.getReference().then(data => {
      setItems(data)
      const cats = Array.from(new Set(data.map(i => i.category)))
      setCategories(cats)
    })
  }, [])

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Справочник</h1>
        <p className="text-gray-600 dark:text-gray-400">
          База знаний по DevOps технологиям и инструментам
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Фильтры
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Категория</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="all">Все категории</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Популярные статьи
            </h2>
            <ul className="space-y-2">
              {items.slice(0, 5).map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="text-blue-600 hover:underline text-left w-full truncate"
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по справочнику..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {selectedItem ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedItem.title}</h2>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                    {selectedItem.category}
                  </span>
                  {selectedItem.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedItem.content}</p>

                  {selectedItem.examples && selectedItem.examples.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Примеры</h3>
                      {selectedItem.examples.map((example, index) => (
                        <div key={index} className="mb-4">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <code>{(example as any).code || example}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map(item => (
                      <div 
                        key={item.id} 
                        className="border rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                            {item.category}
                          </span>
                          {item.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {item.content.substring(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Ничего не найдено</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      Попробуйте изменить поисковый запрос или фильтры
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
