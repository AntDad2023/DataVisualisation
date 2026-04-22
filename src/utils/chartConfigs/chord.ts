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
    tooltip: { trigger: 'item' as const },
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
            width: 1 + (l.value / maxValue) * 5,
            curveness: 0.3,
            opacity: 0.7,
          },
        })),
        label: { show: true, position: 'right' as const, fontSize: 12 },
        emphasis: {
          focus: 'adjacency' as const,
          lineStyle: { width: 8, opacity: 1 },
        },
        lineStyle: { color: 'source' as const },
        roam: false,
      },
    ],
  }
}
