import { describe, it, expect } from 'vitest'
import { generateStackedBarOption } from '../stackedBar'
import type { ParsedData } from '../../types'

describe('generateStackedBarOption', () => {
  const data: ParsedData = {
    columns: ['季度', '产品', '销售额'],
    rows: [
      ['Q1', '手机', 120], ['Q1', '电脑', 80],
      ['Q2', '手机', 150], ['Q2', '电脑', 90],
      ['Q3', '手机', 180], ['Q3', '电脑', 100],
    ],
    columnTypes: ['string', 'string', 'number'],
  }

  it('应按 X 列/系列列分别去重并构造完整的堆叠矩阵', () => {
    const option = generateStackedBarOption(data, { xField: '季度', seriesField: '产品', yField: '销售额' }) as any
    expect(option.xAxis.data).toEqual(['Q1', 'Q2', 'Q3'])
    expect(option.series.map((s: { name: string }) => s.name)).toEqual(['手机', '电脑'])
    expect(option.series[0].data).toEqual([120, 150, 180])
    expect(option.series[1].data).toEqual([80, 90, 100])
  })

  it('所有系列应共用同一个 stack 值（保证堆叠）', () => {
    const option = generateStackedBarOption(data, { xField: '季度', seriesField: '产品', yField: '销售额' }) as any
    const stacks = option.series.map((s: { stack: string }) => s.stack)
    expect(new Set(stacks).size).toBe(1)
  })

  it('缺失的 (x, series) 组合应填 0，不破坏数组结构', () => {
    const d: ParsedData = {
      columns: ['x', 's', 'y'],
      rows: [
        ['Q1', 'A', 10],
        ['Q2', 'B', 20],
        // 没有 (Q1, B) 和 (Q2, A)
      ],
      columnTypes: ['string', 'string', 'number'],
    }
    const option = generateStackedBarOption(d, { xField: 'x', seriesField: 's', yField: 'y' }) as any
    expect(option.xAxis.data).toEqual(['Q1', 'Q2'])
    // A 系列：Q1=10, Q2=0；B 系列：Q1=0, Q2=20
    const a = option.series.find((s: { name: string }) => s.name === 'A')
    const b = option.series.find((s: { name: string }) => s.name === 'B')
    expect(a.data).toEqual([10, 0])
    expect(b.data).toEqual([0, 20])
  })

  it('legend.data 应等于去重后的系列名', () => {
    const option = generateStackedBarOption(data, { xField: '季度', seriesField: '产品', yField: '销售额' }) as any
    expect(option.legend.data).toEqual(['手机', '电脑'])
  })
})
