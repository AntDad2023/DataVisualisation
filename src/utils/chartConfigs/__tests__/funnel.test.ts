import { describe, it, expect } from 'vitest'
import { generateFunnelOption } from '../funnel'
import type { ParsedData } from '../../types'

describe('generateFunnelOption', () => {
  const data: ParsedData = {
    columns: ['阶段', '人数'],
    rows: [
      ['浏览', 10000],
      ['加购', 3000],
      ['下单', 1500],
      ['付款', 1200],
      ['完成', 1000],
    ],
    columnTypes: ['string', 'number'],
  }

  it('应把每行映射为 {name, value} 的 funnel 数据', () => {
    const option = generateFunnelOption(data, { stageField: '阶段', valueField: '人数' }) as any
    expect(option.series[0].type).toBe('funnel')
    expect(option.series[0].data).toEqual([
      { name: '浏览', value: 10000 },
      { name: '加购', value: 3000 },
      { name: '下单', value: 1500 },
      { name: '付款', value: 1200 },
      { name: '完成', value: 1000 },
    ])
  })

  it('series.max 应为所有数值的最大值', () => {
    const option = generateFunnelOption(data, { stageField: '阶段', valueField: '人数' }) as any
    expect(option.series[0].max).toBe(10000)
  })

  it('默认按降序排列（sort: descending）', () => {
    const option = generateFunnelOption(data, { stageField: '阶段', valueField: '人数' }) as any
    expect(option.series[0].sort).toBe('descending')
  })

  it('legend.data 应等于所有阶段名', () => {
    const option = generateFunnelOption(data, { stageField: '阶段', valueField: '人数' }) as any
    expect(option.legend.data).toEqual(['浏览', '加购', '下单', '付款', '完成'])
  })

  it('非数值人数应降级为 0', () => {
    const bad: ParsedData = {
      columns: ['s', 'v'],
      rows: [['A', 'x' as unknown as number], ['B', 100]],
      columnTypes: ['string', 'number'],
    }
    const option = generateFunnelOption(bad, { stageField: 's', valueField: 'v' }) as any
    expect(option.series[0].data).toEqual([
      { name: 'A', value: 0 },
      { name: 'B', value: 100 },
    ])
    expect(option.series[0].max).toBe(100)
  })
})
