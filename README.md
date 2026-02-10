# DataVisualisation 数据可视化课程网站

## 项目简介

这是一个用于"数据可视化"课程的教学网站，纯前端实现，可离线使用。

## 核心功能

### 1. 图表库（教学内容）
- 展示 21 种常见图表的介绍、适用场景、数据格式要求与示例
- 每个图表有统一的讲解结构：是什么 / 什么时候用 / 数据要求 / 示例

### 2. 图表生成器（练习区）
- 支持 CSV 上传和粘贴表格两种数据输入方式
- 第一期支持 8 种图表：条形图、堆叠柱状图、折线图、散点图、饼图、直方图、箱线图、热力图
- 选择图表类型后自动显示字段映射，实时生成图表

## 技术栈

- **框架**：React + Vite
- **图表库**：ECharts（echarts-for-react）
- **CSV 解析**：papaparse
- **样式**：TailwindCSS
- **路由**：react-router-dom
- **部署**：纯静态站点，无需后端

## 本地运行

```bash
npm install
npm run dev
```

## 设计文档

详见 [docs/plans/2026-02-10-data-visualisation-design.md](docs/plans/2026-02-10-data-visualisation-design.md)

## 当前状态

- [x] 产品规格确认
- [ ] 初始化项目骨架
- [ ] 首页、图表库、生成器页面开发
