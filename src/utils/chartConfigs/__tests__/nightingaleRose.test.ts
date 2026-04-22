import { describe, it, expect } from 'vitest'
import { generateNightingaleRoseOption } from '../nightingaleRose'
import type { ParsedData } from '../../types'

describe('generateNightingaleRoseOption', () => {
  const data: ParsedData = {
    columns: ['季节', '降雨量(mm)'],
    rows: [
      ['春', 120], ['夏', 280], ['秋', 90], ['冬', 45],
    ],
    columnTypes: ['string', 'number'],
  }

  it('series.type 仍然是 pie，但有 roseType', () => {
    const opt = generateNightingaleRoseOption(data, { categoryField: '季节', valueField: '降雨量(mm)' }) as {
      series: Array<{ type: string; roseType: string }>
    }
    expect(opt.series[0].type).toBe('pie')
    expect(opt.series[0].roseType).toBe('radius')
  })

  it('data 条数 = 输入行数', () => {
    const opt = generateNightingaleRoseOption(data, { categoryField: '季节', valueField: '降雨量(mm)' }) as {
      series: Array<{ data: Array<{ name: string; value: number }> }>
    }
    expect(opt.series[0].data).toHaveLength(4)
  })

  it('每项 name/value 正确映射', () => {
    const opt = generateNightingaleRoseOption(data, { categoryField: '季节', valueField: '降雨量(mm)' }) as {
      series: Array<{ data: Array<{ name: string; value: number }> }>
    }
    expect(opt.series[0].data[1]).toEqual({ name: '夏', value: 280 })
  })
})
