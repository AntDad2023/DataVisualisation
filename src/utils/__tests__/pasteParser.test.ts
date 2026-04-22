import { describe, it, expect } from 'vitest'
import { parsePastedText } from '../pasteParser'

describe('parsePastedText', () => {
  it('应按 Tab 分隔解析（Excel 复制的典型格式）', () => {
    const text = '城市\t人口\n北京\t2189\n上海\t2487'
    const result = parsePastedText(text)
    expect(result.columns).toEqual(['城市', '人口'])
    expect(result.rows).toEqual([
      ['北京', 2189],
      ['上海', 2487],
    ])
    expect(result.columnTypes).toEqual(['string', 'number'])
  })

  it('第一行无 Tab 时应按逗号分隔', () => {
    const text = 'name,age\nAlice,30\nBob,25'
    const result = parsePastedText(text)
    expect(result.columns).toEqual(['name', 'age'])
    expect(result.rows).toEqual([
      ['Alice', 30],
      ['Bob', 25],
    ])
    expect(result.columnTypes).toEqual(['string', 'number'])
  })

  it('第一行有 Tab 时优先按 Tab 拆分（单元格内的逗号不被再次拆分）', () => {
    // 第一行用 tab → 整体按 tab 拆；第二行里的逗号应视作数据的一部分
    const text = 'a\tb\n1,2\t3,4'
    const result = parsePastedText(text)
    expect(result.columns).toEqual(['a', 'b'])
    expect(result.rows).toEqual([['1,2', '3,4']])
  })

  it('应兼容 CRLF 换行（Windows 剪贴板）', () => {
    const text = 'a,b\r\n1,2\r\n3,4'
    const result = parsePastedText(text)
    expect(result.rows).toEqual([
      [1, 2],
      [3, 4],
    ])
  })

  it('单元格前后的空白应被 trim', () => {
    const text = 'a,b\n  1 ,  2  '
    const result = parsePastedText(text)
    expect(result.rows).toEqual([[1, 2]])
  })

  it('应跳过中间/结尾的空行', () => {
    const text = 'a,b\n\n1,2\n\n3,4\n'
    const result = parsePastedText(text)
    expect(result.rows).toEqual([
      [1, 2],
      [3, 4],
    ])
  })

  it('输入为空应抛出清晰错误', () => {
    expect(() => parsePastedText('')).toThrow('粘贴的内容为空')
    expect(() => parsePastedText('   \n  ')).toThrow('粘贴的内容为空')
  })

  it('只有一行时应抛出错误（至少需要表头 + 1 行数据）', () => {
    expect(() => parsePastedText('a,b,c')).toThrow('至少需要 2 行')
  })

  it('数据行列数少于表头时应用空字符串补齐', () => {
    const text = 'a,b,c\n1,2'
    const result = parsePastedText(text)
    // 第 3 列只有一个空值 → 全空列 → string
    expect(result.columnTypes).toEqual(['number', 'number', 'string'])
    expect(result.rows).toEqual([[1, 2, '']])
  })

  it('数据行列数多于表头时应截断', () => {
    const text = 'a,b\n1,2,3,4'
    const result = parsePastedText(text)
    expect(result.rows).toEqual([[1, 2]])
  })

  it('表头中的空列名应被替换为 col1/col2/...（按位置编号）', () => {
    const text = 'a,,c\n1,2,3'
    const result = parsePastedText(text)
    expect(result.columns).toEqual(['a', 'col2', 'c'])
  })

  it('混合数据类型时应按列识别 number / string', () => {
    const text = 'name\tscore\nAlice\t95.5\nBob\t88'
    const result = parsePastedText(text)
    expect(result.columnTypes).toEqual(['string', 'number'])
    expect(result.rows).toEqual([
      ['Alice', 95.5],
      ['Bob', 88],
    ])
  })
})
