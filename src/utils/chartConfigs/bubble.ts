import type { ParsedData } from '../types'

// 字段映射：气泡图 = 散点图 + 第三维度（气泡大小）
export interface BubbleFieldMapping {
  xField: string          // X 数值列
  yField: string          // Y 数值列
  sizeField: string       // 控制气泡大小的数值列
  categoryField?: string  // 可选：分类列（用颜色区分）
}

/**
 * 气泡大小归一化：最大 60px、最小 12px。
 * 如果所有 size 值相同，统一用中间值 25px。
 */
function makeSymbolSizeFn(sizes: number[]) {
  const valid = sizes.filter((v) => Number.isFinite(v))
  if (valid.length === 0) return () => 20
  const min = Math.min(...valid)
  const max = Math.max(...valid)
  if (min === max) return () => 25
  const MIN_PX = 12
  const MAX_PX = 60
  return (val: number[]) => {
    // val = [x, y, size]
    const raw = Number(val[2]) || 0
    const norm = (raw - min) / (max - min)
    return MIN_PX + norm * (MAX_PX - MIN_PX)
  }
}

/**
 * 生成气泡图的 ECharts option
 *
 * - 每个数据点是 [x, y, size] 三元组
 * - symbolSize 通过归一化映射到 12-60 像素
 * - 有 categoryField 时按分类分系列（不同颜色）
 */
export function generateBubbleOption(data: ParsedData, mapping: BubbleFieldMapping) {
  const xIdx = data.columns.indexOf(mapping.xField)
  const yIdx = data.columns.indexOf(mapping.yField)
  const sIdx = data.columns.indexOf(mapping.sizeField)

  const allSizes = data.rows.map((row) => Number(row[sIdx]) || 0)
  const symbolSize = makeSymbolSizeFn(allSizes)

  const tooltipFormatter = (params: { value: number[]; seriesName?: string }) => {
    const v = params.value
    const prefix = params.seriesName ? `${params.seriesName}<br/>` : ''
    return `${prefix}${mapping.xField}: ${v[0]}<br/>${mapping.yField}: ${v[1]}<br/>${mapping.sizeField}: ${v[2]}`
  }

  if (!mapping.categoryField) {
    const points = data.rows.map((row) => [
      Number(row[xIdx]) || 0,
      Number(row[yIdx]) || 0,
      Number(row[sIdx]) || 0,
    ])
    return {
      tooltip: { trigger: 'item' as const, formatter: tooltipFormatter },
      xAxis: { type: 'value' as const, name: mapping.xField },
      yAxis: { type: 'value' as const, name: mapping.yField },
      series: [
        {
          type: 'scatter' as const,
          data: points,
          symbolSize,
          itemStyle: { color: '#2563EB', opacity: 0.7 },
        },
      ],
    }
  }

  const catIdx = data.columns.indexOf(mapping.categoryField)
  const categories = [...new Set(data.rows.map((row) => String(row[catIdx])))]

  const series = categories.map((cat) => ({
    name: cat,
    type: 'scatter' as const,
    data: data.rows
      .filter((row) => String(row[catIdx]) === cat)
      .map((row) => [
        Number(row[xIdx]) || 0,
        Number(row[yIdx]) || 0,
        Number(row[sIdx]) || 0,
      ]),
    symbolSize,
    itemStyle: { opacity: 0.7 },
  }))

  return {
    tooltip: { trigger: 'item' as const, formatter: tooltipFormatter },
    legend: { data: categories },
    xAxis: { type: 'value' as const, name: mapping.xField },
    yAxis: { type: 'value' as const, name: mapping.yField },
    series,
  }
}
