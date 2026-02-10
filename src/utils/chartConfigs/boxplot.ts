import type { ParsedData } from '../types'

// 字段映射：箱线图需要一个数值列，可选一个分组列
export interface BoxplotFieldMapping {
  valueField: string     // 数值列名
  groupField?: string    // 可选：分组列名
}

/**
 * 计算箱线图的五个统计量：min, Q1, median, Q3, max
 */
function calcBoxplotStats(values: number[]): [number, number, number, number, number] {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length

  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)]

  const lowerHalf = sorted.slice(0, Math.floor(n / 2))
  const upperHalf = sorted.slice(Math.ceil(n / 2))

  const q1 = lowerHalf.length % 2 === 0
    ? (lowerHalf[lowerHalf.length / 2 - 1] + lowerHalf[lowerHalf.length / 2]) / 2
    : lowerHalf[Math.floor(lowerHalf.length / 2)]

  const q3 = upperHalf.length % 2 === 0
    ? (upperHalf[upperHalf.length / 2 - 1] + upperHalf[upperHalf.length / 2]) / 2
    : upperHalf[Math.floor(upperHalf.length / 2)]

  return [sorted[0], q1, median, q3, sorted[n - 1]]
}

/**
 * 生成箱线图的 ECharts option
 */
export function generateBoxplotOption(data: ParsedData, mapping: BoxplotFieldMapping) {
  const valIdx = data.columns.indexOf(mapping.valueField)

  if (!mapping.groupField) {
    // 无分组：单个箱线图
    const values = data.rows.map((row) => Number(row[valIdx])).filter((v) => !isNaN(v))
    if (values.length < 5) {
      return { title: { text: '数据量太少（至少需要 5 个值）' } }
    }

    return {
      tooltip: { trigger: 'item' as const },
      xAxis: { type: 'category' as const, data: [mapping.valueField] },
      yAxis: { type: 'value' as const },
      series: [
        {
          type: 'boxplot' as const,
          data: [calcBoxplotStats(values)],
        },
      ],
    }
  }

  // 有分组：每组一个箱线图
  const groupIdx = data.columns.indexOf(mapping.groupField)
  const groups = [...new Set(data.rows.map((row) => String(row[groupIdx])))]

  const boxData = groups.map((group) => {
    const values = data.rows
      .filter((row) => String(row[groupIdx]) === group)
      .map((row) => Number(row[valIdx]))
      .filter((v) => !isNaN(v))
    return values.length >= 5 ? calcBoxplotStats(values) : [0, 0, 0, 0, 0] as [number, number, number, number, number]
  })

  return {
    tooltip: { trigger: 'item' as const },
    xAxis: { type: 'category' as const, data: groups },
    yAxis: { type: 'value' as const },
    series: [
      {
        type: 'boxplot' as const,
        data: boxData,
      },
    ],
  }
}
