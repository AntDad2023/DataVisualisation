import { describe, it, expect } from 'vitest'
import { generateParallelOption } from '../parallel'
import type { ParsedData } from '../../types'

describe('generateParallelOption', () => {
  const data: ParsedData = {
    columns: ['价格', '面积', '楼层', '评分'],
    rows: [
      [150, 90, 12, 4.5],
      [200, 120, 8, 4.2],
      [100, 60, 3, 3.8],
    ],
    columnTypes: ['number', 'number', 'number', 'number'],
  }

  it('parallelAxis 数量 = dimensions 数量，且 dim 索引连续', () => {
    const opt = generateParallelOption(data, { dimensions: ['价格', '面积', '楼层', '评分'] }) as {
      parallelAxis: Array<{ dim: number; name: string }>
    }
    expect(opt.parallelAxis).toHaveLength(4)
    expect(opt.parallelAxis.map((a) => a.dim)).toEqual([0, 1, 2, 3])
    expect(opt.parallelAxis[0].name).toBe('价格')
  })

  it('不带 nameField：series.data 是纯 number[] 数组', () => {
    const opt = generateParallelOption(data, { dimensions: ['价格', '面积'] }) as {
      series: Array<{ data: number[][] }>
    }
    expect(opt.series[0].data[0]).toEqual([150, 90])
    expect(opt.series[0].data[2]).toEqual([100, 60])
  })

  it('带 nameField：series.data 每项是 {name, value}', () => {
    const dataWithName: ParsedData = {
      columns: ['户型', '价格', '面积'],
      rows: [
        ['小户', 100, 60],
        ['大户', 300, 150],
      ],
      columnTypes: ['string', 'number', 'number'],
    }
    const opt = generateParallelOption(dataWithName, {
      dimensions: ['价格', '面积'],
      nameField: '户型',
    }) as { series: Array<{ data: Array<{ name: string; value: number[] }> }> }
    expect(opt.series[0].data[0]).toEqual({ name: '小户', value: [100, 60] })
  })

  it('series.type 是 parallel', () => {
    const opt = generateParallelOption(data, { dimensions: ['价格', '面积'] }) as {
      series: Array<{ type: string }>
    }
    expect(opt.series[0].type).toBe('parallel')
  })
})
