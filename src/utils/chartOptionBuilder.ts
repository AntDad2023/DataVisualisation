import type { ParsedData } from './types'
import {
  generateBarOption,
  generateStackedBarOption,
  generateLineOption,
  generateScatterOption,
  generatePieOption,
  generateHistogramOption,
  generateBoxplotOption,
  generateHeatmapOption,
  generateAreaOption,
  generateRadarOption,
  generateFunnelOption,
} from './chartConfigs'

export type FieldMapping = Record<string, string | string[]>

export type BuildChartOptionResult =
  | { ok: true; option: object }
  | { ok: false; error: string }

/**
 * 根据图表类型、数据、字段映射构造 ECharts option。
 *
 * 统一承接两处调用：
 * 1. 用户在生成器页面点"生成图表"按钮
 * 2. 从图表详情页"带入生成器"自动填充后立即生成
 *
 * 设计原则：
 * - 纯函数：无副作用、不读写 DOM/storage
 * - 失败时返回 { ok: false, error }，不抛异常（图表生成器内部异常会被包装）
 */
export function buildChartOption(
  data: ParsedData,
  chartType: string,
  mapping: FieldMapping
): BuildChartOptionResult {
  const s = (k: string) => (mapping[k] as string | undefined) || ''
  const arr = (k: string) => (mapping[k] as string[] | undefined) || []

  try {
    switch (chartType) {
      case 'bar':
        if (!s('xField') || !s('yField')) return { ok: false, error: '请选择分类列和数值列' }
        return { ok: true, option: generateBarOption(data, { xField: s('xField'), yField: s('yField') }) }

      case 'stacked-bar':
        if (!s('xField') || !s('seriesField') || !s('yField')) return { ok: false, error: '请选择分类列、分组列和数值列' }
        return { ok: true, option: generateStackedBarOption(data, { xField: s('xField'), seriesField: s('seriesField'), yField: s('yField') }) }

      case 'line':
        if (!s('xField') || arr('yFields').length === 0) return { ok: false, error: '请选择 X 轴列和至少一个 Y 轴列' }
        return { ok: true, option: generateLineOption(data, { xField: s('xField'), yFields: arr('yFields') }) }

      case 'scatter':
        if (!s('xField') || !s('yField')) return { ok: false, error: '请选择 X 和 Y 数值列' }
        return {
          ok: true,
          option: generateScatterOption(data, {
            xField: s('xField'),
            yField: s('yField'),
            categoryField: s('categoryField') || undefined,
          }),
        }

      case 'pie':
        if (!s('categoryField') || !s('valueField')) return { ok: false, error: '请选择分类列和数值列' }
        return { ok: true, option: generatePieOption(data, { categoryField: s('categoryField'), valueField: s('valueField') }) }

      case 'histogram':
        if (!s('valueField')) return { ok: false, error: '请选择数值列' }
        return {
          ok: true,
          option: generateHistogramOption(data, {
            valueField: s('valueField'),
            binCount: Number(s('binCount')) || 10,
          }),
        }

      case 'boxplot':
        if (!s('valueField')) return { ok: false, error: '请选择数值列' }
        return {
          ok: true,
          option: generateBoxplotOption(data, {
            valueField: s('valueField'),
            groupField: s('groupField') || undefined,
          }),
        }

      case 'heatmap':
        if (!s('xField') || !s('yField') || !s('valueField')) return { ok: false, error: '请选择 X 类别列、Y 类别列和数值列' }
        return { ok: true, option: generateHeatmapOption(data, { xField: s('xField'), yField: s('yField'), valueField: s('valueField') }) }

      case 'area':
        if (!s('xField') || !s('yField')) return { ok: false, error: '请选择 X 轴列和 Y 轴数值列' }
        return { ok: true, option: generateAreaOption(data, { xField: s('xField'), yField: s('yField') }) }

      case 'radar':
        if (!s('nameField') || arr('valueFields').length < 3) return { ok: false, error: '请选择对象名列和至少 3 个维度列' }
        return { ok: true, option: generateRadarOption(data, { nameField: s('nameField'), valueFields: arr('valueFields') }) }

      case 'funnel':
        if (!s('stageField') || !s('valueField')) return { ok: false, error: '请选择阶段列和数值列' }
        return { ok: true, option: generateFunnelOption(data, { stageField: s('stageField'), valueField: s('valueField') }) }

      default:
        return { ok: false, error: `不支持的图表类型：${chartType}` }
    }
  } catch (err) {
    return { ok: false, error: `图表生成失败：${(err as Error).message}` }
  }
}
