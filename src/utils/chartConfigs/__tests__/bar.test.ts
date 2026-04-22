import { describe, it, expect } from 'vitest'
import { generateBarOption } from '../bar'
import type { ParsedData } from '../../types'

// 统一断言辅助：option 是 unknown，访问时显式断言
const data: ParsedData = {
  columns: ['city', 'pop'],
  rows: [
    ['Beijing', 2189],
    ['Shanghai', 2487],
    ['Guangzhou', 1868],
  ],
  columnTypes: ['string', 'number'],
}

describe('generateBarOption', () => {
  it('应把分类列转成 xAxis.data、数值列转成 series[0].data', () => {
    const option = generateBarOption(data, { xField: 'city', yField: 'pop' }) as any
    expect(option.xAxis.data).toEqual(['Beijing', 'Shanghai', 'Guangzhou'])
    expect(option.series[0].data).toEqual([2189, 2487, 1868])
    expect(option.series[0].type).toBe('bar')
  })

  it('类目数量 > 8 时应旋转 X 轴文字（rotate=30）', () => {
    const manyCats: ParsedData = {
      columns: ['k', 'v'],
      rows: Array.from({ length: 10 }, (_, i) => [`c${i}`, i] as (string | number)[]),
      columnTypes: ['string', 'number'],
    }
    const option = generateBarOption(manyCats, { xField: 'k', yField: 'v' }) as any
    expect(option.xAxis.axisLabel.rotate).toBe(30)
  })

  it('类目数量 ≤ 8 时不旋转 X 轴文字（rotate=0）', () => {
    const option = generateBarOption(data, { xField: 'city', yField: 'pop' }) as any
    expect(option.xAxis.axisLabel.rotate).toBe(0)
  })

  it('数值列中无法转数字的值应降级为 0（避免 NaN 渲染失败）', () => {
    const badData: ParsedData = {
      columns: ['city', 'pop'],
      rows: [
        ['A', 'x' as unknown as number],
        ['B', 100],
      ],
      columnTypes: ['string', 'number'],
    }
    const option = generateBarOption(badData, { xField: 'city', yField: 'pop' }) as any
    expect(option.series[0].data).toEqual([0, 100])
  })

  it('品牌主色应为 #2563EB（与产品设计文档一致）', () => {
    const option = generateBarOption(data, { xField: 'city', yField: 'pop' }) as any
    expect(option.series[0].itemStyle.color).toBe('#2563EB')
  })
})
