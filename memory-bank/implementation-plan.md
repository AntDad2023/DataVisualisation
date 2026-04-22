# 实现计划

> 最后更新：2026-04-22

## MVP 阶段（批次 0-3B）— ✅ 全部完成

### 批次 0：GitHub 仓库初始化 ✅
- 创建远程仓库 github.com/AntDad2023/DataVisualisation
- 本地 git init + 首次提交 + 推送

### 批次 1：项目骨架 ✅
- 手动创建 Vite + React + TS 项目（未用脚手架，因交互问题）
- 安装依赖：echarts, echarts-for-react, papaparse, tailwindcss, react-router-dom
- 配置路由（/, /charts, /charts/:id, /generator）
- 验证：`npm run dev` 启动成功

### 批次 2A：首页 + 导航栏 ✅
- Layout.tsx：导航栏（Logo + 3 个链接）+ 页脚
- Home.tsx：标题、介绍、入口按钮、"你会学到什么"
- 验证：页面渲染正常，导航跳转正常

### 批次 2B：图表库列表页 ✅
- chartsData.ts：21 种图表的完整元数据（类型定义 + 教学内容 + 示例数据）
- ChartList.tsx：卡片网格 + 7 类分类筛选按钮
- 验证：21 张卡片显示，筛选功能正常

### 批次 2C：数据解析模块 ✅
- types.ts：ParsedData 接口
- csvParser.ts：CSV 文件解析（papaparse）
- pasteParser.ts：粘贴文本解析（Tab/逗号自动检测）
- columnAnalyzer.ts：数值列识别（80% 阈值）
- 验证：在生成器中粘贴数据，解析结果正确

### 批次 3A：图表详情页 ✅
- ChartDetail.tsx：4 个教学区块 + 示例数据表格 + "带入生成器"按钮
- 验证：点击图表卡片进入详情页，内容完整

### 批次 3B：生成器页面 ✅
- 8 种图表的 ECharts 配置生成器（chartConfigs/*.ts）
- Generator.tsx：数据输入 + 预览 + 图表选择 + 动态字段映射 + ECharts 渲染
- 验证：粘贴城市人口数据 → 选条形图 → 成功渲染蓝色柱状图

---

## 后续计划

### 批次 4：文档完善 + 部署 ✅
- [x] 更新 README.md 为最终版（含 Vitest 使用说明）
- [x] 配置 vite.config.ts base 路径（GitHub Pages）
- [x] `npm run build` 验证
- [x] GitHub Pages 部署上线

### 批次 5：单元测试覆盖 ✅
- [x] 引入 Vitest（独立 `vitest.config.ts`，node 环境）
- [x] tsconfig 构建时排除 `*.test.ts`，不污染产物
- [x] `columnAnalyzer` 测试（13 用例，覆盖 80% 阈值、空单元格、边界）
- [x] `pasteParser` 测试（12 用例，覆盖 Tab/逗号、CRLF、列数不一致、异常输入）
- [x] `chartConfigs/{bar,histogram,boxplot}` 测试（共 16 用例，覆盖数值算法与降级分支）
- [x] `npm run test:run` 全绿 + `npm run build` 通过

### 批次 10a：扩展 3 种变体图表 ✅
- [x] 新建三个纯函数：`stackedArea.ts` / `nightingaleRose.ts` / `bubble.ts`
  - stacked-area: 数据处理复用 stackedBar 的宽表透视，series.type=line + areaStyle + stack
  - nightingale-rose: 复用 pie 数据结构，series 加 `roseType:'radius'` + `radius:['20%','75%']`
  - bubble: 每点是 [x,y,size] 三元组，`symbolSize` 函数按 size 值在数据集内的位置归一化到 12-60 px
- [x] 接入生成器：
  - `chartConfigs/index.ts` 导出
  - `chartOptionBuilder.ts` 加 switch case 和字段必填校验
  - default 分支补 `kind:'unsupported'` 保持类型完整性
- [x] UI：`Generator.tsx` 加三个 case 的字段渲染，全部使用批次 9 的 `isUsedByOtherDim` 互斥模式
- [x] 元数据：`chartsData.ts` 三个图表 `generatorSupported:true` + `defaultMapping`
  - 字段名严格对齐 exampleData.columns（中间踩了两个拼写坑："降水量"→"降雨量"；bubble 默认字段写错成另一套广告数据 → 改为 GDP/人口/面积）
- [x] 测试：三个 generator 单测（共 12 条） + 端到端 it.each 自动增加 3 条
- [x] 验证：15 文件 / 105 用例 → 18 文件 / 120 用例，全绿 + build 通过

### 批次 9：字段互斥三层防御 ✅
- [x] **B 层（chartOptionBuilder）**：
  - 新增 `BuildChartOptionErrorKind = 'incomplete' | 'conflict' | 'unsupported' | 'runtime'`
  - 抽 `findDuplicateField(mapping)` helper，扫描所有字段值（含数组字段），排除 `binCount` 等非字段配置项
  - `buildChartOption` 在 switch 之前统一校验，重复时返回 `{ok:false, error:'列 "X" 同时用于多个维度...', kind:'conflict'}`
- [x] **C 层（动态 useEffect）**：
  - 字段完整 → setChartOption + 清 error
  - `kind:'conflict'` → setError + setChartOption(null)（显式清图，避免"看着旧图以为有效"）
  - 其他 error（incomplete）保持静默，用户点"生成图表"才显式报错
- [x] **A 层（UI 互斥）**：
  - `renderFieldMapping` 头部定义 `isUsedByOtherDim(myKey, col)` helper
  - 10 个多字段 case（除 histogram）的 `<option>` 和 checkbox `<input>` 全部加 `disabled` + "· 已用"/"· 已用作 X 轴" 明示标签
  - disabled 选项灰度 + 不响应点击，用户从 UI 层面就选不出冲突
- [x] 测试：`chartOptionBuilder.test.ts` 增加 "字段冲突检测" describe 块，覆盖 bar/line/stacked-bar/radar/heatmap、binCount 豁免、scatter 可选字段空字符串通过
- [x] Puppeteer 端到端：autofill 折线图后正反两个方向都验证 disabled+标签生效

### 批次 8：生成器"动态设置"UX 升级 ✅
- [x] `Generator.tsx` 新增动态生成 useEffect，依赖 `[parsedData, chartType, fieldMapping]`
  - 字段完整 → 立即调用 `buildChartOption` + `setChartOption`（所见即所得）
  - 字段不全 → 保留上次成功的图表，不更新 error（避免"还没选完就报红字"）
- [x] `line.yFields` / `radar.valueFields` 的 `<select multiple>` 改为 checkbox 列表
  - 不再需要 Ctrl+click，勾选状态一目了然
  - 有"数据中没有数值列"的空状态兜底
  - 滚动容器 max-h-40/48，长列表不溢出
- [x] 保留"生成图表"按钮作为明确触发 + 错误诊断入口
- [x] Puppeteer 端到端验证动态生成与 checkbox 交互

### 批次 7：修复"带入生成器"只传图表类型的 bug ✅
- [x] `ChartMeta` 加 `defaultMapping?: Record<string, string|string[]>` 字段
- [x] 11 条 generatorSupported: true 的记录写死 defaultMapping（覆盖 bar/stacked-bar/line/scatter/pie/histogram/boxplot/heatmap/area/radar/funnel）
- [x] 新增 `src/utils/chartOptionBuilder.ts`：把 Generator.tsx 的 55 行 switch 抽为纯函数，返回 `{ok, option}|{ok:false, error}`
- [x] 新增 `src/utils/exampleToParsedData.ts`：把 ChartMeta.exampleData 转为 ParsedData（与 pasteParser 逻辑一致），供 ChartDetail 和单测共享
- [x] `ChartDetail.tsx`：按钮 onClick 写 `sessionStorage['generator:autofill'] = {chartType, parsedData, defaultMapping}` 后 navigate
- [x] `Generator.tsx`：新增 autofill useEffect，挂载时读 storage → 填充 state + 立即调 buildChartOption → 清理 storage
- [x] 新增单测：chartOptionBuilder 18 条（含 11 条端到端断言所有 generatorSupported 图表必能成图）+ exampleToParsedData 5 条
- [x] 15 文件 / 98 用例全绿 + build 通过 + Puppeteer 端到端验证通过

### 批次 6：生成器扩展 + 性能优化 + 全量测试 ✅
- [x] 新增 `area.ts` / `radar.ts` / `funnel.ts` 三个 option 生成器
- [x] `chartConfigs/index.ts` 更新 SUPPORTED_CHART_TYPES（11 种）
- [x] `chartsData.ts`：area/radar/funnel 的 `generatorSupported=true`；雷达改为宽格式示例（对象名列 + 多维度列）
- [x] `Generator.tsx`：注册 RadarChart/FunnelChart；新增 3 个字段映射 case；新增 chartRef + 下载 PNG 按钮（使用 getDataURL）
- [x] `vite.config.ts`：加 manualChunks（echarts / react-vendor / app 三分包），消除 chunk 大小警告
- [x] 补齐 8 个测试文件（scatter/stackedBar/pie/line/heatmap/area/radar/funnel）
- [x] `npm run test:run` 13 文件 / 75 用例全绿；`npm run build` 通过，分包正确

### 未来可选功能
- [ ] 动态 import() 让 /generator 路由下才加载 echarts chunk（首屏再缩一半）
- [ ] 其余图表（堆叠面积、气泡、树图、旭日、桑基、弦图等）加入生成器
- [ ] 自定义图表样式（颜色、标题）
- [ ] 移动端适配
- [ ] React Router v7 future flags 预置
