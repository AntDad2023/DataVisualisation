import { NavLink, Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            <NavLink to="/" className="text-xl font-bold text-blue-600">
              📊 数据可视化课程
            </NavLink>
            <div className="mt-1 text-xs text-gray-500">
              武汉理工大学经济学院 <span className="mx-2 text-gray-300">|</span> 主讲人：曹洪江
            </div>
          </div>
          <div className="flex gap-6 items-center">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`
              }
            >
              首页
            </NavLink>
            <NavLink
              to="/charts"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`
              }
            >
              图表库
            </NavLink>
            <NavLink
              to="/generator"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`
              }
            >
              生成器
            </NavLink>
            <div className="relative group">
              <button className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1">
                教程
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <a href="/DataVisualisation/docs/d3-tutorial.html" target="_blank" rel="noopener" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-t-lg">📐 D3.js 核心教程</a>
                <a href="/DataVisualisation/docs/echarts-tutorial.html" target="_blank" rel="noopener" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600">📊 ECharts 核心教程</a>
                <a href="/DataVisualisation/docs/d3-vs-echarts.html" target="_blank" rel="noopener" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600">⚖️ D3 vs ECharts 对比</a>
                <div className="border-t border-gray-100"></div>
                <a href="/DataVisualisation/docs/downloads.html" target="_blank" rel="noopener" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-b-lg">📁 课件下载</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 页面内容 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-50 border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
        数据可视化课程网站 © 2026
      </footer>
    </div>
  )
}

export default Layout
