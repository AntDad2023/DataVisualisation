import type { ParsedData } from '../types'

// 字段映射：热力图需要 X 类别列 + Y 类别列 + 数值列
export interface HeatmapFieldMapping {
  xField: string     // X 类别列名
  yField: string     // Y 类别列名
  valueField: string // 数值列名
}

/**
 * 生成热力图的 ECharts option
 */
export function generateHeatmapOption(data: ParsedData, mapping: HeatmapFieldMapping) {
  const xIdx = data.columns.indexOf(mapping.xField)
  const yIdx = data.columns.indexOf(mapping.yField)
  const valIdx = data.columns.indexOf(mapping.valueField)

  // 提取唯一的 X 和 Y 类别
  const xCategories = [...new Set(data.rows.map((row) => String(row[xIdx])))]
  const yCategories = [...new Set(data.rows.map((row) => String(row[yIdx])))]

  // 构建热力图数据 [xIndex, yIndex, value]
  const heatData: [number, number, number][] = []
  let minVal = Infinity
  let maxVal = -Infinity

  for (const row of data.rows) {
    const xi = xCategories.indexOf(String(row[xIdx]))
    const yi = yCategories.indexOf(String(row[yIdx]))
    const val = Number(row[valIdx]) || 0
    heatData.push([xi, yi, val])
    if (val < minVal) minVal = val
    if (val > maxVal) maxVal = val
  }

  return {
    tooltip: {
      position: 'top' as const,
      formatter: (params: { value: [number, number, number] }) => {
        const [xi, yi, val] = params.value
        return `${xCategories[xi]} × ${yCategories[yi]}: ${val}`
      },
    },
    xAxis: {
      type: 'category' as const,
      data: xCategories,
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category' as const,
      data: yCategories,
      splitArea: { show: true },
    },
    visualMap: {
      min: minVal,
      max: maxVal,
      calculable: true,
      orient: 'horizontal' as const,
      left: 'center',
      bottom: 0,
      inRange: {
        color: ['#f0f9ff', '#2563EB'],
      },
    },
    series: [
      {
        type: 'heatmap' as const,
        data: heatData,
        label: { show: true },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' },
        },
      },
    ],
  }
}
