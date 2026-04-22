import { describe, it, expect } from 'vitest'
import { generateChordOption } from '../chord'
import type { ParsedData } from '../../types'

const data: ParsedData = {
  columns: ['A', 'B', 'v'],
  rows: [
    ['北京', '上海', 50],
    ['北京', '广州', 30],
    ['上海', '广州', 20],
  ],
  columnTypes: ['string', 'string', 'number'],
}

describe('generateChordOption', () => {
  it('series.type = graph, layout = circular（ECharts 无原生 chord，用 circular graph 近似）', () => {
    const opt = generateChordOption(data, { sourceField: 'A', targetField: 'B', valueField: 'v' }) as {
      series: Array<{ type: string; layout: string }>
    }
    expect(opt.series[0].type).toBe('graph')
    expect(opt.series[0].layout).toBe('circular')
  })

  it('连线带贝塞尔曲率产生弦图效果', () => {
    const opt = generateChordOption(data, { sourceField: 'A', targetField: 'B', valueField: 'v' }) as {
      series: Array<{ links: Array<{ lineStyle: { curveness: number } }> }>
    }
    expect(opt.series[0].links[0].lineStyle.curveness).toBe(0.3)
  })

  it('nodes 从 source/target 去重为 3 个城市', () => {
    const opt = generateChordOption(data, { sourceField: 'A', targetField: 'B', valueField: 'v' }) as {
      series: Array<{ data: Array<{ name: string }> }>
    }
    const names = opt.series[0].data.map((n) => n.name).sort()
    expect(names).toEqual(['上海', '北京', '广州'])
  })
})
