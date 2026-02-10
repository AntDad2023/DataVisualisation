import { useState } from 'react'
import { Link } from 'react-router-dom'
import { chartsData, ALL_CATEGORIES, type ChartCategory } from '../data/chartsData'

function ChartList() {
  const [activeCategory, setActiveCategory] = useState<ChartCategory | '全部'>('全部')

  const filteredCharts = activeCategory === '全部'
    ? chartsData
    : chartsData.filter((c) => c.categories.includes(activeCategory))

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* 标题 */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">图表库</h1>
      <p className="text-gray-600 mb-6">
        浏览 {chartsData.length} 种常见数据可视化图表，了解它们的用途与使用方法
      </p>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('全部')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === '全部'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部（{chartsData.length}）
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const count = chartsData.filter((c) => c.categories.includes(cat)).length
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}（{count}）
            </button>
          )
        })}
      </div>

      {/* 图表卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCharts.map((chart) => (
          <Link
            key={chart.id}
            to={`/charts/${chart.id}`}
            className="block p-5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{chart.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{chart.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {chart.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                >
                  {cat}
                </span>
              ))}
              {chart.generatorSupported && (
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">
                  支持生成
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ChartList
