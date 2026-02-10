import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* 主标题区 */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          数据可视化课程
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          学习如何用图表讲故事——从认识图表到动手生成，一站式掌握数据可视化核心技能
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/charts"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            去图表库
          </Link>
          <Link
            to="/generator"
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            去生成器
          </Link>
        </div>
      </div>

      {/* 你会学到什么 */}
      <div className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">你会学到什么</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '📊', title: '认识 21 种常见图表', desc: '了解每种图表的用途、适用场景和常见误区' },
            { icon: '📋', title: '理解数据与图表的关系', desc: '知道什么样的数据适合什么图表' },
            { icon: '🛠️', title: '动手生成图表', desc: '上传数据集，选择图表类型，一键生成可视化' },
            { icon: '💡', title: '掌握可视化最佳实践', desc: '学会用图表准确、清晰地传达数据信息' },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 p-4 bg-white rounded-lg">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
