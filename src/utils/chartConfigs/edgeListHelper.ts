import type { ParsedData } from '../types'

// 边列表类图表（force-graph / chord）通用字段映射：来源 + 目标 + 关系强度
export interface EdgeListFieldMapping {
  sourceField: string
  targetField: string
  valueField: string
}

export interface GraphNode {
  name: string
  symbolSize: number  // 按 degree 归一化到 20~50 px
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
 * - nodes 从 source/target 两列去重得到，每个节点的 symbolSize 按度数（出现次数）
 *   线性归一化到 20~50 px：度数越高的节点越大
 * - links 保持原始顺序，每条带上 value 供调用者计算 lineStyle.width
 *
 * 本 helper 与 sankey 的 generateSankeyOption 内部实现相似但用途不同：
 * - sankey 是流向图（有方向），这里用于无向的 force/chord（关系网络）
 * - sankey 的 nodes 不需要 symbolSize；这里要按度数缩放
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

  // 统计每个节点的度数（无向：source 和 target 都 +1）
  const degreeMap = new Map<string, number>()
  for (const l of links) {
    degreeMap.set(l.source, (degreeMap.get(l.source) ?? 0) + 1)
    degreeMap.set(l.target, (degreeMap.get(l.target) ?? 0) + 1)
  }

  const maxDegree = Math.max(1, ...degreeMap.values())
  const nodes: GraphNode[] = Array.from(degreeMap.entries()).map(([name, degree]) => ({
    name,
    symbolSize: 20 + (degree / maxDegree) * 30,
  }))

  return { nodes, links }
}
