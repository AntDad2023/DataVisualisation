# 进度跟踪

> 最后更新：2026-04-22

## MVP 阶段

- [x] 批次 0：GitHub 仓库初始化
- [x] 批次 1：项目骨架初始化（Vite+React+TS+TailwindCSS+路由）
- [x] 批次 2A：首页 + 全局导航栏
- [x] 批次 2B：图表库列表页 + 21 种图表元数据 + 7 类分类筛选
- [x] 批次 2C：数据解析模块（CSV + 粘贴 + 数值列识别）
- [x] 批次 3A：图表详情页（21 个图表教学内容 + 示例表格 + 带入生成器）
- [x] 批次 3B：生成器页面（8 种图表 ECharts 配置 + 字段映射 UI）
- [x] memory-bank 文档补齐
- [x] GitHub Pages 部署上线（HashRouter + GitHub Actions）
- [x] 批次 4：文档与部署（README 终稿 + Pages 上线）
- [x] 批次 5：单元测试覆盖（Vitest + 41 条核心 utils 测试）
- [x] 批次 6：生成器扩展 + 性能优化 + 全量测试
  - [x] 新增 3 种图表：面积图、雷达图、漏斗图（共支持 **11 种**）
  - [x] 图表预览区加"下载 PNG"按钮（getDataURL + 触发下载）
  - [x] Vite manualChunks：echarts / react-vendor / app 三分包
  - [x] 单元测试扩展到全部 11 种图表（共 **13 文件 / 75 用例**）
- [x] 批次 7：修复"带入生成器"只传图表类型、不传数据的 bug
  - [x] ChartMeta 接口加 `defaultMapping` 字段，为 11 条 generatorSupported: true 的记录写死对应字段映射
  - [x] 抽 `buildChartOption` 为纯函数（`src/utils/chartOptionBuilder.ts`），组件瘦身
  - [x] 抽 `exampleToParsedData` 为工具（`src/utils/exampleToParsedData.ts`），供详情页与测试共用
  - [x] ChartDetail 点击按钮时把 `{chartType, parsedData, defaultMapping}` 写入 sessionStorage
  - [x] Generator 挂载时读 sessionStorage → 填充数据 + 字段映射 → 立即生成图表 → 清理 storage
  - [x] 补测：新增 `chartOptionBuilder.test.ts`（18 条，含 11 条端到端断言）+ `exampleToParsedData.test.ts`（5 条）
  - [x] 端到端自动化验证：Puppeteer 模拟点击"带入生成器"→ Generator 自动渲染 canvas，流程打通
- [x] 批次 8：生成器"动态设置"UX 升级（修复用户反馈"功能只是摆设"）
  - [x] 新增动态生成 useEffect：监听 [parsedData, chartType, fieldMapping]，字段完整时立即重算图表（所见即所得）；字段不全时保留上次成功的图表，不红字骚扰
  - [x] `line.yFields` / `radar.valueFields` 的 `<select multiple>` 改为 **checkbox 列表**（不再需要按 Ctrl+click，勾选状态一目了然）
  - [x] 保留"生成图表"按钮作为明确触发入口 + 字段不全时的错误诊断
  - [x] Puppeteer 端到端验证：autofill → checkbox 默认勾选 → 切 X 轴下拉 → canvas 像素指纹立刻变（`changedCanvas: true`）
- [x] 批次 13：弦图重做——真弦图（用户指出"graph+circular 不是弦图"）
  - [x] 引入 d3-chord + d3-shape 依赖（+~15KB gzip）
  - [x] `chord.ts` 改为纯数据构造器 `generateChordData`：边列表 → 有向矩阵 → d3-chord 布局（groups 扇形角度 + chords 两端独立 value）
  - [x] 新建 `src/components/ChordChart.tsx` React + SVG 组件：d3-shape.arc 画节点扇形区段、d3-chord.ribbon 画带宽弦带、hover 高亮相邻、SVG `<title>` 原生 tooltip
  - [x] `chartOptionBuilder` chord case 返回 `{ __renderer: 'chord-svg', chordData }` 标记对象
  - [x] `Generator.tsx` 加 `isChordOption()` 类型守卫，chord 走 `<ChordChart />` 而非 `<ReactEChartsCore />`；PNG 下载按钮在 chord 时隐藏
  - [x] 示例数据改为"某学年四所学校转学人数"有向矩阵（A→B=10, B→A=5 刻意不等，体现"弦两端宽度不同"）
  - [x] 单测重写（6 条）：labels 去重顺序 / 有向矩阵 / total / groups 角度分配 / **两端 value 独立不等** / 重复行累加
  - [x] 端到端 it.each 对 chord 豁免 series 断言，改断言 `chordData` 存在
  - [x] 验证：26 文件 / **168 用例全绿** + build 通过（app 99→111KB，echarts 无变化，新增 d3 部分合并进 app chunk）
- [x] 批次 12：3 张难图对齐权威定义（用户提供定义图反馈）
  - [x] **力导图**：节点大小从"按度数"改为"按关系强度之和"（20~60 px）——符合定义"节点大小可代表变量"；tooltip 分别格式化节点/边；repulsion 500 + edgeLength[60,140] + draggable + 白描边阴影
  - [x] **弦图**：曲率 0.3→0.45、线宽 1-6→2-10px、hover 线宽放到 12、加节点阴影——落实定义"交互效果必须有"；tooltip "源⇌目:数值"
  - [x] **六边形分箱图**：配色从冷调蓝改为**热力图五阶黄→红**——落实定义"借鉴热力图"；示例数据从 10 点扩到 **72 点带 3 密集热区**，让"密度分箱"效果真正可见
  - [x] `edgeListHelper.GraphNode` 新增 `value`（weight sum）+ `degree` 字段供 tooltip
  - [x] 跟进 3 条断言：chord curveness / forceGraph symbolSize 上限 / 线宽公式
  - [x] 验证：26 文件 / 165 用例全绿 + build（app 99→100KB）
- [x] 批次 10c：生成器扩展最后 3 张"难图"（力导图 / 弦图 / 六边形分箱图）—— **全部 21 种图表都已支持生成器**
  - [x] 新增 `edgeListHelper.ts`：边列表 → `{nodes, links}` + 按 degree 算 `symbolSize`（force-graph/chord 共用）
  - [x] 新增 `forceGraph.ts`：`series.type='graph' + layout:'force'`，线宽按关系强度缩放，roam 支持拖拽
  - [x] 新增 `chord.ts`：ECharts 无原生 chord，用 `graph + layout:'circular' + curveness:0.3` 近似弦图
  - [x] 新增 `hexbin.ts` + 独立 `hexbin()` 分箱算法：pointy-top 六边形 + odd-row 偏移 + round-nearest-center，O(n)；渲染用 `scatter + symbol:'path://SVG'` + `visualMap` 颜色映射密度
  - [x] `Generator.tsx` 注册 `GraphChart` + 3 个 case UI（force/chord 合并分支共用字段；hexbin 支持可选 `binSize` 数字输入）
  - [x] `chartOptionBuilder.ts` 加 3 个 case + `binSize` 进入字段冲突检测白名单（跟 `binCount` 同等级）
  - [x] `chartsData.ts` 3 图 `generatorSupported:true` + `defaultMapping`
  - [x] 单测 15 条（forceGraph 4 / chord 3 / hexbin 8，其中 hexbin 重点覆盖分箱算法边界）
  - [x] 端到端 `it.each` 自动扩展到 **21 个图表**（chartOptionBuilder.test.ts 从 32→35）
  - [x] 验证：23 文件 / 147 用例 → **26 文件 / 165 用例全绿**
- [x] 批次 11：生成器支持 URL 直达 autofill（分享链接即用即得）
  - [x] 新增 `autofillResolver.ts` 纯函数：决定用哪条 autofill 路径（sessionStorage 优先，URL `?chart=xxx` 收底）
  - [x] URL 直达时从 `chartsData` 里查图表 `exampleData + defaultMapping`，构造与"带入生成器"按钮等价的 payload
  - [x] 容错：sessionStorage JSON 损坏/字段不全时自动降级到 URL 路径，不抛异常
  - [x] `Generator.tsx` autofill useEffect 调用 resolver，逻辑瘦身
  - [x] 单测 9 条（sessionStorage/URL/两者同时/容错/降级/未支持图表的边界场景）
  - [x] 意义：`/generator?chart=treemap` 这类 URL 现在点开就能看到数据+图表，方便社交分享和演示
- [x] 批次 10b：生成器扩展 4 种新结构图表（树图 / 旭日图 / 桑基图 / 平行坐标图）
  - [x] 新增 `hierarchyHelper.ts`：平铺 `[父, 子, 值]` → 嵌套 `{name, value, children}` 的树结构转换（treemap/sunburst 共享）
  - [x] 新增 `treemap.ts` / `sunburst.ts`：复用 helper，不同的 series.type 和样式
  - [x] 新增 `sankey.ts`：边列表 → `{nodes, links}`，nodes 从 source/target 自动去重
  - [x] 新增 `parallel.ts`：dimensions 数组字段 → 每维一根 `parallelAxis`，可选 nameField 给线命名
  - [x] `Generator.tsx` 新增 ECharts 模块注册：`TreemapChart / SunburstChart / SankeyChart / ParallelChart + ParallelComponent`（+ 4 个 case 字段 UI，parallel 用 checkbox 多选维度）
  - [x] `chartsData.ts` 四图 `generatorSupported:true` + `defaultMapping`
  - [x] 测试：4 个独立单测文件（共 14 条）+ 端到端 it.each 自动扩展到 18 种图表
  - [x] 验证：18 文件 / 120 用例 → 22 文件 / 138 用例，全绿 + build 通过
- [x] 批次 10a：生成器扩展 3 种变体图表（堆叠面积图 / 南丁格尔玫瑰图 / 气泡图）
  - [x] 新增 `src/utils/chartConfigs/{stackedArea,nightingaleRose,bubble}.ts` 三个 generator 纯函数
  - [x] 气泡图 `symbolSize` 按第三维度数值归一化到 12-60px（等值降级为 25px）
  - [x] `chartConfigs/index.ts` 导出 + `SUPPORTED_CHART_TYPES` 加入 3 项
  - [x] `chartOptionBuilder.ts` 加 3 个 case（含字段必填校验）+ default 分支补 `kind:'unsupported'`
  - [x] `Generator.tsx` 加 3 个 case 的字段 UI（全部套用 `isUsedByOtherDim` 互斥模式）
  - [x] `chartsData.ts` 三个图表 `generatorSupported` 翻转 `true` + 写 `defaultMapping`（字段名与 exampleData.columns 精确对齐）
  - [x] 三个独立单测文件 + 端到端 it.each 自动扩展到 14 种图表（`chartOptionBuilder.test.ts` 从 25→28）
- [x] 批次 9：字段互斥三层防御（修复用户反馈"X 和 Y 选同一列居然能画图"）
  - [x] B 层：`chartOptionBuilder` 增加 `kind: 'conflict'` 错误分类，switch 前统一做字段唯一性扫描，发现重复立刻拦住，`binCount` 等非字段配置项白名单豁免
  - [x] C 层：Generator 动态 useEffect 捕获 `kind:'conflict'` → setError + setChartOption(null)，让用户**立刻看到红字**而不是盯着旧图
  - [x] A 层：10 个多字段图表（除 histogram 单字段）的下拉/复选框全部加 `disabled` 互斥 + "· 已用"/"· 已用作 X 轴"等明示标签，用户在 UI 层就选不出冲突
  - [x] 补测：`chartOptionBuilder.test.ts` 新增"字段冲突检测"7 条断言（bar/line/stacked-bar/radar/heatmap 各覆盖 + binCount 豁免 + scatter 可选字段空字符串通过）
  - [x] Puppeteer 端到端：autofill 折线图 → X 下拉里 "销售额(万) · 已用作 Y 轴" disabled / Y checkbox "销售额(万) · 已用作 X 轴" disabled

## 线上地址

https://antdad2023.github.io/DataVisualisation/

## 生成器当前支持的图表（21 种，全覆盖）

对比：条形图 / 堆叠柱状图 / 雷达图 / 平行坐标图
趋势：折线图 / 面积图 / 堆叠面积图
占比：饼图 / 南丁格尔玫瑰图
关系：散点图 / 气泡图 / 热力图 / 力导图 / 弦图
分布：直方图 / 箱线图 / 六边形分箱图
流向：漏斗图 / 桑基图
层级：树图 / 旭日图

## 构建产物（代码分割后）

| chunk | 大小（min） | gzip |
|-------|------------|------|
| `index.js`（应用代码） | 72.6 KB | 22.6 KB |
| `react-vendor.js` | 167.6 KB | 54.7 KB |
| `echarts.js` | 625.5 KB | 208.8 KB |
| `index.css` | 15.5 KB | 4.0 KB |

## 待完成（可选增强）

- [ ] 引入 dynamic import() 让 /generator 路由下才加载 echarts（首屏再缩一半）
- [ ] 堆叠面积图、气泡图、树图等其余 10 种图表的生成器支持
- [ ] 图表自定义样式（颜色、标题）
- [ ] 移动端适配优化
- [ ] React Router v7 future flags 预置

## 文档产出

- [x] 新增公众号文章成稿：`docs/articles/2026-04-10-ai-coding-for-developers-wechat.md`

## 已知问题

- React Router 有两条 Future Flag Warning（不影响功能，后续升级时处理）
- ~~Vite 构建有 chunk 大小警告（844KB > 500KB）~~ → 批次 6 已通过 manualChunks 拆分 echarts/react，警告已消除

## 验证记录

| 时间 | 验证内容 | 结果 |
|------|----------|------|
| 2026-02-10 | 首页渲染 + 导航跳转 | ✅ 通过 |
| 2026-02-10 | 图表库 21 种图表卡片 + 分类筛选 | ✅ 通过 |
| 2026-02-10 | 生成器：粘贴数据→解析→选字段→生成条形图 | ✅ 通过（截图确认） |
| 2026-02-10 | GitHub Pages 部署 | ✅ Actions 构建+部署成功 |
| 2026-04-22 | `npm run test:run` 单元测试（批次 5） | ✅ 5 文件 / 41 用例 |
| 2026-04-22 | `npm run build` 生产构建（批次 5） | ✅ 通过 |
| 2026-04-22 | `npm run test:run` 单元测试（批次 6 扩展后） | ✅ 13 文件 / 75 用例全绿 |
| 2026-04-22 | `npm run build` 生产构建（批次 6 分包后） | ✅ 通过，chunk 警告消除 |
| 2026-04-22 | `npm run test:run` 单元测试（批次 7 修复后） | ✅ 15 文件 / 98 用例全绿 |
| 2026-04-22 | `npm run build` 生产构建（批次 7 后） | ✅ 通过 |
| 2026-04-22 | Puppeteer 端到端：`/charts/heatmap` → 带入生成器 → 自动渲染 canvas + 字段预选（星期/时段/客流量） | ✅ 通过 |
| 2026-04-22 | `npm run test:run` 批次 8 后 | ✅ 15 文件 / 98 用例全绿 |
| 2026-04-22 | `npm run build` 批次 8 后 | ✅ 通过 |
| 2026-04-22 | Puppeteer 端到端：折线图带入后 checkbox 默认勾选 + 改 X 轴下拉 canvas 像素指纹立刻变化 | ✅ 通过（动态生成生效） |
| 2026-04-22 | Puppeteer：checkbox 点击切换勾选状态 + 字段不全时保留上次图表 | ✅ 通过 |
| 2026-04-22 | `npm run test:run` 批次 9 后 | ✅ 15 文件 / 105 用例全绿（+7 字段冲突断言） |
| 2026-04-22 | `npm run build` 批次 9 后 | ✅ 通过 |
| 2026-04-22 | Puppeteer：autofill 折线图后 X 下拉 `销售额(万) · 已用作 Y 轴` disabled | ✅ 通过 |
| 2026-04-22 | Puppeteer：反向互斥——X 选 `销售额(万)` 后 Y checkbox `· 已用作 X 轴` disabled | ✅ 通过 |
| 2026-04-22 | `npm run test:run` 批次 10a 后 | ✅ 18 文件 / 120 用例全绿（+15 新用例） |
| 2026-04-22 | `npm run build` 批次 10a 后 | ✅ 通过，app chunk 77→85KB |
| 2026-04-22 | 端到端 `it.each` 自动覆盖：14 个 generatorSupported 图表全部用 exampleData + defaultMapping 成功生成 option | ✅ 通过 |
| 2026-04-22 | `npm run test:run` 批次 10b 后 | ✅ 22 文件 / 138 用例全绿（+18 新用例） |
| 2026-04-22 | `npm run build` 批次 10b 后 | ✅ 通过；app 85→92KB，echarts 626→711KB（新 4 chart + ParallelComponent） |
| 2026-04-22 | 端到端 `it.each` 自动扩展到 18 个 generatorSupported 图表全部成图 | ✅ 通过 |
| 2026-04-22 | `npm run test:run` 批次 11 后 | ✅ 23 文件 / 147 用例全绿（+9 autofillResolver 断言） |
| 2026-04-22 | `npm run build` 批次 11 后 | ✅ 通过（app chunk +0.3KB） |
| 2026-04-22 | `npm run test:run` 批次 10c 后 | ✅ 26 文件 / 165 用例全绿（+18 新用例） |
| 2026-04-22 | `npm run build` 批次 10c 后 | ✅ 通过；app 93→99KB，echarts 711→742KB（新 GraphChart） |
| 2026-04-22 | 端到端 `it.each` 自动扩展到 **21 个 generatorSupported 图表全覆盖** | ✅ 通过 |
