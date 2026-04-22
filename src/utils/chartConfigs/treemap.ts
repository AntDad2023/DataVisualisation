import type { ParsedData } from '../types'
import { rowsToHierarchy, type HierarchyFieldMapping } from './hierarchyHelper'

// 树图字段映射：两级分类 + 数值（复用 hierarchy 通用结构）
export type TreemapFieldMapping = HierarchyFieldMapping

/**
 * 生成树图的 ECharts option。
 * - 矩形嵌套：父节点框内嵌子节点
 * - 面积正比于 value
 */
export function generateTreemapOption(data: ParsedData, mapping: TreemapFieldMapping) {
  const tree = rowsToHierarchy(data, mapping)

  return {
    tooltip: {
      formatter: (info: { name: string; value: number }) =>
        `${info.name}: ${info.value}`,
    },
    series: [
      {
        type: 'treemap' as const,
        data: tree,
        roam: false,
        nodeClick: false as const,
        breadcrumb: { show: false },
        label: { show: true, formatter: '{b}' },
        upperLabel: { show: true, height: 24 },
        levels: [
          {
            itemStyle: { borderColor: '#fff', borderWidth: 3, gapWidth: 3 },
          },
          {
            colorSaturation: [0.35, 0.55],
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2,
              borderColorSaturation: 0.65,
              gapWidth: 1,
            },
          },
        ],
      },
    ],
  }
}
