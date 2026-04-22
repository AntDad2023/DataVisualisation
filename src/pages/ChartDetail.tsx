import { useParams, Link, useNavigate } from 'react-router-dom'
import { chartsData, type ChartMeta } from '../data/chartsData'
import { exampleToParsedData } from '../utils/exampleToParsedData'

/**
 * 点击"带入生成器"：把示例数据 + 字段映射写入 sessionStorage，
 * 供 Generator 挂载时读取并自动生成图表。
 */
function handleOpenInGenerator(chart: ChartMeta, navigate: (path: string) => void) {
  const parsedData = exampleToParsedData(chart.exampleData)
  const payload = {
    chartType: chart.id,
    parsedData,
    defaultMapping: chart.defaultMapping ?? {},
  }
  sessionStorage.setItem('generator:autofill', JSON.stringify(payload))
  navigate(`/generator?chart=${chart.id}`)
}

function ChartDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const chart = chartsData.find((c) => c.id === id)

  if (!chart) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link to="/charts" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← 返回图表库
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">未找到该图表</h1>
        <p className="text-gray-500 mt-2">请检查 URL 是否正确，或返回图表库浏览。</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 返回链接 */}
      <Link to="/charts" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        ← 返回图表库
      </Link>

      {/* 标题区 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{chart.name}</h1>
          <div className="flex gap-1.5">
            {chart.categories.map((cat) => (
              <span key={cat} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
        <p className="text-gray-600">{chart.description}</p>
      </div>

      {/* 区块 1：是什么 */}
      <section className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-3">📖 是什么</h2>
        <p className="text-gray-700 leading-relaxed">{chart.whatIs}</p>
      </section>

      {/* 区块 2：什么时候用 / 不该用 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <section className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-bold text-green-800 mb-3">✅ 什么时候用</h2>
          <ul className="space-y-2">
            {chart.whenToUse.map((item, i) => (
              <li key={i} className="text-sm text-green-700 flex gap-2">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-800 mb-3">❌ 什么时候不该用</h2>
          <ul className="space-y-2">
            {chart.whenNotToUse.map((item, i) => (
              <li key={i} className="text-sm text-red-700 flex gap-2">
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 区块 3：数据格式要求 */}
      <section className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-3">📋 数据格式要求</h2>
        <p className="text-gray-700 mb-4">{chart.dataRequirements}</p>

        {/* 示例数据表格 */}
        <h3 className="text-sm font-semibold text-gray-500 mb-2">示例数据</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {chart.exampleData.columns.map((col) => (
                  <th key={col} className="px-4 py-2 text-left font-medium text-gray-700 border border-gray-200">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.exampleData.rows.slice(0, 8).map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2 text-gray-600 border border-gray-200">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {chart.exampleData.rows.length > 8 && (
            <p className="text-xs text-gray-400 mt-1">
              （仅展示前 8 行，共 {chart.exampleData.rows.length} 行）
            </p>
          )}
        </div>
      </section>

      {/* 区块 4：带入生成器 */}
      {chart.generatorSupported && (
        <section className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <h2 className="text-lg font-bold text-blue-800 mb-2">🛠️ 试试看</h2>
          <p className="text-sm text-blue-700 mb-4">
            用上面的示例数据，在生成器中生成一个{chart.name}
          </p>
          <button
            onClick={() => handleOpenInGenerator(chart, navigate)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            带入生成器
          </button>
        </section>
      )}
    </div>
  )
}

export default ChartDetail
