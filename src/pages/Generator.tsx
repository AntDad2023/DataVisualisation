import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import {
  BarChart, LineChart, ScatterChart, PieChart,
  HeatmapChart, BoxplotChart, RadarChart, FunnelChart,
  TreemapChart, SunburstChart, SankeyChart, ParallelChart,
} from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent, VisualMapComponent, ParallelComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ParsedData } from '../utils/types'
import { parseCsvFile } from '../utils/csvParser'
import { parsePastedText } from '../utils/pasteParser'
import { SUPPORTED_CHART_TYPES } from '../utils/chartConfigs'
import { buildChartOption } from '../utils/chartOptionBuilder'

// 注册 ECharts 组件（按需加载，减小体积）
echarts.use([
  BarChart, LineChart, ScatterChart, PieChart,
  HeatmapChart, BoxplotChart, RadarChart, FunnelChart,
  TreemapChart, SunburstChart, SankeyChart, ParallelChart,
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent, VisualMapComponent, ParallelComponent,
  CanvasRenderer,
])

function Generator() {
  const [searchParams] = useSearchParams()

  // 状态
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [chartType, setChartType] = useState(searchParams.get('chart') || 'bar')
  const [fieldMapping, setFieldMapping] = useState<Record<string, string | string[]>>({})
  const [error, setError] = useState('')
  const [chartOption, setChartOption] = useState<object | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chartRef = useRef<ReactEChartsCore>(null)

  // 下载当前图表为 PNG
  const handleDownloadPng = useCallback(() => {
    const instance = chartRef.current?.getEchartsInstance()
    if (!instance) return
    const url = instance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff',
    })
    const a = document.createElement('a')
    a.href = url
    a.download = `chart-${chartType}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [chartType])

  // URL 参数中的图表类型
  useEffect(() => {
    const urlChart = searchParams.get('chart')
    if (urlChart && SUPPORTED_CHART_TYPES.some((t) => t.id === urlChart)) {
      setChartType(urlChart)
    }
  }, [searchParams])

  // 从图表详情页"带入生成器"传来的 sessionStorage autofill
  // 数据结构：{ chartType, parsedData, defaultMapping }
  // 行为：自动填充数据/映射 → 立即生成图表 → 清除 storage 避免二次触发
  useEffect(() => {
    const raw = sessionStorage.getItem('generator:autofill')
    if (!raw) return
    sessionStorage.removeItem('generator:autofill')
    try {
      const payload = JSON.parse(raw) as {
        chartType: string
        parsedData: ParsedData
        defaultMapping: Record<string, string | string[]>
      }
      setParsedData(payload.parsedData)
      setChartType(payload.chartType)
      setFieldMapping(payload.defaultMapping)
      // 直接用 payload 调用 builder，避免依赖尚未更新的 state
      const result = buildChartOption(payload.parsedData, payload.chartType, payload.defaultMapping)
      if (result.ok) {
        setError('')
        setChartOption(result.option)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('带入生成器失败：autofill 解析异常', err)
    }
    // 只在挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 动态生成：字段映射 / 图表类型 / 数据 变化时自动重算图表
  // - 字段完整 → 立即更新预览（所见即所得）
  // - 字段冲突（kind:'conflict'）→ 立刻红字提示 + 清空图表，避免用户看着"旧图以为还有效"
  // - 字段不全（其他 error）→ 保留上次成功的图表，不显示 error（避免用户编辑过程中被骚扰）
  //   用户点"生成图表"按钮时走 handleGenerate，才会把 incomplete 的 error 显式打出来
  useEffect(() => {
    if (!parsedData) return
    const result = buildChartOption(parsedData, chartType, fieldMapping)
    if (result.ok) {
      setError('')
      setChartOption(result.option)
    } else if (result.kind === 'conflict') {
      setError(result.error)
      setChartOption(null)
    }
  }, [parsedData, chartType, fieldMapping])

  // 处理 CSV 上传
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const data = await parseCsvFile(file)
      setParsedData(data)
      setFieldMapping({})
      setChartOption(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  // 处理粘贴解析
  const handleParsePaste = useCallback(() => {
    setError('')
    try {
      const data = parsePastedText(pasteText)
      setParsedData(data)
      setFieldMapping({})
      setChartOption(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [pasteText])

  // 获取数值列和文本列
  const numericColumns = parsedData
    ? parsedData.columns.filter((_, i) => parsedData.columnTypes[i] === 'number')
    : []
  const stringColumns = parsedData
    ? parsedData.columns.filter((_, i) => parsedData.columnTypes[i] === 'string')
    : []
  const allColumns = parsedData?.columns || []

  // 根据图表类型渲染字段映射 UI
  const renderFieldMapping = () => {
    if (!parsedData) return null

    const selectClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500'

    // 字段互斥：若某列已被"其他维度"占用，则在当前维度的下拉/复选框中 disabled
    // 例：X 轴已经选了 "销售额(万)"，Y 轴的 checkbox 里该项就会变灰不能勾
    // 配合 buildChartOption 的 conflict 校验双保险
    const nonFieldKeys = new Set(['binCount'])
    const isUsedByOtherDim = (myKey: string, col: string): boolean => {
      if (!col) return false
      for (const [k, v] of Object.entries(fieldMapping)) {
        if (k === myKey) continue
        if (nonFieldKeys.has(k)) continue
        if (typeof v === 'string' && v === col) return true
        if (Array.isArray(v) && v.includes(col)) return true
      }
      return false
    }

    switch (chartType) {
      case 'bar':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分类列（X 轴）</span>
              <select className={selectClass} value={fieldMapping.xField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, xField: e.target.value })}>
                <option value="">请选择</option>
                {allColumns.map((col) => {
                  const used = isUsedByOtherDim('xField', col)
                  const tag = stringColumns.includes(col) ? ' (文本)' : ' (数值)'
                  return <option key={col} value={col} disabled={used}>{col}{tag}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列（Y 轴）</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('yField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'stacked-bar':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分类列（X 轴）</span>
              <select className={selectClass} value={fieldMapping.xField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, xField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('xField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分组列（系列）</span>
              <select className={selectClass} value={fieldMapping.seriesField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, seriesField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('seriesField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列（Y 轴）</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('yField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'line':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">X 轴列</span>
              <select className={selectClass} value={fieldMapping.xField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, xField: e.target.value })}>
                <option value="">请选择</option>
                {allColumns.map((col) => {
                  const used = isUsedByOtherDim('xField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用作 Y 轴' : ''}</option>
                })}
              </select>
            </label>
            <div className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Y 轴列（勾选一个或多个数值列，不含 X 轴列）</span>
              <div className="border border-gray-300 rounded-lg p-2 max-h-40 overflow-y-auto">
                {numericColumns.length === 0 ? (
                  <p className="text-sm text-gray-400 px-2 py-1">数据中没有数值列</p>
                ) : (
                  numericColumns.map((col) => {
                    const current = (fieldMapping.yFields as string[]) || []
                    const checked = current.includes(col)
                    const disabled = isUsedByOtherDim('yFields', col)
                    return (
                      <label key={col} className={`flex items-center gap-2 px-2 py-1 rounded ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...current, col]
                              : current.filter((x) => x !== col)
                            setFieldMapping({ ...fieldMapping, yFields: next })
                          }}
                        />
                        <span className="text-sm text-gray-700">{col}{disabled ? ' · 已用作 X 轴' : ''}</span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )

      case 'scatter':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">X 数值列</span>
              <select className={selectClass} value={fieldMapping.xField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, xField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('xField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Y 数值列</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('yField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分类列（可选，用颜色区分）</span>
              <select className={selectClass} value={fieldMapping.categoryField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, categoryField: e.target.value })}>
                <option value="">不使用</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('categoryField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'pie':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分类列</span>
              <select className={selectClass} value={fieldMapping.categoryField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, categoryField: e.target.value })}>
                <option value="">请选择</option>
                {allColumns.map((col) => {
                  const used = isUsedByOtherDim('categoryField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('valueField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'histogram':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分箱数量</span>
              <input type="number" min={3} max={50} className={selectClass} value={fieldMapping.binCount as unknown as string || '10'} onChange={(e) => setFieldMapping({ ...fieldMapping, binCount: e.target.value })} />
            </label>
          </>
        )

      case 'boxplot':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('valueField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分组列（可选）</span>
              <select className={selectClass} value={fieldMapping.groupField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, groupField: e.target.value })}>
                <option value="">不分组</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('groupField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'heatmap':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">X 类别列</span>
              <select className={selectClass} value={fieldMapping.xField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, xField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('xField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Y 类别列</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('yField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('valueField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'area':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">X 轴列（时间/顺序）</span>
              <select className={selectClass} value={fieldMapping.xField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, xField: e.target.value })}>
                <option value="">请选择</option>
                {allColumns.map((col) => {
                  const used = isUsedByOtherDim('xField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Y 轴数值列</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('yField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'radar':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">对象名列（每行=一个对象）</span>
              <select className={selectClass} value={fieldMapping.nameField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, nameField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('nameField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <div className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">维度列（勾选至少 3 个数值列，不含对象名列）</span>
              <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                {numericColumns.length === 0 ? (
                  <p className="text-sm text-gray-400 px-2 py-1">数据中没有数值列</p>
                ) : (
                  numericColumns.map((col) => {
                    const current = (fieldMapping.valueFields as string[]) || []
                    const checked = current.includes(col)
                    const disabled = isUsedByOtherDim('valueFields', col)
                    return (
                      <label key={col} className={`flex items-center gap-2 px-2 py-1 rounded ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...current, col]
                              : current.filter((x) => x !== col)
                            setFieldMapping({ ...fieldMapping, valueFields: next })
                          }}
                        />
                        <span className="text-sm text-gray-700">{col}{disabled ? ' · 已用作对象名' : ''}</span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )

      case 'funnel':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">阶段名称列</span>
              <select className={selectClass} value={fieldMapping.stageField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, stageField: e.target.value })}>
                <option value="">请选择</option>
                {allColumns.map((col) => {
                  const used = isUsedByOtherDim('stageField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('valueField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'stacked-area':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分类列（X 轴，如时间）</span>
              <select className={selectClass} value={fieldMapping.xField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, xField: e.target.value })}>
                <option value="">请选择</option>
                {allColumns.map((col) => {
                  const used = isUsedByOtherDim('xField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分组列（系列，如渠道）</span>
              <select className={selectClass} value={fieldMapping.seriesField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, seriesField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('seriesField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列（Y 轴）</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('yField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'nightingale-rose':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分类列</span>
              <select className={selectClass} value={fieldMapping.categoryField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, categoryField: e.target.value })}>
                <option value="">请选择</option>
                {allColumns.map((col) => {
                  const used = isUsedByOtherDim('categoryField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('valueField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'bubble':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">X 数值列</span>
              <select className={selectClass} value={fieldMapping.xField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, xField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('xField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Y 数值列</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('yField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">气泡大小列（第三维度）</span>
              <select className={selectClass} value={fieldMapping.sizeField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, sizeField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('sizeField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分类列（可选，用颜色区分）</span>
              <select className={selectClass} value={fieldMapping.categoryField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, categoryField: e.target.value })}>
                <option value="">不使用</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('categoryField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'treemap':
      case 'sunburst':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">父级分类列（如"大类"）</span>
              <select className={selectClass} value={fieldMapping.parentField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, parentField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('parentField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">子级分类列（如"小类"）</span>
              <select className={selectClass} value={fieldMapping.childField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, childField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('childField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('valueField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'sankey':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">来源列（起点）</span>
              <select className={selectClass} value={fieldMapping.sourceField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, sourceField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('sourceField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">目标列（终点）</span>
              <select className={selectClass} value={fieldMapping.targetField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, targetField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('targetField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">流量数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => {
                  const used = isUsedByOtherDim('valueField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      case 'parallel':
        return (
          <>
            <div className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">维度列（勾选至少 2 个数值列，每个维度一根竖轴）</span>
              <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                {numericColumns.length === 0 ? (
                  <p className="text-sm text-gray-400 px-2 py-1">数据中没有数值列</p>
                ) : (
                  numericColumns.map((col) => {
                    const current = (fieldMapping.dimensions as string[]) || []
                    const checked = current.includes(col)
                    const disabled = isUsedByOtherDim('dimensions', col)
                    return (
                      <label key={col} className={`flex items-center gap-2 px-2 py-1 rounded ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...current, col]
                              : current.filter((x) => x !== col)
                            setFieldMapping({ ...fieldMapping, dimensions: next })
                          }}
                        />
                        <span className="text-sm text-gray-700">{col}{disabled ? ' · 已用作名称列' : ''}</span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">名称列（可选，给每条折线命名）</span>
              <select className={selectClass} value={fieldMapping.nameField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, nameField: e.target.value })}>
                <option value="">不使用</option>
                {stringColumns.map((col) => {
                  const used = isUsedByOtherDim('nameField', col)
                  return <option key={col} value={col} disabled={used}>{col}{used ? ' · 已用' : ''}</option>
                })}
              </select>
            </label>
          </>
        )

      default:
        return <p className="text-gray-400 text-sm">请选择图表类型</p>
    }
  }

  // 生成图表（统一走 buildChartOption）
  const handleGenerate = () => {
    if (!parsedData) {
      setError('请先上传或粘贴数据')
      return
    }
    const result = buildChartOption(parsedData, chartType, fieldMapping)
    if (result.ok) {
      setError('')
      setChartOption(result.option)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">图表生成器</h1>
      <p className="text-gray-600 mb-6">上传或粘贴数据，选择图表类型，一键生成可视化图表</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== 左侧面板：数据输入与配置 ===== */}
        <div className="space-y-6">
          {/* 数据输入 */}
          <div className="p-5 bg-white border border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. 输入数据</h2>

            {/* CSV 上传 */}
            <div className="mb-4">
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                上传 CSV 文件
              </button>
            </div>

            {/* 分隔线 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">或者</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* 粘贴表格 */}
            <div>
              <textarea
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-y focus:outline-none focus:border-blue-500"
                placeholder={"粘贴表格数据（第一行为列名）\n例如：\n城市\t人口\n北京\t2189\n上海\t2487"}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              <button
                onClick={handleParsePaste}
                disabled={!pasteText.trim()}
                className="mt-2 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                解析粘贴数据
              </button>
            </div>
          </div>

          {/* 数据预览 */}
          {parsedData && (
            <div className="p-5 bg-white border border-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                数据预览
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {parsedData.rows.length} 行 × {parsedData.columns.length} 列
                </span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {parsedData.columns.map((col, i) => (
                        <th key={col} className="px-3 py-1.5 text-left font-medium text-gray-700 border border-gray-200 whitespace-nowrap">
                          {col}
                          <span className={`ml-1 text-xs ${parsedData.columnTypes[i] === 'number' ? 'text-blue-500' : 'text-gray-400'}`}>
                            ({parsedData.columnTypes[i] === 'number' ? '数值' : '文本'})
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.rows.slice(0, 10).map((row, rowIdx) => (
                      <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-3 py-1.5 text-gray-600 border border-gray-200 whitespace-nowrap">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.rows.length > 10 && (
                  <p className="text-xs text-gray-400 mt-1">（仅展示前 10 行）</p>
                )}
              </div>
            </div>
          )}

          {/* 图表类型 + 字段映射 */}
          {parsedData && (
            <div className="p-5 bg-white border border-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">2. 选择图表与字段</h2>

              {/* 图表类型选择 */}
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 mb-1 block">图表类型</span>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  value={chartType}
                  onChange={(e) => { setChartType(e.target.value); setFieldMapping({}); setChartOption(null) }}
                >
                  {SUPPORTED_CHART_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>

              {/* 动态字段映射 */}
              {renderFieldMapping()}

              {/* 生成按钮 */}
              <button
                onClick={handleGenerate}
                className="w-full mt-4 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                生成图表
              </button>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* ===== 右侧面板：图表预览 ===== */}
        <div className="p-5 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">图表预览</h2>
            {chartOption && (
              <button
                onClick={handleDownloadPng}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                title="下载当前图表为 PNG"
              >
                ⬇ 下载 PNG
              </button>
            )}
          </div>
          {chartOption ? (
            <ReactEChartsCore
              ref={chartRef}
              echarts={echarts}
              option={chartOption}
              style={{ height: '500px', width: '100%' }}
              notMerge={true}
            />
          ) : (
            <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg">
              <div className="text-center text-gray-400">
                <p className="text-4xl mb-3">📊</p>
                <p>上传数据并配置字段后</p>
                <p>图表将在这里显示</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Generator
