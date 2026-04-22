import type { ParsedData } from '../types'

// 字段映射：堆叠面积图 = 堆叠柱状图的折线+面积变体
// 分类列（X）+ 分组列（系列）+ 数值列（Y）
export interface StackedAreaFieldMapping {
  xField: string       // 分类列名（如"月份"）
  seriesField: string  // 分组列名（如"渠道"）
  yField: string       // 数值列名（如"访问量"）
}

/**
 * 生成堆叠面积图的 ECharts option
 *
 * 实现思路：
 * - 数据处理与 stacked-bar 完全一致（宽表格透视）
 * - series.type 从 'bar' 换成 'line'，加 areaStyle + stack
 */
export function generateStackedAreaOption(data: ParsedData, mapping: StackedAreaFieldMapping) {
  const xIdx = data.columns.indexOf(mapping.xField)
  const seriesIdx = data.columns.indexOf(mapping.seriesField)
  const yIdx = data.columns.indexOf(mapping.yField)

  const categories = [...new Set(data.rows.map((row) => String(row[xIdx])))]
  const seriesNames = [...new Set(data.rows.map((row) => String(row[seriesIdx])))]

  const series = seriesNames.map((name) => ({
    name,
    type: 'line' as const,
    stack: 'total',
    areaStyle: { opacity: 0.6 },
    smooth: true,
    data: categories.map((cat) => {
      const row = data.rows.find(
        (r) => String(r[xIdx]) === cat && String(r[seriesIdx]) === name
      )
      return row ? Number(row[yIdx]) || 0 : 0
    }),
  }))

  return {
    tooltip: { trigger: 'axis' as const },
    legend: { data: seriesNames },
    xAxis: {
      type: 'category' as const,
      data: categories,
      boundaryGap: false,
    },
    yAxis: { type: 'value' as const },
    series,
  }
}
