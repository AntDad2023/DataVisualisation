import type { ParsedData } from '../types'
import { chord as d3Chord, type Chords } from 'd3-chord'

// 弦图字段映射：源列 / 目标列 / 数值列（有向，可含对称但值不同的两条边）
export interface ChordFieldMapping {
  sourceField: string
  targetField: string
  valueField: string
}

// 交给 <ChordChart /> SVG 组件渲染需要的全部数据
export interface ChordRenderData {
  labels: string[]        // 节点名列表（首次出现顺序）
  matrix: number[][]      // matrix[i][j] = i → j 的流量（有向）
  chords: Chords          // d3-chord 布局结果：groups（每个节点扇形角度范围）+ 每条弦的 source/target 子角度范围
  total: number           // 所有单向流量之和（用于 tooltip 里显示占比）
}

/**
 * 构建弦图渲染数据。
 *
 * ECharts 原生不支持弦图（4.0+ 移除了 chord 类型），且 `graph + circular` 只是
 * "节点在圆上连细线"，完全不是真弦图——真弦图的核心是：
 *   1. 节点是圆周上的扇形"区段"，长度 = 该节点进+出总流量
 *   2. 弦是有宽度的带子，两端宽度**可以不同**（A→B=10 与 B→A=5 是两侧不等宽）
 *
 * 这里用 d3-chord 做布局（只算角度，不生成 SVG），SVG path 由 `<ChordChart />`
 * 组件里 d3-shape 的 ribbon/arc 生成器负责。
 */
export function generateChordData(data: ParsedData, mapping: ChordFieldMapping): ChordRenderData {
  const sIdx = data.columns.indexOf(mapping.sourceField)
  const tIdx = data.columns.indexOf(mapping.targetField)
  const vIdx = data.columns.indexOf(mapping.valueField)

  // 1. 从边列表提取节点名（保持首次出现顺序，稳定可测）
  const labels: string[] = []
  const labelIndex = new Map<string, number>()
  const register = (name: string) => {
    if (!labelIndex.has(name)) {
      labelIndex.set(name, labels.length)
      labels.push(name)
    }
  }
  for (const row of data.rows) {
    register(String(row[sIdx]))
    register(String(row[tIdx]))
  }
  const n = labels.length

  // 2. 构建有向流量矩阵；同一对 (src,tgt) 多行累加
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  let total = 0
  for (const row of data.rows) {
    const i = labelIndex.get(String(row[sIdx]))!
    const j = labelIndex.get(String(row[tIdx]))!
    const v = Number(row[vIdx]) || 0
    matrix[i][j] += v
    total += v
  }

  // 3. d3-chord 布局：padAngle 是节点之间的空隙；sortSubgroups 让每个扇区内
  //    子弧按值降序排列，视觉更整齐
  const chords = d3Chord()
    .padAngle(0.04)
    .sortSubgroups((a, b) => b - a)(matrix)

  return { labels, matrix, chords, total }
}

