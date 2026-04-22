# 项目架构

> 最后更新：2026-04-22

## 目录结构

```
DataVisualisation/
├── index.html                  # Vite 入口 HTML
├── package.json                # 依赖与脚本（含 test/test:run）
├── vite.config.ts              # Vite 配置（React + TailwindCSS + manualChunks 分包）
├── vitest.config.ts            # Vitest 单元测试配置（node 环境，独立于生产构建）
├── tsconfig.json               # TypeScript 配置（build 时排除 *.test.ts）
├── .gitignore
├── README.md
├── docs/plans/                 # 产品设计文档与执行计划
├── docs/articles/              # 项目内沉淀的文章与对外发布文案
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
    │   └── Generator.tsx       # 生成器：数据输入 + 预览 + 图表类型选择 + 字段映射 + ECharts 渲染 + 下载 PNG
    ├── data/
    │   └── chartsData.ts       # 21种图表元数据（类型定义 + 教学内容 + 示例数据）
    └── utils/
        ├── types.ts                  # ParsedData 接口定义（columns, rows, columnTypes）
        ├── csvParser.ts              # CSV 文件解析（papaparse）→ ParsedData
        ├── pasteParser.ts            # 粘贴文本解析（Tab/逗号分隔）→ ParsedData
        ├── columnAnalyzer.ts         # 数值列识别（80%阈值）
        ├── exampleToParsedData.ts    # ChartMeta.exampleData → ParsedData（供"带入生成器"复用）
        ├── chartOptionBuilder.ts     # 根据 chartType + mapping 分发到具体 option 生成器，返回 {ok, option}|{ok:false, error}
        ├── __tests__/
        │   ├── columnAnalyzer.test.ts        # 列类型识别测试（13 用例）
        │   ├── pasteParser.test.ts           # 粘贴解析测试（12 用例）
        │   ├── exampleToParsedData.test.ts   # 示例数据转换测试（5 用例）
        │   └── chartOptionBuilder.test.ts    # option builder + 11 种图表端到端测试（18 用例）
        └── chartConfigs/
            ├── index.ts        # 统一导出 + SUPPORTED_CHART_TYPES 列表（11 种）
            ├── bar.ts          # 条形图 ECharts 配置生成
            ├── stackedBar.ts   # 堆叠柱状图配置生成
            ├── line.ts         # 折线图配置生成（支持多Y轴）
            ├── scatter.ts      # 散点图配置生成（支持分类着色）
            ├── pie.ts          # 饼图配置生成
            ├── histogram.ts    # 直方图配置生成（手动分箱）
            ├── boxplot.ts      # 箱线图配置生成（手动计算五数概括）
            ├── heatmap.ts      # 热力图配置生成
            ├── area.ts         # 面积图配置生成（折线图 + areaStyle）
            ├── radar.ts        # 雷达图配置生成（多对象 × 多维度，自动算 max）
            ├── funnel.ts       # 漏斗图配置生成（降序 + max=数据峰值）
            └── __tests__/
                ├── bar.test.ts         # 条形图 option 测试（5 用例）
                ├── stackedBar.test.ts  # 堆叠柱状图去重与填补测试（4 用例）
                ├── line.test.ts        # 折线图多 Y 轴与 legend 测试（5 用例）
                ├── scatter.test.ts     # 散点图分类与降级测试（4 用例）
                ├── pie.test.ts         # 饼图映射与 tooltip 测试（3 用例）
                ├── histogram.test.ts   # 直方图分箱逻辑测试（6 用例）
                ├── boxplot.test.ts     # 箱线图五数概括测试（5 用例）
                ├── heatmap.test.ts     # 热力图三元组 + visualMap 测试（4 用例）
                ├── area.test.ts        # 面积图 areaStyle / boundaryGap 测试（4 用例）
                ├── radar.test.ts       # 雷达图 indicator / max 1.2 倍测试（5 用例）
                └── funnel.test.ts      # 漏斗图降序 / max 测试（5 用例）
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

1. **ECharts 按需注册**：在 Generator.tsx 中只注册用到的 8 种图表组件（Bar/Line/Scatter/Pie/Heatmap/Boxplot/Radar/Funnel），减小体积
2. **数值列自动识别**：80% 阈值——非空值中 80% 以上可转数字则标记为数值列
3. **粘贴分隔符检测**：优先 Tab（Excel 复制），无 Tab 则用逗号
4. **图表元数据集中管理**：chartsData.ts 一个文件管理 21 种图表，详情页和列表页共用
5. **字段映射动态 UI**：Generator.tsx 根据 chartType 用 switch 渲染不同的下拉框组合
6. **测试与构建分离**：`vitest.config.ts` 独立配置，`tsconfig.json` 在 build 时排除 `*.test.ts`，保证 `npm run build` 产物不包含测试代码，测试只用 node 环境，不引入 jsdom 以保持启动最快
7. **Vite manualChunks 代码分割**：应用代码 / `echarts+zrender` / `react+react-dom+router` 分为三个 chunk，体积最大的 echarts 独立缓存，后续版本迭代不会让用户重新下载它
8. **图表导出 PNG**：Generator.tsx 通过 `ref` 获取 ECharts 实例，调用 `getDataURL({type:'png', pixelRatio:2, backgroundColor:'#fff'})` 拿到 data URL，动态创建 `<a download>` 触发浏览器保存
9. **雷达图数据布局约定**：一行 = 一个对象（nameField 列），多个数值列 = 多个维度；`max` 取每维度实际最大值 × 1.2 自动留 20% 余量，全 0 时兜底为 100
10. **"带入生成器"端到端自动化**：
    - `ChartMeta.defaultMapping` 写死每个 generatorSupported 图表的字段映射，与其 `exampleData` 一一对应
    - ChartDetail 点击按钮时构造 ParsedData 写入 `sessionStorage['generator:autofill']`（不污染 URL，避免 base64 编码复杂度）
    - Generator 挂载 useEffect 读 storage → 填 state → 直接用 payload 调 `buildChartOption`（不依赖 setState 时序）→ 清理 storage
    - 单元测试层面通过 11 条端到端断言（每个 generatorSupported 图表 × defaultMapping × exampleData 必须产出有效 option）锁死该契约，未来任何改动一破即红
11. **chartOptionBuilder 纯函数**：组件外导出，接收 `(data, chartType, mapping)` 返回 `{ok, option} | {ok:false, error}`。同时服务于手动生成与 autofill，集中校验逻辑、便于测试
12. **动态生成（所见即所得）**：Generator 用 useEffect 监听 `[parsedData, chartType, fieldMapping]`，字段完整时立即重算图表，字段不全则保留上次成功图表、不干扰用户编辑。"生成图表"按钮作为明确触发入口 + 错误诊断（点击后会把 builder 的 error 打到红框里）
13. **多选字段用 checkbox 列表而非 `<select multiple>`**：HTML multi-select 的 Ctrl+click 交互对新手极不友好（从截图诊断来看，用户常把"列表里看见 = 已选中"）。`line.yFields` 和 `radar.valueFields` 改为 checkbox 列表，勾选状态一眼可见，无需键盘辅助
14. **字段互斥三层防御**：严格禁止"一列同时给多个维度"（否则会画出"自己对自己"的无意义图表，如 X=销售额 Y=销售额 的折线）。三层协同：
    - **A 层 UI 互斥**：`renderFieldMapping` 中用 `isUsedByOtherDim` 给 `<option>`/`<input type=checkbox>` 加 `disabled` + "· 已用"/"· 已用作 X 轴" 明示标签，用户在 UI 就选不出冲突
    - **B 层 builder 校验**：`buildChartOption` 在 switch 前统一扫描所有字段值（排除 `binCount` 等非字段配置），冲突时返回 `kind:'conflict'` 带具体列名的 error
    - **C 层 动态反馈**：Generator 动态 useEffect 对 `kind:'conflict'` 立刻 setError + setChartOption(null)，让用户立刻看到红字而不是盯着旧图
15. **错误分类 `BuildChartOptionErrorKind`**：`incomplete`（字段没填全，编辑中静默）/ `conflict`（字段冲突，立刻红字）/ `unsupported`（未知图表类型）/ `runtime`（底层生成器异常）。把"严重到必须打扰用户"和"还在编辑中不打扰"分开处理，UX 既不迟钝也不吵闹
16. **层级数据平铺 → 嵌套转换**：`hierarchyHelper.rowsToHierarchy` 把 `[父,子,值]` 行扁平数据转为 ECharts `{name, value, children}` 嵌套结构。父节点 value 自动算作子节点之和（方便 tooltip）。`treemap` 和 `sunburst` 共用此 helper，只差 `series.type` 和样式，实现成本低
17. **边列表 → `{nodes, links}` 转换**：`sankey.ts` 里把 `[[source,target,value]...]` 行扁平数据转为 ECharts 桑基图需要的双数组：`links` 保持原始顺序、`nodes` 从 source/target 两列 Set 去重而来。复杂度 O(n)，无需单独的 nodeField
18. **平行坐标图的二态 data 格式**：无 nameField 时 `series.data` 是 `number[][]`（每项是多维数值数组）；有 nameField 时是 `{name, value:number[]}[]`。这是 ECharts 的约定，同一 generator 内部根据 mapping 自动切换输出形态
19bis. **边列表类图表的共享转换**：`edgeListHelper.rowsToGraphData` 跟 sankey 的边列表处理类似但产出不同：保留 `{nodes, links}`，且节点带 `symbolSize` 按 degree 归一化到 20~50px（度数越高节点越大）。`force-graph` 和 `chord` 共用这一 helper，只在 option 里切 `layout`（force vs circular）和 lineStyle（直线 vs curveness=0.3）
20. **ECharts 无原生图表类型的两种应对**：
    - **chord（弦图）**：**完全旁路 ECharts**。`graph+circular` 的近似是"节点在圆周上连细线"，跟定义里"节点是扇形区段、弦是带宽度可不等的带子"根本不是一回事。最终引入 `d3-chord`（~3KB gzip，纯布局算法）+ `d3-shape` 的 `arc` 生成器 + `d3-chord` 的 `ribbon` path 生成器，自研 `<ChordChart />` React + SVG 组件渲染。通过 `chartOptionBuilder` 返回 `{ __renderer: 'chord-svg', chordData }` 标记 option，Generator 用 `isChordOption()` 类型守卫路由到 SVG 组件而非 `<ReactEChartsCore />`。这是全站**唯一**不走 ECharts 的图表
    - **hexbin（六边形分箱图）**：ECharts 完全没有但可用原语拼。自己实现分箱算法（pointy-top + odd-row 偏移 + round-to-nearest-center），渲染用 `scatter + symbol:'path://SVG'` + `visualMap` 映射颜色。symbolSize 固定像素（30px），用户通过 `binSize` 参数控制网格粗细
    - 原则：**能用 ECharts 原语拼就拼（hexbin），拼不出真形的引入专用库（chord）**。数据可视化教学平台，正确性 > 技术统一性
21. **非字段配置项白名单 `NON_FIELD_KEYS`**：`binCount`（直方图）和 `binSize`（hexbin）这类数字配置参数虽然也放在 `fieldMapping` 里（同一份 state），但不是"列名"。字段冲突检测 `findDuplicateField` 对这些 key 白名单豁免，避免误报"列 X 重复占用"
22. **Autofill 两条路径 + 纯函数解耦**：Generator 挂载时自动填数据有两条来源：
    - **sessionStorage**（详情页"带入生成器"按钮写入）—— 优先级最高
    - **URL 参数 `?chart=xxx`**（用户直接访问/分享链接时）—— 用 chartsData 的 exampleData+defaultMapping 构造等价 payload
    
    决策逻辑抽成 `autofillResolver.resolveAutofillPayload(storageRaw, urlChartId, charts?)` 纯函数，Generator 只负责调用 + apply state。好处：
    - URL 可分享（`/generator?chart=treemap` 点开就看到完整示例）
    - 容错（storage JSON 损坏时自动降级到 URL）
    - 可测试（9 条 Vitest 断言覆盖所有分支，不需要 jsdom）

## 测试策略

- **范围**：只针对 `src/utils/` 下的纯函数（数据解析、列类型识别、图表 option 生成），不测试 React 组件（避免引入 jsdom / React Testing Library 带来的维护成本）
- **运行命令**：`npm run test:run`（一次性执行）/ `npm test`（watch 模式）
- **命名约定**：测试文件与被测文件同级的 `__tests__/` 目录下，以 `*.test.ts` 命名
- **覆盖重点**：边界条件（80% 阈值、空输入、列数不一致、非数值单元格），以及容易出 bug 的数值算法（直方图分箱、箱线图五数概括、雷达图 max 计算）
- **当前规模**：26 文件 / 165 用例，覆盖**全部 21 种生成器图表**、option builder 分发与字段冲突检测、示例数据转换、层级/边列表结构转换、hexbin 分箱算法、autofill 两路径决策、所有 utils 纯函数

## 文档产出补充

- `docs/articles/2026-04-10-ai-coding-for-developers-wechat.md`：可直接发布的公众号文章 Markdown 成稿，主题为 AI 编程发展与普通开发者应对。
