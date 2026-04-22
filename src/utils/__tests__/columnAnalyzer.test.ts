import { describe, it, expect } from 'vitest'
import { analyzeColumnTypes } from '../columnAnalyzer'

describe('analyzeColumnTypes', () => {
  it('全数字列应识别为 number', () => {
    const rows = [
      ['1', '2'],
      ['3', '4'],
      ['5', '6'],
    ]
    expect(analyzeColumnTypes(rows, 2)).toEqual(['number', 'number'])
  })

  it('全文本列应识别为 string', () => {
    const rows = [
      ['a', 'b'],
      ['c', 'd'],
    ]
    expect(analyzeColumnTypes(rows, 2)).toEqual(['string', 'string'])
  })

  it('数字列 + 文本列 的混合场景应分别识别', () => {
    const rows = [
      ['10', 'Alice'],
      ['20', 'Bob'],
      ['30', 'Carol'],
    ]
    expect(analyzeColumnTypes(rows, 2)).toEqual(['number', 'string'])
  })

  it('数值占比 ≥ 80% 时标记为 number（9/10）', () => {
    const rows = [
      ['1'], ['2'], ['3'], ['4'], ['5'],
      ['6'], ['7'], ['8'], ['9'], ['x'],
    ]
    expect(analyzeColumnTypes(rows, 1)).toEqual(['number'])
  })

  it('数值占比恰好 80% 时标记为 number（4/5 边界）', () => {
    const rows = [['1'], ['2'], ['3'], ['4'], ['x']]
    expect(analyzeColumnTypes(rows, 1)).toEqual(['number'])
  })

  it('数值占比 < 80% 时标记为 string（3/10）', () => {
    const rows = [
      ['1'], ['2'], ['3'], ['x'], ['y'],
      ['z'], ['p'], ['q'], ['r'], ['s'],
    ]
    expect(analyzeColumnTypes(rows, 1)).toEqual(['string'])
  })

  it('计算占比时应忽略空单元格', () => {
    // 2 个数字 + 2 个空 → 非空中 100% 是数字 → number
    const rows = [['1'], [''], ['2'], ['']]
    expect(analyzeColumnTypes(rows, 1)).toEqual(['number'])
  })

  it('全空列应标记为 string（兜底）', () => {
    const rows = [[''], [''], ['']]
    expect(analyzeColumnTypes(rows, 1)).toEqual(['string'])
  })

  it('负数与小数应被识别为数字', () => {
    const rows = [['-1.5'], ['2.3'], ['-0.01']]
    expect(analyzeColumnTypes(rows, 1)).toEqual(['number'])
  })

  it('科学计数法应被识别为数字', () => {
    const rows = [['1e5'], ['2E-3'], ['3.14e2']]
    expect(analyzeColumnTypes(rows, 1)).toEqual(['number'])
  })

  it('行中缺失的列应按空处理，不影响已有列的判定', () => {
    // 第二行只有一列，第二列访问到 undefined → 按空单元格处理
    const rows: string[][] = [['1', '2'], ['3']]
    expect(analyzeColumnTypes(rows, 2)).toEqual(['number', 'number'])
  })

  it('空 rows 时每列都兜底为 string', () => {
    expect(analyzeColumnTypes([], 3)).toEqual(['string', 'string', 'string'])
  })

  it('数字单元格前后空白应被 trim 后正确识别', () => {
    const rows = [['  10  '], [' 20 '], ['30']]
    expect(analyzeColumnTypes(rows, 1)).toEqual(['number'])
  })
})
