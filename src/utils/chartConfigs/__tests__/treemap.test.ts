import { describe, it, expect } from 'vitest'
import { generateTreemapOption } from '../treemap'
import { rowsToHierarchy } from '../hierarchyHelper'
import type { ParsedData } from '../../types'

describe('rowsToHierarchy', () => {
  const data: ParsedData = {
    columns: ['大类', '小类', '金额(万)'],
    rows: [
      ['食品', '水果', 30], ['食品', '蔬菜', 25],
      ['电子', '手机', 80],
    ],
    columnTypes: ['string', 'string', 'number'],
  }

  it('将平铺二级分类转为嵌套 children', () => {
    const tree = rowsToHierarchy(data, { parentField: '大类', childField: '小类', valueField: '金额(万)' })
    expect(tree).toHaveLength(2)
    const food = tree.find((n) => n.name === '食品')
    expect(food?.children).toEqual([
      { name: '水果', value: 30 },
      { name: '蔬菜', value: 25 },
    ])
  })

  it('父节点 value 是子节点之和', () => {
    const tree = rowsToHierarchy(data, { parentField: '大类', childField: '小类', valueField: '金额(万)' })
    expect(tree.find((n) => n.name === '食品')?.value).toBe(55)
    expect(tree.find((n) => n.name === '电子')?.value).toBe(80)
  })
})

describe('generateTreemapOption', () => {
  const data: ParsedData = {
    columns: ['大类', '小类', '金额(万)'],
    rows: [
      ['食品', '水果', 30], ['食品', '蔬菜', 25],
      ['电子', '手机', 80],
    ],
    columnTypes: ['string', 'string', 'number'],
  }

  it('series.type 是 treemap', () => {
    const opt = generateTreemapOption(data, { parentField: '大类', childField: '小类', valueField: '金额(万)' }) as {
      series: Array<{ type: string }>
    }
    expect(opt.series[0].type).toBe('treemap')
  })

  it('series.data 顶层节点数 = 父分类去重数', () => {
    const opt = generateTreemapOption(data, { parentField: '大类', childField: '小类', valueField: '金额(万)' }) as {
      series: Array<{ data: Array<{ name: string; children: unknown[] }> }>
    }
    expect(opt.series[0].data).toHaveLength(2)
  })
})
