import { describe, it, expect } from 'vitest'
import { resolveAutofillPayload } from '../autofillResolver'
import type { ChartMeta } from '../../data/chartsData'

/** 造一组最小可用的 chartsData，避免依赖真实数据变动 */
const fakeCharts: ChartMeta[] = [
  {
    id: 'bar',
    name: '条形图',
    description: '',
    categories: ['对比'],
    whatIs: '',
    whenToUse: [],
    whenNotToUse: [],
    dataRequirements: '',
    exampleData: {
      columns: ['城市', '人口'],
      rows: [
        ['北京', 2189],
        ['上海', 2487],
      ],
    },
    generatorSupported: true,
    defaultMapping: { xField: '城市', yField: '人口' },
  },
  {
    id: 'force',
    name: '力导图',
    description: '',
    categories: ['关系'],
    whatIs: '',
    whenToUse: [],
    whenNotToUse: [],
    dataRequirements: '',
    exampleData: { columns: [], rows: [] },
    generatorSupported: false,  // 不支持生成
  },
]

describe('resolveAutofillPayload', () => {
  it('sessionStorage 有合法 payload：直接返回，不查 chartsData', () => {
    const raw = JSON.stringify({
      chartType: 'line',
      parsedData: {
        columns: ['x', 'y'],
        rows: [['a', 1]],
        columnTypes: ['string', 'number'],
      },
      defaultMapping: { xField: 'x', yFields: ['y'] },
    })
    const r = resolveAutofillPayload(raw, null, fakeCharts)
    expect(r).not.toBeNull()
    expect(r?.chartType).toBe('line')
    expect(r?.defaultMapping).toEqual({ xField: 'x', yFields: ['y'] })
  })

  it('sessionStorage 为 null + URL chart 有效：从 chartsData 构造', () => {
    const r = resolveAutofillPayload(null, 'bar', fakeCharts)
    expect(r).not.toBeNull()
    expect(r?.chartType).toBe('bar')
    expect(r?.defaultMapping).toEqual({ xField: '城市', yField: '人口' })
    expect(r?.parsedData.columns).toEqual(['城市', '人口'])
    expect(r?.parsedData.rows).toHaveLength(2)
  })

  it('sessionStorage + URL 同时存在：sessionStorage 优先', () => {
    const raw = JSON.stringify({
      chartType: 'scatter',
      parsedData: { columns: ['a'], rows: [[1]], columnTypes: ['number'] },
      defaultMapping: { xField: 'a', yField: 'a' },
    })
    const r = resolveAutofillPayload(raw, 'bar', fakeCharts)
    expect(r?.chartType).toBe('scatter')
  })

  it('sessionStorage 为 null + 无 URL：返回 null（空白生成器）', () => {
    const r = resolveAutofillPayload(null, null, fakeCharts)
    expect(r).toBeNull()
  })

  it('URL chart 在 chartsData 里不存在：返回 null', () => {
    const r = resolveAutofillPayload(null, 'unknown-chart-id', fakeCharts)
    expect(r).toBeNull()
  })

  it('URL chart 存在但 generatorSupported=false：返回 null', () => {
    const r = resolveAutofillPayload(null, 'force', fakeCharts)
    expect(r).toBeNull()
  })

  it('sessionStorage JSON 损坏 + URL 有效：容错降级到 URL 路径', () => {
    const r = resolveAutofillPayload('{not valid json', 'bar', fakeCharts)
    expect(r).not.toBeNull()
    expect(r?.chartType).toBe('bar')
  })

  it('sessionStorage JSON 损坏 + 无 URL：返回 null，不抛异常', () => {
    const r = resolveAutofillPayload('{broken', null, fakeCharts)
    expect(r).toBeNull()
  })

  it('sessionStorage payload 字段不全：忽略并降级', () => {
    // 缺 parsedData
    const raw = JSON.stringify({ chartType: 'bar', defaultMapping: {} })
    const r = resolveAutofillPayload(raw, 'bar', fakeCharts)
    expect(r?.chartType).toBe('bar')
    // 因为降级到了 URL 路径，defaultMapping 来自 fakeCharts
    expect(r?.defaultMapping).toEqual({ xField: '城市', yField: '人口' })
  })
})
