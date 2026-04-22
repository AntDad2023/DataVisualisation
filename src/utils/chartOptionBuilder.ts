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
  generateStackedAreaOption,
  generateNightingaleRoseOption,
  generateBubbleOption,
  generateTreemapOption,
  generateSunburstOption,
  generateSankeyOption,
  generateParallelOption,
  generateForceGraphOption,
  generateChordOption,
  generateHexbinOption,
} from './chartConfigs'

export type FieldMapping = Record<string, string | string[]>

/**
 * 错误分类：
 * - `incomplete` 字段没填全（用户还在编辑，可静默）
 * - `conflict`   字段重复占用（配置错误，必须立刻提示）
 * - `unsupported` 不支持的图表类型
 * - `runtime`   底层 option 生成器抛异常
 */
export type BuildChartOptionErrorKind = 'incomplete' | 'conflict' | 'unsupported' | 'runtime'

export type BuildChartOptionResult =
  | { ok: true; option: object }
  | { ok: false; error: string; kind?: BuildChartOptionErrorKind }

/** 非字段名的 mapping 键（配置项），不参与字段唯一性校验 */
const NON_FIELD_KEYS = new Set<string>(['binCount', 'binSize'])

/**
 * 检查 mapping 里是否有列名被同时赋给多个维度。
 *
 * 例如折线图把 X 轴和 Y 轴都选成"销售额(万)"——这样画出的图没有语义，
 * 必须在成图前拦住并给用户明确提示，而不是让 ECharts 画出"自己对自己"的怪图。
 */
function findDuplicateField(mapping: FieldMapping): string | null {
  const used: string[] = []
  for (const [key, value] of Object.entries(mapping)) {
    if (NON_FIELD_KEYS.has(key)) continue
    if (typeof value === 'string' && value) used.push(value)
    else if (Array.isArray(value)) used.push(...value.filter(Boolean))
  }
  const counts = new Map<string, number>()
  for (const f of used) counts.set(f, (counts.get(f) || 0) + 1)
  for (const [f, c] of counts) {
    if (c > 1) return f
  }
  return null
}

/**
 * 根据图表类型、数据、字段映射构造 ECharts option。
 *
 * 统一承接两处调用：
 * 1. 用户在生成器页面点"生成图表"按钮
 * 2. 从图表详情页"带入生成器"自动填充后立即生成
 *
 * 设计原则：
 * - 纯函数：无副作用、不读写 DOM/storage
 * - 失败时返回 { ok: false, error, kind }，不抛异常（图表生成器内部异常会被包装成 runtime）
 * - 字段冲突（一列同时给两个维度）在 switch 前就拦下，所有图表共用
 */
export function buildChartOption(
  data: ParsedData,
  chartType: string,
  mapping: FieldMapping
): BuildChartOptionResult {
  const s = (k: string) => (mapping[k] as string | undefined) || ''
  const arr = (k: string) => (mapping[k] as string[] | undefined) || []

  // 字段唯一性校验：同一个列不能被同时用于多个维度
  const dup = findDuplicateField(mapping)
  if (dup) {
    return {
      ok: false,
      error: `列 "${dup}" 同时用于多个维度，请为每个维度选择不同的列`,
      kind: 'conflict',
    }
  }

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

      case 'stacked-area':
        if (!s('xField') || !s('seriesField') || !s('yField')) return { ok: false, error: '请选择分类列、分组列和数值列' }
        return { ok: true, option: generateStackedAreaOption(data, { xField: s('xField'), seriesField: s('seriesField'), yField: s('yField') }) }

      case 'nightingale-rose':
        if (!s('categoryField') || !s('valueField')) return { ok: false, error: '请选择分类列和数值列' }
        return { ok: true, option: generateNightingaleRoseOption(data, { categoryField: s('categoryField'), valueField: s('valueField') }) }

      case 'bubble':
        if (!s('xField') || !s('yField') || !s('sizeField')) return { ok: false, error: '请选择 X、Y 和气泡大小三个数值列' }
        return {
          ok: true,
          option: generateBubbleOption(data, {
            xField: s('xField'),
            yField: s('yField'),
            sizeField: s('sizeField'),
            categoryField: s('categoryField') || undefined,
          }),
        }

      case 'treemap':
        if (!s('parentField') || !s('childField') || !s('valueField')) return { ok: false, error: '请选择父级列、子级列和数值列' }
        return {
          ok: true,
          option: generateTreemapOption(data, {
            parentField: s('parentField'),
            childField: s('childField'),
            valueField: s('valueField'),
          }),
        }

      case 'sunburst':
        if (!s('parentField') || !s('childField') || !s('valueField')) return { ok: false, error: '请选择父级列、子级列和数值列' }
        return {
          ok: true,
          option: generateSunburstOption(data, {
            parentField: s('parentField'),
            childField: s('childField'),
            valueField: s('valueField'),
          }),
        }

      case 'sankey':
        if (!s('sourceField') || !s('targetField') || !s('valueField')) return { ok: false, error: '请选择来源列、目标列和数值列' }
        return {
          ok: true,
          option: generateSankeyOption(data, {
            sourceField: s('sourceField'),
            targetField: s('targetField'),
            valueField: s('valueField'),
          }),
        }

      case 'parallel':
        if (arr('dimensions').length < 2) return { ok: false, error: '请至少勾选 2 个数值维度' }
        return {
          ok: true,
          option: generateParallelOption(data, {
            dimensions: arr('dimensions'),
            nameField: s('nameField') || undefined,
          }),
        }

      case 'force-graph':
        if (!s('sourceField') || !s('targetField') || !s('valueField')) return { ok: false, error: '请选择来源列、目标列和关系强度列' }
        return {
          ok: true,
          option: generateForceGraphOption(data, {
            sourceField: s('sourceField'),
            targetField: s('targetField'),
            valueField: s('valueField'),
          }),
        }

      case 'chord':
        if (!s('sourceField') || !s('targetField') || !s('valueField')) return { ok: false, error: '请选择来源列、目标列和数值列' }
        return {
          ok: true,
          option: generateChordOption(data, {
            sourceField: s('sourceField'),
            targetField: s('targetField'),
            valueField: s('valueField'),
          }),
        }

      case 'hexbin':
        if (!s('xField') || !s('yField')) return { ok: false, error: '请选择 X 和 Y 两个数值列' }
        return {
          ok: true,
          option: generateHexbinOption(data, {
            xField: s('xField'),
            yField: s('yField'),
            binSize: Number(s('binSize')) || undefined,
          }),
        }

      default:
        return { ok: false, error: `不支持的图表类型：${chartType}`, kind: 'unsupported' }
    }
  } catch (err) {
    return { ok: false, error: `图表生成失败：${(err as Error).message}` }
  }
}
