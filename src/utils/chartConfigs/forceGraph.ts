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
    tooltip: {
      trigger: 'item' as const,
      formatter: (p: { dataType: string; data: { name: string; value: number; degree: number } | { source: string; target: string; value: number } }) => {
        if (p.dataType === 'edge') {
          const d = p.data as { source: string; target: string; value: number }
          return `${d.source} — ${d.target}<br/>关系强度：${d.value}`
        }
        const d = p.data as { name: string; value: number; degree: number }
        return `${d.name}<br/>连接数：${d.degree}<br/>总关系强度：${d.value}`
      },
    },
    series: [
      {
        type: 'graph' as const,
        layout: 'force' as const,
        data: nodes,
        links: links.map((l) => ({
          source: l.source,
          target: l.target,
          value: l.value,
          lineStyle: { width: 1 + (l.value / maxValue) * 5 },
        })),
        roam: true,
        draggable: true,
        label: { show: true, position: 'right' as const, fontSize: 12, fontWeight: 'bold' as const },
        force: { repulsion: 500, edgeLength: [60, 140], gravity: 0.15, layoutAnimation: true },
        emphasis: {
          focus: 'adjacency' as const,
          label: { fontSize: 14 },
          lineStyle: { width: 8 },
        },
        lineStyle: { color: 'source' as const, curveness: 0, opacity: 0.8 },
        itemStyle: { borderColor: '#fff', borderWidth: 1.5, shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.15)' },
      },
    ],
  }
}
