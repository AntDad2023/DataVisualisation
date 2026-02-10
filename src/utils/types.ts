// 解析后的数据结构（CSV 和粘贴表格共用）
export interface ParsedData {
  columns: string[]                    // 列名数组
  rows: (string | number)[][]          // 数据行（每行是一个数组）
  columnTypes: ('number' | 'string')[] // 每列的类型（数值 or 文本）
}
