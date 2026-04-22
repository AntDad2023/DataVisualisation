import { describe, it, expect } from 'vitest'
import { generateSankeyOption } from '../sankey'
import type { ParsedData } from '../../types'

describe('generateSankeyOption', () => {
  const data: ParsedData = {
    columns: ['来源', '目标', '流量'],
    rows: [
      ['搜索', '首页', 500],
      ['社交', '首页', 300],
      ['首页', '产品', 600],
      ['首页', '博客', 200],
    ],
    columnTypes: ['string', 'string', 'number'],
  }

  it('links 数量 = 行数，保留顺序和三元组结构', () => {
    const opt = generateSankeyOption(data, { sourceField: '来源', targetField: '目标', valueField: '流量' }) as {
      series: Array<{ links: Array<{ source: string; target: string; value: number }> }>
    }
    expect(opt.series[0].links).toHaveLength(4)
    expect(opt.series[0].links[0]).toEqual({ source: '搜索', target: '首页', value: 500 })
  })

  it('nodes 自动从 source/target 去重', () => {
    const opt = generateSankeyOption(data, { sourceField: '来源', targetField: '目标', valueField: '流量' }) as {
      series: Array<{ data: Array<{ name: string }> }>
    }
    const names = opt.series[0].data.map((n) => n.name).sort()
    expect(names).toEqual(['产品', '博客', '搜索', '社交', '首页'].sort())
  })

  it('series.type 是 sankey', () => {
    const opt = generateSankeyOption(data, { sourceField: '来源', targetField: '目标', valueField: '流量' }) as {
      series: Array<{ type: string }>
    }
    expect(opt.series[0].type).toBe('sankey')
  })
})
