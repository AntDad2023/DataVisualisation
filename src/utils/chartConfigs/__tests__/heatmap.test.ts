import { describe, it, expect } from 'vitest'
import { generateHeatmapOption } from '../heatmap'
import type { ParsedData } from '../../types'

describe('generateHeatmapOption', () => {
  const data: ParsedData = {
    columns: ['星期', '时段', '客流量'],
    rows: [
      ['周一', '上午', 120], ['周一', '下午', 200],
      ['周二', '上午', 130], ['周二', '下午', 210],
    ],
    columnTypes: ['string', 'string', 'number'],
  }

  it('应按 X/Y 轴去重并保持首次出现顺序', () => {
    const option = generateHeatmapOption(data, { xField: '星期', yField: '时段', valueField: '客流量' }) as any
    expect(option.xAxis.data).toEqual(['周一', '周二'])
    expect(option.yAxis.data).toEqual(['上午', '下午'])
  })

  it('每行数据应映射为 [xIdx, yIdx, value] 三元组', () => {
    const option = generateHeatmapOption(data, { xField: '星期', yField: '时段', valueField: '客流量' }) as any
    const expected = [
      [0, 0, 120],
      [0, 1, 200],
      [1, 0, 130],
      [1, 1, 210],
    ]
    expect(option.series[0].data).toEqual(expected)
  })

  it('visualMap.min/max 应覆盖数据的最小/最大值', () => {
    const option = generateHeatmapOption(data, { xField: '星期', yField: '时段', valueField: '客流量' }) as any
    expect(option.visualMap.min).toBe(120)
    expect(option.visualMap.max).toBe(210)
  })

  it('visualMap 色带从浅到深使用品牌色渐变', () => {
    const option = generateHeatmapOption(data, { xField: '星期', yField: '时段', valueField: '客流量' }) as any
    expect(option.visualMap.inRange.color).toEqual(['#f0f9ff', '#2563EB'])
  })
})
