// 统一导出所有图表配置生成器
export { generateBarOption, type BarFieldMapping } from './bar'
export { generateStackedBarOption, type StackedBarFieldMapping } from './stackedBar'
export { generateLineOption, type LineFieldMapping } from './line'
export { generateScatterOption, type ScatterFieldMapping } from './scatter'
export { generatePieOption, type PieFieldMapping } from './pie'
export { generateHistogramOption, type HistogramFieldMapping } from './histogram'
export { generateBoxplotOption, type BoxplotFieldMapping } from './boxplot'
export { generateHeatmapOption, type HeatmapFieldMapping } from './heatmap'

// 生成器支持的图表类型 ID 列表
export const SUPPORTED_CHART_TYPES = [
  { id: 'bar', name: '条形图' },
  { id: 'stacked-bar', name: '堆叠柱状图' },
  { id: 'line', name: '折线图' },
  { id: 'scatter', name: '散点图' },
  { id: 'pie', name: '饼图' },
  { id: 'histogram', name: '直方图' },
  { id: 'boxplot', name: '箱线图' },
  { id: 'heatmap', name: '热力图' },
] as const
