import type { ParsedData } from '../types'

// 字段映射：条形图需要一个分类列(X) + 一个数值列(Y)
export interface BarFieldMapping {
  xField: string   // 分类列名
  yField: string   // 数值列名
}

/**
 * 生成条形图的 ECharts option
 */
export function generateBarOption(data: ParsedData, mapping: BarFieldMapping) {
  const xIdx = data.columns.indexOf(mapping.xField)
  const yIdx = data.columns.indexOf(mapping.yField)

  const categories = data.rows.map((row) => String(row[xIdx]))
  const values = data.rows.map((row) => Number(row[yIdx]) || 0)

  return {
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: categories,
      axisLabel: { rotate: categories.length > 8 ? 30 : 0 },
    },
    yAxis: { type: 'value' as const },
    series: [
      {
        type: 'bar' as const,
        data: values,
        itemStyle: { color: '#2563EB' },
      },
    ],
  }
}
