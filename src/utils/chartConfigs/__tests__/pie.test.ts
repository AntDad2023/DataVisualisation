import { describe, it, expect } from 'vitest'
import { generatePieOption } from '../pie'
import type { ParsedData } from '../../types'

describe('generatePieOption', () => {
  const data: ParsedData = {
    columns: ['browser', 'share'],
    rows: [
      ['Chrome', 65],
      ['Safari', 18],
      ['Firefox', 8],
    ],
    columnTypes: ['string', 'number'],
  }

  it('应把每行映射为 {name, value} 的 pie 数据', () => {
    const option = generatePieOption(data, { categoryField: 'browser', valueField: 'share' }) as any
    expect(option.series[0].type).toBe('pie')
    expect(option.series[0].data).toEqual([
      { name: 'Chrome', value: 65 },
      { name: 'Safari', value: 18 },
      { name: 'Firefox', value: 8 },
    ])
  })

  it('非数值的 value 应降级为 0，避免饼图渲染崩溃', () => {
    const bad: ParsedData = {
      columns: ['k', 'v'],
      rows: [['A', 'x' as unknown as number], ['B', 50]],
      columnTypes: ['string', 'number'],
    }
    const option = generatePieOption(bad, { categoryField: 'k', valueField: 'v' }) as any
    expect(option.series[0].data).toEqual([
      { name: 'A', value: 0 },
      { name: 'B', value: 50 },
    ])
  })

  it('tooltip 应显示名称/值/百分比（{b}: {c} ({d}%)）', () => {
    const option = generatePieOption(data, { categoryField: 'browser', valueField: 'share' }) as any
    expect(option.tooltip.formatter).toBe('{b}: {c} ({d}%)')
  })
})
