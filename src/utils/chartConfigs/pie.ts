import type { ParsedData } from '../types'

// 字段映射：饼图需要一个分类列 + 一个数值列
export interface PieFieldMapping {
  categoryField: string  // 分类列名
  valueField: string     // 数值列名
}

/**
 * 生成饼图的 ECharts option
 */
export function generatePieOption(data: ParsedData, mapping: PieFieldMapping) {
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
        radius: '60%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
}
