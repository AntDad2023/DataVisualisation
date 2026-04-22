import type { ParsedData } from '../types'

// 字段映射：雷达图需要一个对象名列（string） + 多个数值维度列（number[]）
export interface RadarFieldMapping {
  nameField: string
  valueFields: string[]
}

/**
 * 生成雷达图的 ECharts option
 * 每行是一个对象（用 nameField 区分），valueFields 是它的多个维度得分
 */
export function generateRadarOption(data: ParsedData, mapping: RadarFieldMapping) {
  const nameIdx = data.columns.indexOf(mapping.nameField)
  const valueIndices = mapping.valueFields.map((f) => data.columns.indexOf(f))

  // 每个维度的最大值（乘以 1.2 作为 max，留余量）；若全为 0 则用 100 兜底
  const indicator = mapping.valueFields.map((name, i) => {
    const vi = valueIndices[i]
    const vals = data.rows.map((row) => Number(row[vi]) || 0)
    const max = Math.max(...vals)
    return { name, max: max > 0 ? +(max * 1.2).toFixed(2) : 100 }
  })

  const seriesData = data.rows.map((row) => ({
    name: String(row[nameIdx]),
    value: valueIndices.map((vi) => Number(row[vi]) || 0),
  }))

  return {
    tooltip: { trigger: 'item' as const },
    legend: {
      data: seriesData.map((s) => s.name),
      bottom: 0,
    },
    radar: {
      indicator,
      shape: 'polygon' as const,
    },
    series: [
      {
        type: 'radar' as const,
        data: seriesData,
      },
    ],
  }
}
