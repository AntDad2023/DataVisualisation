import type { ParsedData } from '../types'

// 平行坐标图字段映射：多个数值维度 + 可选的线名称列
export interface ParallelFieldMapping {
  dimensions: string[]  // 要展示的数值列名（勾选至少 2 个）
  nameField?: string    // 可选：每条线的名称列（通常是文本列）
}

/**
 * 生成平行坐标图的 ECharts option。
 *
 * - 每个 dimension 对应一根竖轴
 * - 每行数据对应一条贯穿所有轴的折线
 * - 如果指定 nameField，折线带名称用于 tooltip
 */
export function generateParallelOption(data: ParsedData, mapping: ParallelFieldMapping) {
  const dimIdxs = mapping.dimensions.map((d) => data.columns.indexOf(d))
  const nameIdx = mapping.nameField ? data.columns.indexOf(mapping.nameField) : -1

  const parallelAxis = mapping.dimensions.map((name, i) => ({ dim: i, name }))

  const seriesData = data.rows.map((row) => {
    const values = dimIdxs.map((idx) => Number(row[idx]) || 0)
    return nameIdx >= 0 ? { name: String(row[nameIdx]), value: values } : values
  })

  return {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: { name?: string; value: number[] }) => {
        const head = params.name ? `<b>${params.name}</b><br/>` : ''
        return (
          head +
          mapping.dimensions
            .map((dim, i) => `${dim}: ${params.value[i]}`)
            .join('<br/>')
        )
      },
    },
    parallel: {
      left: '5%',
      right: '13%',
      bottom: '10%',
      top: '15%',
    },
    parallelAxis,
    series: [
      {
        type: 'parallel' as const,
        data: seriesData,
        lineStyle: { width: 2, opacity: 0.6 },
        emphasis: { lineStyle: { width: 3, opacity: 1 } },
      },
    ],
  }
}
