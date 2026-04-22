import { describe, it, expect } from 'vitest'
import { exampleToParsedData } from '../exampleToParsedData'

describe('exampleToParsedData', () => {
  it('识别 string 列和 number 列', () => {
    const result = exampleToParsedData({
      columns: ['城市', '人口(万)'],
      rows: [
        ['北京', 2189],
        ['上海', 2487],
      ],
    })
    expect(result.columns).toEqual(['城市', '人口(万)'])
    expect(result.columnTypes).toEqual(['string', 'number'])
  })

  it('number 列的 cell 应转为 number 类型', () => {
    const result = exampleToParsedData({
      columns: ['x', 'y'],
      rows: [['a', 10], ['b', 20]],
    })
    expect(result.rows[0][1]).toBe(10)
    expect(typeof result.rows[0][1]).toBe('number')
  })

  it('全数字字面量的列应识别为 number（如 2019/2020）', () => {
    const result = exampleToParsedData({
      columns: ['年份', '收入'],
      rows: [
        ['2019', 50],
        ['2020', 65],
      ],
    })
    expect(result.columnTypes).toEqual(['number', 'number'])
  })

  it('雷达图的宽格式（对象名 + 多维度）应识别为 1 string + N number', () => {
    const result = exampleToParsedData({
      columns: ['角色', '攻击', '防御', '速度', '技巧', '体力'],
      rows: [
        ['战士', 85, 90, 60, 70, 95],
        ['法师', 95, 55, 75, 90, 60],
      ],
    })
    expect(result.columnTypes).toEqual(['string', 'number', 'number', 'number', 'number', 'number'])
    // 原始数字应保持 number
    expect(result.rows[0][1]).toBe(85)
    expect(result.rows[1][5]).toBe(60)
  })

  it('rows 的长度和列数应与输入一致', () => {
    const result = exampleToParsedData({
      columns: ['a', 'b', 'c'],
      rows: [
        ['x', 1, 2],
        ['y', 3, 4],
        ['z', 5, 6],
      ],
    })
    expect(result.rows).toHaveLength(3)
    expect(result.rows[0]).toHaveLength(3)
  })
})
