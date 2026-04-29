import { describe, it, expect } from 'vitest'
import { chartsData, type ChartMeta } from '../../data/chartsData'
import { buildPreviewResult } from '../ChartDetail'

/**
 * ChartDetail 预览区块的逻辑单测。
 *
 * 直接 import ChartDetail 里的 buildPreviewResult 真实实现来测，
 * 而不是在测试里复制一份实现——避免测试和实现各自维护、随时间漂移。
 *
 * buildPreviewResult 是纯函数（无 DOM / jsdom 依赖），node 环境下可直接测。
 */

// 取三张具有代表性的图表
const barChart = chartsData.find((c) => c.id === 'bar')!
const chordChart = chartsData.find((c) => c.id === 'chord')!
const hexbinChart = chartsData.find((c) => c.id === 'hexbin')!

describe('ChartDetail 预览区块逻辑', () => {
  it('bar 图：buildChartOption 成功，且 option 包含 series', () => {
    // 验收要求 1：普通 ECharts 图表（bar）渲染时调了 buildChartOption 且结果有 series
    expect(barChart).toBeDefined()
    const result = buildPreviewResult(barChart)
    // 有 defaultMapping，不应返回 null
    expect(result).not.toBeNull()
    expect(result!.ok).toBe(true)
    if (!result!.ok) throw new Error('bar 预览生成失败')
    const opt = result!.option as { series?: unknown }
    expect(opt.series).toBeDefined()
    expect(Array.isArray(opt.series)).toBe(true)
  })

  it('chord 图：buildChartOption 返回 chord-svg 标记，不走 ECharts', () => {
    // 验收要求 2：chord 图表走 ChordChart 分支（__renderer === 'chord-svg'）
    expect(chordChart).toBeDefined()
    const result = buildPreviewResult(chordChart)
    expect(result).not.toBeNull()
    expect(result!.ok).toBe(true)
    if (!result!.ok) throw new Error('chord 预览生成失败')
    const opt = result!.option as { __renderer?: string; chordData?: unknown }
    // chord 不走 ECharts，option 里必须有 __renderer 标记而不是 series
    expect(opt.__renderer).toBe('chord-svg')
    expect(opt.chordData).toBeDefined()
    expect((opt as { series?: unknown }).series).toBeUndefined()
  })

  it('hexbin 图：buildChartOption 成功，option 包含 series', () => {
    // hexbin 是难图之一，验证它也能正常走预览逻辑
    expect(hexbinChart).toBeDefined()
    const result = buildPreviewResult(hexbinChart)
    expect(result).not.toBeNull()
    expect(result!.ok).toBe(true)
    if (!result!.ok) throw new Error(`hexbin 预览生成失败：${result!.error}`)
    const opt = result!.option as { series?: unknown }
    expect(opt.series).toBeDefined()
  })

  it('没有 defaultMapping 的图表：buildPreviewResult 返回 null，不渲染预览区块', () => {
    // 验收要求 3：generatorSupported=false 或无 defaultMapping 的图表不渲染预览区块
    // 构造一个没有 defaultMapping 的虚拟 ChartMeta，模拟未来可能加入的"生成器未支持"图表
    const unsupportedChart: ChartMeta = {
      id: 'fake-unsupported',
      name: '虚拟图',
      description: '用于测试',
      categories: ['对比'],
      whatIs: '测试用',
      whenToUse: [],
      whenNotToUse: [],
      dataRequirements: '无',
      exampleData: { columns: ['a', 'b'], rows: [['x', 1]] },
      generatorSupported: false,
      // 故意不传 defaultMapping
    }
    const result = buildPreviewResult(unsupportedChart)
    // 无 defaultMapping → 返回 null → ChartDetail 不渲染预览区块
    expect(result).toBeNull()
  })

  it('所有有 defaultMapping 的图表都能成功生成预览 option', () => {
    // 端到端保证：没有任何图表会在详情页展示"暂无预览（...）"错误提示
    const withMapping = chartsData.filter((c) => c.defaultMapping)
    for (const chart of withMapping) {
      const result = buildPreviewResult(chart)
      expect(result, `${chart.id} 应返回非 null`).not.toBeNull()
      expect(result!.ok, `${chart.id} 预览应成功: ${result!.ok ? '' : (result as { error: string }).error}`).toBe(true)
    }
  })
})
