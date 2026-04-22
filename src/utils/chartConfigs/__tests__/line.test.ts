import { describe, it, expect } from 'vitest'
import { generateLineOption } from '../line'
import type { ParsedData } from '../../types'

describe('generateLineOption', () => {
  const data: ParsedData = {
    columns: ['月份', '销售', '利润'],
    rows: [
      ['1月', 100, 20],
      ['2月', 120, 30],
      ['3月', 150, 45],
    ],
    columnTypes: ['string', 'number', 'number'],
  }

  it('单 Y 字段时应生成单条折线，且不显示 legend', () => {
    const option = generateLineOption(data, { xField: '月份', yFields: ['销售'] }) as any
    expect(option.series).toHaveLength(1)
    expect(option.series[0].type).toBe('line')
    expect(option.series[0].data).toEqual([100, 120, 150])
    expect(option.legend).toBeUndefined()
  })

  it('多 Y 字段时应生成多条折线，并显示 legend', () => {
    const option = generateLineOption(data, { xField: '月份', yFields: ['销售', '利润'] }) as any
    expect(option.series).toHaveLength(2)
    expect(option.series[0].name).toBe('销售')
    expect(option.series[1].name).toBe('利润')
    expect(option.series[1].data).toEqual([20, 30, 45])
    expect(option.legend.data).toEqual(['销售', '利润'])
  })

  it('X 轴应为 category 类型并使用字符串化的 X 列', () => {
    const option = generateLineOption(data, { xField: '月份', yFields: ['销售'] }) as any
    expect(option.xAxis.type).toBe('category')
    expect(option.xAxis.data).toEqual(['1月', '2月', '3月'])
  })

  it('非数值 Y 值应降级为 0', () => {
    const d: ParsedData = {
      columns: ['x', 'y'],
      rows: [['a', 'bad' as unknown as number], ['b', 10]],
      columnTypes: ['string', 'number'],
    }
    const option = generateLineOption(d, { xField: 'x', yFields: ['y'] }) as any
    expect(option.series[0].data).toEqual([0, 10])
  })

  it('折线应为平滑曲线（smooth: true）', () => {
    const option = generateLineOption(data, { xField: '月份', yFields: ['销售'] }) as any
    expect(option.series[0].smooth).toBe(true)
  })
})
