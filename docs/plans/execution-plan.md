# 执行计划表

> 最后更新：2026-02-10  
> 项目：DataVisualisation 数据可视化课程网站

---

## 总览

| 批次 | 任务 | 状态 | 依赖 | 说明 |
|------|------|------|------|------|
| 0 | GitHub 仓库初始化 | ⏳ 等待用户创建 | 无 | 用户在 GitHub 上创建仓库后关联 |
| 1 | 项目骨架初始化 | 🔲 待开始 | 批次0 | Vite+React+TS+TailwindCSS+路由+依赖 |
| 2A | 首页 + 全局导航栏 | 🔲 待开始 | 批次1 | Home.tsx + Layout.tsx |
| 2B | 图表库列表页 + 图表元数据 | 🔲 待开始 | 批次1 | chartsData.ts + ChartList.tsx |
| 2C | 数据解析模块 | 🔲 待开始 | 批次1 | CSV解析 + 粘贴解析 + 数值列识别 |
| 3A | 图表详情页（21个图表教学内容） | 🔲 待开始 | 批次2B | ChartDetail.tsx + 21个图表数据 |
| 3B | 生成器页面（8种图表渲染） | 🔲 待开始 | 批次2C | Generator.tsx + 字段映射 + ECharts |
| 4 | 文档完善 + 部署配置 | 🔲 待开始 | 批次3 | README更新 + 部署脚本 |

**状态说明**：✅ 已完成 | 🔄 进行中 | 🔲 待开始 | ⏳ 等待中 | ❌ 阻塞

---

## 批次 0：GitHub 仓库初始化

### 用户操作
1. 在 https://github.com/new 创建仓库 `DataVisualisation`
2. 不勾选 README / .gitignore / License（本地已有）
3. 将仓库地址告知开发者

### 开发者操作
```bash
cd D:\WindsurfProject\DataVisualisation
git init
git add .
git commit -m "init: 产品设计文档"
git remote add origin <仓库地址>
git push -u origin main
```

---

## 批次 1：项目骨架初始化

### 目标
搭建可运行的空项目，`npm run dev` 能看到空白页面

### 具体步骤
1. 用 Vite 创建 React + TypeScript 项目
2. 安装依赖：
   - `echarts` + `echarts-for-react`
   - `papaparse` + `@types/papaparse`
   - `react-router-dom`
   - `tailwindcss` + `@tailwindcss/vite`
3. 配置 TailwindCSS
4. 创建目录结构：
   ```
   src/
   ├── components/       # 公共组件（导航栏、布局等）
   ├── pages/            # 页面组件
   │   ├── Home.tsx
   │   ├── ChartList.tsx
   │   ├── ChartDetail.tsx
   │   └── Generator.tsx
   ├── data/             # 图表元数据、示例数据
   ├── utils/            # 工具函数（数据解析等）
   ├── App.tsx           # 路由配置
   └── main.tsx          # 入口
   ```
5. 配置路由（/, /charts, /charts/:id, /generator）
6. 验证：`npm run dev` 能正常启动

### 产出
- 可运行的空项目
- Git 提交：`feat: 项目骨架初始化`

---

## 批次 2A：首页 + 全局导航栏

### 目标
用户打开网站看到课程入口页，能导航到图表库和生成器

### 具体内容
- **导航栏**（Layout.tsx）：Logo + 首页 / 图表库 / 生成器 三个链接
- **首页**（Home.tsx）：
  - 标题：数据可视化课程
  - 副标题：一句话介绍
  - 两个入口按钮：去图表库 / 去生成器
  - "你会学到什么"（3-5 条列表）

### 产出
- Git 提交：`feat: 首页与导航栏`

---

## 批次 2B：图表库列表页 + 图表元数据

### 目标
展示 21 种图表的卡片列表，支持按用途分类筛选

### 具体内容
- **图表元数据**（data/chartsData.ts）：
  - 21 种图表的 id、名称、一句话描述、分类标签、示意图（可先用占位符）
  - 分类：对比、趋势、占比、分布、关系、层级、流向
- **列表页**（ChartList.tsx）：
  - 顶部分类筛选按钮
  - 图表卡片网格（图表名 + 描述 + 分类标签）
  - 点击跳转到 /charts/:id

### 产出
- Git 提交：`feat: 图表库列表页`

---

## 批次 2C：数据解析模块

### 目标
纯工具函数，不涉及 UI，为生成器提供数据解析能力

### 具体内容
- **CSV 解析**（utils/csvParser.ts）：
  - 使用 papaparse 解析上传的 CSV 文件
  - 返回 { columns: string[], rows: any[][], columnTypes: ('number'|'string')[] }
- **粘贴解析**（utils/pasteParser.ts）：
  - 检测分隔符（Tab 优先，逗号其次）
  - 解析为相同格式
- **数值列识别**（utils/columnAnalyzer.ts）：
  - 扫描每列，80%+ 可转数字 → 标记为数值列
- **单元测试**：至少覆盖 CSV 解析、粘贴解析、数值列识别各 2 个用例

### 产出
- Git 提交：`feat: 数据解析模块`

---

## 批次 3A：图表详情页

### 目标
每个图表有完整的教学内容页面

### 具体内容
- **详情页模板**（ChartDetail.tsx）：
  - 4 个区块：是什么 / 什么时候用 / 数据格式要求 / 示例
  - "带入生成器"按钮（跳转到 /generator 并预设图表类型）
- **21 个图表的教学数据**（data/chartsData.ts 扩展）：
  - 每个图表填充 4 个区块的文字内容
  - 每个图表提供一组示例数据

### 产出
- Git 提交：`feat: 图表详情页`

---

## 批次 3B：生成器页面

### 目标
用户能上传/粘贴数据 → 选择图表 → 看到生成的图表

### 具体内容
- **生成器页面**（Generator.tsx）：
  - 左侧面板：
    1. 数据输入区（上传 CSV 按钮 + 粘贴文本框 + 解析按钮）
    2. 表格预览（前 10 行）
    3. 图表类型选择（下拉，8 种）
    4. 字段映射（根据图表类型动态显示下拉框）
    5. 生成按钮
  - 右侧面板：ECharts 图表渲染区
- **8 种图表的 ECharts 配置生成器**（utils/chartConfigs/）：
  - 每种图表一个函数：接收 (data, fieldMapping) → 返回 ECharts option
  - bar.ts / stackedBar.ts / line.ts / scatter.ts / pie.ts / histogram.ts / boxplot.ts / heatmap.ts

### 产出
- Git 提交：`feat: 图表生成器`

---

## 批次 4：文档完善 + 部署

### 具体内容
- 更新 README.md（最终版）
- 配置 `vite.config.ts` 的 base 路径（如果部署到 GitHub Pages）
- 添加 `npm run build` 验证
- 最终全站测试

### 产出
- Git 提交：`docs: 完善文档与部署配置`
