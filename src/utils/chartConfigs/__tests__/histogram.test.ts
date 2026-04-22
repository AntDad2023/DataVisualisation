import { describe, it, expect } from 'vitest'
import { generateHistogramOption } from '../histogram'
import type { ParsedData } from '../../types'

describe('generateHistogramOption', () => {
  it('应按指定分箱数生成对应数量的 bin 标签', () => {
    const data: ParsedData = {
      columns: ['v'],
      rows: Array.from({ length: 10 }, (_, i) => [i] as (string | number)[]),
      columnTypes: ['number'],
    }
    const option = generateHistogramOption(data, { valueField: 'v', binCount: 5 }) as any
    expect(option.xAxis.data).toHaveLength(5)
  })

  it('默认分箱数应为 10', () => {
    const data: ParsedData = {
      columns: ['v'],
      rows: Array.from({ length: 20 }, (_, i) => [i] as (string | number)[]),
      columnTypes: ['number'],
    }
    const option = generateHistogramOption(data, { valueField: 'v' }) as any
    expect(option.xAxis.data).toHaveLength(10)
  })

  it('所有有效数值都应被计入某个 bin（总频次 = 输入数量）', () => {
    const data: ParsedData = {
      columns: ['v'],
      rows: Array.from({ length: 10 }, (_, i) => [i] as (string | number)[]),
      columnTypes: ['number'],
    }
    const option = generateHistogramOption(data, { valueField: 'v', binCount: 5 }) as any
    const total = (option.series[0].data as number[]).reduce((a, b) => a + b, 0)
    expect(total).toBe(10)
  })

  it('最大值应被归入最后一个 bin，而不是越界', () => {
    const data: ParsedData = {
      columns: ['v'],
      rows: [[0], [0], [10]] as (string | number)[][],
      columnTypes: ['number'],
    }
    const option = generateHistogramOption(data, { valueField: 'v', binCount: 2 }) as any
    const counts = option.series[0].data as number[]
    expect(counts[0]).toBe(2)
    expect(counts[counts.length - 1]).toBe(1)
  })

  it('非数值单元格应被过滤后再分箱', () => {
    const data: ParsedData = {
      columns: ['v'],
      rows: [[1], [2], ['bad'], [3], [4]] as (string | number)[][],
      columnTypes: ['number'],
    }
    const option = generateHistogramOption(data, { valueField: 'v', binCount: 4 }) as any
    const total = (option.series[0].data as number[]).reduce((a, b) => a + b, 0)
    expect(total).toBe(4)
  })

  it('无任何有效数值时应返回一个带占位标题的 option', () => {
    const data: ParsedData = {
      columns: ['v'],
      rows: [['x'], ['y']] as (string | number)[][],
      columnTypes: ['string'],
    }
    const option = generateHistogramOption(data, { valueField: 'v' }) as any
    expect(option.title.text).toMatch(/没有有效/)
  })
})
