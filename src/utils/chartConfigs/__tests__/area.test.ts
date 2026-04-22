import { describe, it, expect } from 'vitest'
import { generateAreaOption } from '../area'
import type { ParsedData } from '../../types'

describe('generateAreaOption', () => {
  const data: ParsedData = {
    columns: ['year', 'revenue'],
    rows: [['2019', 50], ['2020', 65], ['2021', 80]],
    columnTypes: ['string', 'number'],
  }

  it('应生成一个带 areaStyle 的 line 系列', () => {
    const option = generateAreaOption(data, { xField: 'year', yField: 'revenue' }) as any
    expect(option.series).toHaveLength(1)
    expect(option.series[0].type).toBe('line')
    expect(option.series[0].areaStyle).toBeDefined()
    expect(option.series[0].smooth).toBe(true)
  })

  it('X 轴应为 category，boundaryGap=false（让面积贴紧左右边）', () => {
    const option = generateAreaOption(data, { xField: 'year', yField: 'revenue' }) as any
    expect(option.xAxis.type).toBe('category')
    expect(option.xAxis.data).toEqual(['2019', '2020', '2021'])
    expect(option.xAxis.boundaryGap).toBe(false)
  })

  it('Y 数据应正确取值并降级非数值为 0', () => {
    const d: ParsedData = {
      columns: ['x', 'y'],
      rows: [['a', 10], ['b', 'bad' as unknown as number], ['c', 30]],
      columnTypes: ['string', 'number'],
    }
    const option = generateAreaOption(d, { xField: 'x', yField: 'y' }) as any
    expect(option.series[0].data).toEqual([10, 0, 30])
  })

  it('应使用品牌主色 #2563EB', () => {
    const option = generateAreaOption(data, { xField: 'year', yField: 'revenue' }) as any
    expect(option.series[0].lineStyle.color).toBe('#2563EB')
    expect(option.series[0].itemStyle.color).toBe('#2563EB')
  })
})
