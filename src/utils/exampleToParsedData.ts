import type { ParsedData } from './types'
import { analyzeColumnTypes } from './columnAnalyzer'

/**
 * 将 ChartMeta.exampleData 转换为 ParsedData。
 *
 * 行为与 pasteParser 保持一致：
 *   先把所有 cell 字符串化 → analyzeColumnTypes 识别列类型 → number 列再转回 Number。
 *
 * 这保证："带入生成器"产生的 ParsedData 与用户手动粘贴产生的 ParsedData
 * 结构完全一致，下游 buildChartOption 无需关心来源。
 */
export function exampleToParsedData(example: {
  columns: string[]
  rows: (string | number)[][]
}): ParsedData {
  const stringRows = example.rows.map((row) => row.map((cell) => String(cell)))
  const columnTypes = analyzeColumnTypes(stringRows, example.columns.length)
  const rows = stringRows.map((row) =>
    row.map((cell, colIdx) => {
      if (columnTypes[colIdx] === 'number') {
        const num = Number(cell)
        return isNaN(num) ? cell : num
      }
      return cell
    })
  )
  return { columns: example.columns, rows, columnTypes }
}
