import type { ParsedData } from '../types'

// 字段映射：堆叠柱状图需要分类列(X) + 分组列(系列) + 数值列(Y)
export interface StackedBarFieldMapping {
  xField: string      // 分类列名（如"季度"）
  seriesField: string  // 分组列名（如"产品"）
  yField: string       // 数值列名（如"销售额"）
}

/**
 * 生成堆叠柱状图的 ECharts option
 */
export function generateStackedBarOption(data: ParsedData, mapping: StackedBarFieldMapping) {
  const xIdx = data.columns.indexOf(mapping.xField)
  const seriesIdx = data.columns.indexOf(mapping.seriesField)
  const yIdx = data.columns.indexOf(mapping.yField)

  // 提取唯一的 X 轴类别和系列名
  const categories = [...new Set(data.rows.map((row) => String(row[xIdx])))]
  const seriesNames = [...new Set(data.rows.map((row) => String(row[seriesIdx])))]

  // 构建每个系列的数据
  const series = seriesNames.map((name) => ({
    name,
    type: 'bar' as const,
    stack: 'total',
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
    },
    yAxis: { type: 'value' as const },
    series,
  }
}
