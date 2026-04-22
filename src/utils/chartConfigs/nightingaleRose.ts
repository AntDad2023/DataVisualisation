import type { ParsedData } from '../types'

// 字段映射：南丁格尔玫瑰图是饼图的变体，字段完全与饼图一致
export interface NightingaleRoseFieldMapping {
  categoryField: string  // 分类列名
  valueField: string     // 数值列名
}

/**
 * 生成南丁格尔玫瑰图的 ECharts option
 *
 * 实现思路：
 * - 跟饼图完全一样，只是 series 加 roseType:'radius'（用半径表示数值大小）
 */
export function generateNightingaleRoseOption(
  data: ParsedData,
  mapping: NightingaleRoseFieldMapping
) {
  const catIdx = data.columns.indexOf(mapping.categoryField)
  const valIdx = data.columns.indexOf(mapping.valueField)

  const pieData = data.rows.map((row) => ({
    name: String(row[catIdx]),
    value: Number(row[valIdx]) || 0,
  }))

  return {
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical' as const,
      left: 'left',
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['20%', '75%'],
        roseType: 'radius' as const,
        data: pieData,
        itemStyle: { borderRadius: 6 },
      },
    ],
  }
}
