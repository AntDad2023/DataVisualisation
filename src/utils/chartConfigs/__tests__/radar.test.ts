import { describe, it, expect } from 'vitest'
import { generateRadarOption } from '../radar'
import type { ParsedData } from '../../types'

describe('generateRadarOption', () => {
  const data: ParsedData = {
    columns: ['角色', '攻击', '防御', '速度'],
    rows: [
      ['战士', 85, 90, 60],
      ['法师', 95, 55, 75],
    ],
    columnTypes: ['string', 'number', 'number', 'number'],
  }

  it('indicator 应覆盖所有传入的维度名', () => {
    const option = generateRadarOption(data, {
      nameField: '角色',
      valueFields: ['攻击', '防御', '速度'],
    }) as any
    expect(option.radar.indicator.map((i: { name: string }) => i.name)).toEqual([
      '攻击', '防御', '速度',
    ])
  })

  it('每个 indicator.max 应 = 该维度最大值 × 1.2（留 20% 余量）', () => {
    const option = generateRadarOption(data, {
      nameField: '角色',
      valueFields: ['攻击', '防御', '速度'],
    }) as any
    // 攻击: max(85, 95) = 95 → 95*1.2 = 114
    // 防御: max(90, 55) = 90 → 90*1.2 = 108
    // 速度: max(60, 75) = 75 → 75*1.2 = 90
    expect(option.radar.indicator[0].max).toBe(114)
    expect(option.radar.indicator[1].max).toBe(108)
    expect(option.radar.indicator[2].max).toBe(90)
  })

  it('series.data 应每行映射为 {name, value[]}，与维度顺序一致', () => {
    const option = generateRadarOption(data, {
      nameField: '角色',
      valueFields: ['攻击', '防御', '速度'],
    }) as any
    expect(option.series[0].data).toEqual([
      { name: '战士', value: [85, 90, 60] },
      { name: '法师', value: [95, 55, 75] },
    ])
  })

  it('legend.data 应等于所有对象名', () => {
    const option = generateRadarOption(data, {
      nameField: '角色',
      valueFields: ['攻击', '防御', '速度'],
    }) as any
    expect(option.legend.data).toEqual(['战士', '法师'])
  })

  it('维度全为 0 时 indicator.max 应兜底为 100', () => {
    const zeros: ParsedData = {
      columns: ['name', 'a'],
      rows: [['x', 0], ['y', 0]],
      columnTypes: ['string', 'number'],
    }
    const option = generateRadarOption(zeros, {
      nameField: 'name',
      valueFields: ['a'],
    }) as any
    expect(option.radar.indicator[0].max).toBe(100)
  })
})
