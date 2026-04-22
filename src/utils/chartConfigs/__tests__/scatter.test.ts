import { describe, it, expect } from 'vitest'
import { generateScatterOption } from '../scatter'
import type { ParsedData } from '../../types'

describe('generateScatterOption', () => {
  const data: ParsedData = {
    columns: ['h', 'w'],
    rows: [[165, 55], [170, 62], [180, 78]],
    columnTypes: ['number', 'number'],
  }

  it('无分类时应生成单系列散点数据 [[x, y], ...]', () => {
    const option = generateScatterOption(data, { xField: 'h', yField: 'w' }) as any
    expect(option.series).toHaveLength(1)
    expect(option.series[0].type).toBe('scatter')
    expect(option.series[0].data).toEqual([[165, 55], [170, 62], [180, 78]])
  })

  it('无分类时应使用品牌色 #2563EB', () => {
    const option = generateScatterOption(data, { xField: 'h', yField: 'w' }) as any
    expect(option.series[0].itemStyle.color).toBe('#2563EB')
  })

  it('有分类时应按分类拆成多系列', () => {
    const d: ParsedData = {
      columns: ['h', 'w', 'sex'],
      rows: [
        [165, 55, 'F'],
        [170, 62, 'M'],
        [180, 78, 'M'],
      ],
      columnTypes: ['number', 'number', 'string'],
    }
    const option = generateScatterOption(d, { xField: 'h', yField: 'w', categoryField: 'sex' }) as any
    expect(option.series).toHaveLength(2)
    // 保持首次出现顺序：F 先、M 后
    expect(option.series[0].name).toBe('F')
    expect(option.series[0].data).toEqual([[165, 55]])
    expect(option.series[1].name).toBe('M')
    expect(option.series[1].data).toEqual([[170, 62], [180, 78]])
  })

  it('非数值坐标应降级为 0', () => {
    const d: ParsedData = {
      columns: ['x', 'y'],
      rows: [['bad' as unknown as number, 'bad' as unknown as number], [10, 20]],
      columnTypes: ['number', 'number'],
    }
    const option = generateScatterOption(d, { xField: 'x', yField: 'y' }) as any
    expect(option.series[0].data).toEqual([[0, 0], [10, 20]])
  })
})
