import type { ParsedData } from '../types'

// 字段映射：折线图需要 X 列 + 一个或多个 Y 列
export interface LineFieldMapping {
  xField: string     // X 轴列名
  yFields: string[]  // Y 轴列名（支持多条线）
}

/**
 * 生成折线图的 ECharts option
 */
export function generateLineOption(data: ParsedData, mapping: LineFieldMapping) {
  const xIdx = data.columns.indexOf(mapping.xField)
  const xData = data.rows.map((row) => String(row[xIdx]))

  const series = mapping.yFields.map((yField) => {
    const yIdx = data.columns.indexOf(yField)
    return {
      name: yField,
      type: 'line' as const,
      data: data.rows.map((row) => Number(row[yIdx]) || 0),
      smooth: true,
    }
  })

  return {
    tooltip: { trigger: 'axis' as const },
    legend: mapping.yFields.length > 1 ? { data: mapping.yFields } : undefined,
    xAxis: {
      type: 'category' as const,
      data: xData,
    },
    yAxis: { type: 'value' as const },
    series,
  }
}
