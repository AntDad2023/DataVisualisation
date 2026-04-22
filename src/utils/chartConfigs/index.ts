// 统一导出所有图表配置生成器
export { generateBarOption, type BarFieldMapping } from './bar'
export { generateStackedBarOption, type StackedBarFieldMapping } from './stackedBar'
export { generateLineOption, type LineFieldMapping } from './line'
export { generateScatterOption, type ScatterFieldMapping } from './scatter'
export { generatePieOption, type PieFieldMapping } from './pie'
export { generateHistogramOption, type HistogramFieldMapping } from './histogram'
export { generateBoxplotOption, type BoxplotFieldMapping } from './boxplot'
export { generateHeatmapOption, type HeatmapFieldMapping } from './heatmap'
export { generateAreaOption, type AreaFieldMapping } from './area'
export { generateRadarOption, type RadarFieldMapping } from './radar'
export { generateFunnelOption, type FunnelFieldMapping } from './funnel'
export { generateStackedAreaOption, type StackedAreaFieldMapping } from './stackedArea'
export { generateNightingaleRoseOption, type NightingaleRoseFieldMapping } from './nightingaleRose'
export { generateBubbleOption, type BubbleFieldMapping } from './bubble'
export { generateTreemapOption, type TreemapFieldMapping } from './treemap'
export { generateSunburstOption, type SunburstFieldMapping } from './sunburst'
export { generateSankeyOption, type SankeyFieldMapping } from './sankey'
export { generateParallelOption, type ParallelFieldMapping } from './parallel'
export { generateForceGraphOption, type ForceGraphFieldMapping } from './forceGraph'
export { generateChordData, type ChordFieldMapping, type ChordRenderData } from './chord'
export { generateHexbinOption, type HexbinFieldMapping } from './hexbin'

// 生成器支持的图表类型 ID 列表
export const SUPPORTED_CHART_TYPES = [
  { id: 'bar', name: '条形图' },
  { id: 'stacked-bar', name: '堆叠柱状图' },
  { id: 'line', name: '折线图' },
  { id: 'area', name: '面积图' },
  { id: 'stacked-area', name: '堆叠面积图' },
  { id: 'scatter', name: '散点图' },
  { id: 'bubble', name: '气泡图' },
  { id: 'pie', name: '饼图' },
  { id: 'nightingale-rose', name: '南丁格尔玫瑰图' },
  { id: 'histogram', name: '直方图' },
  { id: 'boxplot', name: '箱线图' },
  { id: 'heatmap', name: '热力图' },
  { id: 'radar', name: '雷达图' },
  { id: 'funnel', name: '漏斗图' },
  { id: 'treemap', name: '树图' },
  { id: 'sunburst', name: '旭日图' },
  { id: 'sankey', name: '桑基图' },
  { id: 'parallel', name: '平行坐标图' },
  { id: 'force-graph', name: '力导图' },
  { id: 'chord', name: '弦图' },
  { id: 'hexbin', name: '六边形分箱图' },
] as const
