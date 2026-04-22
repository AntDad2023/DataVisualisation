import { describe, it, expect } from 'vitest'
import { generateStackedAreaOption } from '../stackedArea'
import type { ParsedData } from '../../types'

describe('generateStackedAreaOption', () => {
  const data: ParsedData = {
    columns: ['月份', '渠道', '访问量'],
    rows: [
      ['1月', '搜索', 400], ['1月', '直接', 200], ['1月', '社交', 100],
      ['2月', '搜索', 450], ['2月', '直接', 220], ['2月', '社交', 130],
      ['3月', '搜索', 500], ['3月', '直接', 250], ['3月', '社交', 160],
    ],
    columnTypes: ['string', 'string', 'number'],
  }

  it('series 数量 = seriesField 的去重数量', () => {
    const opt = generateStackedAreaOption(data, { xField: '月份', seriesField: '渠道', yField: '访问量' }) as { series: unknown[] }
    expect(opt.series).toHaveLength(3)
  })

  it('每个 series 都有 stack 和 areaStyle', () => {
    const opt = generateStackedAreaOption(data, { xField: '月份', seriesField: '渠道', yField: '访问量' }) as {
      series: Array<{ type: string; stack: string; areaStyle: object }>
    }
    for (const s of opt.series) {
      expect(s.type).toBe('line')
      expect(s.stack).toBe('total')
      expect(s.areaStyle).toBeDefined()
    }
  })

  it('X 轴 category 对应月份去重', () => {
    const opt = generateStackedAreaOption(data, { xField: '月份', seriesField: '渠道', yField: '访问量' }) as {
      xAxis: { data: string[] }
    }
    expect(opt.xAxis.data).toEqual(['1月', '2月', '3月'])
  })

  it('series 数据数组长度 = 类别数', () => {
    const opt = generateStackedAreaOption(data, { xField: '月份', seriesField: '渠道', yField: '访问量' }) as {
      series: Array<{ data: number[] }>
    }
    for (const s of opt.series) expect(s.data).toHaveLength(3)
  })

  it('特定系列的 Y 值正确', () => {
    const opt = generateStackedAreaOption(data, { xField: '月份', seriesField: '渠道', yField: '访问量' }) as {
      series: Array<{ name: string; data: number[] }>
    }
    const searchSeries = opt.series.find((s) => s.name === '搜索')
    expect(searchSeries?.data).toEqual([400, 450, 500])
  })
})
