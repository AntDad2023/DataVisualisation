# 技术栈

> 最后更新：2026-02-10

## 核心依赖

| 依赖 | 版本 | 用途 | 替代方案 | 备注 |
|------|------|------|----------|------|
| react | ^19.0.0 | UI 框架 | Vue / Svelte | 生态最成熟 |
| react-dom | ^19.0.0 | React DOM 渲染 | — | 与 React 配套 |
| react-router-dom | ^7.1.5 | 客户端路由 | — | SPA 必需 |
| echarts | ^5.6.0 | 图表渲染引擎 | Chart.js / D3 | 图表类型最全，中文文档好 |
| echarts-for-react | ^3.0.2 | ECharts React 封装 | 直接用 echarts API | 简化 React 集成 |
| papaparse | ^5.5.2 | CSV 解析 | 手写解析 | 成熟稳定，处理边界情况好 |
| tailwindcss | ^4.0.6 | CSS 工具类框架 | 手写 CSS | 快速开发，一致性好 |

## 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| vite | ^6.1.0 | 构建工具 + 开发服务器 |
| typescript | ~5.7.2 | 类型检查 |
| @vitejs/plugin-react | ^4.3.4 | Vite React 插件 |
| @tailwindcss/vite | ^4.0.6 | Vite TailwindCSS 插件 |
| @types/papaparse | ^5.3.15 | papaparse 类型定义 |
| @types/react | ^19.0.8 | React 类型定义 |
| @types/react-dom | ^19.0.3 | React DOM 类型定义 |

## 架构决策

- **纯前端 SPA**：无后端，所有逻辑在浏览器端完成，支持离线使用
- **ECharts 按需加载**：在 Generator.tsx 中按需注册图表组件，减小打包体积
- **数据解析与渲染分离**：utils/ 下的解析模块与 chartConfigs/ 下的配置生成器独立，互不耦合
