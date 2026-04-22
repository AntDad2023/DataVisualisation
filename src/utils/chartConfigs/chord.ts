import type { ParsedData } from '../types'
import { rowsToGraphData, type EdgeListFieldMapping } from './edgeListHelper'

// 弦图字段映射：复用通用边列表映射
export type ChordFieldMapping = EdgeListFieldMapping

/**
 * 生成弦图的 ECharts option。
 *
 * ECharts 没有独立的 chord 类型，这里用 `graph + layout:'circular'` 近似：
 * - 节点均匀分布在圆周上
 * - 连线用贝塞尔曲线 (curveness=0.3) 穿过圆心区域，产生弦图视觉效果
 * - 线宽按关系强度缩放，hover 时高亮相邻
 */
export function generateChordOption(data: ParsedData, mapping: ChordFieldMapping) {
  const { nodes, links } = rowsToGraphData(data, mapping)

  const maxValue = Math.max(1, ...links.map((l) => l.value))

  return {
    tooltip: {
      trigger: 'item' as const,
      formatter: (p: { dataType: string; data: { name: string; value: number; degree: number } | { source: string; target: string; value: number } }) => {
        if (p.dataType === 'edge') {
          const d = p.data as { source: string; target: string; value: number }
          return `${d.source} ⇌ ${d.target}<br/>数值：${d.value}`
        }
        const d = p.data as { name: string; value: number; degree: number }
        return `${d.name}<br/>关联数：${d.degree}<br/>总量：${d.value}`
      },
    },
    series: [
      {
        type: 'graph' as const,
        layout: 'circular' as const,
        circular: { rotateLabel: true },
        data: nodes,
        links: links.map((l) => ({
          source: l.source,
          target: l.target,
          value: l.value,
          lineStyle: {
            width: 2 + (l.value / maxValue) * 8,  // 2~10 px，弦宽度差异更明显
            curveness: 0.45,                       // 曲率大一些，更像弦
            opacity: 0.6,
          },
        })),
        label: { show: true, position: 'right' as const, fontSize: 13, fontWeight: 'bold' as const },
        emphasis: {
          focus: 'adjacency' as const,
          label: { fontSize: 15 },
          lineStyle: { width: 12, opacity: 1 },
          itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.3)' },
        },
        lineStyle: { color: 'source' as const },
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        roam: false,
      },
    ],
  }
}
