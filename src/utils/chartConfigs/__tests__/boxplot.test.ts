import { describe, it, expect } from 'vitest'
import { generateBoxplotOption } from '../boxplot'
import type { ParsedData } from '../../types'

describe('generateBoxplotOption', () => {
  it('无分组：9 个数（1-9）应得出正确的五数概括', () => {
    // 手算：min=1, Q1=(2+3)/2=2.5, median=5, Q3=(7+8)/2=7.5, max=9
    const data: ParsedData = {
      columns: ['v'],
      rows: [[1], [2], [3], [4], [5], [6], [7], [8], [9]] as (string | number)[][],
      columnTypes: ['number'],
    }
    const option = generateBoxplotOption(data, { valueField: 'v' }) as any
    expect(option.series[0].data).toEqual([[1, 2.5, 5, 7.5, 9]])
  })

  it('无分组：8 个数（偶数长度）中位数应为 (4+5)/2 = 4.5', () => {
    const data: ParsedData = {
      columns: ['v'],
      rows: [[1], [2], [3], [4], [5], [6], [7], [8]] as (string | number)[][],
      columnTypes: ['number'],
    }
    const option = generateBoxplotOption(data, { valueField: 'v' }) as any
    const [min, q1, median, q3, max] = (option.series[0].data as number[][])[0]
    expect(min).toBe(1)
    expect(q1).toBe(2.5)
    expect(median).toBe(4.5)
    expect(q3).toBe(6.5)
    expect(max).toBe(8)
  })

  it('无分组：数据量 < 5 时应返回占位标题而非计算统计量', () => {
    const data: ParsedData = {
      columns: ['v'],
      rows: [[1], [2], [3]] as (string | number)[][],
      columnTypes: ['number'],
    }
    const option = generateBoxplotOption(data, { valueField: 'v' }) as any
    expect(option.title.text).toMatch(/至少需要 5/)
  })

  it('有分组：应按分组列分别计算五数概括', () => {
    const data: ParsedData = {
      columns: ['group', 'v'],
      rows: [
        ['A', 1], ['A', 2], ['A', 3], ['A', 4], ['A', 5],
        ['B', 10], ['B', 20], ['B', 30], ['B', 40], ['B', 50],
      ],
      columnTypes: ['string', 'number'],
    }
    const option = generateBoxplotOption(data, { valueField: 'v', groupField: 'group' }) as any
    expect(option.xAxis.data).toEqual(['A', 'B'])
    const stats = option.series[0].data as number[][]
    expect(stats).toHaveLength(2)
    // A: min=1, max=5
    expect(stats[0][0]).toBe(1)
    expect(stats[0][4]).toBe(5)
    // B: min=10, max=50
    expect(stats[1][0]).toBe(10)
    expect(stats[1][4]).toBe(50)
  })

  it('有分组：某组数据量 < 5 时应回退为 [0,0,0,0,0]，而不会抛错', () => {
    const data: ParsedData = {
      columns: ['group', 'v'],
      rows: [
        ['A', 1], ['A', 2], ['A', 3], ['A', 4], ['A', 5],
        ['B', 100], ['B', 200], // B 只有 2 条
      ],
      columnTypes: ['string', 'number'],
    }
    const option = generateBoxplotOption(data, { valueField: 'v', groupField: 'group' }) as any
    const stats = option.series[0].data as number[][]
    expect(stats[1]).toEqual([0, 0, 0, 0, 0])
  })
})
