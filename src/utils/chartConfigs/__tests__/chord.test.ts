import { describe, it, expect } from 'vitest'
import { generateChordData } from '../chord'
import type { ParsedData } from '../../types'

// 有向矩阵测试数据：A↔B、A↔C、B↔C 三对关系，每对两个方向值不同（体现"弦两端不等宽"）
const data: ParsedData = {
  columns: ['src', 'tgt', 'v'],
  rows: [
    ['A', 'B', 10],  // A→B 10
    ['B', 'A', 5],   // B→A 5（两端不等！）
    ['A', 'C', 15],
    ['C', 'A', 5],
    ['B', 'C', 15],
    ['C', 'B', 10],
  ],
  columnTypes: ['string', 'string', 'number'],
}

describe('generateChordData', () => {
  it('labels 按首次出现顺序提取，不重复', () => {
    const r = generateChordData(data, { sourceField: 'src', targetField: 'tgt', valueField: 'v' })
    expect(r.labels).toEqual(['A', 'B', 'C'])
  })

  it('matrix 是有向 NxN，方向不同值不同（弦两端不等宽的来源）', () => {
    const r = generateChordData(data, { sourceField: 'src', targetField: 'tgt', valueField: 'v' })
    expect(r.matrix).toEqual([
      [0, 10, 15],  // A→A=0, A→B=10, A→C=15
      [5, 0, 15],   // B→A=5 ≠ A→B=10，关键不对称
      [5, 10, 0],
    ])
  })

  it('total 是所有单向流量之和', () => {
    const r = generateChordData(data, { sourceField: 'src', targetField: 'tgt', valueField: 'v' })
    expect(r.total).toBe(60)  // 10+5+15+5+15+10
  })

  it('chords.groups 给每个节点分配扇形角度，总角度覆盖一圈（减去 padAngle）', () => {
    const r = generateChordData(data, { sourceField: 'src', targetField: 'tgt', valueField: 'v' })
    expect(r.chords.groups).toHaveLength(3)
    for (const g of r.chords.groups) {
      expect(g.endAngle).toBeGreaterThan(g.startAngle)
    }
  })

  it('chords 每条弦 source/target 两端 value 独立（由 matrix[i][j] vs matrix[j][i] 决定）', () => {
    const r = generateChordData(data, { sourceField: 'src', targetField: 'tgt', valueField: 'v' })
    // 找 A↔B 那条弦
    const ab = r.chords.find(
      (c) =>
        (c.source.index === 0 && c.target.index === 1) ||
        (c.source.index === 1 && c.target.index === 0)
    )
    expect(ab).toBeDefined()
    // 两端 value 加起来 = 10+5 = 15
    expect(ab!.source.value + ab!.target.value).toBe(15)
    // 且两端不相等（关键！）
    expect(ab!.source.value).not.toBe(ab!.target.value)
  })

  it('同一对 (src,tgt) 多行时自动累加', () => {
    const dup: ParsedData = {
      columns: ['s', 't', 'v'],
      rows: [
        ['X', 'Y', 3],
        ['X', 'Y', 7],  // 应累加为 10
      ],
      columnTypes: ['string', 'string', 'number'],
    }
    const r = generateChordData(dup, { sourceField: 's', targetField: 't', valueField: 'v' })
    expect(r.matrix[0][1]).toBe(10)
  })
})

