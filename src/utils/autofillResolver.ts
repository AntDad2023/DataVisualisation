import type { ParsedData } from './types'
import type { FieldMapping } from './chartOptionBuilder'
import { chartsData, type ChartMeta } from '../data/chartsData'
import { exampleToParsedData } from './exampleToParsedData'

export interface AutofillPayload {
  chartType: string
  parsedData: ParsedData
  defaultMapping: FieldMapping
}

/**
 * 决定生成器挂载时使用哪一份 autofill 数据。
 *
 * 两条来源（按优先级）：
 * 1. sessionStorage['generator:autofill'] —— 图表详情页按"带入生成器"按钮写入的完整 payload
 * 2. URL 参数 `?chart=xxx` —— 用户直接访问 /generator?chart=treemap 时，
 *    从 chartsData 里找到该图表的 exampleData + defaultMapping 构造等价 payload
 *
 * 返回 null 表示"不做 autofill"（用户访问空白生成器页面，需要手动上传/粘贴数据）。
 *
 * 纯函数：不读写 DOM / storage / location，输入通过参数注入，便于测试。
 */
export function resolveAutofillPayload(
  sessionStorageRaw: string | null,
  urlChartId: string | null,
  charts: ChartMeta[] = chartsData
): AutofillPayload | null {
  // 路径 1：sessionStorage 优先（来自详情页按钮）
  if (sessionStorageRaw) {
    try {
      const parsed = JSON.parse(sessionStorageRaw) as Partial<AutofillPayload>
      if (
        parsed &&
        typeof parsed.chartType === 'string' &&
        parsed.parsedData &&
        parsed.defaultMapping
      ) {
        return {
          chartType: parsed.chartType,
          parsedData: parsed.parsedData as ParsedData,
          defaultMapping: parsed.defaultMapping as FieldMapping,
        }
      }
    } catch {
      // JSON 坏了 → 容错：落到路径 2
    }
  }

  // 路径 2：URL ?chart=xxx 直达 —— 从 chartsData 构造 payload
  if (urlChartId) {
    const meta = charts.find((c) => c.id === urlChartId)
    if (meta && meta.generatorSupported && meta.defaultMapping) {
      return {
        chartType: meta.id,
        parsedData: exampleToParsedData(meta.exampleData),
        defaultMapping: meta.defaultMapping,
      }
    }
  }

  return null
}
