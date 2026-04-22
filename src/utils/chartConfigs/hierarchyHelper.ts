import type { ParsedData } from '../types'

// treemap / sunburst 共享的字段映射：两列分类（父/子）+ 一列数值
export interface HierarchyFieldMapping {
  parentField: string
  childField: string
  valueField: string
}

// ECharts treemap / sunburst 的嵌套数据结构
export interface TreeNode {
  name: string
  value?: number
  children?: TreeNode[]
}

/**
 * 把平铺的两级分类 + 数值转为 ECharts 需要的嵌套 children 结构。
 *
 * 输入行格式（示例）：
 *   [ ['食品', '水果', 30], ['食品', '蔬菜', 25], ['电子', '手机', 80] ]
 *
 * 输出：
 *   [
 *     { name: '食品', value: 55, children: [{name:'水果',value:30}, {name:'蔬菜',value:25}] },
 *     { name: '电子', value: 80, children: [{name:'手机',value:80}] },
 *   ]
 *
 * 父节点的 value 为其所有子节点 value 之和（供 ECharts tooltip/label 使用）。
 */
export function rowsToHierarchy(
  data: ParsedData,
  mapping: HierarchyFieldMapping
): TreeNode[] {
  const pIdx = data.columns.indexOf(mapping.parentField)
  const cIdx = data.columns.indexOf(mapping.childField)
  const vIdx = data.columns.indexOf(mapping.valueField)

  const parentMap = new Map<string, TreeNode[]>()
  for (const row of data.rows) {
    const p = String(row[pIdx])
    const c = String(row[cIdx])
    const v = Number(row[vIdx]) || 0
    if (!parentMap.has(p)) parentMap.set(p, [])
    parentMap.get(p)!.push({ name: c, value: v })
  }

  return Array.from(parentMap.entries()).map(([name, children]) => ({
    name,
    value: children.reduce((sum, c) => sum + (c.value || 0), 0),
    children,
  }))
}
