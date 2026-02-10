import { useParams, Link } from 'react-router-dom'

function ChartDetail() {
  const { id } = useParams()

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link to="/charts" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← 返回图表库
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">图表详情：{id}</h1>
      <p className="text-gray-400">（图表详情内容即将上线）</p>
    </div>
  )
}

export default ChartDetail
