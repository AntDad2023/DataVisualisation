# 项目架构

> 最后更新：2026-02-10

## 目录结构

```
DataVisualisation/
├── index.html                  # Vite 入口 HTML
├── package.json                # 依赖与脚本
├── vite.config.ts              # Vite 配置（React + TailwindCSS 插件）
├── tsconfig.json               # TypeScript 配置
├── .gitignore
├── README.md
├── docs/plans/                 # 产品设计文档与执行计划
├── memory-bank/                # 项目记忆库（设计/技术/架构/进度）
└── src/
    ├── main.tsx                # React 入口，挂载 App + BrowserRouter
    ├── App.tsx                 # 路由配置（/, /charts, /charts/:id, /generator）
    ├── index.css               # 全局样式（TailwindCSS 导入）
    ├── vite-env.d.ts           # Vite 类型声明
    ├── components/
    │   └── Layout.tsx          # 全局布局：导航栏 + Outlet + 页脚
    ├── pages/
    │   ├── Home.tsx            # 首页：课程介绍 + 入口按钮
    │   ├── ChartList.tsx       # 图表库列表：21种图表卡片 + 7类分类筛选
    │   ├── ChartDetail.tsx     # 图表详情：教学4区块 + 示例数据表格 + 带入生成器
    │   └── Generator.tsx       # 生成器：数据输入 + 预览 + 图表类型选择 + 字段映射 + ECharts渲染
    ├── data/
    │   └── chartsData.ts       # 21种图表元数据（类型定义 + 教学内容 + 示例数据）
    └── utils/
        ├── types.ts            # ParsedData 接口定义（columns, rows, columnTypes）
        ├── csvParser.ts        # CSV 文件解析（papaparse）→ ParsedData
        ├── pasteParser.ts      # 粘贴文本解析（Tab/逗号分隔）→ ParsedData
        ├── columnAnalyzer.ts   # 数值列识别（80%阈值）
        └── chartConfigs/
            ├── index.ts        # 统一导出 + SUPPORTED_CHART_TYPES 列表
            ├── bar.ts          # 条形图 ECharts 配置生成
            ├── stackedBar.ts   # 堆叠柱状图配置生成
            ├── line.ts         # 折线图配置生成（支持多Y轴）
            ├── scatter.ts      # 散点图配置生成（支持分类着色）
            ├── pie.ts          # 饼图配置生成
            ├── histogram.ts    # 直方图配置生成（手动分箱）
            ├── boxplot.ts      # 箱线图配置生成（手动计算五数概括）
            └── heatmap.ts      # 热力图配置生成
```

## 数据流

```
用户输入（CSV文件/粘贴文本）
    ↓
csvParser.ts / pasteParser.ts
    ↓ 调用 columnAnalyzer.ts
ParsedData { columns, rows, columnTypes }
    ↓
Generator.tsx（数据预览 + 字段映射 UI）
    ↓ 用户选择图表类型和字段
chartConfigs/*.ts（生成 ECharts option）
    ↓
echarts-for-react（渲染图表）
```

## 关键接口

### ParsedData（src/utils/types.ts）
```typescript
interface ParsedData {
  columns: string[]                    // 列名
  rows: (string | number)[][]          // 数据行
  columnTypes: ('number' | 'string')[] // 每列类型
}
```

### ChartMeta（src/data/chartsData.ts）
```typescript
interface ChartMeta {
  id: string
  name: string
  description: string
  categories: ChartCategory[]
  whatIs: string
  whenToUse: string[]
  whenNotToUse: string[]
  dataRequirements: string
  exampleData: { columns: string[]; rows: (string | number)[][] }
  generatorSupported: boolean
}
```

### 图表配置函数（src/utils/chartConfigs/*.ts）
每个文件导出：
- `FieldMapping` 接口：该图表需要的字段映射
- `generate*Option(data: ParsedData, mapping: FieldMapping) → ECharts option`

## 关键设计决策

1. **ECharts 按需注册**：在 Generator.tsx 中只注册用到的 6 种图表组件，减小体积
2. **数值列自动识别**：80% 阈值——非空值中 80% 以上可转数字则标记为数值列
3. **粘贴分隔符检测**：优先 Tab（Excel 复制），无 Tab 则用逗号
4. **图表元数据集中管理**：chartsData.ts 一个文件管理 21 种图表，详情页和列表页共用
5. **字段映射动态 UI**：Generator.tsx 根据 chartType 用 switch 渲染不同的下拉框组合
