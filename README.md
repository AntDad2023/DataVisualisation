# DataVisualisation 数据可视化课程网站

## 项目简介

这是一个用于"数据可视化"课程的教学网站，**纯前端实现**，支持离线使用。面向数据可视化初学者：认识图表 → 理解数据 → 动手生成。

**线上地址**：<https://antdad2023.github.io/DataVisualisation/>

## 核心功能

### 1. 图表库（教学内容）
- 展示 **21 种**常见图表的介绍、适用场景、数据格式要求与示例
- 每个图表统一讲解结构：是什么 / 什么时候用 / 什么时候不该用 / 数据要求 / 示例
- 支持按 **7 类用途**筛选：对比、趋势、占比、分布、关系、层级、流向
- 详情页支持"一键带入生成器"

### 2. 图表生成器（练习区）
- 支持 **CSV 上传** 和 **粘贴表格**（Tab / 逗号自动检测）两种输入
- 自动识别数值列与文本列（80% 阈值规则）
- 当前支持 **11 种**图表：条形图、堆叠柱状图、折线图、面积图、散点图、饼图、直方图、箱线图、热力图、雷达图、漏斗图
- 选择图表类型后动态显示字段映射下拉框，**实时**用 ECharts 渲染
- **一键下载 PNG**：生成后右上角按钮即可保存 2x 分辨率的白底 PNG

## 技术栈

- **框架**：React 18 + Vite 6 + TypeScript 5
- **图表库**：ECharts 5（通过 echarts-for-react）
- **CSV 解析**：papaparse
- **样式**：TailwindCSS 4
- **路由**：react-router-dom 6（HashRouter，便于 GitHub Pages 部署）
- **测试**：Vitest 2
- **部署**：GitHub Pages + GitHub Actions

## 本地运行

```bash
npm install
npm run dev
```

## 生产构建

```bash
npm run build      # tsc 类型检查 + vite 构建
npm run preview    # 本地预览 dist/
```

构建产物（已做 manualChunks 分包，首屏只加载应用代码 + react-vendor）：

| chunk | 大小（min） | gzip |
|-------|------------|------|
| `index.js`（应用代码） | ~73 KB | ~23 KB |
| `react-vendor.js` | ~168 KB | ~55 KB |
| `echarts.js`（echarts + zrender） | ~626 KB | ~209 KB |

## 单元测试

```bash
npm run test       # 监听模式（开发时）
npm run test:run   # 一次性执行（CI / 提交前）
```

测试覆盖 `src/utils/` 下的纯函数：数据解析（CSV / 粘贴）、列类型识别（80% 阈值）、示例数据转换（ChartMeta → ParsedData）、option builder 分发与字段校验、全部 11 种图表的 option 生成器（含直方图分箱、箱线图五数概括、雷达图 max 计算等易出错的数值逻辑）。当前 **15 个测试文件 / 98 个用例**，其中包含 11 条端到端断言保证所有"带入生成器"按钮必能成图。

## 目录结构与架构

见 [`memory-bank/architecture.md`](memory-bank/architecture.md)。

## 设计文档

- 产品设计：[`memory-bank/product-design-document.md`](memory-bank/product-design-document.md)
- 技术栈：[`memory-bank/tech-stack.md`](memory-bank/tech-stack.md)
- 实现计划：[`memory-bank/implementation-plan.md`](memory-bank/implementation-plan.md)
- 进度：[`memory-bank/progress.md`](memory-bank/progress.md)

## 当前状态

- [x] 产品规格确认
- [x] 项目骨架、首页、图表库、图表详情、生成器
- [x] GitHub Pages 部署上线
- [x] 核心 utils 单元测试覆盖（Vitest，15 文件 / 98 用例）
- [x] 生成器扩展到 11 种图表（+ 面积 / 雷达 / 漏斗）
- [x] 图表导出 PNG（一键下载）
- [x] Vite 构建 chunk 代码分割优化
- [ ] 动态 import() 把 echarts 挪到路由级懒加载（未来可选）
- [ ] 其余 10 种图表加入生成器（未来可选）
