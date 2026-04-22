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

## 线上地址

https://antdad2023.github.io/DataVisualisation/

## 生成器当前支持的图表（11 种）

对比：条形图 / 堆叠柱状图 / 雷达图
趋势：折线图 / 面积图
占比：饼图
分布：直方图 / 箱线图
关系：散点图 / 热力图
流向：漏斗图

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
