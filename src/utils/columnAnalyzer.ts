/**
 * 分析每列的数据类型
 * 规则：如果一列中 80% 以上的非空值能转成数字，则标记为 'number'，否则为 'string'
 * @param rows 数据行（纯字符串）
 * @param colCount 列数
 * @returns 每列的类型数组
 */
export function analyzeColumnTypes(
  rows: string[][],
  colCount: number
): ('number' | 'string')[] {
  const types: ('number' | 'string')[] = []

  for (let col = 0; col < colCount; col++) {
    let totalNonEmpty = 0
    let numericCount = 0

    for (const row of rows) {
      const cell = (row[col] ?? '').trim()
      if (cell === '') continue

      totalNonEmpty++
      // 尝试转换为数字（支持负数、小数、科学计数法）
      if (!isNaN(Number(cell)) && cell !== '') {
        numericCount++
      }
    }

    // 80% 阈值：非空值中 80% 以上是数字 → 数值列
    if (totalNonEmpty > 0 && numericCount / totalNonEmpty >= 0.8) {
      types.push('number')
    } else {
      types.push('string')
    }
  }

  return types
}
