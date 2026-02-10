# 实现计划

> 最后更新：2026-02-10

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

## 后续计划（待定）

### 批次 4：文档完善 + 部署
- [ ] 更新 README.md 为最终版
- [ ] 配置 vite.config.ts base 路径（GitHub Pages）
- [ ] `npm run build` 验证
- [ ] 全站手动测试

### 未来可选功能
- [ ] 图表导出为 PNG
- [ ] 自定义图表样式（颜色、标题）
- [ ] 更多图表类型支持（雷达图、漏斗图等加入生成器）
- [ ] 移动端适配
- [ ] 单元测试覆盖
