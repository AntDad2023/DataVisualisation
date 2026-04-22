import type { ParsedData } from '../types'

// 边列表类图表（force-graph / chord）通用字段映射：来源 + 目标 + 关系强度
export interface EdgeListFieldMapping {
  sourceField: string
  targetField: string
  valueField: string
}

export interface GraphNode {
  name: string
  symbolSize: number  // 按"关系强度之和"归一化到 20~60 px
  value: number       // 该节点涉及的所有连线 value 求和（供 tooltip / visualMap 用）
  degree: number      // 涉及连线数（出现次数）
}

export interface GraphLink {
  source: string
  target: string
  value: number
}

/**
 * 把平铺的边列表 `[source, target, value]` 转为 ECharts graph 所需的
 * `{ nodes, links }` 结构。
 *
 * 节点大小（symbolSize）按"**涉及该节点的所有关系强度之和**"归一化到 20~60 px。
 * 这比单纯按度数（出现次数）更符合力导图/弦图的定义——节点大小应能代表一个
 * 有实际意义的变量（如"某人的总社交量"），而不仅是"出现过几次"。
 *
 * - nodes 从 source/target 两列去重得到
 * - links 保持原始顺序，每条带上 value
 *
 * 本 helper 与 sankey 的 generateSankeyOption 内部实现相似但用途不同：
 * - sankey 是流向图（有方向），这里用于无向的 force/chord（关系网络）
 * - sankey 的 nodes 不需要 symbolSize；这里要按强度缩放
 */
export function rowsToGraphData(
  data: ParsedData,
  mapping: EdgeListFieldMapping
): { nodes: GraphNode[]; links: GraphLink[] } {
  const sIdx = data.columns.indexOf(mapping.sourceField)
  const tIdx = data.columns.indexOf(mapping.targetField)
  const vIdx = data.columns.indexOf(mapping.valueField)

  const links: GraphLink[] = data.rows.map((row) => ({
    source: String(row[sIdx]),
    target: String(row[tIdx]),
    value: Number(row[vIdx]) || 0,
  }))

  // 同时统计度数和关系强度之和（无向：source/target 都累计）
  const degreeMap = new Map<string, number>()
  const weightMap = new Map<string, number>()
  for (const l of links) {
    degreeMap.set(l.source, (degreeMap.get(l.source) ?? 0) + 1)
    degreeMap.set(l.target, (degreeMap.get(l.target) ?? 0) + 1)
    weightMap.set(l.source, (weightMap.get(l.source) ?? 0) + l.value)
    weightMap.set(l.target, (weightMap.get(l.target) ?? 0) + l.value)
  }

  const maxWeight = Math.max(1, ...weightMap.values())
  const nodes: GraphNode[] = Array.from(degreeMap.entries()).map(([name, degree]) => {
    const weight = weightMap.get(name) ?? 0
    return {
      name,
      symbolSize: 20 + (weight / maxWeight) * 40,  // 20~60 px，核心节点更醒目
      value: weight,
      degree,
    }
  })

  return { nodes, links }
}
