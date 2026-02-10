import type { ParsedData } from './types'
import { analyzeColumnTypes } from './columnAnalyzer'

/**
 * 解析用户粘贴的表格文本
 * 优先按 Tab 分隔（Excel 复制），如果没有 Tab 则按逗号分隔
 * @param text 用户粘贴的文本
 * @returns ParsedData
 */
export function parsePastedText(text: string): ParsedData {
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('粘贴的内容为空，请先粘贴数据')
  }

  // 按行拆分（兼容 \r\n 和 \n）
  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim() !== '')

  if (lines.length < 2) {
    throw new Error('数据至少需要 2 行（第 1 行是列名，第 2 行开始是数据）')
  }

  // 检测分隔符：如果第一行包含 Tab，用 Tab；否则用逗号
  const delimiter = lines[0].includes('\t') ? '\t' : ','

  // 拆分每行
  const rawRows = lines.map((line) => line.split(delimiter))

  // 第一行作为列名
  const columns = rawRows[0].map((col, i) =>
    col.trim() || `col${i + 1}`
  )

  // 剩余行作为数据
  const dataRows = rawRows.slice(1)

  // 标准化每行的列数
  const normalizedRows = dataRows.map((row) => {
    const trimmedRow = row.map((cell) => cell.trim())
    if (trimmedRow.length < columns.length) {
      return [...trimmedRow, ...Array(columns.length - trimmedRow.length).fill('')]
    }
    return trimmedRow.slice(0, columns.length)
  })

  // 分析列类型并转换数值
  const columnTypes = analyzeColumnTypes(normalizedRows, columns.length)
  const typedRows = normalizedRows.map((row) =>
    row.map((cell, colIdx) => {
      if (columnTypes[colIdx] === 'number') {
        const num = Number(cell)
        return isNaN(num) ? cell : num
      }
      return cell
    })
  )

  return { columns, rows: typedRows, columnTypes }
}
