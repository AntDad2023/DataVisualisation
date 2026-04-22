import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import {
  BarChart, LineChart, ScatterChart, PieChart,
  HeatmapChart, BoxplotChart, RadarChart, FunnelChart,
} from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent, VisualMapComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ParsedData } from '../utils/types'
import { parseCsvFile } from '../utils/csvParser'
import { parsePastedText } from '../utils/pasteParser'
import {
  SUPPORTED_CHART_TYPES,
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
} from '../utils/chartConfigs'

// 注册 ECharts 组件（按需加载，减小体积）
echarts.use([
  BarChart, LineChart, ScatterChart, PieChart,
  HeatmapChart, BoxplotChart, RadarChart, FunnelChart,
  TitleComponent, TooltipComponent, GridComponent, LegendComponent, VisualMapComponent,
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

    switch (chartType) {
      case 'bar':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分类列（X 轴）</span>
              <select className={selectClass} value={fieldMapping.xField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, xField: e.target.value })}>
                <option value="">请选择</option>
                {allColumns.map((col) => <option key={col} value={col}>{col}{stringColumns.includes(col) ? ' (文本)' : ' (数值)'}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列（Y 轴）</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
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
                {stringColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分组列（系列）</span>
              <select className={selectClass} value={fieldMapping.seriesField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, seriesField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列（Y 轴）</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
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
                {allColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Y 轴列（可多选，按住 Ctrl）</span>
              <select className={selectClass} multiple value={fieldMapping.yFields as string[] || []} onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (opt) => opt.value)
                setFieldMapping({ ...fieldMapping, yFields: selected })
              }} style={{ minHeight: '80px' }}>
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
          </>
        )

      case 'scatter':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">X 数值列</span>
              <select className={selectClass} value={fieldMapping.xField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, xField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Y 数值列</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分类列（可选，用颜色区分）</span>
              <select className={selectClass} value={fieldMapping.categoryField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, categoryField: e.target.value })}>
                <option value="">不使用</option>
                {stringColumns.map((col) => <option key={col} value={col}>{col}</option>)}
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
                {allColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
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
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">分组列（可选）</span>
              <select className={selectClass} value={fieldMapping.groupField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, groupField: e.target.value })}>
                <option value="">不分组</option>
                {stringColumns.map((col) => <option key={col} value={col}>{col}</option>)}
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
                {stringColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Y 类别列</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {stringColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
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
                {allColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Y 轴数值列</span>
              <select className={selectClass} value={fieldMapping.yField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, yField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
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
                {stringColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">维度列（可多选，按住 Ctrl/Cmd）</span>
              <select
                className={selectClass}
                multiple
                value={fieldMapping.valueFields as string[] || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (opt) => opt.value)
                  setFieldMapping({ ...fieldMapping, valueFields: selected })
                }}
                style={{ minHeight: '120px' }}
              >
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
          </>
        )

      case 'funnel':
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">阶段名称列</span>
              <select className={selectClass} value={fieldMapping.stageField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, stageField: e.target.value })}>
                <option value="">请选择</option>
                {allColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700 mb-1 block">数值列</span>
              <select className={selectClass} value={fieldMapping.valueField as string || ''} onChange={(e) => setFieldMapping({ ...fieldMapping, valueField: e.target.value })}>
                <option value="">请选择</option>
                {numericColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
          </>
        )

      default:
        return <p className="text-gray-400 text-sm">请选择图表类型</p>
    }
  }

  // 生成图表
  const handleGenerate = () => {
    if (!parsedData) {
      setError('请先上传或粘贴数据')
      return
    }
    setError('')

    try {
      let option: object | null = null

      switch (chartType) {
        case 'bar':
          if (!fieldMapping.xField || !fieldMapping.yField) { setError('请选择分类列和数值列'); return }
          option = generateBarOption(parsedData, { xField: fieldMapping.xField as string, yField: fieldMapping.yField as string })
          break
        case 'stacked-bar':
          if (!fieldMapping.xField || !fieldMapping.seriesField || !fieldMapping.yField) { setError('请选择分类列、分组列和数值列'); return }
          option = generateStackedBarOption(parsedData, { xField: fieldMapping.xField as string, seriesField: fieldMapping.seriesField as string, yField: fieldMapping.yField as string })
          break
        case 'line':
          if (!fieldMapping.xField || !(fieldMapping.yFields as string[])?.length) { setError('请选择 X 轴列和至少一个 Y 轴列'); return }
          option = generateLineOption(parsedData, { xField: fieldMapping.xField as string, yFields: fieldMapping.yFields as string[] })
          break
        case 'scatter':
          if (!fieldMapping.xField || !fieldMapping.yField) { setError('请选择 X 和 Y 数值列'); return }
          option = generateScatterOption(parsedData, { xField: fieldMapping.xField as string, yField: fieldMapping.yField as string, categoryField: fieldMapping.categoryField as string || undefined })
          break
        case 'pie':
          if (!fieldMapping.categoryField || !fieldMapping.valueField) { setError('请选择分类列和数值列'); return }
          option = generatePieOption(parsedData, { categoryField: fieldMapping.categoryField as string, valueField: fieldMapping.valueField as string })
          break
        case 'histogram':
          if (!fieldMapping.valueField) { setError('请选择数值列'); return }
          option = generateHistogramOption(parsedData, { valueField: fieldMapping.valueField as string, binCount: Number(fieldMapping.binCount) || 10 })
          break
        case 'boxplot':
          if (!fieldMapping.valueField) { setError('请选择数值列'); return }
          option = generateBoxplotOption(parsedData, { valueField: fieldMapping.valueField as string, groupField: fieldMapping.groupField as string || undefined })
          break
        case 'heatmap':
          if (!fieldMapping.xField || !fieldMapping.yField || !fieldMapping.valueField) { setError('请选择 X 类别列、Y 类别列和数值列'); return }
          option = generateHeatmapOption(parsedData, { xField: fieldMapping.xField as string, yField: fieldMapping.yField as string, valueField: fieldMapping.valueField as string })
          break
        case 'area':
          if (!fieldMapping.xField || !fieldMapping.yField) { setError('请选择 X 轴列和 Y 轴数值列'); return }
          option = generateAreaOption(parsedData, { xField: fieldMapping.xField as string, yField: fieldMapping.yField as string })
          break
        case 'radar':
          if (!fieldMapping.nameField || !((fieldMapping.valueFields as string[])?.length >= 3)) { setError('请选择对象名列和至少 3 个维度列'); return }
          option = generateRadarOption(parsedData, { nameField: fieldMapping.nameField as string, valueFields: fieldMapping.valueFields as string[] })
          break
        case 'funnel':
          if (!fieldMapping.stageField || !fieldMapping.valueField) { setError('请选择阶段列和数值列'); return }
          option = generateFunnelOption(parsedData, { stageField: fieldMapping.stageField as string, valueField: fieldMapping.valueField as string })
          break
      }

      if (option) setChartOption(option)
    } catch (err) {
      setError(`图表生成失败：${(err as Error).message}`)
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
