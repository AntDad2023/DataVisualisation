import type { ParsedData } from '../types'

// 字段映射：散点图需要 X 数值列 + Y 数值列，可选分类列
export interface ScatterFieldMapping {
  xField: string          // X 数值列名
  yField: string          // Y 数值列名
  categoryField?: string  // 可选：分类列（用颜色区分）
}

/**
 * 生成散点图的 ECharts option
 */
export function generateScatterOption(data: ParsedData, mapping: ScatterFieldMapping) {
  const xIdx = data.columns.indexOf(mapping.xField)
  const yIdx = data.columns.indexOf(mapping.yField)

  if (!mapping.categoryField) {
    // 无分类：单系列散点图
    const points = data.rows.map((row) => [Number(row[xIdx]) || 0, Number(row[yIdx]) || 0])
    return {
      tooltip: {
        trigger: 'item' as const,
        formatter: (params: { value: number[] }) =>
          `${mapping.xField}: ${params.value[0]}<br/>${mapping.yField}: ${params.value[1]}`,
      },
      xAxis: { type: 'value' as const, name: mapping.xField },
      yAxis: { type: 'value' as const, name: mapping.yField },
      series: [
        {
          type: 'scatter' as const,
          data: points,
          symbolSize: 10,
          itemStyle: { color: '#2563EB' },
        },
      ],
    }
  }

  // 有分类：按分类分系列
  const catIdx = data.columns.indexOf(mapping.categoryField)
  const categories = [...new Set(data.rows.map((row) => String(row[catIdx])))]

  const series = categories.map((cat) => ({
    name: cat,
    type: 'scatter' as const,
    data: data.rows
      .filter((row) => String(row[catIdx]) === cat)
      .map((row) => [Number(row[xIdx]) || 0, Number(row[yIdx]) || 0]),
    symbolSize: 10,
  }))

  return {
    tooltip: { trigger: 'item' as const },
    legend: { data: categories },
    xAxis: { type: 'value' as const, name: mapping.xField },
    yAxis: { type: 'value' as const, name: mapping.yField },
    series,
  }
}
