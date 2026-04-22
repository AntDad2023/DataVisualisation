import { describe, it, expect } from 'vitest'
import { generateForceGraphOption } from '../forceGraph'
import { rowsToGraphData } from '../edgeListHelper'
import type { ParsedData } from '../../types'

const data: ParsedData = {
  columns: ['A', 'B', 'w'],
  rows: [
    ['张三', '李四', 5],
    ['张三', '王五', 3],
    ['李四', '王五', 4],
    ['张三', '赵六', 2],
  ],
  columnTypes: ['string', 'string', 'number'],
}

describe('rowsToGraphData (edgeListHelper)', () => {
  it('nodes 去重；按关系强度之和算 symbolSize（张三 weight 最高）', () => {
    const { nodes } = rowsToGraphData(data, { sourceField: 'A', targetField: 'B', valueField: 'w' })
    const names = nodes.map((n) => n.name).sort()
    expect(names).toEqual(['张三', '李四', '王五', '赵六'].sort())
    // 张三涉及 3 条边，weight = 5+3+2 = 10（全局最大），symbolSize = 20 + 40*1 = 60 px
    const zhang = nodes.find((n) => n.name === '张三')
    expect(zhang?.symbolSize).toBe(60)
    expect(zhang?.value).toBe(10)
    expect(zhang?.degree).toBe(3)
  })

  it('links 保留原始顺序和 value', () => {
    const { links } = rowsToGraphData(data, { sourceField: 'A', targetField: 'B', valueField: 'w' })
    expect(links).toHaveLength(4)
    expect(links[0]).toEqual({ source: '张三', target: '李四', value: 5 })
  })
})

describe('generateForceGraphOption', () => {
  it('series.type = graph, layout = force', () => {
    const opt = generateForceGraphOption(data, { sourceField: 'A', targetField: 'B', valueField: 'w' }) as {
      series: Array<{ type: string; layout: string }>
    }
    expect(opt.series[0].type).toBe('graph')
    expect(opt.series[0].layout).toBe('force')
  })

  it('线宽随 value 线性缩放', () => {
    const opt = generateForceGraphOption(data, { sourceField: 'A', targetField: 'B', valueField: 'w' }) as {
      series: Array<{ links: Array<{ value: number; lineStyle: { width: number } }> }>
    }
    const links = opt.series[0].links
    // maxValue=5, value=5 → width = 1 + 5*1 = 6 px（最粗）
    const maxLink = links.find((l) => l.value === 5)
    expect(maxLink?.lineStyle.width).toBe(6)
  })
})
