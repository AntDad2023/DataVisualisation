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
- [x] 批次 4：单元测试覆盖（Vitest + 41 条核心 utils 测试）

## 线上地址

https://antdad2023.github.io/DataVisualisation/

## 待完成

- [ ] 图表导出 PNG（可选）
- [ ] 更多图表加入生成器（可选）
- [ ] Vite 构建 chunk 代码分割优化（可选）
- [ ] 单元测试扩展到 scatter/stackedBar/pie/line/heatmap（可选，收益递减）

## 文档产出

- [x] 新增公众号文章成稿：`docs/articles/2026-04-10-ai-coding-for-developers-wechat.md`

## 已知问题

- React Router 有两条 Future Flag Warning（不影响功能，后续升级时处理）
- Vite 构建有 chunk 大小警告（844KB > 500KB），后续可做代码分割优化

## 验证记录

| 时间 | 验证内容 | 结果 |
|------|----------|------|
| 2026-02-10 | 首页渲染 + 导航跳转 | ✅ 通过 |
| 2026-02-10 | 图表库 21 种图表卡片 + 分类筛选 | ✅ 通过 |
| 2026-02-10 | 生成器：粘贴数据→解析→选字段→生成条形图 | ✅ 通过（截图确认） |
| 2026-02-10 | GitHub Pages 部署 | ✅ Actions 构建+部署成功 |
| 2026-04-22 | `npm run test:run` 全部单元测试 | ✅ 5 文件 / 41 用例全绿 |
| 2026-04-22 | `npm run build` 生产构建（tsc + vite） | ✅ 通过 |
