import { describe, it, expect } from 'vitest'
import { buildChartOption } from '../chartOptionBuilder'
import { exampleToParsedData } from '../exampleToParsedData'
import { chartsData } from '../../data/chartsData'
import type { ParsedData } from '../types'

describe('buildChartOption', () => {
  // 构造一组所有图表通用的宽数据（覆盖全部字段）
  const wideData: ParsedData = {
    columns: ['名称', '分组', '维度A', '维度B', '维度C'],
    rows: [
      ['x1', 'G1', 10, 20, 30],
      ['x2', 'G2', 15, 25, 35],
      ['x3', 'G1', 12, 22, 32],
    ],
    columnTypes: ['string', 'string', 'number', 'number', 'number'],
  }

  describe('校验缺失字段映射', () => {
    it('bar 缺字段时应返回 error', () => {
      const r = buildChartOption(wideData, 'bar', {})
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error).toContain('请选择')
    })

    it('stacked-bar 缺字段时应返回 error', () => {
      const r = buildChartOption(wideData, 'stacked-bar', { xField: '名称' })
      expect(r.ok).toBe(false)
    })

    it('line 的 yFields 空数组应返回 error', () => {
      const r = buildChartOption(wideData, 'line', { xField: '名称', yFields: [] })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error).toContain('Y 轴')
    })

    it('radar 维度不足 3 个应返回 error', () => {
      const r = buildChartOption(wideData, 'radar', {
        nameField: '名称',
        valueFields: ['维度A', '维度B'],
      })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error).toContain('至少 3 个')
    })

    it('未知图表类型应返回 error', () => {
      const r = buildChartOption(wideData, 'unknown-chart-type', {})
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error).toContain('不支持')
    })
  })

  describe('底层生成器异常应被包装为 error', () => {
    it('字段名不存在于数据时，不抛异常而返回 error 或 ok', () => {
      // xField 传了数据里不存在的列名；底层实现可能宽容处理也可能抛错
      // 关键是 buildChartOption 不会把异常冒泡出来
      const r = buildChartOption(wideData, 'bar', { xField: '不存在的列', yField: '维度A' })
      // 无论 ok 或 !ok，都应该是一个合法的结果对象，不抛异常
      expect(r).toBeDefined()
      expect(typeof r.ok).toBe('boolean')
    })
  })

  describe('端到端：每个 generatorSupported 的图表都应能用自带的示例数据+默认映射成功生成', () => {
    const supported = chartsData.filter((c) => c.generatorSupported)

    it('所有 generatorSupported: true 的图表都必须有 defaultMapping', () => {
      for (const chart of supported) {
        expect(chart.defaultMapping, `${chart.id} 缺少 defaultMapping`).toBeDefined()
      }
    })

    it.each(supported.map((c) => [c.id, c]))(
      '%s 用示例数据 + defaultMapping 应能成功生成 option',
      (_id, chart) => {
        const data = exampleToParsedData(chart.exampleData)
        const result = buildChartOption(data, chart.id, chart.defaultMapping!)
        if (!result.ok) {
          throw new Error(`${chart.id} 生成失败：${result.error}`)
        }
        expect(result.ok).toBe(true)
        expect(result.option).toBeDefined()
        // 所有 option 都应该包含 series 字段
        expect((result.option as { series: unknown }).series).toBeDefined()
      }
    )
  })
})
