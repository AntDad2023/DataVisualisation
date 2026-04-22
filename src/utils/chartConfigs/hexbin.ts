import type { ParsedData } from '../types'

// 六边形分箱图字段映射
export interface HexbinFieldMapping {
  xField: string
  yField: string
  binSize?: number  // 可选：六边形边长（数据单位）。缺省按数据范围自动取 1/15
}

export interface HexBin {
  cx: number   // 六边形中心 x（数据坐标）
  cy: number   // 六边形中心 y
  count: number
}

/**
 * 对二维点集做六边形分箱（pointy-top 布局 + odd-row 水平偏移）。
 *
 * 算法：
 *   水平间距 dx = sqrt(3) * binSize
 *   垂直间距 dy = 1.5 * binSize
 *   每个奇数行在 x 方向偏移 0.5 * dx
 *
 * 对每个点用 round-to-nearest-center 分配到 bin（近似，非严格 axial 坐标）。
 * 对密度可视化足够，且计算简单，O(n) 复杂度。
 *
 * 导出以便单测直接验证分箱逻辑。
 */
export function hexbin(points: Array<[number, number]>, binSize: number): HexBin[] {
  const dx = Math.sqrt(3) * binSize
  const dy = 1.5 * binSize
  const bins = new Map<string, HexBin>()

  for (const [px, py] of points) {
    const row = Math.round(py / dy)
    const colOffset = (row & 1) ? 0.5 : 0
    const col = Math.round(px / dx - colOffset)
    const cx = (col + colOffset) * dx
    const cy = row * dy
    const key = `${row},${col}`
    const bin = bins.get(key)
    if (bin) {
      bin.count++
    } else {
      bins.set(key, { cx, cy, count: 1 })
    }
  }

  return Array.from(bins.values())
}

// 六边形 SVG path（pointy-top，单位圆内接，中心在原点）
const HEX_SYMBOL_PATH =
  'path://M 0 -1 L 0.866 -0.5 L 0.866 0.5 L 0 1 L -0.866 0.5 L -0.866 -0.5 Z'

/**
 * 生成六边形分箱图的 ECharts option。
 *
 * 实现策略：ECharts 原生无 hexbin，用 `scatter + symbol:'path://六边形'` 近似。
 * - bins 作为 scatter 点，位置是六边形中心
 * - symbolSize 固定像素大小（30 px），用户可通过 binSize 调整网格粗细
 * - visualMap 按 count 映射颜色深浅（浅蓝→深蓝），体现密度
 */
export function generateHexbinOption(data: ParsedData, mapping: HexbinFieldMapping) {
  const xIdx = data.columns.indexOf(mapping.xField)
  const yIdx = data.columns.indexOf(mapping.yField)

  const points: Array<[number, number]> = data.rows.map((row) => [
    Number(row[xIdx]) || 0,
    Number(row[yIdx]) || 0,
  ])

  // 自动 binSize：取数据范围较大的一边 / 15，或用户指定
  let binSize = mapping.binSize
  if (!binSize || binSize <= 0) {
    const xs = points.map((p) => p[0])
    const ys = points.map((p) => p[1])
    const xRange = (Math.max(...xs) - Math.min(...xs)) || 1
    const yRange = (Math.max(...ys) - Math.min(...ys)) || 1
    binSize = Math.max(xRange, yRange) / 15
  }

  const bins = hexbin(points, binSize)
  const maxCount = Math.max(1, ...bins.map((b) => b.count))

  return {
    tooltip: {
      trigger: 'item' as const,
      formatter: (p: { value: [number, number, number] }) =>
        `${mapping.xField}: ${p.value[0].toFixed(2)}<br/>` +
        `${mapping.yField}: ${p.value[1].toFixed(2)}<br/>` +
        `点数: ${p.value[2]}`,
    },
    xAxis: { type: 'value' as const, scale: true, name: mapping.xField },
    yAxis: { type: 'value' as const, scale: true, name: mapping.yField },
    visualMap: {
      min: 0,
      max: maxCount,
      calculable: true,
      inRange: { color: ['#e0f2fe', '#0369a1'] },
      orient: 'horizontal' as const,
      left: 'center',
      bottom: 10,
      dimension: 2,
    },
    series: [
      {
        type: 'scatter' as const,
        symbol: HEX_SYMBOL_PATH,
        symbolSize: 30,
        data: bins.map((b) => [b.cx, b.cy, b.count]),
      },
    ],
  }
}
