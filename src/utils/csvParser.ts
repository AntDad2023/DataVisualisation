import Papa from 'papaparse'
import type { ParsedData } from './types'
import { analyzeColumnTypes } from './columnAnalyzer'

/**
 * 解析 CSV 文件，返回统一的 ParsedData 格式
 * @param file 用户上传的 CSV 文件
 * @returns Promise<ParsedData>
 */
export function parseCsvFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,        // 不自动把第一行当 header，我们手动处理
      skipEmptyLines: true,  // 跳过空行
      complete(results) {
        const rawRows = results.data as string[][]

        if (rawRows.length === 0) {
          reject(new Error('CSV 文件为空'))
          return
        }

        // 第一行作为列名
        const columns = rawRows[0].map((col, i) =>
          col.trim() || `col${i + 1}`
        )

        // 剩余行作为数据
        const dataRows = rawRows.slice(1)

        // 检查列数一致性
        const inconsistentRows = dataRows.filter((row) => row.length !== columns.length)
        if (inconsistentRows.length > 0) {
          console.warn(`有 ${inconsistentRows.length} 行的列数与表头不一致，已自动补齐或截断`)
        }

        // 标准化每行的列数（补空字符串或截断）
        const normalizedRows = dataRows.map((row) => {
          if (row.length < columns.length) {
            return [...row, ...Array(columns.length - row.length).fill('')]
          }
          return row.slice(0, columns.length)
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

        resolve({ columns, rows: typedRows, columnTypes })
      },
      error(err) {
        reject(new Error(`CSV 解析失败：${err.message}`))
      },
    })
  })
}
