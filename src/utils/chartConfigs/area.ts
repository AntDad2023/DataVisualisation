import type { ParsedData } from '../types'

// 字段映射：面积图是折线图的变体，需要 X 列 + Y 列（单系列）
export interface AreaFieldMapping {
  xField: string
  yField: string
}

/**
 * 生成面积图的 ECharts option（折线 + areaStyle）
 */
export function generateAreaOption(data: ParsedData, mapping: AreaFieldMapping) {
  const xIdx = data.columns.indexOf(mapping.xField)
  const yIdx = data.columns.indexOf(mapping.yField)

  const xData = data.rows.map((row) => String(row[xIdx]))
  const yData = data.rows.map((row) => Number(row[yIdx]) || 0)

  return {
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: xData,
      boundaryGap: false,
    },
    yAxis: { type: 'value' as const },
    series: [
      {
        name: mapping.yField,
        type: 'line' as const,
        data: yData,
        smooth: true,
        areaStyle: { opacity: 0.5 },
        lineStyle: { color: '#2563EB', width: 2 },
        itemStyle: { color: '#2563EB' },
      },
    ],
  }
}
