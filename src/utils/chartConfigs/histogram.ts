import type { ParsedData } from '../types'

// 字段映射：直方图需要一个数值列，可选分箱数量
export interface HistogramFieldMapping {
  valueField: string  // 数值列名
  binCount?: number   // 分箱数量（默认 10）
}

/**
 * 生成直方图的 ECharts option
 * 手动计算分箱，因为 ECharts 没有内置直方图
 */
export function generateHistogramOption(data: ParsedData, mapping: HistogramFieldMapping) {
  const valIdx = data.columns.indexOf(mapping.valueField)
  const values = data.rows.map((row) => Number(row[valIdx])).filter((v) => !isNaN(v))

  if (values.length === 0) {
    return { title: { text: '没有有效的数值数据' } }
  }

  const binCount = mapping.binCount || 10
  const min = Math.min(...values)
  const max = Math.max(...values)
  const binWidth = (max - min) / binCount || 1

  // 计算每个分箱的频次
  const bins: number[] = new Array(binCount).fill(0)
  const binLabels: string[] = []

  for (let i = 0; i < binCount; i++) {
    const low = min + i * binWidth
    const high = min + (i + 1) * binWidth
    binLabels.push(`${low.toFixed(1)}~${high.toFixed(1)}`)
  }

  for (const v of values) {
    let idx = Math.floor((v - min) / binWidth)
    if (idx >= binCount) idx = binCount - 1  // 最大值归入最后一个箱
    if (idx < 0) idx = 0
    bins[idx]++
  }

  return {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: { name: string; value: number }[]) =>
        `${params[0].name}<br/>频次: ${params[0].value}`,
    },
    xAxis: {
      type: 'category' as const,
      data: binLabels,
      axisLabel: { rotate: 30 },
      name: mapping.valueField,
    },
    yAxis: {
      type: 'value' as const,
      name: '频次',
    },
    series: [
      {
        type: 'bar' as const,
        data: bins,
        barWidth: '90%',
        itemStyle: { color: '#2563EB' },
      },
    ],
  }
}
