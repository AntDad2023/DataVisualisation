import { describe, it, expect } from 'vitest'
import { generateBubbleOption } from '../bubble'
import type { ParsedData } from '../../types'

describe('generateBubbleOption', () => {
  const data: ParsedData = {
    columns: ['GDP(万亿)', '人口(亿)', '面积(万km²)'],
    rows: [
      [17.7, 14.1, 960],
      [25.5, 3.3, 937],
      [5.1, 1.3, 33],
      [4.2, 0.8, 36],
      [3.1, 0.7, 38],
    ],
    columnTypes: ['number', 'number', 'number'],
  }

  it('不带 categoryField：单系列，点数 = 行数，每点是 [x,y,size] 三元组', () => {
    const opt = generateBubbleOption(data, { xField: 'GDP(万亿)', yField: '人口(亿)', sizeField: '面积(万km²)' }) as {
      series: Array<{ type: string; data: number[][] }>
    }
    expect(opt.series).toHaveLength(1)
    expect(opt.series[0].type).toBe('scatter')
    expect(opt.series[0].data).toHaveLength(5)
    expect(opt.series[0].data[0]).toEqual([17.7, 14.1, 960])
  })

  it('symbolSize 是一个函数（运行时根据 size 值归一化）', () => {
    const opt = generateBubbleOption(data, { xField: 'GDP(万亿)', yField: '人口(亿)', sizeField: '面积(万km²)' }) as {
      series: Array<{ symbolSize: unknown }>
    }
    expect(typeof opt.series[0].symbolSize).toBe('function')
  })

  it('symbolSize 函数：最小 size 值返回 12，最大返回 60', () => {
    const opt = generateBubbleOption(data, { xField: 'GDP(万亿)', yField: '人口(亿)', sizeField: '面积(万km²)' }) as {
      series: Array<{ symbolSize: (v: number[]) => number }>
    }
    const fn = opt.series[0].symbolSize
    // min size = 33, max size = 960
    const smallest = fn([0, 0, 33])
    const largest = fn([0, 0, 960])
    expect(smallest).toBeCloseTo(12, 1)
    expect(largest).toBeCloseTo(60, 1)
  })

  it('带 categoryField：按分类分系列', () => {
    const dataWithCat: ParsedData = {
      columns: ['国家', 'GDP', '人口', '面积'],
      rows: [
        ['亚洲', 17.7, 14.1, 960],
        ['亚洲', 5.1, 1.3, 33],
        ['美洲', 25.5, 3.3, 937],
        ['美洲', 3.1, 0.7, 38],
      ],
      columnTypes: ['string', 'number', 'number', 'number'],
    }
    const opt = generateBubbleOption(dataWithCat, {
      xField: 'GDP', yField: '人口', sizeField: '面积', categoryField: '国家',
    }) as { series: Array<{ name: string; data: number[][] }> }
    expect(opt.series).toHaveLength(2)
    expect(opt.series.map((s) => s.name).sort()).toEqual(['亚洲', '美洲'])
  })
})
