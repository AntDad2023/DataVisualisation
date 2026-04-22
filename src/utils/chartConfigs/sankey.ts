import type { ParsedData } from '../types'

// 桑基图字段映射：源/目标/流量
export interface SankeyFieldMapping {
  sourceField: string  // 起点列（如"来源"）
  targetField: string  // 终点列（如"目标"）
  valueField: string   // 流量数值列
}

/**
 * 生成桑基图的 ECharts option。
 *
 * 输入：边列表（每行 [source, target, value]）
 * 输出：ECharts 需要的 { nodes, links } 结构
 *
 * - nodes 由 source 和 target 列自动去重得到
 * - links 保留原始顺序，不做汇总合并
 */
export function generateSankeyOption(data: ParsedData, mapping: SankeyFieldMapping) {
  const sIdx = data.columns.indexOf(mapping.sourceField)
  const tIdx = data.columns.indexOf(mapping.targetField)
  const vIdx = data.columns.indexOf(mapping.valueField)

  const links = data.rows.map((row) => ({
    source: String(row[sIdx]),
    target: String(row[tIdx]),
    value: Number(row[vIdx]) || 0,
  }))

  const nodeSet = new Set<string>()
  for (const l of links) {
    nodeSet.add(l.source)
    nodeSet.add(l.target)
  }
  const nodes = Array.from(nodeSet).map((name) => ({ name }))

  return {
    tooltip: { trigger: 'item' as const, triggerOn: 'mousemove' as const },
    series: [
      {
        type: 'sankey' as const,
        data: nodes,
        links,
        emphasis: { focus: 'adjacency' as const },
        lineStyle: { color: 'source' as const, curveness: 0.5 },
        label: { color: '#333', fontSize: 12 },
      },
    ],
  }
}
