import { describe, it, expect } from 'vitest'
import { generateHexbinOption, hexbin } from '../hexbin'
import type { ParsedData } from '../../types'

describe('hexbin 分箱算法', () => {
  it('相同点全部归入同一个 bin，count 累加', () => {
    const bins = hexbin(
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
      1
    )
    expect(bins).toHaveLength(1)
    expect(bins[0].count).toBe(3)
  })

  it('相距超过 binSize 的点落到不同 bin', () => {
    // binSize=1, 水平间距 dx=sqrt(3)≈1.732, 垂直间距 dy=1.5
    // (0,0) 和 (10,10) 远到一定会分到不同 bin
    const bins = hexbin(
      [
        [0, 0],
        [10, 10],
      ],
      1
    )
    expect(bins.length).toBeGreaterThanOrEqual(2)
  })

  it('空点集返回空数组', () => {
    expect(hexbin([], 1)).toEqual([])
  })

  it('bin 中心坐标落在规则网格上（偶数行无 x 偏移）', () => {
    // 点 (0,0) 落入的 bin 中心应该是 (0,0)
    const bins = hexbin([[0, 0]], 2)
    expect(bins[0].cx).toBeCloseTo(0, 6)
    expect(bins[0].cy).toBeCloseTo(0, 6)
  })
})

describe('generateHexbinOption', () => {
  const data: ParsedData = {
    columns: ['x', 'y'],
    rows: [
      [0, 0],
      [0, 0],
      [10, 10],
      [10, 10],
      [10, 10],
    ],
    columnTypes: ['number', 'number'],
  }

  it('series.type = scatter（用 scatter + 六边形 symbol 近似）', () => {
    const opt = generateHexbinOption(data, { xField: 'x', yField: 'y' }) as {
      series: Array<{ type: string; symbol: string }>
    }
    expect(opt.series[0].type).toBe('scatter')
    expect(opt.series[0].symbol.startsWith('path://')).toBe(true)
  })

  it('visualMap.max 等于所有 bin 里最大 count', () => {
    const opt = generateHexbinOption(data, { xField: 'x', yField: 'y' }) as {
      visualMap: { max: number }
    }
    // (10,10) 出现 3 次，应是 maxCount
    expect(opt.visualMap.max).toBe(3)
  })

  it('用户指定 binSize 时使用指定值，不自动计算', () => {
    const opt = generateHexbinOption(data, { xField: 'x', yField: 'y', binSize: 100 }) as {
      series: Array<{ data: number[][] }>
    }
    // binSize=100 很大，所有点都落入同一个 bin，count=5
    expect(opt.series[0].data).toHaveLength(1)
    expect(opt.series[0].data[0][2]).toBe(5)
  })

  it('series.data 每项是 [cx, cy, count] 三元组', () => {
    const opt = generateHexbinOption(data, { xField: 'x', yField: 'y', binSize: 100 }) as {
      series: Array<{ data: number[][] }>
    }
    expect(opt.series[0].data[0]).toHaveLength(3)
  })
})
