import type { ParsedData } from '../types'

// 字段映射：漏斗图需要一个阶段名列（string） + 一个数值列（number）
export interface FunnelFieldMapping {
  stageField: string
  valueField: string
}

/**
 * 生成漏斗图的 ECharts option
 * 数据按数值降序排列，适合展示转化流程
 */
export function generateFunnelOption(data: ParsedData, mapping: FunnelFieldMapping) {
  const stageIdx = data.columns.indexOf(mapping.stageField)
  const valIdx = data.columns.indexOf(mapping.valueField)

  const funnelData = data.rows.map((row) => ({
    name: String(row[stageIdx]),
    value: Number(row[valIdx]) || 0,
  }))

  const max = funnelData.length > 0 ? Math.max(...funnelData.map((d) => d.value)) : 0

  return {
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: {c}',
    },
    legend: {
      data: funnelData.map((d) => d.name),
      bottom: 0,
    },
    series: [
      {
        type: 'funnel' as const,
        left: '10%',
        top: 20,
        bottom: 50,
        width: '80%',
        min: 0,
        max,
        sort: 'descending' as const,
        gap: 2,
        label: { show: true, position: 'inside' as const },
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        data: funnelData,
      },
    ],
  }
}
