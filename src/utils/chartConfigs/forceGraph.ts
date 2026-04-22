import type { ParsedData } from '../types'
import { rowsToGraphData, type EdgeListFieldMapping } from './edgeListHelper'

// 力导图字段映射：复用通用边列表映射
export type ForceGraphFieldMapping = EdgeListFieldMapping

/**
 * 生成力导图的 ECharts option。
 * - 节点用物理模拟自动布局，关系紧密的靠在一起
 * - 度数高的节点显示得更大
 * - 线宽按关系强度 (value) 缩放
 * - roam: true 允许用户拖拽和缩放
 */
export function generateForceGraphOption(data: ParsedData, mapping: ForceGraphFieldMapping) {
  const { nodes, links } = rowsToGraphData(data, mapping)

  const maxValue = Math.max(1, ...links.map((l) => l.value))

  return {
    tooltip: { trigger: 'item' as const },
    series: [
      {
        type: 'graph' as const,
        layout: 'force' as const,
        data: nodes,
        links: links.map((l) => ({
          source: l.source,
          target: l.target,
          value: l.value,
          lineStyle: { width: 1 + (l.value / maxValue) * 4 },
        })),
        roam: true,
        label: { show: true, position: 'right' as const, fontSize: 12 },
        force: { repulsion: 300, edgeLength: 120, gravity: 0.1 },
        emphasis: { focus: 'adjacency' as const, lineStyle: { width: 6 } },
        lineStyle: { color: 'source' as const, curveness: 0 },
      },
    ],
  }
}
