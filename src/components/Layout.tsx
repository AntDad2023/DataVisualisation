import { NavLink, Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <NavLink to="/" className="text-xl font-bold text-blue-600">
            📊 数据可视化课程
          </NavLink>
          <div className="flex gap-6">
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
