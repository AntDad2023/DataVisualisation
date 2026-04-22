import { describe, it, expect } from 'vitest'
import { generateSunburstOption } from '../sunburst'
import type { ParsedData } from '../../types'

describe('generateSunburstOption', () => {
  const data: ParsedData = {
    columns: ['大洲', '国家', '人口(亿)'],
    rows: [
      ['亚洲', '中国', 14.1], ['亚洲', '印度', 13.8],
      ['欧洲', '德国', 0.8],
    ],
    columnTypes: ['string', 'string', 'number'],
  }

  it('series.type 是 sunburst', () => {
    const opt = generateSunburstOption(data, { parentField: '大洲', childField: '国家', valueField: '人口(亿)' }) as {
      series: Array<{ type: string }>
    }
    expect(opt.series[0].type).toBe('sunburst')
  })

  it('series.data 顶层 2 个（亚洲/欧洲）', () => {
    const opt = generateSunburstOption(data, { parentField: '大洲', childField: '国家', valueField: '人口(亿)' }) as {
      series: Array<{ data: Array<{ name: string; children: Array<{ name: string; value: number }> }> }>
    }
    const asia = opt.series[0].data.find((n) => n.name === '亚洲')
    expect(asia?.children).toHaveLength(2)
    expect(asia?.children[0]).toEqual({ name: '中国', value: 14.1 })
  })

  it('radius 设置覆盖整个圆', () => {
    const opt = generateSunburstOption(data, { parentField: '大洲', childField: '国家', valueField: '人口(亿)' }) as {
      series: Array<{ radius: Array<string | number> }>
    }
    expect(opt.series[0].radius).toEqual([0, '90%'])
  })
})
