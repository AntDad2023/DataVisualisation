import type { ParsedData } from '../types'
import { rowsToHierarchy, type HierarchyFieldMapping } from './hierarchyHelper'

// 旭日图字段映射：跟树图共用层级数据结构
export type SunburstFieldMapping = HierarchyFieldMapping

/**
 * 生成旭日图的 ECharts option。
 * - 同心圆环：内圈为父节点，外圈为子节点
 * - 扇区角度正比于 value
 */
export function generateSunburstOption(data: ParsedData, mapping: SunburstFieldMapping) {
  const tree = rowsToHierarchy(data, mapping)

  return {
    tooltip: {
      formatter: (info: { name: string; value: number }) =>
        `${info.name}: ${info.value}`,
    },
    series: [
      {
        type: 'sunburst' as const,
        data: tree,
        radius: [0, '90%'],
        label: { rotate: 'radial' as const, minAngle: 10 },
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        emphasis: { focus: 'ancestor' as const },
      },
    ],
  }
}
